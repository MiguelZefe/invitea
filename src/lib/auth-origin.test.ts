import {
  ALLOWED_AUTH_ORIGINS,
  CANONICAL_AUTH_ORIGIN,
  DEFAULT_SIGNUP_DESTINATION,
  buildRecoveryConfirmationRedirect,
  buildSignupConfirmationRedirect,
  getSignupDestination,
  isAllowedAuthOrigin,
  resolveAuthOrigin,
} from "@/lib/auth-origin";
import { describe, expect, it } from "vitest";

describe("auth origins", () => {
  it("accepts only configured origins", () => {
    for (const origin of ALLOWED_AUTH_ORIGINS) {
      expect(isAllowedAuthOrigin(origin)).toBe(true);
    }

    expect(isAllowedAuthOrigin("https://untrusted.example")).toBe(false);
    expect(resolveAuthOrigin("https://untrusted.example")).toBe(
      CANONICAL_AUTH_ORIGIN
    );
  });

  it("allows only known signup destinations", () => {
    expect(getSignupDestination("/dashboard/nueva")).toBe(
      "/dashboard/nueva"
    );
    expect(getSignupDestination("/outside")).toBe(
      DEFAULT_SIGNUP_DESTINATION
    );
    expect(getSignupDestination(null)).toBe(DEFAULT_SIGNUP_DESTINATION);
  });

  it("builds confirmation redirects from trusted values", () => {
    const signupUrl = new URL(
      buildSignupConfirmationRedirect(
        "https://untrusted.example",
        "/dashboard/nueva"
      )
    );
    const recoveryUrl = new URL(
      buildRecoveryConfirmationRedirect(ALLOWED_AUTH_ORIGINS[0])
    );

    expect(signupUrl.origin).toBe(CANONICAL_AUTH_ORIGIN);
    expect(signupUrl.pathname).toBe("/auth/confirm");
    expect(signupUrl.searchParams.get("next")).toBe("/dashboard/nueva");
    expect(recoveryUrl.pathname).toBe("/auth/confirm");
    expect(recoveryUrl.searchParams.get("next")).toBe(
      "/restablecer-password"
    );
  });
});
