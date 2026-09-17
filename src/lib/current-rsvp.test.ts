import { describe, expect, it } from "vitest";
import { currentRsvpForGuest, currentRsvpsByGuest, type RsvpRecord } from "./current-rsvp";

const base: RsvpRecord = {
  event_slug: "evento-prueba", guest_id: "invitado-prueba", created_at: "2030-01-01T00:00:00Z",
  attendance_status: "confirmed", guests_count: 2,
};
const select = (rows: RsvpRecord[]) => currentRsvpForGuest(rows, base.event_slug, base.guest_id!);

describe("current RSVP by registration date", () => {
  it("distinguishes no response from one response", () => {
    expect(select([])).toEqual({ kind: "none" });
    expect(select([base])).toEqual({ kind: "current", response: { attendance_status: "confirmed", guests_count: 2 } });
  });

  it.each([
    ["confirmed", "declined", 2, 1],
    ["declined", "confirmed", 1, 3],
    ["confirmed", "confirmed", 2, 3],
  ])("selects %s → %s and count %s → %s independently of array order", (before, after, oldCount, newCount) => {
    const older = { ...base, attendance_status: before as string, guests_count: oldCount as number };
    const newer = { ...base, created_at: "2030-01-02T00:00:00Z", attendance_status: after as string, guests_count: newCount as number };
    for (const rows of [[older, newer], [newer, older]]) {
      expect(select(rows)).toEqual({ kind: "current", response: { attendance_status: after, guests_count: newCount } });
    }
  });

  it("separates events and guests and ignores unlinked responses", () => {
    const rows = [base,
      { ...base, event_slug: "otro-evento", attendance_status: "declined", created_at: "2030-01-03T00:00:00Z" },
      { ...base, guest_id: "otro-invitado", guests_count: 4 },
      { ...base, guest_id: null, guests_count: 9 },
    ];
    expect(select(rows)).toEqual(select([base]));
    expect(currentRsvpsByGuest(rows, base.event_slug).size).toBe(2);
    expect(currentRsvpForGuest(rows, "otro-evento", base.guest_id!)).toMatchObject({ response: { attendance_status: "declined" } });
  });

  it.each([
    { attendance_status: "declined" },
    { guests_count: 3 },
  ])("blocks incompatible latest ties: %j", (difference) => {
    const conflicting = { ...base, ...difference };
    expect(select([base, conflicting])).toEqual({ kind: "ambiguous" });
    expect(select([conflicting, base])).toEqual({ kind: "ambiguous" });
  });

  it("accepts compatible latest ties without selecting an arbitrary history record", () => {
    expect(select([base, { ...base }])).toEqual({ kind: "current", response: { attendance_status: "confirmed", guests_count: 2 } });
  });

  it("ignores conflicts at an older date when a later response is unambiguous", () => {
    const latest = { ...base, created_at: "2030-02-01T00:00:00Z", guests_count: 4 };
    expect(select([base, latest, { ...base, attendance_status: "declined" }])).toMatchObject({ kind: "current", response: { guests_count: 4 } });
  });

  it("recognizes equal instants across timezone offsets", () => {
    expect(select([base, { ...base, created_at: "2029-12-31T18:00:00-06:00", guests_count: 3 }])).toEqual({ kind: "ambiguous" });
  });

  it("does not collapse distinct microseconds into an artificial tie", () => {
    const older = { ...base, created_at: "2030-01-01T00:00:00.123001Z" };
    const newer = { ...base, created_at: "2030-01-01T00:00:00.123002+00:00", attendance_status: "declined" };
    expect(select([newer, older])).toMatchObject({ kind: "current", response: { attendance_status: "declined" } });
  });

  it("does not guess an order when a registration date is unusable", () => {
    expect(select([base, { ...base, created_at: "unknown" }])).toEqual({ kind: "ambiguous" });
  });

  it("does not mutate or remove history", () => {
    const rows = Object.freeze([Object.freeze(base), Object.freeze({ ...base, created_at: "2030-02-01T00:00:00Z" })]);
    currentRsvpsByGuest(rows, base.event_slug);
    expect(rows).toHaveLength(2);
    expect(rows[0].created_at).toBe(base.created_at);
  });
});
