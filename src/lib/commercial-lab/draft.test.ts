import { expect, it } from "vitest";
import { DRAFT_TTL_MS, loadDraft, loadDraftRecord, saveDraft, STORAGE_KEY, SYNTHETIC_DRAFT, validateDraft } from "./draft";

it("creates, edits, and recovers the same draft from persisted JSON", () => {
  const data = new Map<string, string>();
  const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); }, removeItem: (key: string) => { data.delete(key); } };
  expect(loadDraft(storage)).toBeNull();
  saveDraft(storage, SYNTHETIC_DRAFT);
  const edited = { ...loadDraft(storage)!, type: "baby-shower" as const, names: "Bebé de ejemplo", location: "Salón ficticio" };
  saveDraft(storage, edited);
  expect(loadDraft(storage)).toEqual(edited);
  expect([...data.keys()]).toEqual([STORAGE_KEY]);
});

it("expires a saved draft after thirty minutes and removes it", () => {
  const data = new Map<string, string>();
  const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); }, removeItem: (key: string) => { data.delete(key); } };
  const savedAt = 1_000_000;
  data.set(STORAGE_KEY, JSON.stringify({ draft: SYNTHETIC_DRAFT, savedAt, expiresAt: savedAt + DRAFT_TTL_MS }));
  expect(loadDraftRecord(storage, savedAt + DRAFT_TTL_MS - 1)?.draft).toEqual(SYNTHETIC_DRAFT);
  expect(loadDraftRecord(storage, savedAt + DRAFT_TTL_MS)).toBeNull();
  expect(data.has(STORAGE_KEY)).toBe(false);
});

it.each([
  null, {}, { ...SYNTHETIC_DRAFT, state: "published" }, { ...SYNTHETIC_DRAFT, version: 2 },
  { ...SYNTHETIC_DRAFT, type: "other" }, { ...SYNTHETIC_DRAFT, names: "  " },
  { ...SYNTHETIC_DRAFT, location: "" }, { ...SYNTHETIC_DRAFT, names: "x".repeat(121) },
  { ...SYNTHETIC_DRAFT, date: "2026-02-30" }, { ...SYNTHETIC_DRAFT, date: "invalid" },
])("rejects malformed or tampered drafts: %j", value => {
  expect(() => validateDraft(value)).toThrow();
});

it("does not restore injected payment or ownership properties", () => {
  expect(validateDraft({ ...SYNTHETIC_DRAFT, payment: "succeeded", owner: "admin" })).toEqual(SYNTHETIC_DRAFT);
});

it("surfaces storage failures and malformed JSON without fallback", () => {
  expect(() => loadDraft({ getItem: () => "{", setItem() {} })).toThrow();
  expect(() => saveDraft({ getItem: () => null, setItem() { throw new Error("quota"); } }, SYNTHETIC_DRAFT)).toThrow("quota");
});
