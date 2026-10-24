import { expect, it } from "vitest";
import { ASSISTED_OFFER, ASSISTED_WHATSAPP_NUMBER, assistedCustomEventQuoteLink, assistedExtraQuoteLink, assistedOrderLink, assistedVoiceQuoteLink, buildAssistedOrderMessage } from "./assisted-sales";
it("routes the single offer to the owner's contact without confirming a payment", () => {
  expect(ASSISTED_OFFER).toEqual({ amountCents: 9900, currency: "MXN" });
  expect(ASSISTED_WHATSAPP_NUMBER).toBe("525525613131");
  for (const type of [undefined, "Cumpleaños", "Bautizo"] as const) {
    const url = new URL(assistedOrderLink(type));
    expect(url.origin).toBe("https://wa.me");
    expect(url.pathname).toBe("/525525613131");
    const message = url.searchParams.get("text")!;
    expect(message).toContain(type ?? "por elegir");
    expect(message).toContain("$99 MXN");
    expect(message).toContain("invitación sencilla");
    expect(message).toContain("Hora: por confirmar.");
    expect(message).toContain("antes de transferir");
  }
});

it("includes the requested event hour in the WhatsApp draft", () => {
  const message = buildAssistedOrderMessage({
    type: "Bautizo",
    name: " Mateo ",
    date: "2026-12-20",
    time: "13:30",
    place: " Salón de ejemplo ",
  });

  expect(message).toContain("Celebración: Bautizo.");
  expect(message).toContain("Nombre: Mateo.");
  expect(message).toContain("Fecha: 2026-12-20.");
  expect(message).toContain("Hora: 13:30.");
  expect(message).toContain("Lugar: Salón de ejemplo.");
});

it("puts entered sample details in the WhatsApp draft", () => {
  const url = new URL(assistedOrderLink("Bautizo", {
    name: "Mateo",
    date: "2026-12-20",
    time: "13:30",
    place: "Salón de ejemplo",
  }));
  const message = url.searchParams.get("text")!;

  expect(message).toContain("Celebración: Bautizo.");
  expect(message).toContain("Nombre: Mateo.");
  expect(message).toContain("Fecha: 2026-12-20.");
  expect(message).toContain("Hora: 13:30.");
  expect(message).toContain("Lugar: Salón de ejemplo.");
});

it("keeps cleared or whitespace-only fields as unconfirmed in the WhatsApp draft", () => {
  const url = new URL(assistedOrderLink("Cumpleaños", {
    name: "  ",
    date: "",
    time: "",
    place: "   ",
  }));
  const message = url.searchParams.get("text")!;

  expect(message).toContain("Nombre: por confirmar.");
  expect(message).toContain("Fecha: por confirmar.");
  expect(message).toContain("Hora: por confirmar.");
  expect(message).toContain("Lugar: por confirmar.");
});

it("adds the optional custom voice as a separately quoted extra only when selected", () => {
  const withVoice = buildAssistedOrderMessage({ type: "Bautizo", customVoice: true });
  const withoutVoice = buildAssistedOrderMessage({ type: "Bautizo", customVoice: false });

  expect(withVoice).toContain("narración de voz personalizada (cotización aparte)");
  expect(withoutVoice).not.toContain("narración de voz personalizada");
  expect(withVoice).toContain("invitación sencilla de ZefeInvita por $99 MXN");
});

it("creates a separate WhatsApp inquiry for a custom voice quote", () => {
  const url = new URL(assistedVoiceQuoteLink());
  const message = url.searchParams.get("text")!;

  expect(url.origin).toBe("https://wa.me");
  expect(url.pathname).toBe("/525525613131");
  expect(message).toContain("voz personalizada");
  expect(message).toContain("cotización");
  expect(message).not.toContain("$99 MXN");
});

it("keeps check-in and album inquiries separate from the $99 offer", () => {
  for (const [extra, phrase] of [["checkin", "check-in con QR"], ["album", "álbum digital"]] as const) {
    const url = new URL(assistedExtraQuoteLink(extra));
    expect(url.origin).toBe("https://wa.me");
    expect(url.pathname).toBe("/525525613131");
    const message = url.searchParams.get("text")!;
    expect(message).toContain(phrase);
    expect(message).toContain("cotización");
    expect(message).not.toContain("$99 MXN");
    expect(message).not.toContain("confirmado");
  }
});

it("offers custom events as a separate consultation without claiming the $99 price", () => {
  const url = new URL(assistedCustomEventQuoteLink("Boda"));
  const message = url.searchParams.get("text")!;
  expect(url.origin).toBe("https://wa.me");
  expect(message).toContain("invitación personalizada para Boda");
  expect(message).toContain("por cotizar aparte");
  expect(message).not.toContain("por $99 MXN");
});
