export const ALLOWED_AUTH_ORIGINS = [
  "https://www.zefeinvita.com.mx",
  "https://invitea-iota.vercel.app",
  "http://localhost:3000",
] as const;

export const CANONICAL_AUTH_ORIGIN = ALLOWED_AUTH_ORIGINS[0];
export const DEFAULT_SIGNUP_DESTINATION = "/dashboard";
export const RECOVERY_DESTINATION = "/restablecer-password";

const ALLOWED_ORIGINS = new Set<string>(ALLOWED_AUTH_ORIGINS);
export function isAllowedAuthOrigin(origin: string): boolean {
  return ALLOWED_ORIGINS.has(origin);
}

export function resolveAuthOrigin(origin: string): string {
  return isAllowedAuthOrigin(origin) ? origin : CANONICAL_AUTH_ORIGIN;
}

export function getAuthNextPath(value: unknown): "/dashboard/nueva" | "/laboratorio-comercial" | undefined {
  if (value === "/dashboard/nueva") return value;
  if (value === "/laboratorio-comercial" && process.env.NODE_ENV === "development") {
    return value;
  }
  return undefined;
}

export function getSignupDestination(value: unknown): string {
  return getAuthNextPath(value) ?? DEFAULT_SIGNUP_DESTINATION;
}

export function buildSignupConfirmationRedirect(
  origin: string,
  next: unknown
): string {
  const safeOrigin = resolveAuthOrigin(origin);
  const safeNext = getSignupDestination(next);
  return `${safeOrigin}/auth/confirm?next=${encodeURIComponent(safeNext)}`;
}

export function buildRecoveryConfirmationRedirect(origin: string): string {
  const safeOrigin = resolveAuthOrigin(origin);
  return `${safeOrigin}/auth/confirm?next=${encodeURIComponent(RECOVERY_DESTINATION)}`;
}
