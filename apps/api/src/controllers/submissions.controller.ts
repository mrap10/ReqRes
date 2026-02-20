import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@reqres/database";
import { submissionQueue, submissionQueueEvents } from "../queues/submission.queue.js";
import type { JobProgress } from "bullmq";
import { apiLogger } from "../lib/logger.js";
import { captureException, setUserContext, addBreadcrumb } from "../lib/sentry.js";
import { metricsService, MetricType } from "../services/metrics.service.js";
import { updateStreakOnSubmission, invalidateActivityGrid } from "../services/streak.service.js";

const MAX_SUBMISSION_FILES = 30;
const MAX_FILE_PATH_LENGTH = 200;
const MAX_FILE_CONTENT_LENGTH = 100_000;
const MAX_TOTAL_CODE_SIZE_BYTES = 500_000;

const CodeFilesSchema = z
  .record(z.string().max(MAX_FILE_PATH_LENGTH), z.string().max(MAX_FILE_CONTENT_LENGTH))
  .superRefine((files, ctx) => {
    const entries = Object.entries(files);

    if (entries.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one file is required",
      });
      return;
    }

    if (entries.length > MAX_SUBMISSION_FILES) {
      ctx.addIssue({
        code: "custom",
        message: `Too many files. Max allowed is ${MAX_SUBMISSION_FILES}`,
      });
      return;
    }

    let totalCodeSize = 0;
    for (const [filePath, content] of entries) {
      const normalizedPath = filePath.replace(/\\/g, "/");
      if (normalizedPath.startsWith("/") || normalizedPath.includes("..")) {
        ctx.addIssue({
          code: "custom",
          message: `Invalid file path: ${filePath}`,
        });
        return;
      }

      totalCodeSize += Buffer.byteLength(content, "utf8");
      if (totalCodeSize > MAX_TOTAL_CODE_SIZE_BYTES) {
        ctx.addIssue({
          code: "custom",
          message: "Submission is too large",
        });
        return;
      }
    }
  });

const CreateSubmissionSchema = z.object({
  problemId: z.cuid(),
  code: z.object({
    files: CodeFilesSchema,
    entryPoint: z.string().min(1).max(MAX_FILE_PATH_LENGTH).optional().default("index.ts"),
  }),
  timezone: z.string().optional().default("UTC"),
  mode: z.enum(["run", "submit"]).optional().default("submit"),
});

export async function createSubmission(req: Request, res: Response) {
  const correlationId = req.correlationId;

  try {
    if (req.user) {
      setUserContext({
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
      });
    }

    addBreadcrumb("Parsing submission payload", "submission", {
      correlationId,
      hasProblemId: !!req.body?.problemId,
    });

    await metricsService.trackUniqueUser(req.user!.id);
    await metricsService.incrementCounter(MetricType.SUBMISSION_CREATED);

    const parseResult = CreateSubmissionSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: "Invalid submission payload",
        details: parseResult.error.flatten(),
        correlationId,
      });
    }

    const { problemId, code, timezone, mode } = parseResult.data;

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized", correlationId });
    }

    if (!submissionQueue) {
      return res.status(503).json({
        error: "Submission queue unavailable - Redis is not configured",
        correlationId,
      });
    }

    const userId = req.user.id;

    addBreadcrumb("Fetching problem from database", "database", {
      problemId,
      correlationId,
    });

    const problem = await prisma.problem.findUnique({
      where: { id: problemId, isPublished: true },
      include: { testConfig: true },
    });

    if (!problem || !problem.testConfig) {
      return res.status(404).json({ error: "Problem not found", correlationId });
    }

    addBreadcrumb("Creating submission record", "database", {
      problemId,
      userId,
      correlationId,
    });

    const submission = await prisma.$transaction(async (tx) => {
      const sub = await tx.submission.create({
        data: {
          userId,
          problemId,
          codeBundle: JSON.stringify(code),
          status: "PENDING",
        },
      });

      await updateStreakOnSubmission(tx, userId, timezone);

      return sub;
    });

    await invalidateActivityGrid(userId);

    addBreadcrumb("Adding job to submission queue", "queue", {
      submissionId: submission.id,
      correlationId,
    });
    await submissionQueue.add(
      "processSubmission",
      {
        submissionId: submission.id,
        problem: {
          id: problem.id,
          slug: problem.slug,
          submissionType: problem.submissionType,
        },
        codeBundle: {
          files: code.files,
          entryPoint: code.entryPoint || "index.js",
        },
        testConfig: {
          timeoutMs: problem.testConfig.timeoutMs,
          memoryMb: problem.testConfig.memoryMb,
        },
        correlationId: correlationId || "",
        mode,
      },
      {
        jobId: submission.id,
        priority: 1,
      }
    );

    await metricsService.incrementCounter(MetricType.SUBMISSION_QUEUED);

    res.json({
      submissionId: submission.id,
      status: "PENDING",
      correlationId,
    });
  } catch (error) {
    apiLogger.error({ correlationId, error }, "Failed to create submission");

    captureException(error as Error, {
      correlationId,
      userId: req.user?.id,
      problemId: req.body?.problemId,
      action: "createSubmission",
    });

    await metricsService.incrementCounter(MetricType.SUBMISSION_ERROR);

    res.status(500).json({
      error: "Failed to create submission",
      correlationId,
    });
  }
}

