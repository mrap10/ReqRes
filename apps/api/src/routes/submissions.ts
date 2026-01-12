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

  const userId = req.user?.id || "6bdee8fd-e5d1-44d6-80c1-00db5a7fc86c"; // temporary fallback for testing
  const { problemId, code } = parseResult.data;

  const problem = await prisma.problem.findFirst({
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
        codeBundle: {
          files: code.files,
          entryPoint: code.entryPoint || "index.ts",
        },
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
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
  });
});

export default router;
