import { initializeSentry, setupSentryErrorHandler } from "./src/lib/sentry.js";
initializeSentry();

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import submissionsRouter from "./src/routes/submissions.js";
import callbackRouter from "./src/routes/internalRunnerCallback.js";
import problemsRouter from "./src/routes/problems.js";
import userRouter from "./src/routes/user.js";
import metricsRouter from "./src/routes/metrics.js";
import adminRateLimitsRouter from "./src/routes/adminRateLimits.js";
import healthRouter from "./src/routes/health.js";
import { auth } from "./src/lib/auth.js";
import { toNodeHandler } from "better-auth/node";
import { closeQueueConnections, isQueueAvailable } from "./src/queues/config.js";
import {
  correlationMiddleware,
  requestLoggingMiddleware,
} from "./src/middleware/logging.middleware.js";
import {
  rateLimitMiddleware,
  closeRateLimitConnection,
} from "./src/middleware/rateLimit.middleware.js";
import { apiLogger } from "./src/lib/logger.js";

// importing worker conditionally via embedded for dev mode only, will run separately in prod
const WORKER_ENABLED = process.env.WORKER_ENABLED !== "false" && isQueueAvailable();
let submissionWorker: { close: () => Promise<void> } | null = null;

if (WORKER_ENABLED) {
  const workerModule = await import("./src/workers/submission.worker.js");
  submissionWorker = workerModule.submissionWorker;
} else if (!isQueueAvailable()) {
  apiLogger.warn("Worker disabled — Redis is not configured");
}

const PORT = process.env.PORT;

const normalizeOrigin = (origin: string): string => {
  const trimmed = origin.trim().replace(/\/$/, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const allowedOrigins = (process.env.WEB_BASE_URL || "http://localhost:3000")
  .split(",")
  .map((value) => normalizeOrigin(value))
  .filter(Boolean);

const app = express();
const shouldTrustProxy =
  process.env.TRUST_PROXY === "true" ||
  (process.env.NODE_ENV === "production" && process.env.TRUST_PROXY !== "false");

if (shouldTrustProxy) {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = normalizeOrigin(origin);
      const isAllowed = allowedOrigins.includes(normalizedOrigin);

      if (isAllowed) {
        callback(null, true);
        return;
      }

      apiLogger.warn({ origin, allowedOrigins }, "Blocked by CORS policy");
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

app.use(correlationMiddleware);
app.use(requestLoggingMiddleware);

app.use("/health", healthRouter);

app.use(rateLimitMiddleware());

app.use("/api/auth", toNodeHandler(auth));

app.use("/submissions", submissionsRouter);
app.use("/internal/runner", callbackRouter);
app.use("/problems", problemsRouter);
app.use("/user", userRouter);
// app.use("/debug", debugRouter);
app.use("/metrics", metricsRouter);
app.use("/admin/rate-limits", adminRateLimitsRouter);

app.get("/", (_, res) => {
  res.json({ status: "ok" });
});

setupSentryErrorHandler(app);

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  apiLogger.error(
    {
      correlationId: req.correlationId,
      error: err.message,
      stack: err.stack,
    },
    "Unhandled error occurred"
  );

  res.status(500).json({
    error: "Internal Server Error",
    correlationId: req.correlationId,
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  apiLogger.info({ port: PORT }, `API server started`);
  apiLogger.info({ allowedOrigins }, "CORS allowed origins");
  if (WORKER_ENABLED) {
    apiLogger.info({ concurrency: process.env.WORKER_CONCURRENCY || 5 }, "Embedded worker started");
  } else {
    apiLogger.info("Worker disabled - run separately with: bun run worker:start");
  }
});

const gracefulShutdown = async (signal: string) => {
  apiLogger.info({ signal }, "Shutdown signal received - shutting down gracefully");

  if (submissionWorker) {
    await submissionWorker.close();
    apiLogger.info("Worker closed successfully");
  }

  await closeQueueConnections();
  await closeRateLimitConnection();

  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