export async function getUserSubmissions(req: Request, res: Response) {
  const correlationId = req.correlationId;

  try {
    const { userId } = req.params;

    addBreadcrumb("Fetching user submissions", "database", { userId, correlationId });

    const submissions = await prisma.submission.findMany({
      where: {
        userId,
      },
      include: {
        problem: {
          select: {
            title: true,
            track: true,
            difficulty: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const submissionList = submissions.map((submission) => ({
      id: submission.id,
      problemId: submission.problemId,
      problemTitle: submission.problem.title,
      userId: submission.userId,
      status: submission.status,
      track: submission.problem.track,
      difficulty: submission.problem.difficulty,
      durationMs: submission.durations || 0,
      xpEarned: submission.score || 0,
      isFirstTryBonus: submission.isFirstTryBonus,
      createdAt: submission.createdAt,
    }));

    res.json({ submissions: submissionList });
  } catch (error) {
    apiLogger.error({ userId: req.params.userId, error }, "Failed to fetch user submissions");
    captureException(error as Error, {
      correlationId,
      userId: req.params.userId,
      action: "getUserSubmissions",
    });
    res.status(500).json({ error: "Failed to fetch user submissions", correlationId });
  }
}

export async function getLeaderboard(req: Request, res: Response) {
  const correlationId = req.correlationId;

  try {
    addBreadcrumb("Fetching leaderboard data", "database", { correlationId });

    const leaderboardData = await prisma.submission.groupBy({
      by: ["userId"],
      where: {
        status: "PASSED",
      },
      _sum: {
        score: true,
      },
    });

    const solvedPairs = await prisma.submission.findMany({
      where: {
        status: "PASSED",
      },
      distinct: ["userId", "problemId"],
      select: {
        userId: true,
      },
    });

    const problemCountMap = new Map<string, number>();
    for (const pair of solvedPairs) {
      problemCountMap.set(pair.userId, (problemCountMap.get(pair.userId) ?? 0) + 1);
    }

    const userIds = leaderboardData.map((entry) => entry.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds }, role: "USER" },
      select: { id: true, username: true },
    });

    const userMap = new Map(users.map((user) => [user.id, user.username]));

    const sortedLeaderboard = leaderboardData
      .filter((entry) => userMap.has(entry.userId))
      .map((entry) => ({
        userId: entry.userId,
        username: userMap.get(entry.userId) || "Unknown",
        totalScore: entry._sum.score || 0,
        problemsSolved: problemCountMap.get(entry.userId) || 0,
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    const leaderboard = sortedLeaderboard.map((entry, index) => ({
      globalRank: index + 1,
      ...entry,
    }));

    res.json({ leaderboard });
  } catch (error) {
    apiLogger.error({ error }, "Failed to fetch leaderboard");
    captureException(error as Error, { correlationId, action: "getLeaderboard" });
    res.status(500).json({ error: "Failed to fetch leaderboard", correlationId });
  }
}

export async function getSubmissionById(req: Request, res: Response) {
  const correlationId = req.correlationId;

  try {
    const submissionId = req.params.id;

    addBreadcrumb("Fetching submission by ID", "database", { submissionId, correlationId });

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        result: true,
      },
    });

    if (!submission) {
      return res.status(404).json({ error: "Submission not found", correlationId });
    }

    let testResults = null;
    if (submission.result?.rawResult) {
      try {
        testResults = JSON.parse(submission.result.rawResult);
      } catch {
        testResults = null;
      }
    }

    res.json({
      id: submission.id,
      problemId: submission.problemId,
      userId: submission.userId,
      status: submission.status,
      durationMs: submission.durations,
      output: submission.output,
      results: testResults?.results || [],
      xpEarned: submission.score,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
    });
  } catch (error) {
    apiLogger.error({ submissionId: req.params.id, error }, "Failed to fetch submission");
    captureException(error as Error, {
      correlationId,
      submissionId: req.params.id,
      action: "getSubmissionById",
    });
    res.status(500).json({ error: "Failed to fetch submission", correlationId });
  }
}

export async function getSubmissionLogs(req: Request, res: Response) {
  const correlationId = req.correlationId;

  try {
    const submissionId = req.params.id;

    addBreadcrumb("Fetching submission logs", "database", { submissionId, correlationId });

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: { id: true, status: true },
    });

    if (!submission) {
      return res.status(404).json({ error: "Submission not found", correlationId });
    }

    const logs = await prisma.executionLog.findMany({
      where: { submissionId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        level: true,
        message: true,
        createdAt: true,
      },
    });

    res.json({
      submissionId,
      status: submission.status,
      logs: logs.map((log) => ({
        type: log.level,
        message: log.message,
        timestamp: log.createdAt,
      })),
    });
  } catch (error) {
    apiLogger.error({ submissionId: req.params.id, error }, "Failed to fetch submission logs");
    captureException(error as Error, {
      correlationId,
      submissionId: req.params.id,
      action: "getSubmissionLogs",
    });
    res.status(500).json({ error: "Failed to fetch submission logs", correlationId });
  }
}

