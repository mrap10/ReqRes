import { prisma } from "@reqres/database";
import { Router } from "express";

const router = Router();

router.post("/result", async (req, res) => {
  console.log("runner callback raw body:", JSON.stringify(req.body, null, 2));

  const secret = req.headers["x-runner-secret"];
  if (secret !== process.env.RUNNER_SHARED_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { submissionId, status, results, durationMs, stdout, stderr } = req.body;

  // there is def. better way to do this, will look into it later.
  let prismaStatus: "PASSED" | "WRONG_ANSWER" | "RUNTIME_ERROR";
  if (status === "PASSED") {
    prismaStatus = "PASSED";
  } else if (status === "FAILED") {
    prismaStatus = "WRONG_ANSWER";
  } else {
    prismaStatus = "RUNTIME_ERROR";
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: prismaStatus,
      durations: durationMs,
      output: status === "PASSED" ? stdout : stderr || stdout || "Execution failed!",
    },
  });

  await prisma.executionResult.upsert({
    where: { submissionId },
    update: {
      rawResult: JSON.stringify({ results, stdout, stderr, durationMs }),
    },
    create: {
      submissionId,
      rawResult: JSON.stringify({ results, stdout, stderr, durationMs }),
    },
  });

  res.json({ message: "Result recorded" });
});

router.post("/log", async (req, res) => {
  const secret = req.headers["x-runner-secret"];
  if (secret !== process.env.RUNNER_SHARED_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { submissionId, level, message } = req.body;

  if (!submissionId || !level || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  await prisma.executionLog.create({
    data: {
      submissionId,
      level,
      message,
    },
  });

  res.json({ message: "Log recorded" });
});

export default router;
