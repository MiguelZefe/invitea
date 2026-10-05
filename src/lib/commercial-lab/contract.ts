// Pure demonstration contract. Never an authorization or payment receipt.
export const OFFER = Object.freeze({ amountCents: 9900, currency: "MXN" as const });
export type EventState = "draft" | "published" | "archived";
export type PaymentState = "created" | "pending" | "succeeded" | "failed" | "cancelled";

const paymentTransitions: Record<PaymentState, readonly PaymentState[]> = {
  created: ["pending", "cancelled"],
  pending: ["succeeded", "failed", "cancelled"],
  succeeded: [], failed: [], cancelled: [],
};

export function transitionPayment(from: PaymentState, to: PaymentState): PaymentState {
  if (!paymentTransitions[from]?.includes(to)) throw new Error("Transición de pago inválida");
  return to;
}

export type DemoAttempt = {
  eventId: string;
  state: PaymentState;
  amountCents: number;
  currency: string;
};

// Future server integration must authenticate ownership and verify a provider
// notification transactionally BEFORE evaluating this rule. Browser data is untrusted.
export function transitionEvent(
  event: { id: string; state: EventState },
  to: EventState,
  attempt?: DemoAttempt,
): EventState {
  if (event.state === "draft" && to === "published" &&
      attempt?.eventId === event.id && attempt.state === "succeeded" &&
      attempt.amountCents === OFFER.amountCents && attempt.currency === OFFER.currency) {
    return to;
  }
  if ((event.state === "draft" || event.state === "published") && to === "archived") return to;
  throw new Error("Transición de evento inválida");
}
