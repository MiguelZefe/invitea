import {
  isAllowedAuthOrigin,
  RECOVERY_DESTINATION,
  RECOVERY_MARK_COOKIE,
} from "@/lib/auth";
import { cookies } from "next/headers";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" } as const;

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const requestOrigin = request.headers.get("origin");

  if (
    !requestOrigin ||
    requestOrigin !== requestUrl.origin ||
    !isAllowedAuthOrigin(requestOrigin)
  ) {
    return new Response(null, { status: 403, headers: NO_STORE_HEADERS });
  }

  const cookieStore = await cookies();
  cookieStore.set(RECOVERY_MARK_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: RECOVERY_DESTINATION,
    sameSite: "strict",
    secure: requestUrl.protocol === "https:",
  });

  return new Response(null, { status: 204, headers: NO_STORE_HEADERS });
}
