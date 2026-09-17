export type EventWhatsApp = { whatsapp_number?: string | null; whatsapp_primary?: boolean };

export function isWhatsAppNumber(value: unknown): value is string {
  return typeof value === "string" && /^[1-9]\d{7,14}$/.test(value);
}

export function canWhatsAppBePrimary(config: EventWhatsApp): boolean {
  return config.whatsapp_primary === true && isWhatsAppNumber(config.whatsapp_number);
}

// Uses the existing RSVP status values. The caller validates the form and passes
// only public fields; this formatter has no persistence or browser side effects.
export function encodeWhatsAppMessage(input: {
  eventTitle: string;
  fullName: string;
  attendanceStatus: "confirmed" | "declined";
  guestsCount: number;
  message?: string;
}): string {
  return encodeURIComponent([
    `Evento: ${input.eventTitle.trim()}`,
    `Nombre: ${input.fullName.trim()}`,
    input.attendanceStatus === "confirmed" ? "Asistiré." : "No podré asistir.",
    input.attendanceStatus === "confirmed" ? `Cantidad de asistentes: ${input.guestsCount}` : "",
    input.message?.trim() ? `Mensaje: ${input.message.trim()}` : "",
  ].filter(Boolean).join("\n"));
}

// User input requires + and a country code; stored values contain only digits.
export function normalizeWhatsAppInput(input: string): string | null {
  const value = input.trim();
  if (!/^\+[1-9][\d -]*\d$/.test(value)) return null;
  const digits = value.replace(/[+ -]/g, "");
  return isWhatsAppNumber(digits) ? digits : null;
}

// Local contract, deliberately not connected to writes until schema verification.
export function validateEventWhatsApp(form: FormData):
  | { success: true; values: Required<EventWhatsApp> }
  | { success: false; message: string } {
  const raw = form.get("whatsapp_number");
  const primary = form.get("whatsapp_primary") === "on";
  const number = typeof raw === "string" && raw.trim() ? normalizeWhatsAppInput(raw) : null;
  if ((raw !== null && typeof raw !== "string") || (typeof raw === "string" && raw.trim() && !number) || (primary && !number)) {
    return { success: false, message: "Indica un número internacional válido con + y código de país para usar WhatsApp." };
  }
  return { success: true, values: { whatsapp_number: number, whatsapp_primary: primary } };
}
