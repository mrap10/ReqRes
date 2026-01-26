import * as Sentry from "@sentry/node";
import type { Express } from "express";

const isDevelopment = process.env.NODE_ENV !== "production";

export function initializeSentry() {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    sendDefaultPii: false,
    sampleRate: isDevelopment ? 1.0 : 0.1,
    tracesSampleRate: isDevelopment ? 1.0 : 0.05,
    environment: process.env.NODE_ENV || "development",
    release: process.env.package_version || "unknown",
    enabled: !isDevelopment || process.env.SENTRY_ENABLED === "true",
    serverName: "runner-service",
    beforeSend(event) {
      if (event.request?.data) {
        const data = event.request.data as Record<string, unknown>;
        if (data.codeBundle) {
          data.codeBundle = "[REDACTED - USER CODE]";
        }
        if (data.files) {
          data.files = "[REDACTED - USER FILES]";
        }
      }
      if (event.extra) {
        if (event.extra.stdout) {
          event.extra.stdout = "[REDACTED]";
        }
        if (event.extra.stderr) {
          event.extra.stderr = "[REDACTED]";
        }
      }
      return event;
    },
  });
}

export function setupSentryErrorHandler(app: Express) {
  Sentry.setupExpressErrorHandler(app);
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
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

export function setTags(tags: Record<string, string>) {
  Object.entries(tags).forEach(([key, value]) => {
    Sentry.setTag(key, value);
  });
}
