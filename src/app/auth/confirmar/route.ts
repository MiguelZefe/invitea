const SECURITY_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Security-Policy":
    "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
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

function renderPage(confirmationUrl: URL | null): Response {
  const isValid = confirmationUrl !== null;
  const title = isValid ? "Confirmar correo" : "Enlace no válido";
  const description = isValid
    ? "Confirma tu correo para terminar de crear tu cuenta."
    : "No pudimos validar este enlace de confirmación.";
  const action = confirmationUrl
    ? `<a href="${escapeHtml(confirmationUrl.href)}">Confirmar correo</a>`
    : "";

  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title} | ZEFEINVITA</title>
    <style>
      *{box-sizing:border-box}body{margin:0;background:#f8f5f2;color:#171717;font-family:Arial,sans-serif}main{min-height:100vh;display:grid;place-items:center;padding:24px}section{width:min(100%,448px);background:#fff;border-radius:32px;padding:32px;box-shadow:0 1px 8px #00000012}.brand{font-size:12px;letter-spacing:.3em;color:#737373}h1{font-family:Georgia,serif;font-size:38px;font-weight:400;margin:20px 0 12px}p{color:#525252;line-height:1.6}a{display:block;width:100%;margin-top:20px;border-radius:999px;background:#000;color:#fff;padding:16px 24px;text-align:center;text-decoration:none}
    </style>
  </head>
  <body>
    <main>
      <section>
        <div class="brand">ZEFEINVITA</div>
        <h1>${title}</h1>
        <p>${description}</p>
        ${action}
      </section>
    </main>
  </body>
</html>`;

  return new Response(html, {
    status: isValid ? 200 : 400,
    headers: {
      ...SECURITY_HEADERS,
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

export function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const confirmationUrlValue = requestUrl.searchParams.get("confirmation_url");
  const supabaseUrlValue = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!confirmationUrlValue || !supabaseUrlValue) {
    return renderPage(null);
  }

  try {
    const confirmationUrl = new URL(confirmationUrlValue);
    const expectedOrigin = new URL(supabaseUrlValue).origin;

    if (
      confirmationUrl.origin !== expectedOrigin ||
      confirmationUrl.pathname !== "/auth/v1/verify"
    ) {
      return renderPage(null);
    }

    return renderPage(confirmationUrl);
  } catch {
    return renderPage(null);
  }
}
