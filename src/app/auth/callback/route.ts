import {
  createRecoveryMark,
  getTrustedAuthOrigin,
  isAllowedAuthOrigin,
  RECOVERY_DESTINATION,
  RECOVERY_MARK_COOKIE,
  RECOVERY_MARK_MAX_AGE_SECONDS,
} from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const trustedOrigin = getTrustedAuthOrigin(requestUrl);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const allowedNext =
    next === "/restablecer-password" || next === "/dashboard/nueva"
      ? next
      : null;
  const isPasswordRecovery = next === "/restablecer-password";

  if (!isAllowedAuthOrigin(requestUrl.origin)) {
    const loginUrl = new URL("/login", trustedOrigin);
    loginUrl.searchParams.set("error", "confirmacion");
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Compatibilidad temporal con enlaces recovery PKCE antiguos.
      // Retirar esta rama después de completar la migración a TokenHash.
      if (isPasswordRecovery) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          const recoveryUrl = new URL("/recuperar-password", trustedOrigin);
          recoveryUrl.searchParams.set("error", "enlace");
          return NextResponse.redirect(recoveryUrl);
        }

        const recoveryMark = createRecoveryMark(user.id);

        if (!recoveryMark) {
          const recoveryUrl = new URL("/recuperar-password", trustedOrigin);
          recoveryUrl.searchParams.set("error", "enlace");
          return NextResponse.redirect(recoveryUrl);
        }

        const cookieStore = await cookies();
        cookieStore.set(RECOVERY_MARK_COOKIE, recoveryMark, {
          httpOnly: true,
          maxAge: RECOVERY_MARK_MAX_AGE_SECONDS,
          path: RECOVERY_DESTINATION,
          sameSite: "strict",
          secure: requestUrl.protocol === "https:",
        });
      }

      const destination = allowedNext ?? "/dashboard";

      return NextResponse.redirect(new URL(destination, trustedOrigin));
    }
  }

  if (isPasswordRecovery) {
    const recoveryUrl = new URL("/recuperar-password", trustedOrigin);
    recoveryUrl.searchParams.set("error", "enlace");
    return NextResponse.redirect(recoveryUrl);
  }

  const loginUrl = new URL("/login", trustedOrigin);
  loginUrl.searchParams.set("error", "confirmacion");
  return NextResponse.redirect(loginUrl);
}
