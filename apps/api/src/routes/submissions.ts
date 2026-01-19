import { Router } from "express";
import { z } from "zod";
import { prisma } from "@reqres/database";
import axios from "axios";

declare module "express-serve-static-core" {
  interface Request {
    user: {
      id: string;
    };
  }
}

const router = Router();

const CreateSubmissionSchema = z.object({
  problemId: z.cuid(),
  code: z.object({
    files: z.record(z.string(), z.string()),
    entryPoint: z.string().optional().default("index.ts"),
  }),
});

router.post("/", async (req, res) => {
  const parseResult = CreateSubmissionSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res
      .status(400)
      .json({ error: "Invalid submission payload", details: parseResult.error.flatten() });
  }

  const userId = req.user?.id || "cmke8l4hl000304ju6o218tod"; // temporary fallback for testing (dev user from seed)
  const { problemId, code } = parseResult.data;

  const problem = await prisma.problem.findFirst({
    where: { id: problemId, isPublished: true },
    include: { testConfig: true },
  });

  if (!problem || !problem.testConfig) {
    return res.status(404).json({ error: "Problem not found" });
  }

  let submission;
  try {
    submission = await prisma.submission.create({
      data: {
        userId,
        problemId,
        codeBundle: JSON.stringify(code),
        status: "PENDING",
      },
    });
  } catch (error) {
    console.error("Failed to create submission:", error);
    return res.status(500).json({ error: "Failed to create submission" });
  }

  const codeBundleToSend = {
    files: code.files,
    entryPoint: code.entryPoint || "index.js",
  };

  axios
    .post(
      `${process.env.RUNNER_BASE_URL}/internal/execute`,
      {
        submissionId: submission.id,
        problem: {
          id: problem.id,
          slug: problem.slug,
          submissionType: problem.submissionType,
        },
        codeBundle: codeBundleToSend,
        testConfig: {
          timeoutMs: problem.testConfig.timeoutMs,
          memoryMb: problem.testConfig.memoryMb,
        },
      },
      {
        headers: {
          "x-runner-secret": process.env.RUNNER_SHARED_SECRET,
        },
        timeout: 60000,
      }
    )
    .catch((err) => {
      console.error("Failed to send execution request to runner:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
    });

  await prisma.submission.update({
    where: { id: submission.id },
    data: { status: "RUNNING" },
  });

  res.json({
    submissionId: submission.id,
    status: "RUNNING",
  });
});

router.get("/user/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const submissions = await prisma.submission.findMany({
      where: {
        userId,
        status: "PASSED",
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
      problemTitle: submission.problem.title,
      track: submission.problem.track,
      difficulty: submission.problem.difficulty,
      durationMs: submission.durations || 0,
      xpEarned: submission.score || 0,
      isFirstTryBonus: submission.isFirstTryBonus,
      createdAt: submission.createdAt,
    }));

    res.json({ submissions: submissionList });
  } catch (error) {
    console.error("Failed to fetch user submissions:", error);
    res.status(500).json({ error: "Failed to fetch user submissions" });
  }
});

router.get("/leaderboard", async (_, res) => {
  try {
    const leaderboardData = await prisma.submission.groupBy({
      by: ["userId"],
      where: {
        status: "PASSED",
      },
      _sum: {
        score: true,
      },
    });

    const uniqueProblems = await Promise.all(
      leaderboardData.map(async (entry) => {
        const count = await prisma.submission.findMany({
          where: {
            userId: entry.userId,
            status: "PASSED",
          },
          distinct: ["problemId"],
          select: { problemId: true },
        });
        return { userId: entry.userId, count: count.length };
      })
    );

    const userIds = leaderboardData.map((entry) => entry.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true },
    });

    const userMap = new Map(users.map((user) => [user.id, user.username]));
    const problemCountMap = new Map(uniqueProblems.map((p) => [p.userId, p.count]));

    const sortedLeaderboard = leaderboardData
      .map((entry) => ({
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
    console.error("Failed to fetch leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

router.get("/:id", async (req, res) => {
  const submissionId = req.params.id;

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      result: true,
    },
  });

  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
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
});

router.get("/:id/logs", async (req, res) => {
  const submissionId = req.params.id;

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { id: true, status: true },
  });

  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
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
});

export default router;
