import { describe, expect, it } from "vitest";

import {
  getAttendanceVerificationError,
  getCheckedInPeople,
  getCheckInCountError,
  isGuestCheckedIn,
} from "./guest-attendance";

describe("guest attendance", () => {
  it("uses the check-in timestamp as the authoritative access state", () => {
    expect(
      isGuestCheckedIn({ checkedInAt: null, checkedInCount: null })
    ).toBe(false);
    expect(
      isGuestCheckedIn({
        checkedInAt: "2026-09-19T20:00:00.000Z",
        checkedInCount: 3,
      })
    ).toBe(true);
  });

  it("keeps a historical check-in valid when its count is unavailable", () => {
    const snapshot = {
      checkedInAt: "2026-09-19T20:00:00.000Z",
      checkedInCount: null,
    };

    expect(isGuestCheckedIn(snapshot)).toBe(true);
    expect(getCheckedInPeople(snapshot)).toBe(0);
  });

  it("counts people from completed check-ins", () => {
    expect(
      getCheckedInPeople({
        checkedInAt: "2026-09-19T20:00:00.000Z",
        checkedInCount: 4,
      })
    ).toBe(4);
    expect(
      getCheckedInPeople({
        checkedInAt: null,
        checkedInCount: null,
      })
    ).toBe(0);
  });

  it("validates whole check-in counts within the guest pass limit", () => {
    expect(getCheckInCountError(1, 3)).toBeNull();
    expect(getCheckInCountError(3, 3)).toBeNull();
    expect(getCheckInCountError(0, 3)).toBe(
      "La cantidad debe ser un entero entre 1 y 3."
    );
    expect(getCheckInCountError(1.5, 3)).toBe(
      "La cantidad debe ser un entero entre 1 y 3."
    );
    expect(getCheckInCountError(4, 3)).toBe(
      "La cantidad debe ser un entero entre 1 y 3."
    );
  });

  it("requires an explicit human attendance verification", () => {
    expect(getAttendanceVerificationError(true)).toBeNull();
    expect(getAttendanceVerificationError(false)).toBe(
      "Confirma que verificaste el nombre y la cantidad de asistentes."
    );
  });
});
