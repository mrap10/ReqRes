import { Router } from "express";
import { z } from "zod";
import { runExecution } from "../services/executor.js";
import { requireRunnerSecret } from "../middleware/auth.js";

export const executeRouter = Router();

const ExecuteSchema = z.object({
  submissionId: z.string().regex(/^c[a-z0-9]{24}$/, "Invalid CUID format"),
  problem: z.object({
    id: z.string().regex(/^c[a-z0-9]{24}$/, "Invalid CUID format"),
    slug: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
    submissionType: z.literal("EXPRESS_API"),
  }),
  codeBundle: z.object({
    files: z.record(z.string(), z.string()),
    entryPoint: z.string(),
  }),
  testConfig: z.object({
    timeoutMs: z.number().min(100).max(60000),
    memoryMb: z.number().min(16).max(2048),
  }),
});

executeRouter.post("/", requireRunnerSecret, async (req, res) => {
  const parseResult = ExecuteSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res
      .status(400)
      .json({ error: "Invalid exec request payload", details: parseResult.error.flatten() });
  }

  try {
    const result = await runExecution(parseResult.data);
    return res.json(result);
  } catch (error) {
    console.error("Execution error:", error);
    return res.status(500).json({
      submissionId: parseResult.data.submissionId,
      status: "ERROR",
      results: [],
      durationMs: 0,
      stderr: "Internal server error during execution",
    });
  }
});
