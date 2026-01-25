import express from "express";
import cors from "cors";
import submissionsRouter from "./src/routes/submissions.js";
import callbackRouter from "./src/routes/internalRunnerCallback.js";
import problemsRouter from "./src/routes/problems.js";
import userRouter from "./src/routes/user.js";
import { auth } from "./src/lib/auth.js";
import { toNodeHandler } from "better-auth/node";
import { closeQueueConnections } from "./src/queues/config.js";
import {
  correlationMiddleware,
  requestLoggingMiddleware,
} from "./src/middleware/logging.middleware.js";
import { apiLogger } from "./src/lib/logger.js";

// importing worker conditionally via embedded for dev mode only, will run separately in prod
const WORKER_ENABLED = process.env.WORKER_ENABLED !== "false";
let submissionWorker: { close: () => Promise<void> } | null = null;

if (WORKER_ENABLED) {
  const workerModule = await import("./src/workers/submission.worker.js");
  submissionWorker = workerModule.submissionWorker;
}

const PORT = process.env.PORT;

const app = express();

app.use(
  cors({
    origin: process.env.WEB_BASE_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use(correlationMiddleware);
app.use(requestLoggingMiddleware);

app.use("/api/auth", toNodeHandler(auth));

app.use("/submissions", submissionsRouter);
app.use("/internal/runner", callbackRouter);
app.use("/problems", problemsRouter);
app.use("/user", userRouter);

app.get("/", (_, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  apiLogger.info({ port: PORT }, `API server started`);
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

  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
