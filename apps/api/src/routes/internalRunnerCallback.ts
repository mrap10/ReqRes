import { prisma } from "@reqres/database";
import { Router } from "express";
import { apiLogger } from "../lib/logger.js";
import { invalidateActivityGrid } from "../services/streak.service.js";

const router = Router();

const XP_VALUES = {
  EASY: 50,
  MEDIUM: 100,
  HARD: 150,
} as const;

const FIRST_SUBMISSION_BONUS = 25;

// hope i dont need explicit middleware here
router.post("/result", async (req, res) => {
  const { submissionId } = req.body;
  apiLogger.debug({ body: req.body }, "Runner callback received");

  const secret = req.headers["x-runner-secret"];
  if (secret !== process.env.RUNNER_SHARED_SECRET) {
    apiLogger.warn({ submissionId }, "Runner callback rejected - invalid secret");
    return res.status(403).json({ error: "Forbidden" });
  }

  const { status, results, durationMs, stdout, stderr, mode } = req.body;

  // there is def. better way to do this, will look into it later.
  let prismaStatus: "PASSED" | "WRONG_ANSWER" | "RUNTIME_ERROR";
  if (status === "PASSED") {
    prismaStatus = "PASSED";
  } else if (status === "FAILED") {
    prismaStatus = "WRONG_ANSWER";
  } else {
    prismaStatus = "RUNTIME_ERROR";
  }

  const isRunMode = mode === "run";

  try {
    const currentSubmission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        problem: true,
        user: true,
      },
    });

    if (!currentSubmission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    const { userId, problemId, problem } = currentSubmission;

    await prisma.$transaction(async (tx) => {
      let xpToAward = 0;
      let isFirstTryBonus = false;

      if (prismaStatus === "PASSED" && !isRunMode) {
        const previousPassedSubmission = await tx.submission.findFirst({
          where: {
            userId,
            problemId,
            status: "PASSED",
            id: { not: submissionId },
          },
        });

        if (!previousPassedSubmission) {
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

          await tx.user.update({
            where: { id: userId },
            data: {
              xp: {
                increment: xpToAward,
              },
            },
          });
        }
      }

      await tx.submission.update({
        where: { id: submissionId },
        data: {
          status: prismaStatus,
          durations: durationMs,
          output: status === "PASSED" ? stdout : stderr || stdout || "Execution failed!",
          score: xpToAward,
          isFirstTryBonus,
        },
      });

      // keeping only the latest failed submission per user per problem
      if (prismaStatus !== "PASSED") {
        const oldFailedSubmissions = await tx.submission.findMany({
          where: {
            userId,
            problemId,
            status: { in: ["WRONG_ANSWER", "RUNTIME_ERROR", "TIME_LIMIT", "MEMORY_LIMIT"] },
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

      if (prismaStatus === "PASSED" && !isRunMode) {
        const oldPassedSubmissions = await tx.submission.findMany({
          where: {
            userId,
            problemId,
            status: "PASSED",
            id: { not: submissionId },
          },
          select: { id: true },
        });

        if (oldPassedSubmissions.length > 0) {
          await tx.executionResult.deleteMany({
            where: {
              submissionId: { in: oldPassedSubmissions.map((s) => s.id) },
            },
          });

          await tx.executionLog.deleteMany({
            where: {
              submissionId: { in: oldPassedSubmissions.map((s) => s.id) },
            },
          });

          await tx.submission.deleteMany({
            where: {
              id: { in: oldPassedSubmissions.map((s) => s.id) },
            },
          });
        }
      }

      await tx.executionResult.upsert({
        where: { submissionId },
        update: {
          rawResult: JSON.stringify({ results, stdout, stderr, durationMs }),
        },
        create: {
          submissionId,
          rawResult: JSON.stringify({ results, stdout, stderr, durationMs }),
        },
      });
    });

    await invalidateActivityGrid(userId);

    apiLogger.info({ submissionId, status: prismaStatus }, "Submission result recorded");
    res.json({ message: "Result recorded" });
  } catch (error) {
    apiLogger.error(
      { submissionId, error: error instanceof Error ? error.message : String(error) },
      "Failed to record submission result"
    );
    res.status(500).json({ error: "Failed to record result" });
  }
});

router.post("/log", async (req, res) => {
  const { submissionId } = req.body;
  const secret = req.headers["x-runner-secret"];
  if (secret !== process.env.RUNNER_SHARED_SECRET) {
    apiLogger.warn({ submissionId }, "Execution log rejected - invalid secret");
    return res.status(403).json({ error: "Forbidden" });
  }

  const { level, message } = req.body;

  if (!submissionId || !level || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

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
    res.status(500).json({ error: "Failed to record log" });
  }
});

export default router;
