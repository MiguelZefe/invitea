import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { describe, expect, it } from "vitest";
import { config } from "@/proxy";

function doesProxyMatch(pathname: string) {
  return unstable_doesMiddlewareMatch({
    config,
    nextConfig: {},
    url: pathname,
  });
}

describe("Supabase session proxy matcher", () => {
  it.each([
    "/auth/confirm",
    "/cuenta",
    "/dashboard",
    "/dashboard/evento/invitados",
    "/login",
    "/recuperar-password",
    "/registro",
    "/restablecer-password",
  ])("matches auth-aware route %s", (pathname) => {
    expect(doesProxyMatch(pathname)).toBe(true);
  });

  it.each([
    "/",
    "/demo",
    "/invitacion/evento",
    "/favicon.ico",
    "/_next/static/app.js",
  ])("skips public route %s", (pathname) => {
    expect(doesProxyMatch(pathname)).toBe(false);
  });
});
