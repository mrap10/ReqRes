import { submissionWorker } from "./src/workers/submission.worker.js";
import { closeQueueConnections } from "./src/queues/config.js";
import { workerLogger } from "./src/lib/logger.js";

workerLogger.info(
  {
    concurrency: process.env.WORKER_CONCURRENCY || "5",
    redisHost: process.env.REDIS_HOST || "localhost",
    redisPort: process.env.REDIS_PORT || "6379",
  },
  "ReqRes Submission Worker Started"
);

submissionWorker.on("ready", () => {
  workerLogger.info("Worker ready and waiting for jobs");
});

submissionWorker.on("active", (job) => {
  workerLogger.info({ jobId: job.id, submissionId: job.data.submissionId }, "Processing job");
});

submissionWorker.on("completed", (job, result) => {
  workerLogger.info({ jobId: job.id, result }, "Job completed");
});

submissionWorker.on("failed", (job, err) => {
  workerLogger.error({ jobId: job?.id, error: err.message }, "Job failed");
});

submissionWorker.on("error", (err) => {
  workerLogger.error({ error: err.message }, "Worker error");
});

submissionWorker.on("stalled", (jobId) => {
  workerLogger.warn({ jobId }, "Job stalled - will be retried");
});

const gracefulShutdown = async (signal: string) => {
  workerLogger.info({ signal }, "Shutdown signal received - shutting down gracefully");

  await submissionWorker.close();
  workerLogger.info("Worker closed successfully");

  await closeQueueConnections();
  workerLogger.info("Redis connections closed");

  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  workerLogger.error({ error: err }, "Uncaught exception");
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  workerLogger.error({ reason, promise }, "Unhandled rejection");
});
