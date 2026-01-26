import * as Sentry from "@sentry/node";
import type { Express } from "express";
import { apiLogger } from "./logger.js";

const isDevelopment = process.env.NODE_ENV !== "production";

export function initializeSentry() {
  if (!process.env.SENTRY_DSN) {
    apiLogger.warn("SENTRY_DSN not set. Sentry will not be initialized.");
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    sendDefaultPii: true,
    // integrations: [nodeProfilingIntegration()], - seems like profiling integration causes issues with Bun
    sampleRate: isDevelopment ? 1.0 : 0.1,
    tracesSampleRate: isDevelopment ? 1.0 : 0.1,
    profileSessionSampleRate: isDevelopment ? 1.0 : 0.1,
    environment: process.env.NODE_ENV || "development",
    release: process.env.package_version || "unknown",
    enabled: !isDevelopment || process.env.SENTRY_ENABLED === "true",
    beforeSend(event) {
      if (event.request) {
        delete event.request.cookies;
        if (event.request.data) {
          const data = event.request.data as Record<string, unknown>;
          if (data.password) {
            data.password = "[REDACTED]";
          }
          if (data.token) {
            data.token = "[REDACTED]";
          }
          if (data.code) {
            data.code = "[REDACTED - USER CODE]";
          }
        }
      }
      return event;
    },
  });

  apiLogger.info("Sentry initialized successfully");
}

export function setupSentryErrorHandler(app: Express) {
  Sentry.setupExpressErrorHandler(app);
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  Sentry.captureMessage(message, level);
}

export function addBreadcrumb(
  message: string,
  category: string = "custom",
  data?: Record<string, unknown>,
  level: Sentry.SeverityLevel = "info"
) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level,
    timestamp: Date.now() / 1000,
  });
}

export function setUserContext(user?: { id: string; email?: string; username?: string }) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }
}

export function clearUserContext() {
  Sentry.setUser(null);
}

// for additional filtering in Sentry dashboard
export function setTags(tags: Record<string, string>) {
  Object.entries(tags).forEach(([key, value]) => {
    Sentry.setTag(key, value);
  });
}

// async function wrapper with Sentry error tracking
export function withSentry<T>(
  fn: () => Promise<T>,
  context?: { name: string; data?: Record<string, string | number | boolean> }
): Promise<T> {
  return Sentry.startSpan(
    { name: context?.name || "operation", attributes: context?.data },
    async () => {
      try {
        return await fn();
      } catch (error) {
        captureException(error as Error, context?.data);
        throw error;
      }
    }
  );
}
