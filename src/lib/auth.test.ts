import {
  createAuthConfirmationNonce,
  createRecoveryMark,
  getConfirmationErrorDestination,
  isTrustedAuthRequest,
  isValidAuthConfirmationNonce,
  isValidRecoveryMark,
  parseConfirmationType,
  RECOVERY_MARK_MAX_AGE_SECONDS,
} from "@/lib/auth";
import { afterEach, describe, expect, it, vi } from "vitest";

const previousRecoverySecret = process.env.AUTH_RECOVERY_MARK_SECRET;

afterEach(() => {
  vi.useRealTimers();

  if (previousRecoverySecret === undefined) {
    delete process.env.AUTH_RECOVERY_MARK_SECRET;
  } else {
    process.env.AUTH_RECOVERY_MARK_SECRET = previousRecoverySecret;
  }
});

describe("auth confirmation helpers", () => {
  it("normalizes supported confirmation types", () => {
    expect(parseConfirmationType("signup")).toBe("signup");
    expect(parseConfirmationType("recovery")).toBe("recovery");
    expect(parseConfirmationType("email")).toBe("signup");
    expect(parseConfirmationType("unknown")).toBeNull();
  });

  it("creates and validates a single confirmation nonce", () => {
    const nonce = createAuthConfirmationNonce();
    const tamperedNonce = `${nonce[0] === "a" ? "b" : "a"}${nonce.slice(1)}`;

    expect(nonce).toHaveLength(43);
    expect(isValidAuthConfirmationNonce(nonce, nonce)).toBe(true);
    expect(isValidAuthConfirmationNonce(tamperedNonce, nonce)).toBe(false);
    expect(isValidAuthConfirmationNonce(nonce, undefined)).toBe(false);
  });

  it("accepts only trusted same-origin confirmation requests", () => {
    const requestUrl = new URL("http://localhost:3000/auth/confirm");

    expect(
      isTrustedAuthRequest(
        requestUrl,
        new Headers({ origin: "http://localhost:3000" })
      )
    ).toBe(true);
    expect(
      isTrustedAuthRequest(
        requestUrl,
        new Headers({ origin: "https://untrusted.example" })
      )
    ).toBe(false);
    expect(
      isTrustedAuthRequest(
        requestUrl,
        new Headers({ "sec-fetch-site": "same-origin" })
      )
    ).toBe(true);
    expect(
      isTrustedAuthRequest(
        requestUrl,
        new Headers({ referer: "http://localhost:3000/login" })
      )
    ).toBe(true);
    expect(isTrustedAuthRequest(requestUrl, new Headers())).toBe(false);
  });

  it("routes recovery failures separately", () => {
    expect(getConfirmationErrorDestination("recovery")).toContain(
      "/recuperar-password"
    );
    expect(getConfirmationErrorDestination("signup")).toContain("/login");
  });
});

describe("recovery marks", () => {
  it("requires a sufficiently long server secret", () => {
    delete process.env.AUTH_RECOVERY_MARK_SECRET;
    expect(createRecoveryMark("user-a")).toBeNull();

    process.env.AUTH_RECOVERY_MARK_SECRET = "too-short";
    expect(createRecoveryMark("user-a")).toBeNull();
  });

  it("binds a signed mark to its user and expiration", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-30T12:00:00Z"));
    process.env.AUTH_RECOVERY_MARK_SECRET =
      "test-only-secret-with-at-least-thirty-two-characters";

    const mark = createRecoveryMark("user-a");

    expect(mark).not.toBeNull();
    expect(isValidRecoveryMark(mark ?? undefined, "user-a")).toBe(true);
    expect(isValidRecoveryMark(mark ?? undefined, "user-b")).toBe(false);

    vi.advanceTimersByTime(
      (RECOVERY_MARK_MAX_AGE_SECONDS + 1) * 1000
    );
    expect(isValidRecoveryMark(mark ?? undefined, "user-a")).toBe(false);
  });
});
