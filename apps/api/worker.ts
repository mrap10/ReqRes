import { submissionWorker } from "./src/workers/submission.worker.js";
import { closeQueueConnections } from "./src/queues/config.js";

console.log("╔════════════════════════════════════════════╗");
console.log("║     ReqRes Submission Worker Started       ║");
console.log("╠════════════════════════════════════════════╣");
console.log(`║ Concurrency: ${(process.env.WORKER_CONCURRENCY || "5").padEnd(29)}║`);
console.log(`║ Redis Host:  ${(process.env.REDIS_HOST || "localhost").padEnd(29)}║`);
console.log(`║ Redis Port:  ${(process.env.REDIS_PORT || "6379").padEnd(29)}║`);
console.log("╚════════════════════════════════════════════╝");

submissionWorker.on("ready", () => {
  console.log("[Worker] Ready and waiting for jobs...");
});

submissionWorker.on("active", (job) => {
  console.log(`[Worker] Processing job ${job.id} - Submission: ${job.data.submissionId}`);
});

submissionWorker.on("completed", (job, result) => {
  console.log(`[Worker] Job ${job.id} completed:`, result);
});

submissionWorker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

submissionWorker.on("error", (err) => {
  console.error("[Worker] Error:", err.message);
});

submissionWorker.on("stalled", (jobId) => {
  console.warn(`[Worker] Job ${jobId} stalled - will be retried`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\n[Worker] ${signal} received. Shutting down gracefully...`);

  await submissionWorker.close();
  console.log("[Worker] Worker closed");

  await closeQueueConnections();
  console.log("[Worker] Redis connections closed");

  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  console.error("[Worker] Uncaught exception:", err);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[Worker] Unhandled rejection at:", promise, "reason:", reason);
});
