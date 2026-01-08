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
  problemId: z.uuid(),
  code: z.object({
    files: z.record(z.string(), z.string()),
  }),
});

router.post("/", async (req, res) => {
  const parseResult = CreateSubmissionSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res
      .status(400)
      .json({ error: "Invalid submission payload", details: parseResult.error.flatten() });
  }

  const userId = req.user.id; // assuming req.user is populated by authentication middleware
  const { problemId, code } = parseResult.data;

  const problem = await prisma.problem.findFirst({
    where: { id: problemId, isActive: true },
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

export default router;
