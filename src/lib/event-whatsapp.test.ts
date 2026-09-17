import { expect, it } from "vitest";
import { canWhatsAppBePrimary, encodeWhatsAppMessage, isWhatsAppNumber, normalizeWhatsAppInput, validateEventWhatsApp } from "./event-whatsapp";

it("normalizes explicit international input and prepares the local contract", () => {
  const form = new FormData();
  form.set("whatsapp_number", " +1 202-555-0100 ");
  form.set("whatsapp_primary", "on");
  expect(validateEventWhatsApp(form)).toEqual({ success: true, values: { whatsapp_number: "12025550100", whatsapp_primary: true } });
});

it.each(["12345678", "123456789012345"])("accepts the local length boundary %s", (number) => {
  expect(isWhatsAppNumber(number)).toBe(true);
  expect(normalizeWhatsAppInput(`+${number}`)).toBe(number);
});

it.each([undefined, false, "true", 1, null])("requires strict boolean true: %s", (preference) => {
  expect(canWhatsAppBePrimary({ whatsapp_number: "12025550100", whatsapp_primary: preference as boolean })).toBe(false);
});

it("requires a valid number and isolates event preferences", () => {
  expect(canWhatsAppBePrimary({ whatsapp_primary: true })).toBe(false);
  expect(canWhatsAppBePrimary({ whatsapp_number: "invalid", whatsapp_primary: true })).toBe(false);
  expect(canWhatsAppBePrimary({ whatsapp_number: "12025550100", whatsapp_primary: true })).toBe(true);
  expect(canWhatsAppBePrimary({ whatsapp_number: "12025550101" })).toBe(false);
});

it.each(["confirmed", "declined"] as const)("encodes a public %s message", (attendanceStatus) => {
  const encoded = encodeWhatsAppMessage({
    eventTitle: " Evento ficticio ", fullName: " Persona ficticia ",
    attendanceStatus, guestsCount: 2, message: " Cariño & alegría + 🎉\n¡Sí! ",
  });
  expect(decodeURIComponent(encoded)).toBe([
    "Evento: Evento ficticio", "Nombre: Persona ficticia",
    attendanceStatus === "confirmed" ? "Asistiré." : "No podré asistir.",
    attendanceStatus === "confirmed" ? "Cantidad de asistentes: 2" : "",
    "Mensaje: Cariño & alegría + 🎉\n¡Sí!",
  ].filter(Boolean).join("\n"));
  expect(encoded).toContain("%26");
  expect(encoded).toContain("%2B");
});

it.each([undefined, "", "  "])("omits optional blank message %s", (message) => {
  expect(decodeURIComponent(encodeWhatsAppMessage({
    eventTitle: "Evento ficticio", fullName: "Persona ficticia",
    attendanceStatus: "declined", guestsCount: 0, message,
  }))).toBe("Evento: Evento ficticio\nNombre: Persona ficticia\nNo podré asistir.");
});
it.each(["2025550100", "0012025550100", "+1 2025550100 ext 2", "+1 2025550100x2", "+1 abc", "+123", "+1234567890123456", "+0123456789"])("rejects ambiguous or invalid input %s", (value) => {
  expect(normalizeWhatsAppInput(value)).toBeNull();
  const form = new FormData(); form.set("whatsapp_number", value);
  expect(validateEventWhatsApp(form).success).toBe(false);
});
it("keeps empty configuration safe and forbids primary without a number", () => {
  const form = new FormData();
  expect(validateEventWhatsApp(form)).toEqual({ success: true, values: { whatsapp_number: null, whatsapp_primary: false } });
  form.set("whatsapp_primary", "on");
  expect(validateEventWhatsApp(form).success).toBe(false);
});
