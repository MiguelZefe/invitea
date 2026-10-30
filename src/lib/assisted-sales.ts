// Public contact supplied by the owner; no payment credentials or network calls.
export const ASSISTED_OFFER = Object.freeze({ amountCents: 9900, currency: "MXN" });
export const ASSISTED_WHATSAPP_NUMBER = "525525613131";
export type SimpleEventType = "Cumpleaños" | "Bautizo";

export type AssistedOrderDetails = {
  type?: SimpleEventType;
  template?: string;
  name?: string;
  date?: string;
  time?: string;
  place?: string;
  customVoice?: boolean;
};

export function buildAssistedOrderMessage({ type, template, name, date, time, place, customVoice }: AssistedOrderDetails = {}) {
  return [
    "Hola, quiero pedir una invitación sencilla de ZefeInvita por $99 MXN.",
    `Celebración: ${type ?? "por elegir"}.`,
    ...(template?.trim() ? [`Plantilla que me gustó: ${template.trim()}.`] : []),
    `Nombre: ${name?.trim() || "por confirmar"}.`,
    `Fecha: ${date || "por confirmar"}.`,
    `Hora: ${time || "por confirmar"}.`,
    `Lugar: ${place?.trim() || "por confirmar"}.`,
    ...(customVoice ? ["También quiero consultar una narración de voz personalizada (cotización aparte)."] : []),
    "Quisiera confirmar qué incluye, disponibilidad y fecha de entrega antes de transferir.",
  ].join("\n");
}

export function assistedOrderLink(type?: SimpleEventType, details: Omit<AssistedOrderDetails, "type"> = {}) {
  return `https://wa.me/${ASSISTED_WHATSAPP_NUMBER}?text=${encodeURIComponent(buildAssistedOrderMessage({ ...details, type }))}`;
}

export function assistedVoiceQuoteLink() {
  const message = [
    "Hola, quiero consultar por una voz personalizada para acompañar mi invitación.",
    "Tipo de evento y estilo de voz: por definir.",
    "Quisiera conocer opciones, disponibilidad y cotización antes de confirmar.",
  ].join("\n");

  return `https://wa.me/${ASSISTED_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export type AssistedExtra = "checkin" | "album";

export function assistedExtraQuoteLink(extra: AssistedExtra) {
  const title = extra === "checkin" ? "check-in con QR para invitados" : "álbum digital de fotos y videos";
  const message = [
    `Hola, quisiera consultar el complemento de ${title} para una invitación de ZefeInvita.`,
    "Tipo de evento, fecha y número de invitados: por confirmar.",
    "Quisiera conocer alcance, disponibilidad y cotización antes de contratar.",
  ].join("\n");
  return `https://wa.me/${ASSISTED_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function assistedCustomEventQuoteLink(eventType: string, template?: string) {
  const message = [
    `Hola, quiero consultar una invitación personalizada para ${eventType}.`,
    ...(template?.trim() ? [`Plantilla que me gustó: ${template.trim()}.`] : []),
    "Me interesan las plantillas de muestra y quisiera definir diseño, funciones, disponibilidad y precio.",
    "Entiendo que es un proyecto por cotizar aparte de la invitación sencilla de $99 MXN.",
  ].join("\n");
  return `https://wa.me/${ASSISTED_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
