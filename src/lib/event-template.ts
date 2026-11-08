export type InvitationTemplate = "wedding" | "baby-shower" | "celebration";

export function getInvitationTemplate(eventType: string): InvitationTemplate {
  const normalizedType = eventType
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  if (
    normalizedType.includes("baby shower") ||
    normalizedType.includes("babyshower") ||
    normalizedType.includes("bebeshower") ||
    normalizedType.includes("bebe shower")
  ) {
    return "baby-shower";
  }

  if (/\b(boda|matrimonio|wedding)\b/.test(normalizedType)) return "wedding";

  return "celebration";
}
