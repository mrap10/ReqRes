import { SubmissionStatus, prisma } from "@reqres/database";
import { Request, Router } from "express";
import { z } from "zod";
import { apiLogger } from "../lib/logger.js";
import { invalidateActivityGrid } from "../services/streak.service.js";

const router = Router();

const XP_VALUES = {
  EASY: 50,
  MEDIUM: 100,
  HARD: 150,
} as const;

const FIRST_SUBMISSION_BONUS = 25;
const MAX_OUTPUT_LENGTH = 12_000;
const MAX_LOG_MESSAGE_LENGTH = 1_000;
const TERMINAL_SUBMISSION_STATUSES = new Set<SubmissionStatus>([
  SubmissionStatus.PASSED,
  SubmissionStatus.WRONG_ANSWER,
  SubmissionStatus.TIME_LIMIT,
  SubmissionStatus.MEMORY_LIMIT,
  SubmissionStatus.RUNTIME_ERROR,
  SubmissionStatus.COMPILE_ERROR,
]);

const RunnerResultSchema = z.object({
  submissionId: z.cuid(),
  status: z.string().min(1).max(32),
  results: z
    .array(
      z.object({
        name: z.string().min(1).max(300),
        passed: z.boolean(),
        error: z.string().max(2_000).optional(),
        index: z.number().int().nonnegative().optional(),
        location: z
          .union([
            z.object({
              line: z.number().int().nonnegative(),
              column: z.number().int().nonnegative(),
            }),
            z.null(),
          ])
          .optional()
          .transform((value) => value ?? undefined),
      })
    )
    .max(200)
    .optional()
    .default([]),
  durationMs: z.number().int().nonnegative().max(300_000).optional(),
  stdout: z.string().max(MAX_OUTPUT_LENGTH).optional(),
  stderr: z.string().max(MAX_OUTPUT_LENGTH).optional(),
  mode: z.enum(["run", "submit"]).optional().default("submit"),
});

const RunnerLogSchema = z.object({
  submissionId: z.cuid(),
  level: z.enum(["info", "warn", "error"]),
  message: z.string().min(1).max(MAX_LOG_MESSAGE_LENGTH),
});

