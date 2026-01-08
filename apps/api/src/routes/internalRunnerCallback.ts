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
      durationMs,
      output: stderr || stdout,
    },
  });

  await prisma.executionResult.create({
    data: {
      submissionId,
      rawResult: JSON.stringify({ results, stdout, stderr }),
    },
  });

  res.json({ message: "Result recorded" });
});

export default router;
