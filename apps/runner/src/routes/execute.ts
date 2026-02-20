import { Router } from "express";
import { z } from "zod";
import { runExecution } from "../services/executor.js";
import { requireRunnerSecret } from "../middleware/auth.js";
import { captureException, addBreadcrumb, setTags } from "../lib/sentry.js";
import { runnerLogger } from "../lib/logger.js";

export const executeRouter = Router();
const MAX_FILES = 30;
const MAX_FILE_CONTENT_LENGTH = 100_000;
const MAX_TOTAL_CONTENT_LENGTH = 500_000;
const MAX_FILE_PATH_LENGTH = 200;

const CodeFilesSchema = z
  .record(z.string().max(MAX_FILE_PATH_LENGTH), z.string().max(MAX_FILE_CONTENT_LENGTH))
  .superRefine((files, ctx) => {
    const entries = Object.entries(files);

    if (entries.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one file is required",
      });
      return;
    }

    if (entries.length > MAX_FILES) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Too many files. Max allowed is ${MAX_FILES}`,
      });
      return;
    }

    let totalContentLength = 0;
    for (const [filePath, content] of entries) {
      const normalizedPath = filePath.replace(/\\/g, "/");
      if (normalizedPath.startsWith("/") || normalizedPath.includes("..")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid file path: ${filePath}`,
        });
        return;
      }

      totalContentLength += Buffer.byteLength(content, "utf8");
      if (totalContentLength > MAX_TOTAL_CONTENT_LENGTH) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Submission is too large",
        });
        return;
      }
    }
  });

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
    files: CodeFilesSchema,
    entryPoint: z.string().min(1).max(MAX_FILE_PATH_LENGTH),
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
