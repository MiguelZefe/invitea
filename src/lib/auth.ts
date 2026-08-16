import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import {
  ALLOWED_AUTH_ORIGINS,
  isAllowedAuthOrigin,
} from "@/lib/auth-origin";

export {
  ALLOWED_AUTH_ORIGINS,
  DEFAULT_SIGNUP_DESTINATION,
  getSignupDestination,
  isAllowedAuthOrigin,
  RECOVERY_DESTINATION,
} from "@/lib/auth-origin";
export const RECOVERY_MARK_COOKIE = "invitea_recovery_mark";
export const RECOVERY_MARK_MAX_AGE_SECONDS = 10 * 60;

export type AuthConfirmationType = "email" | "recovery";

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
