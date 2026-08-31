type GuestAttendanceSnapshot = {
  checkedInAt: string | null;
  checkedInCount: number | null;
};

export function isGuestCheckedIn(snapshot: GuestAttendanceSnapshot) {
  return Boolean(snapshot.checkedInAt);
}

export function getCheckedInPeople(snapshot: GuestAttendanceSnapshot) {
  return isGuestCheckedIn(snapshot) &&
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

export function getAttendanceVerificationError(verified: boolean) {
  return verified
    ? null
    : "Confirma que verificaste el nombre y la cantidad de asistentes.";
}
