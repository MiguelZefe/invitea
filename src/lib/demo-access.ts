export function createDemoAccessPayload(eventType: string) {
  const eventSlug = eventType
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "celebracion";

  return `ZEFEINVITA|DEMO|${eventSlug}|INVITADO-001`;
}
