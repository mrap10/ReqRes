import { Router } from "express";
import { z } from "zod";
import { runExecution } from "../services/executor.js";
import { requireRunnerSecret } from "../middleware/auth.js";
import { captureException, addBreadcrumb, setTags } from "../lib/sentry.js";
import { runnerLogger } from "../lib/logger.js";

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
  correlationId: z.string().optional(),
  mode: z.enum(["run", "submit"]).optional().default("submit"),
});

executeRouter.post("/", requireRunnerSecret, async (req, res) => {
  const parseResult = ExecuteSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res
      .status(400)
      .json({ error: "Invalid exec request payload", details: parseResult.error.flatten() });
  }

  const { submissionId, problem, correlationId } = parseResult.data;

  setTags({
    submissionId,
    problemId: problem.id,
    problemSlug: problem.slug,
    correlationId: correlationId || "unknown",
  });

  addBreadcrumb("Starting code execution", "execution", {
    submissionId,
    problemSlug: problem.slug,
    timeoutMs: parseResult.data.testConfig.timeoutMs,
  });

  try {
    runnerLogger.info({ submissionId, problemSlug: problem.slug }, "Starting execution");

    const result = await runExecution(parseResult.data);

    runnerLogger.info(
      { submissionId, status: result.status, durationMs: result.durationMs },
      "Execution completed"
    );

    addBreadcrumb("Execution completed", "execution", {
      submissionId,
      status: result.status,
      durationMs: result.durationMs,
    });

    return res.json(result);
  } catch (error) {
    runnerLogger.error(
      {
        submissionId,
        problemId: problem.id,
        error: error instanceof Error ? error.message : String(error),
      },
      "Execution failed"
    );

    addBreadcrumb("Execution failed", "error", { submissionId }, "error");

    captureException(error as Error, {
      submissionId,
      problemId: problem.id,
      problemSlug: problem.slug,
      correlationId,
      action: "runExecution",
    });

    return res.status(500).json({
      submissionId: parseResult.data.submissionId,
      status: "ERROR",
      results: [],
      durationMs: 0,
      stderr: "Internal server error during execution",
    });
  }
});
