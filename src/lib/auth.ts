import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ALLOWED_AUTH_ORIGINS = [
  "https://www.zefeinvita.com.mx",
  "https://invitea-iota.vercel.app",
  "http://localhost:3000",
] as const;

export const DEFAULT_SIGNUP_DESTINATION = "/dashboard";
export const RECOVERY_DESTINATION = "/restablecer-password";
export const RECOVERY_MARK_COOKIE = "invitea_recovery_mark";
export const RECOVERY_MARK_MAX_AGE_SECONDS = 10 * 60;

const SIGNUP_DESTINATIONS = new Set([
  DEFAULT_SIGNUP_DESTINATION,
  "/dashboard/nueva",
]);
const ALLOWED_ORIGINS = new Set<string>(ALLOWED_AUTH_ORIGINS);

export type AuthConfirmationType = "email" | "recovery";

export function isAllowedAuthOrigin(origin: string): boolean {
  return ALLOWED_ORIGINS.has(origin);
}

export function getTrustedAuthOrigin(requestUrl: URL): string {
  return isAllowedAuthOrigin(requestUrl.origin)
    ? requestUrl.origin
    : ALLOWED_AUTH_ORIGINS[0];
}

export function parseConfirmationType(
  value: FormDataEntryValue | string | null
): AuthConfirmationType | null {
  return value === "email" || value === "recovery" ? value : null;
}

export function getSignupDestination(value: unknown): string {
  return typeof value === "string" && SIGNUP_DESTINATIONS.has(value)
    ? value
    : DEFAULT_SIGNUP_DESTINATION;
}

export function getConfirmationErrorDestination(
  type: AuthConfirmationType | null
): string {
  return type === "recovery"
    ? "/recuperar-password?error=enlace"
    : "/login?error=confirmacion";
}

function getRecoveryMarkSecret(): string | null {
  const secret = process.env.AUTH_RECOVERY_MARK_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

function digest(value: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(value).digest();
}

function subjectForUser(userId: string, secret: string): string {
  return digest(`user:${userId}`, secret).toString("base64url");
}

export function createRecoveryMark(userId: string): string | null {
  const secret = getRecoveryMarkSecret();
  if (!secret) return null;

  const payload = Buffer.from(
    JSON.stringify({
      sub: subjectForUser(userId, secret),
      exp: Math.floor(Date.now() / 1000) + RECOVERY_MARK_MAX_AGE_SECONDS,
      nonce: randomBytes(16).toString("base64url"),
    })
  ).toString("base64url");
  const signature = digest(payload, secret).toString("base64url");

  return `${payload}.${signature}`;
}

export function isValidRecoveryMark(mark: string | undefined, userId: string): boolean {
  const secret = getRecoveryMarkSecret();
  if (!secret || !mark) return false;

  const [payload, signature, extra] = mark.split(".");
  if (!payload || !signature || extra) return false;

  const suppliedSignature = Buffer.from(signature, "base64url");
  const expectedSignature = digest(payload, secret);
  if (
    suppliedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(suppliedSignature, expectedSignature)
  ) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      sub?: unknown;
      exp?: unknown;
      nonce?: unknown;
    };

    return (
      parsed.sub === subjectForUser(userId, secret) &&
      typeof parsed.exp === "number" &&
      parsed.exp > Math.floor(Date.now() / 1000) &&
      typeof parsed.nonce === "string" &&
      parsed.nonce.length > 0
    );
  } catch {
    return false;
  }
}
