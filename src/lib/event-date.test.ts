import { getCountdownParts, parseEventDateTime } from "@/lib/event-date";
import { describe, expect, it } from "vitest";

describe("parseEventDateTime", () => {
  it("parses a Spanish date with a 12-hour time", () => {
    const result = parseEventDateTime(
      "Sábado 17 de octubre de 2026",
      "4:30 PM"
    );

    expect(result).not.toBeNull();
    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(9);
    expect(result?.getDate()).toBe(17);
    expect(result?.getHours()).toBe(16);
    expect(result?.getMinutes()).toBe(30);
  });

  it("parses an ISO date and allows a separate event time", () => {
    const result = parseEventDateTime("2026-10-18", "17:05 h");

    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(9);
    expect(result?.getDate()).toBe(18);
    expect(result?.getHours()).toBe(17);
    expect(result?.getMinutes()).toBe(5);
  });

  it("uses an embedded ISO time when no separate time is available", () => {
    const result = parseEventDateTime("2026-10-18T09:15");

    expect(result?.getHours()).toBe(9);
    expect(result?.getMinutes()).toBe(15);
  });

  it("rejects impossible and unsupported dates", () => {
    expect(parseEventDateTime("31 de febrero de 2026")).toBeNull();
    expect(parseEventDateTime("próximamente")).toBeNull();
  });
});

describe("getCountdownParts", () => {
  it("splits the remaining time into stable calendar units", () => {
    const currentDate = new Date(2026, 7, 30, 12, 0, 0);
    const targetDate = new Date(2026, 8, 1, 14, 3, 4);

    expect(getCountdownParts(targetDate, currentDate)).toEqual({
      days: 2,
      hours: 2,
      minutes: 3,
      seconds: 4,
      isComplete: false,
    });
  });

  it("stops at zero after the event begins", () => {
    const targetDate = new Date(2026, 7, 30, 12, 0, 0);
    const currentDate = new Date(2026, 7, 30, 12, 0, 1);

    expect(getCountdownParts(targetDate, currentDate)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isComplete: true,
    });
  });
});
