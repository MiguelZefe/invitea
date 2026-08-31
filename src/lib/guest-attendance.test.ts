import { describe, expect, it } from "vitest";

import {
  getCheckInCountError,
  getGuestPresenceStatus,
  getPeopleInside,
  isGuestInside,
} from "./guest-attendance";

describe("guest attendance", () => {
  it("distinguishes guests who never arrived, are inside, or checked out", () => {
    expect(
      getGuestPresenceStatus({ checkedInAt: null, checkedInCount: null })
    ).toBe("not-arrived");
    expect(
      getGuestPresenceStatus({
        checkedInAt: "2026-09-19T20:00:00.000Z",
        checkedInCount: 3,
      })
    ).toBe("inside");
    expect(
      getGuestPresenceStatus({
        checkedInAt: "2026-09-19T20:00:00.000Z",
        checkedInCount: null,
      })
    ).toBe("checked-out");
  });

  it("treats a previous check-in without a current count as checked out", () => {
    const snapshot = {
      checkedInAt: "2026-09-19T20:00:00.000Z",
      checkedInCount: null,
    };

    expect(isGuestInside(snapshot)).toBe(false);
    expect(getPeopleInside(snapshot)).toBe(0);
  });

  it("counts only people currently inside", () => {
    expect(
      getPeopleInside({
        checkedInAt: "2026-09-19T20:00:00.000Z",
        checkedInCount: 4,
      })
    ).toBe(4);
    expect(
      getPeopleInside({
        checkedInAt: "2026-09-19T20:00:00.000Z",
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
});
