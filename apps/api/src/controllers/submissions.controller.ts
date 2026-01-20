import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@reqres/database";
import axios from "axios";

const CreateSubmissionSchema = z.object({
  problemId: z.cuid(),
  code: z.object({
    files: z.record(z.string(), z.string()),
    entryPoint: z.string().optional().default("index.ts"),
  }),
});

export async function createSubmission(req: Request, res: Response) {
  try {
    const parseResult = CreateSubmissionSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res
        .status(400)
        .json({ error: "Invalid submission payload", details: parseResult.error.flatten() });
    }

    const { problemId, code } = parseResult.data;

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;

    const problem = await prisma.problem.findUnique({
      where: { id: problemId, isPublished: true },
      include: { testConfig: true },
    });

    if (!problem || !problem.testConfig) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const submission = await prisma.submission.create({
      data: {
        userId,
        problemId,
        codeBundle: JSON.stringify(code),
        status: "PENDING",
      },
    });

    const codeBundleToSend = {
      files: code.files,
      entryPoint: code.entryPoint || "index.js",
    };

    // fire-and-forget request to runner
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
  } catch (error) {
    console.error("Failed to create submission:", error);
    res.status(500).json({ error: "Failed to create submission" });
  }
}

export async function getUserSubmissions(req: Request, res: Response) {
  try {
    const { userId } = req.params;

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
}

export async function getLeaderboard(_: Request, res: Response) {
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
}

export async function getSubmissionById(req: Request, res: Response) {
  try {
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
  } catch (error) {
    console.error("Failed to fetch submission:", error);
    res.status(500).json({ error: "Failed to fetch submission" });
  }
}

export async function getSubmissionLogs(req: Request, res: Response) {
  try {
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
  } catch (error) {
    console.error("Failed to fetch submission logs:", error);
    res.status(500).json({ error: "Failed to fetch submission logs" });
  }
}