export async function streamSubmissionStatus(req: Request, res: Response) {
  const correlationId = req.correlationId;

  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Submission ID is required", correlationId });
    }

    addBreadcrumb("Starting submission status stream", "sse", { submissionId: id, correlationId });

    if (!submissionQueue || !submissionQueueEvents) {
      return res.status(503).json({
        error: "Submission queue unavailable — Redis is not configured",
        correlationId,
      });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // nginx buffering disabled

    const job = await submissionQueue.getJob(id);

    if (!job) {
      res.write(`data: ${JSON.stringify({ error: "Job not found", correlationId })}\n\n`);
      return res.end();
    }

    const initialState = await job.getState();
    res.write(
      `data: ${JSON.stringify({
        state: initialState,
        progress: job.progress,
        submissionId: id,
        correlationId,
      })}\n\n`
    );

    if (initialState === "completed" || initialState === "failed") {
      if (initialState === "completed") {
        res.write(
          `data: ${JSON.stringify({
            state: "completed",
            result: job.returnvalue,
          })}\n\n`
        );
      } else {
        res.write(
          `data: ${JSON.stringify({
            state: "failed",
            error: job.failedReason,
          })}\n\n`
        );
      }
      return res.end();
    }

    const onProgress = async (data: { jobId: string; data: JobProgress }) => {
      if (data.jobId === id) {
        res.write(
          `data: ${JSON.stringify({
            state: "active",
            progress: data.data,
          })}\n\n`
        );
      }
    };

    const onCompleted = async (data: { jobId: string; returnvalue: unknown }) => {
      if (data.jobId === id) {
        res.write(
          `data: ${JSON.stringify({
            state: "completed",
            result: data.returnvalue,
          })}\n\n`
        );
        cleanup();
        res.end();
      }
    };

    const onFailed = async (data: { jobId: string; failedReason: string }) => {
      if (data.jobId === id) {
        res.write(
          `data: ${JSON.stringify({
            state: "failed",
            error: data.failedReason,
          })}\n\n`
        );
        cleanup();
        res.end();
      }
    };

    const cleanup = () => {
      submissionQueueEvents!.off("progress", onProgress);
      submissionQueueEvents!.off("completed", onCompleted);
      submissionQueueEvents!.off("failed", onFailed);
    };

    submissionQueueEvents.on("progress", onProgress);
    submissionQueueEvents.on("completed", onCompleted);
    submissionQueueEvents.on("failed", onFailed);

    req.on("close", () => {
      cleanup();
    });

    const keepAliveInterval = setInterval(() => {
      res.write(`: keepalive\n\n`);
    }, 15000);

    const maxConnectionTimeout = setTimeout(
      () => {
        cleanup();
        clearInterval(keepAliveInterval);
        res.write(
          `data: ${JSON.stringify({ state: "timeout", message: "Connection timed out, please reconnect" })}\n\n`
        );
        res.end();
      },
      5 * 60 * 1000
    );

    req.on("close", () => {
      clearInterval(keepAliveInterval);
      clearTimeout(maxConnectionTimeout);
    });
  } catch (error) {
    apiLogger.error({ submissionId: req.params.id, error }, "Failed to stream submission status");
    captureException(error as Error, {
      correlationId,
      submissionId: req.params.id,
      action: "streamSubmissionStatus",
    });
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to stream submission status", correlationId });
    }
  }
}
