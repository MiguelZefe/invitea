import { updateSupabaseSession } from "@/lib/supabase-proxy";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/cuenta/:path*",
    "/dashboard/:path*",
    "/login",
    "/recuperar-password",
    "/registro",
    "/restablecer-password",
  ],
};
