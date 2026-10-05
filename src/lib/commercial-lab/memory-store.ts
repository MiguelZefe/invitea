// Synthetic contract harness only. Not a server, authentication, or webhook verifier.
import { OFFER } from "@/lib/commercial-lab/contract";
import { validateDraft, type Draft } from "@/lib/commercial-lab/draft";

type Event = { id: string; owner: string; draft: Draft; published: boolean };
type Attempt = {
  id: string; eventId: string; owner: string;
  amountCents: number; currency: string;
  state: "pending" | "failed" | "succeeded";
};
export type SyntheticConfirmation = {
  notificationId: string; attemptId: string; eventId: string; owner: string;
  amountCents: number; currency: string; result: "failed" | "succeeded";
};

/** All identities and confirmations are synthetic inputs supplied by tests.
 * A real adapter must obtain identity from a trusted session, verify provider
 * signatures, and use database transactions/unique constraints. Never expose
 * confirmSynthetic as an endpoint or accept these identities from a browser.
 */
export function createMemoryStore() {
  const events = new Map<string, Event>();
  const attempts = new Map<string, Attempt>();
  const notifications = new Map<string, string>();
  let sequence = 0;
  function owned(owner: string, id: string) {
    const event = events.get(id);
    if (!owner || !event || event.owner !== owner) throw new Error("Evento no disponible");
    return event;
  }
  return {
    create(owner: string, value: Draft) {
      if (!owner.trim()) throw new Error("Identidad sintética requerida");
      const draft = validateDraft(value);
      const id = `demo-event-${++sequence}`;
      events.set(id, { id, owner, draft, published: false });
      return id;
    },
    read(owner: string, id: string) {
      const event = owned(owner, id);
      return { ...event, draft: { ...event.draft } };
    },
    edit(owner: string, id: string, value: Draft) {
      const event = owned(owner, id);
      event.draft = validateDraft(value);
      // Editing the same event preserves its synthetic publication entitlement.
    },
    begin(owner: string, id: string) {
      const event = owned(owner, id);
      if (event.published) throw new Error("El evento ya está activado en la simulación");
      const pending = [...attempts.values()].find(a => a.eventId === id && a.state === "pending");
      if (pending) return { ...pending };
      const attempt: Attempt = {
        id: `demo-attempt-${++sequence}`, eventId: id, owner, ...OFFER, state: "pending",
      };
      attempts.set(attempt.id, attempt);
      return { ...attempt };
    },
    confirmSynthetic(input: SyntheticConfirmation) {
      if (!input.notificationId.trim() || !["failed", "succeeded"].includes(input.result)) {
        throw new Error("Confirmación sintética inválida");
      }
      const attempt = attempts.get(input.attemptId);
      if (!attempt || input.eventId !== attempt.eventId || input.owner !== attempt.owner ||
          input.amountCents !== OFFER.amountCents || input.currency !== OFFER.currency) {
        throw new Error("La confirmación no corresponde a la compra");
      }
      const event = owned(input.owner, input.eventId);
      const fingerprint = JSON.stringify([
        input.attemptId, input.eventId, input.owner, input.amountCents, input.currency, input.result,
      ]);
      const prior = notifications.get(input.notificationId);
      if (prior && prior !== fingerprint) throw new Error("Identificador de notificación reutilizado");
      if (prior) return { duplicate: true, activated: false };

      // Synthetic reconciliation: success is authoritative and never downgraded
      // by a late failure. A provider adapter must map its actual event semantics.
      const activated = input.result === "succeeded" && !event.published;
      notifications.set(input.notificationId, fingerprint);
      if (input.result === "succeeded") {
        attempt.state = "succeeded";
        event.published = true;
      } else if (attempt.state !== "succeeded") attempt.state = "failed";
      return { duplicate: false, activated };
    },
  };
}
