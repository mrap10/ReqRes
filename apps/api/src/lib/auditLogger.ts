import { logger } from "./logger.js";

export const auditLogger = logger.child({ service: "audit" });

export type AuditEventType =
  | "USER_SIGNUP"
  | "USER_SIGNIN"
  | "USER_SIGNOUT"
  | "PASSWORD_RESET_REQUESTED"
  | "PASSWORD_RESET_COMPLETED"
  | "EMAIL_VERIFIED"
  | "OAUTH_SIGNIN"
  | "SESSION_CREATED";

interface AuditLogData {
  event: AuditEventType;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export function logAuditEvent(data: AuditLogData) {
  const { event, userId, email, ip, userAgent, metadata } = data;

  auditLogger.info(
    {
      event,
      userId,
      email,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
      ...metadata,
    },
    `[AUDIT] ${event}`
  );
}

export function getClientIp(request?: Request): string | undefined {
  if (!request) return undefined;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return undefined;
}

export function getUserAgent(request?: Request): string | undefined {
  if (!request) return undefined;
  return request.headers.get("user-agent") || undefined;
}