function verifyRunnerSecret(req: Request): { ok: boolean; status: number; error: string } {
  const configuredSecret = process.env.RUNNER_SHARED_SECRET;
  if (!configuredSecret) {
    apiLogger.error("RUNNER_SHARED_SECRET is missing; rejecting internal runner callbacks");
    return { ok: false, status: 503, error: "Service unavailable" };
  }

  const incomingSecret = req.headers["x-runner-secret"];
  if (typeof incomingSecret !== "string" || incomingSecret !== configuredSecret) {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return { ok: true, status: 200, error: "" };
}

function truncateText(value: string | undefined, maxLength: number): string | undefined {
  if (!value) {
    return value;
  }

  return value.length > maxLength ? `${value.slice(0, maxLength)}...[truncated]` : value;
}

function mapRunnerStatusToSubmissionStatus(status: string): SubmissionStatus {
  const normalizedStatus = status.toUpperCase();

  switch (normalizedStatus) {
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

router.post("/result", async (req, res) => {
  const secretCheck = verifyRunnerSecret(req);
  if (!secretCheck.ok) {
    return res.status(secretCheck.status).json({ error: secretCheck.error });
  }

  const parseResult = RunnerResultSchema.safeParse(req.body);
  if (!parseResult.success) {
    apiLogger.warn(
      {
        issues: parseResult.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        })),
      },
      "Invalid runner callback payload"
    );
    return res.status(400).json({ error: "Invalid runner callback payload" });
  }

  const { submissionId, status, results, durationMs, stdout, stderr, mode } = parseResult.data;
  apiLogger.debug(
    { submissionId, status, mode, resultCount: results.length },
    "Runner callback received"
  );

  const prismaStatus = mapRunnerStatusToSubmissionStatus(status);
  const isRunMode = mode === "run";
  const safeStdout = truncateText(stdout, MAX_OUTPUT_LENGTH);
  const safeStderr = truncateText(stderr, MAX_OUTPUT_LENGTH);

  try {
    const submissionExists = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: { id: true },
    });
    if (!submissionExists) {
      return res.status(404).json({ error: "Submission not found" });
    }

    const txResult = await prisma.$transaction(async (tx) => {
      const currentSubmission = await tx.submission.findUnique({
        where: { id: submissionId },
        include: {
          problem: true,
        },
      });

      if (!currentSubmission) {
        return { processed: false, userId: null as string | null };
      }

      if (TERMINAL_SUBMISSION_STATUSES.has(currentSubmission.status)) {
        return { processed: false, userId: currentSubmission.userId };
      }

      const { userId, problemId, problem } = currentSubmission;
      let xpToAward = 0;
      let isFirstTryBonus = false;
      let hasRewardedPassedSubmission = false;

      if (prismaStatus === SubmissionStatus.PASSED && !isRunMode) {
        const previousPassedSubmission = await tx.submission.findFirst({
          where: {
            userId,
            problemId,
            status: SubmissionStatus.PASSED,
            OR: [{ score: { gt: 0 } }, { isFirstTryBonus: true }],
            id: { not: submissionId },
          },
        });

        hasRewardedPassedSubmission = Boolean(previousPassedSubmission);

        if (!hasRewardedPassedSubmission) {
          const baseXP = XP_VALUES[problem.difficulty as keyof typeof XP_VALUES] || 0;

          const isFirstSubmission = await tx.submission.count({
            where: {
              userId,
              problemId,
              id: { not: submissionId },
            },
          });

          if (isFirstSubmission === 0) {
            isFirstTryBonus = true;
            xpToAward = baseXP + FIRST_SUBMISSION_BONUS;
          } else {
            xpToAward = baseXP;
          }
        }
      }

      const updateResult = await tx.submission.updateMany({
        where: {
          id: submissionId,
          status: {
            in: [SubmissionStatus.PENDING, SubmissionStatus.RUNNING],
          },
        },
        data: {
          status: prismaStatus,
          durations: durationMs,
          output:
            prismaStatus === SubmissionStatus.PASSED
              ? safeStdout
              : safeStderr || safeStdout || "Execution failed!",
          score: xpToAward,
          isFirstTryBonus,
        },
      });

      if (updateResult.count === 0) {
        return { processed: false, userId };
      }

      if (xpToAward > 0) {
        await tx.user.update({
          where: { id: userId },
          data: {
            xp: {
              increment: xpToAward,
            },
          },
        });
      }

      if (prismaStatus !== SubmissionStatus.PASSED) {
        const oldFailedSubmissions = await tx.submission.findMany({
          where: {
            userId,
            problemId,
            status: {
              in: [
                SubmissionStatus.WRONG_ANSWER,
                SubmissionStatus.RUNTIME_ERROR,
                SubmissionStatus.TIME_LIMIT,
                SubmissionStatus.MEMORY_LIMIT,
              ],
            },
            id: { not: submissionId },
          },
          select: { id: true },
        });

        if (oldFailedSubmissions.length > 0) {
          const oldIds = oldFailedSubmissions.map((s) => s.id);

          await tx.executionResult.deleteMany({
            where: { submissionId: { in: oldIds } },
          });

          await tx.executionLog.deleteMany({
            where: { submissionId: { in: oldIds } },
          });

          await tx.submission.deleteMany({
            where: { id: { in: oldIds } },
          });
        }
      }

      await tx.executionResult.upsert({
        where: { submissionId },
        update: {
          rawResult: JSON.stringify({
            results,
            stdout: safeStdout,
            stderr: safeStderr,
            durationMs,
          }),
        },
        create: {
          submissionId,
          rawResult: JSON.stringify({
            results,
            stdout: safeStdout,
            stderr: safeStderr,
            durationMs,
          }),
        },
      });

      return { processed: true, userId };
    });

    if (txResult.processed && txResult.userId) {
      await invalidateActivityGrid(txResult.userId);
    } else {
      apiLogger.info({ submissionId }, "Ignoring duplicate or already-processed callback");
      return res.json({ message: "Already processed" });
    }

    apiLogger.info({ submissionId, status: prismaStatus }, "Submission result recorded");
    return res.json({ message: "Result recorded" });
  } catch (error) {
    apiLogger.error(
      { submissionId, error: error instanceof Error ? error.message : String(error) },
      "Failed to record submission result"
    );
    return res.status(500).json({ error: "Failed to record result" });
  }
});

router.post("/log", async (req, res) => {
  const secretCheck = verifyRunnerSecret(req);
  if (!secretCheck.ok) {
    return res.status(secretCheck.status).json({ error: secretCheck.error });
  }

  const parseResult = RunnerLogSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid execution log payload" });
  }

  const { submissionId, level, message } = parseResult.data;

  try {
    await prisma.executionLog.create({
      data: {
        submissionId,
        level,
        message,
      },
    });

    res.json({ message: "Log recorded" });
  } catch (error) {
    apiLogger.error(
      { submissionId, error: error instanceof Error ? error.message : String(error) },
      "Failed to record execution log"
    );
    return res.status(500).json({ error: "Failed to record log" });
  }
});

export default router;
