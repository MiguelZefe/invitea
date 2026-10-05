export const STORAGE_KEY = "zefeinvita:commercial-lab:draft:v1";
export type Draft = {
  version: 1;
  state: "draft";
  type: "wedding" | "baby-shower";
  names: string;
  date: string;
  location: string;
};
export const SYNTHETIC_DRAFT: Draft = {
  version: 1, state: "draft", type: "wedding",
  names: "Alex y Sam (ficticios)", date: "2026-11-16",
  location: "Jardín de ejemplo, Ciudad imaginaria",
};

export function validateDraft(value: unknown): Draft {
  if (!value || typeof value !== "object") throw new Error("Borrador inválido");
  const d = value as Record<string, unknown>;
  if (d.version !== 1 || d.state !== "draft" ||
      (d.type !== "wedding" && d.type !== "baby-shower") ||
      typeof d.names !== "string" || !d.names.trim() || d.names.length > 120 ||
      typeof d.location !== "string" || !d.location.trim() || d.location.length > 200 ||
      typeof d.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(d.date) ||
      !Number.isFinite(Date.parse(d.date)) || new Date(d.date).toISOString().slice(0, 10) !== d.date) {
    throw new Error("Revisa nombres, fecha y ubicación del borrador");
  }
  // Whitelist fields: injected payment/publication data is never restored.
  return { version: 1, state: "draft", type: d.type, names: d.names.trim(), date: d.date, location: d.location.trim() };
}

type Storage = Pick<globalThis.Storage, "getItem" | "setItem">;
export function loadDraft(storage: Storage): Draft | null {
  const raw = storage.getItem(STORAGE_KEY);
  return raw === null ? null : validateDraft(JSON.parse(raw));
}
export function saveDraft(storage: Storage, value: Draft): Draft {
  const draft = validateDraft(value);
  storage.setItem(STORAGE_KEY, JSON.stringify(draft));
  return draft;
}
