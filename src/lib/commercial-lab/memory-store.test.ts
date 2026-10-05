import { expect, it } from "vitest";
import { createMemoryStore, type SyntheticConfirmation } from "./memory-store";
import { SYNTHETIC_DRAFT } from "./draft";

function scenario() {
  const store = createMemoryStore();
  const eventId = store.create("buyer-a", SYNTHETIC_DRAFT);
  const otherId = store.create("buyer-b", { ...SYNTHETIC_DRAFT, names: "Otra familia ficticia" });
  const attempt = store.begin("buyer-a", eventId);
  const confirmation: SyntheticConfirmation = {
    ...attempt, attemptId: attempt.id, notificationId: "notice-1", result: "succeeded",
  };
  return { store, eventId, otherId, attempt, confirmation };
}

it("isolates reading, editing and purchases between two synthetic owners", () => {
  const { store, eventId, otherId } = scenario();
  for (const owner of ["buyer-b", "", "anonymous"]) {
    expect(() => store.read(owner, eventId)).toThrow();
    expect(() => store.edit(owner, eventId, SYNTHETIC_DRAFT)).toThrow();
    expect(() => store.begin(owner, eventId)).toThrow();
  }
  expect(store.read("buyer-b", otherId).draft.names).toBe("Otra familia ficticia");
});

it("fixes price internally and reuses a pending attempt for double clicks", () => {
  const { store, eventId, attempt } = scenario();
  expect(attempt.amountCents).toBe(9900);
  expect(attempt.currency).toBe("MXN");
  expect(store.begin("buyer-a", eventId)).toEqual(attempt);
  attempt.amountCents = 1;
  expect(store.begin("buyer-a", eventId).amountCents).toBe(9900);
  expect(store.read("buyer-a", eventId).published).toBe(false);
});

it.each([
  { owner: "buyer-b" }, { eventId: "different" }, { attemptId: "missing" },
  { amountCents: 99 }, { amountCents: 9900.1 }, { currency: "USD" }, { notificationId: "" },
])("rejects mismatched confirmations atomically: %j", patch => {
  const { store, eventId, confirmation } = scenario();
  expect(() => store.confirmSynthetic({ ...confirmation, ...patch })).toThrow();
  expect(store.read("buyer-a", eventId).published).toBe(false);
  expect(store.confirmSynthetic(confirmation).activated).toBe(true);
});

it("activates once despite replay, and does not affect the other event", () => {
  const { store, eventId, otherId, confirmation } = scenario();
  expect(store.confirmSynthetic(confirmation)).toEqual({ duplicate: false, activated: true });
  expect(store.confirmSynthetic(confirmation)).toEqual({ duplicate: true, activated: false });
  expect(store.confirmSynthetic({ ...confirmation, notificationId: "notice-2" }).activated).toBe(false);
  expect(store.read("buyer-a", eventId).published).toBe(true);
  expect(store.read("buyer-b", otherId).published).toBe(false);
  expect(() => store.confirmSynthetic({ ...confirmation, result: "failed" })).toThrow();
});

it("retries a failure and reconciles delayed success without double activation", () => {
  const { store, eventId, attempt, confirmation } = scenario();
  store.confirmSynthetic({ ...confirmation, result: "failed" });
  expect(store.read("buyer-a", eventId).published).toBe(false);
  const retry = store.begin("buyer-a", eventId);
  expect(retry.id).not.toBe(attempt.id);
  expect(store.confirmSynthetic({ ...confirmation, notificationId: "late-success" }).activated).toBe(true);
  expect(store.confirmSynthetic({ ...confirmation, attemptId: retry.id, notificationId: "retry-success" }).activated).toBe(false);
  store.confirmSynthetic({ ...confirmation, notificationId: "late-failure", result: "failed" });
  expect(store.read("buyer-a", eventId).published).toBe(true);
});

it("preserves entitlement on edits without allowing another purchase or alias mutation", () => {
  const { store, eventId, confirmation } = scenario();
  store.confirmSynthetic(confirmation);
  store.edit("buyer-a", eventId, { ...SYNTHETIC_DRAFT, names: "Nombre actualizado ficticio" });
  const event = store.read("buyer-a", eventId);
  expect(event.published).toBe(true);
  expect(event.draft.names).toBe("Nombre actualizado ficticio");
  event.draft.names = "mutated";
  expect(store.read("buyer-a", eventId).draft.names).not.toBe("mutated");
  expect(() => store.begin("buyer-a", eventId)).toThrow();
});
