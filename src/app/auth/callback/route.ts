import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const isPasswordRecovery = next === "/restablecer-password";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const destination = isPasswordRecovery
        ? "/restablecer-password"
        : "/dashboard";

      return NextResponse.redirect(new URL(destination, requestUrl.origin));
    }
  }

  if (isPasswordRecovery) {
    const recoveryUrl = new URL("/recuperar-password", requestUrl.origin);
    recoveryUrl.searchParams.set("error", "enlace");
    return NextResponse.redirect(recoveryUrl);
  }

  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set("error", "confirmacion");
  return NextResponse.redirect(loginUrl);
}
