import { Router, Request, Response } from "express";
import { captureException, captureMessage, addBreadcrumb, setUserContext } from "../lib/sentry.js";
import { apiLogger } from "../lib/logger.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireAdmin);

// test endpoint to trigger an unhandled error. This will be caught by Sentry's error handler
router.get("/error/unhandled", (_req: Request, _res: Response) => {
  throw new Error("Test unhandled error - this should appear in Sentry!");
});

// test endpoint to trigger a handled error with context
router.get("/error/handled", (req: Request, res: Response) => {
  const correlationId = req.correlationId;

  try {
    setUserContext({
      id: "test-user-123",
      email: "test@reqres.site",
      username: "testuser",
    });

    addBreadcrumb("Starting test operation", "test", { step: 1 });
    addBreadcrumb("Processing data", "test", { step: 2, dataSize: 100 });
    addBreadcrumb("About to fail", "test", { step: 3 }, "warning");

    const data: Record<string, unknown> = {};
    // @ts-expect-error - intentionally accessing undefined property
    const result = data.nested.value;

    res.json({ result });
  } catch (error) {
    apiLogger.error({ correlationId, error }, "Handled test error");

    captureException(error as Error, {
      correlationId,
      testType: "handled",
      customData: { foo: "bar" },
    });

    res.status(500).json({
      error: "Test error captured",
      correlationId,
      message: "Check your Sentry dashboard for this error",
    });
  }
});

// test endpoint to send a message to Sentry
router.get("/message", (req: Request, res: Response) => {
  const correlationId = req.correlationId;

  captureMessage(`Test message from debug endpoint - correlationId: ${correlationId}`, "info");

  res.json({
    success: true,
    correlationId,
    message: "Test message sent to Sentry",
  });
});

// test async error handling
router.get("/error/async", async (req: Request, res: Response) => {
  const correlationId = req.correlationId;

  try {
    addBreadcrumb("Starting async operation", "async", { correlationId });

    await new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Async operation failed - test error"));
      }, 100);
    });

    res.json({ success: true });
  } catch (error) {
    apiLogger.error({ correlationId, error }, "Async test error");

    captureException(error as Error, {
      correlationId,
      testType: "async",
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({
      error: "Async test error captured",
      correlationId,
    });
  }
});

router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    sentryDsn: process.env.SENTRY_DSN ? "configured" : "not configured",
    environment: process.env.NODE_ENV || "development",
  });
});

export default router;
