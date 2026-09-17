export const CURRENT_RSVP_FIELDS = "event_slug,guest_id,created_at,attendance_status,guests_count";

export type RsvpRecord = {
  event_slug: string;
  guest_id: string | null;
  created_at: string;
  attendance_status: string;
  guests_count: number;
};

export type CurrentRsvp =
  | { kind: "none" }
  | { kind: "ambiguous" }
  | { kind: "current"; response: { attendance_status: string; guests_count: number } };

// created_at is registration time, not modification time. Preserve fractional
// precision (including PostgreSQL microseconds) instead of truncating to milliseconds.
function registrationKey(value: string): string | null {
  if (typeof value !== "string") return null;
  const match = value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2})$/i);
  if (!match) return null;
  const seconds = Date.parse(`${match[1]}${match[3]}`);
  if (!Number.isFinite(seconds)) return null;
  return `${new Date(seconds).toISOString().slice(0, 19)}.${(match[2] ?? "").padEnd(9, "0")}`;
}

export function currentRsvpsByGuest(rows: readonly RsvpRecord[], eventSlug: string): Map<string, CurrentRsvp> {
  const groups = new Map<string, RsvpRecord[]>();
  for (const row of rows) {
    if (row.event_slug !== eventSlug || typeof row.guest_id !== "string") continue;
    const group = groups.get(row.guest_id) ?? [];
    group.push(row);
    groups.set(row.guest_id, group);
  }

  const result = new Map<string, CurrentRsvp>();
  for (const [guestId, group] of groups) {
    const dated = group.map((row) => ({ row, key: registrationKey(row.created_at) }));
    if (dated.some(({ key }) => key === null)) {
      result.set(guestId, { kind: "ambiguous" });
      continue;
    }
    const latest = dated.reduce((maximum, { key }) => key! > maximum ? key! : maximum, "");
    const tied = dated.filter(({ key }) => key === latest).map(({ row }) => row);
    const { attendance_status, guests_count } = tied[0];
    if (
      !["confirmed", "declined"].includes(attendance_status) ||
      !Number.isInteger(guests_count) || guests_count < 0 ||
      tied.some((row) => row.attendance_status !== attendance_status || row.guests_count !== guests_count)
    ) {
      result.set(guestId, { kind: "ambiguous" });
    } else {
      // Only return the agreed state/count, never an arbitrarily chosen history row.
      result.set(guestId, { kind: "current", response: { attendance_status, guests_count } });
    }
  }
  return result;
}

export function currentRsvpForGuest(rows: readonly RsvpRecord[], eventSlug: string, guestId: string): CurrentRsvp {
  return currentRsvpsByGuest(rows, eventSlug).get(guestId) ?? { kind: "none" };
}
