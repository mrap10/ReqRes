import { Queue, QueueEvents } from "bullmq";
import { queueConfig, isQueueAvailable } from "./config.js";
import { queueLogger } from "../lib/logger.js";
import { metricsService, MetricType } from "../services/metrics.service.js";

export interface SubmissionJobData {
  submissionId: string;
  problem: {
    id: string;
    slug: string;
    submissionType?: string;
  };
  codeBundle: {
    files: Record<string, string>;
    entryPoint: string;
  };
  testConfig: {
    timeoutMs: number;
    memoryMb: number;
  };
  correlationId: string;
  mode: "run" | "submit";
}

export const submissionQueue: Queue<SubmissionJobData> | null = isQueueAvailable()
  ? new Queue<SubmissionJobData>("submissionQueue", queueConfig!)
  : null;

export const submissionQueueEvents: QueueEvents | null = isQueueAvailable()
  ? new QueueEvents("submissionQueue", {
      connection: queueConfig!.connection,
    })
  : null;

export async function queueSubmission(data: SubmissionJobData) {
  if (!submissionQueue) {
    throw new Error("Submission queue unavailable — Redis is not configured");
  }

  queueLogger.info(
    {
      correlationId: data.correlationId,
      submissionId: data.submissionId,
      problemId: data.problem.id,
    },
    "Queueing submission"
  );

  const job = await submissionQueue.add("processSubmission", data, {
    jobId: data.submissionId,
    priority: 1,
  });

  const waitingCount = await submissionQueue.getWaitingCount();
  await metricsService.setGauge(MetricType.QUEUE_DEPTH, waitingCount);

  queueLogger.info(
    {
      correlationId: data.correlationId,
      jobId: job.id,
      queueDepth: waitingCount,
    },
    "Submission queued successfully!"
  );

  return job.id;
}

export async function getSubmissionStatus(submissionId: string) {
  if (!submissionQueue) {
    queueLogger.warn({ submissionId }, "Queue unavailable — cannot fetch submission status");
    return null;
  }

  const job = await submissionQueue.getJob(submissionId);
  if (!job) {
    queueLogger.warn({ submissionId }, "Submission job not found in queue");
    return null;
  }

  return {
    id: job.id,
    name: job.name,
    data: job.data,
    progress: job.progress,
    state: await job.getState(),
    result: job.returnvalue,
    attemptsMade: job.attemptsMade,
    failedReason: job.failedReason,
  };
}
