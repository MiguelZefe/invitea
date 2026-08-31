import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const { createServerClientMock } = vi.hoisted(() => ({
  createServerClientMock: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

import { updateSupabaseSession } from "@/lib/supabase-proxy";

const previousSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const previousSupabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

afterEach(() => {
  createServerClientMock.mockReset();

  if (previousSupabaseUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_URL = previousSupabaseUrl;
  }

  if (previousSupabaseKey === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = previousSupabaseKey;
  }
});

describe("updateSupabaseSession", () => {
  it("copies refreshed cookies and cache headers to the request and response", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.example";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "public-test-value";

    createServerClientMock.mockImplementation(
      (
        _url: string,
        _key: string,
        options: {
          cookies: {
            setAll: (
              cookies: Array<{
                name: string;
                value: string;
                options: { httpOnly?: boolean; path?: string };
              }>,
              headers: Record<string, string>
            ) => void;
          };
        }
      ) => ({
        auth: {
          getClaims: async () => {
            options.cookies.setAll(
              [
                {
                  name: "test-session",
                  value: "test-value",
                  options: { httpOnly: true, path: "/" },
                },
              ],
              {
                "Cache-Control": "private, no-store",
                Pragma: "no-cache",
              }
            );

            return { data: { claims: null }, error: null };
          },
        },
      })
    );

    const request = new NextRequest("https://app.example/dashboard");
    const response = await updateSupabaseSession(request);

    expect(request.cookies.get("test-session")?.value).toBe("test-value");
    expect(response.cookies.get("test-session")?.value).toBe("test-value");
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("Pragma")).toBe("no-cache");
  });
});
