export type GuestPresenceStatus = "not-arrived" | "inside" | "checked-out";

type GuestAttendanceSnapshot = {
  checkedInAt: string | null;
  checkedInCount: number | null;
};

export function getGuestPresenceStatus({
  checkedInAt,
  checkedInCount,
}: GuestAttendanceSnapshot): GuestPresenceStatus {
  if (!checkedInAt) {
    return "not-arrived";
  }

  return typeof checkedInCount === "number" && checkedInCount > 0
    ? "inside"
    : "checked-out";
}

export function isGuestInside(snapshot: GuestAttendanceSnapshot) {
  return getGuestPresenceStatus(snapshot) === "inside";
}

export function getPeopleInside(snapshot: GuestAttendanceSnapshot) {
  return isGuestInside(snapshot) &&
    Number.isInteger(snapshot.checkedInCount) &&
    (snapshot.checkedInCount ?? 0) > 0
    ? snapshot.checkedInCount ?? 0
    : 0;
}

export function getCheckInCountError(value: number, maximum: number) {
  if (!Number.isInteger(value) || value < 1 || value > maximum) {
    return `La cantidad debe ser un entero entre 1 y ${maximum}.`;
  }

  return null;
}
