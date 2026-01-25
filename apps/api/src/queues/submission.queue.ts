import { Queue, QueueEvents } from "bullmq";
import { queueConfig } from "./config.js";
import { queueLogger } from "../lib/logger.js";

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
}

export const submissionQueue = new Queue<SubmissionJobData>("submissionQueue", queueConfig);

export const submissionQueueEvents = new QueueEvents("submissionQueue", {
  connection: queueConfig.connection,
});

export async function queueSubmission(data: SubmissionJobData) {
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

  queueLogger.info(
    {
      correlationId: data.correlationId,
      jobId: job.id,
    },
    "Submission queued successfully!"
  );

  return job.id;
}

export async function getSubmissionStatus(submissionId: string) {
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
