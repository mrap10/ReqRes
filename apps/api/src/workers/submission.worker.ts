import { Worker, Job } from "bullmq";
import { SubmissionJobData } from "../queues/submission.queue.js";
import axios from "axios";
import { prisma, SubmissionStatus } from "@reqres/database";
import { workerConfig } from "../queues/config.js";

interface RunnerResponse {
  status: SubmissionStatus;
  result?: TestResult;
  durationMs?: number;
  output?: string;
}

interface TestResult {
  passed: boolean;
  testsPassed?: number;
  testsFailed?: number;
  results?: Array<{
    name: string;
    passed: boolean;
    message?: string;
  }>;
}

const RUNNER_URL = process.env.RUNNER_BASE_URL;

async function processSubmission(job: Job<SubmissionJobData>) {
  const { submissionId, problem, codeBundle, testConfig } = job.data;

  try {
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "RUNNING" },
    });

    await job.updateProgress(10);

    const response = await axios.post(
      `${RUNNER_URL}/internal/execute`,
      {
        submissionId,
        problem: {
          id: problem.id,
          slug: problem.slug,
          submissionType: problem.submissionType,
        },
        codeBundle,
        testConfig,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-runner-secret": process.env.RUNNER_SHARED_SECRET!,
        },
        timeout: testConfig.timeoutMs + 30000,
      }
    );

    await job.updateProgress(50);

    const { status, result, durationMs, output } = response.data as RunnerResponse;

    await updateSubmissionInDb(submissionId, {
      status,
      result,
      durationMs,
      output,
    });

    await job.updateProgress(100);

    return { submissionId, status, durationMs };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
    const errorMessage = axiosError.message || "Unknown error";

    console.error(`Error processing submission ${submissionId}:`, errorMessage);

    await updateSubmissionInDb(submissionId, {
      status: SubmissionStatus.RUNTIME_ERROR,
      output: axiosError.response?.data?.error || errorMessage || "Execution failed",
    });

    throw error;
  }
}

export const submissionWorker = new Worker<SubmissionJobData>(
  "submissionQueue",
  processSubmission,
  workerConfig
);

submissionWorker.on("completed", (job, returnvalue) => {
  console.log(`Submission job ${job.id} completed with result:`, returnvalue);
});

submissionWorker.on("active", (job) => {
  console.log(`Processing submission job ${job.id}...`);
});

submissionWorker.on("failed", (job, err) => {
  console.error(`Submission job ${job?.id} failed with error:`, err);
});

submissionWorker.on("error", (err) => {
  console.error("Worker encountered an error:", err);
});

interface SubmissionUpdateData {
  status: SubmissionStatus;
  result?: TestResult;
  durationMs?: number;
  output?: string;
}

interface SubmissionUpdatePayload {
  status: SubmissionStatus;
  durations?: number;
  output?: string;
}

async function updateSubmissionInDb(submissionId: string, data: SubmissionUpdateData) {
  try {
    const updateData: SubmissionUpdatePayload = {
      status: data.status,
    };

    if (data.durationMs !== undefined) {
      updateData.durations = data.durationMs;
    }

    if (data.output !== undefined) {
      updateData.output = data.output;
    }

    await prisma.submission.update({
      where: { id: submissionId },
      data: updateData,
    });

    if (data.result) {
      await prisma.executionResult.upsert({
        where: { submissionId },
        create: {
          submissionId,
          rawResult: JSON.stringify(data.result),
        },
        update: {
          rawResult: JSON.stringify(data.result),
        },
      });
    }

    console.log(`Updated submission ${submissionId} with status: ${data.status}`);
  } catch (error) {
    console.error(`Failed to update submission ${submissionId}:`, error);
    throw error;
  }
}
