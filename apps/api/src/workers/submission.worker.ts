import { Worker, Job } from "bullmq";
import { SubmissionJobData } from "../queues/submission.queue.js";
import axios from "axios";
import { prisma, SubmissionStatus } from "@reqres/database";
import { workerConfig } from "../queues/config.js";
import { workerLogger } from "../lib/logger.js";
import { captureException, addBreadcrumb, setTags, withSentry } from "../lib/sentry.js";

interface RunnerResponse {
  status: string;
  results?: Array<{
    name: string;
    passed: boolean;
    error?: string;
  }>;
  durationMs?: number;
  stdout?: string;
  stderr?: string;
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

// Runner may return: PASSED, FAILED, ERROR, TIMEOUT, etc.
// Prisma expects: PENDING, RUNNING, PASSED, WRONG_ANSWER, TIME_LIMIT, MEMORY_LIMIT, RUNTIME_ERROR, COMPILE_ERROR
// will try to make this status thing simpler directly in the schema, so that mapping all this will not be necessary.
function mapRunnerStatusToSubmissionStatus(runnerStatus: string): SubmissionStatus {
  const status = runnerStatus.toUpperCase();

  switch (status) {
    case "PASSED":
      return SubmissionStatus.PASSED;
    case "FAILED":
    case "WRONG_ANSWER":
      return SubmissionStatus.WRONG_ANSWER;
    case "TIMEOUT":
    case "TIME_LIMIT":
    case "TLE":
      return SubmissionStatus.TIME_LIMIT;
    case "MEMORY_LIMIT":
    case "MLE":
    case "OOM":
      return SubmissionStatus.MEMORY_LIMIT;
    case "COMPILE_ERROR":
    case "COMPILATION_ERROR":
      return SubmissionStatus.COMPILE_ERROR;
    case "RUNTIME_ERROR":
    case "ERROR":
    default:
      return SubmissionStatus.RUNTIME_ERROR;
  }
}

const RUNNER_URL = process.env.RUNNER_BASE_URL;

async function processSubmission(job: Job<SubmissionJobData>) {
  const { submissionId, problem, codeBundle, testConfig, correlationId } = job.data;

  const jobLogger = workerLogger.child({ submissionId, correlationId });

  setTags({
    submissionId,
    correlationId: correlationId || "unknown",
    problemId: problem.id,
    problemSlug: problem.slug,
  });

  try {
    addBreadcrumb("Starting submission processing", "worker", {
      submissionId,
      correlationId,
      problemId: problem.id,
    });

    jobLogger.info("Starting submission processing");

    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "RUNNING" },
    });

    await job.updateProgress(10);

    addBreadcrumb("Sending submission to runner service", "http", {
      submissionId,
      runnerUrl: RUNNER_URL,
    });

    jobLogger.debug("Sending submission to runner service");

    const response = await withSentry(
      async () =>
        axios.post(
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
            correlationId,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-runner-secret": process.env.RUNNER_SHARED_SECRET!,
            },
            timeout: testConfig.timeoutMs + 30000,
          }
        ),
      { name: "runner.execute", data: { submissionId, problemId: problem.id } }
    );

    await job.updateProgress(50);

    const runnerResponse = response.data as RunnerResponse;

    addBreadcrumb("Received response from runner", "http", {
      submissionId,
      status: runnerResponse.status,
      durationMs: runnerResponse.durationMs,
    });

    jobLogger.info({ runnerResponse }, "Received response from runner service");

    const mappedStatus = mapRunnerStatusToSubmissionStatus(runnerResponse.status);

    await job.updateProgress(100);

    addBreadcrumb("Submission processing completed", "worker", {
      submissionId,
      status: mappedStatus,
    });

    jobLogger.info(`Submission processed with status: ${mappedStatus}`);

    return { submissionId, status: mappedStatus, durationMs: runnerResponse.durationMs };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
    const errorMessage = axiosError.message || "Unknown error";

    addBreadcrumb(
      "Submission processing failed",
      "error",
      {
        submissionId,
        error: errorMessage,
      },
      "error"
    );

    jobLogger.error({ error: errorMessage }, "Submission processing failed");

    captureException(error as Error, {
      submissionId,
      correlationId,
      problemId: problem.id,
      problemSlug: problem.slug,
      action: "processSubmission",
      runnerUrl: RUNNER_URL,
      responseError: axiosError.response?.data?.error,
      jobId: job.id,
      jobAttempts: job.attemptsMade,
    });

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

submissionWorker.on("completed", (job) => {
  workerLogger.info(
    {
      correlationId: job.data.correlationId,
      jobId: job.id,
    },
    "Submission job completed successfully"
  );
});

submissionWorker.on("active", (job) => {
  workerLogger.info(
    {
      correlationId: job.data.correlationId,
      jobId: job.id,
    },
    "Processing submission job"
  );
});

submissionWorker.on("failed", (job, err) => {
  workerLogger.error(
    {
      correlationId: job?.data.correlationId,
      jobId: job?.id,
      error: err.message,
    },
    "Submission job failed"
  );

  if (job) {
    captureException(err, {
      jobId: job.id,
      correlationId: job.data.correlationId,
      submissionId: job.data.submissionId,
      problemId: job.data.problem?.id,
      attemptsMade: job.attemptsMade,
      action: "submissionWorker.failed",
    });
  }
});

submissionWorker.on("error", (err) => {
  workerLogger.error({ error: err.message }, "Worker encountered an error");
  captureException(err, { action: "submissionWorker.error" });
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

    workerLogger.info({ submissionId, status: data.status }, "Updated submission in database");
  } catch (error) {
    workerLogger.error({ submissionId, error }, "Failed to update submission in database");
    throw error;
  }
}
