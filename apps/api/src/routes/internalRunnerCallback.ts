import { prisma } from "@reqres/database";
import { Router } from "express";

const router = Router();

router.post("/result", async (req, res) => {
  const secret = req.headers["x-runner-secret"];
  if (secret !== process.env.RUNNER_SHARED_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { submissionId, status, results, durationMs, stdout, stderr } = req.body;

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status,
      durations: durationMs,
      output: stderr || stdout || "Execution completed",
    },
  });

  await prisma.executionResult.create({
    data: {
      submissionId,
      rawResult: JSON.stringify({ results, stdout, stderr, durationMs }),
    },
  });

  res.json({ message: "Result recorded" });
});

export default router;
