import { prisma } from "@reqres/database";
import { Router } from "express";
import { ProblemListDTO, ProblemDetailDTO, CreateProblemDTO } from "@reqres/types";
import { apiLogger } from "../lib/logger.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const problems = await prisma.problem.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        difficulty: true,
        tags: true,
        track: true,
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({ problems: problems as ProblemListDTO[] });
  } catch (error) {
    apiLogger.error(
      {
        correlationId: req.correlationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to fetch problems list"
    );
    res.status(500).json({ error: "Failed to fetch problems", correlationId: req.correlationId });
  }
});

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return res
      .status(400)
      .json({ error: "Invalid problem slug.", correlationId: req.correlationId });
  }

  try {
    const problem = await prisma.problem.findFirst({
      where: { slug, isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        shortDescription: true,
        instructions: true,
        starterCode: true,
        constraints: true,
        examples: true,
        difficulty: true,
        track: true,
        tags: true,
      },
    });

    if (!problem) {
      return res
        .status(404)
        .json({ error: "Problem not found.", correlationId: req.correlationId });
    }

    res.json({ problem: problem as ProblemDetailDTO });
  } catch (error) {
    apiLogger.error(
      {
        correlationId: req.correlationId,
        slug,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to fetch problem by slug"
    );
    res.status(500).json({ error: "Failed to fetch problem", correlationId: req.correlationId });
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const body = req.body as CreateProblemDTO;

    if (
      !body.title ||
      !body.slug ||
      !body.description ||
      !body.shortDescription ||
      !body.instructions
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        correlationId: req.correlationId,
      });
    }

    const existingProblem = await prisma.problem.findUnique({
      where: { slug: body.slug },
    });

    if (existingProblem) {
      return res.status(409).json({
        error: "A problem with this slug already exists",
        correlationId: req.correlationId,
      });
    }

    const problem = await prisma.$transaction(async (tx) => {
      const newProblem = await tx.problem.create({
        data: {
          title: body.title,
          slug: body.slug,
          description: body.description,
          shortDescription: body.shortDescription,
          instructions: body.instructions,
          difficulty: body.difficulty,
          track: body.track,
          starterCode: JSON.stringify(body.starterCode),
          constraints: body.constraints,
          tags: body.tags,
          isPublished: body.isPublished,
          submissionType: "EXPRESS_API",
        },
      });

      await tx.testConfig.create({
        data: {
          problemId: newProblem.id,
          timeoutMs: body.testConfig?.timeoutMs || 3000,
          memoryMb: body.testConfig?.memoryMb || 256,
        },
      });

      return newProblem;
    });

    apiLogger.info(
      {
        correlationId: req.correlationId,
        problemId: problem.id,
        slug: problem.slug,
        adminId: req.user?.id,
      },
      "Problem created successfully"
    );

    res.status(201).json({
      message: "Problem created successfully",
      problem: {
        id: problem.id,
        slug: problem.slug,
        title: problem.title,
      },
    });
  } catch (error) {
    apiLogger.error(
      {
        correlationId: req.correlationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to create problem"
    );
    res.status(500).json({
      error: "Failed to create problem",
      correlationId: req.correlationId,
    });
  }
});

export default router;
