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
  }),
});

router.post("/", async (req, res) => {
  console.log("Received request body:", JSON.stringify(req.body, null, 2));

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
          submissionType: problem.submissionType,
        },
        codeBundle: code,
        testConfig: {
          timeoutMs: problem.testConfig.timeoutMs,
          memoryMb: problem.testConfig.memoryMb,
        },
      },
      {
        headers: {
          "x-runner-secret": process.env.RUNNER_SHARED_SECRET,
        },
        timeout: 30000,
      }
    )
    .catch((err) => {
      console.error("Failed to send execution request to runner:", err);
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
  });

  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
  }

  res.json({
    id: submission.id,
    problemId: submission.problemId,
    userId: submission.userId,
    status: submission.status,
    durationMs: submission.durations,
    output: submission.output,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
  });
});

export default router;
