import {
  AUTH_CONFIRMATION_NONCE_COOKIE,
  AUTH_CONFIRMATION_NONCE_MAX_AGE_SECONDS,
  AuthConfirmationType,
  createAuthConfirmationNonce,
  createRecoveryMark,
  getConfirmationErrorDestination,
  getSignupDestination,
  getTrustedAuthOrigin,
  isAllowedAuthOrigin,
  isValidAuthConfirmationNonce,
  isTrustedAuthRequest,
  parseConfirmationType,
  RECOVERY_DESTINATION,
  RECOVERY_MARK_COOKIE,
  RECOVERY_MARK_MAX_AGE_SECONDS,
} from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SECURITY_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Security-Policy":
    "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
} as const;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function redirectTo(requestUrl: URL, destination: string) {
  return NextResponse.redirect(
    new URL(destination, getTrustedAuthOrigin(requestUrl)),
    { headers: SECURITY_HEADERS }
  );
}

function errorResponse(requestUrl: URL, type: AuthConfirmationType | null) {
  return redirectTo(requestUrl, getConfirmationErrorDestination(type));
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = parseConfirmationType(requestUrl.searchParams.get("type"));

  // Compatibilidad temporal con ConfirmationURL/PKCE mientras se migran los
  // templates a TokenHash. Retirar cuando los enlaces legacy hayan expirado.
  if (!(tokenHash && type)) {
    const code = requestUrl.searchParams.get("code");

    if (code) {
      const requestedNext = requestUrl.searchParams.get("next");
      const legacyNext =
        requestedNext === RECOVERY_DESTINATION
          ? RECOVERY_DESTINATION
          : getSignupDestination(requestedNext);
      const callbackUrl = new URL(
        "/auth/callback",
        getTrustedAuthOrigin(requestUrl)
      );
      callbackUrl.searchParams.set("code", code);
      callbackUrl.searchParams.set("next", legacyNext);

      return NextResponse.redirect(callbackUrl, { headers: SECURITY_HEADERS });
    }
  }

  if (!isAllowedAuthOrigin(requestUrl.origin) || !tokenHash || !type) {
    return errorResponse(requestUrl, type);
  }

  const next = type === "signup"
    ? getSignupDestination(requestUrl.searchParams.get("next"))
    : "";
  const title = type === "signup" ? "Confirmar correo" : "Continuar con recuperación";
  const description =
    type === "signup"
      ? "Confirma tu correo para terminar de crear tu cuenta."
      : "Continúa para verificar tu enlace y elegir una contraseña nueva.";
  const confirmationNonce = createAuthConfirmationNonce();

  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title} | INVITEA</title>
    <style>
      *{box-sizing:border-box}body{margin:0;background:#f8f5f2;color:#171717;font-family:Arial,sans-serif}main{min-height:100vh;display:grid;place-items:center;padding:24px}section{width:min(100%,448px);background:#fff;border-radius:32px;padding:32px;box-shadow:0 1px 8px #00000012}.brand{font-size:12px;letter-spacing:.3em;color:#737373}h1{font-family:Georgia,serif;font-size:38px;font-weight:400;margin:20px 0 12px}p{color:#525252;line-height:1.6}button{width:100%;margin-top:20px;border:0;border-radius:999px;background:#000;color:#fff;padding:16px 24px;font:inherit;cursor:pointer}button:disabled{opacity:.5;cursor:wait}
    </style>
  </head>
  <body>
    <main>
      <section>
        <div class="brand">INVITEA</div>
        <h1>${title}</h1>
        <p>${description}</p>
        <form method="post" action="/auth/confirm">
          <input type="hidden" name="token_hash" value="${escapeHtml(tokenHash)}">
          <input type="hidden" name="type" value="${type}">
          <input type="hidden" name="confirmation_nonce" value="${confirmationNonce}">
          ${type === "signup" ? `<input type="hidden" name="next" value="${escapeHtml(next)}">` : ""}
          <button type="submit">${title}</button>
        </form>
      </section>
    </main>
    <script>document.querySelector('form').addEventListener('submit',function(){var b=this.querySelector('button');b.disabled=true;b.textContent='Procesando…'})</script>
  </body>
</html>`;

  const response = new NextResponse(html, {
    headers: { ...SECURITY_HEADERS, "Content-Type": "text/html; charset=utf-8" },
  });
  response.cookies.set(AUTH_CONFIRMATION_NONCE_COOKIE, confirmationNonce, {
    httpOnly: true,
    maxAge: AUTH_CONFIRMATION_NONCE_MAX_AGE_SECONDS,
    path: "/auth/confirm",
    sameSite: "strict",
    secure: requestUrl.protocol === "https:",
  });

  return response;
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse(requestUrl, null);
  }

  const type = parseConfirmationType(formData.get("type"));
  const tokenHashValue = formData.get("token_hash");
  const tokenHash = typeof tokenHashValue === "string" ? tokenHashValue : "";
  const confirmationNonceValue = formData.get("confirmation_nonce");
  const confirmationNonce =
    typeof confirmationNonceValue === "string" ? confirmationNonceValue : "";
  const cookieStore = await cookies();
  const hasValidConfirmationNonce = isValidAuthConfirmationNonce(
    confirmationNonce,
    cookieStore.get(AUTH_CONFIRMATION_NONCE_COOKIE)?.value
  );

  if (
    !isAllowedAuthOrigin(requestUrl.origin) ||
    (!isTrustedAuthRequest(requestUrl, request.headers) &&
      !hasValidConfirmationNonce) ||
    !type ||
    !tokenHash
  ) {
    return errorResponse(requestUrl, type);
  }

  cookieStore.set(AUTH_CONFIRMATION_NONCE_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/auth/confirm",
    sameSite: "strict",
    secure: requestUrl.protocol === "https:",
  });

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error || !data.user) {
    return errorResponse(requestUrl, type);
  }

  if (type === "recovery") {
    const recoveryMark = createRecoveryMark(data.user.id);
    if (!recoveryMark) {
      return errorResponse(requestUrl, type);
    }

    cookieStore.set(RECOVERY_MARK_COOKIE, recoveryMark, {
      httpOnly: true,
      maxAge: RECOVERY_MARK_MAX_AGE_SECONDS,
      path: RECOVERY_DESTINATION,
      sameSite: "strict",
      secure: requestUrl.protocol === "https:",
    });

    return redirectTo(requestUrl, RECOVERY_DESTINATION);
  }

  return redirectTo(requestUrl, getSignupDestination(formData.get("next")));
}
