import { describe, expect, it } from "vitest";
import { OFFER, transitionEvent, transitionPayment, type PaymentState, type EventState, type DemoAttempt } from "./contract";

it("fixes the single offer in integer cents and MXN", () => {
  expect(OFFER).toEqual({ amountCents: 9900, currency: "MXN" });
  expect(Number.isInteger(OFFER.amountCents)).toBe(true);
  expect(Object.isFrozen(OFFER)).toBe(true);
});

describe("each payment attempt has explicit terminal states; retry requires a new attempt", () => {
  const states: PaymentState[] = ["created", "pending", "succeeded", "failed", "cancelled"];
  const valid = ["created:pending", "created:cancelled", "pending:succeeded", "pending:failed", "pending:cancelled"];
  for (const from of states) for (const to of states) {
    it(`${from} → ${to}`, () => {
      if (valid.includes(`${from}:${to}`)) expect(transitionPayment(from, to)).toBe(to);
      else expect(() => transitionPayment(from, to)).toThrow();
    });
  }
});

const paid: DemoAttempt = { eventId: "synthetic-1", state: "succeeded", ...OFFER };
describe("publication contract (simulation only)", () => {
  const states: EventState[] = ["draft", "published", "archived"];
  for (const from of states) for (const to of states) {
    it(`${from} → ${to}`, () => {
      const run = () => transitionEvent({ id: "synthetic-1", state: from }, to, paid);
      if (["draft:published", "draft:archived", "published:archived"].includes(`${from}:${to}`)) expect(run()).toBe(to);
      else expect(run).toThrow();
    });
  }
  it.each([
    undefined, { ...paid, eventId: "other-event" }, { ...paid, amountCents: 99 },
    { ...paid, amountCents: 9900.1 }, { ...paid, currency: "USD" },
    ...(["created", "pending", "failed", "cancelled"] as PaymentState[]).map(state => ({ ...paid, state })),
  ])("rejects absent, wrong, or unsuccessful payment evidence: %j", (attempt) => {
    expect(() => transitionEvent({ id: "synthetic-1", state: "draft" }, "published", attempt)).toThrow();
  });
  it("payment success alone does not mutate the event or publish anything", () => {
    const event = { id: "synthetic-1", state: "draft" as const };
    expect(transitionPayment("pending", "succeeded")).toBe("succeeded");
    expect(event.state).toBe("draft");
    expect(transitionEvent(event, "published", paid)).toBe("published");
    expect(event.state).toBe("draft");
  });
});
