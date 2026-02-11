import { prisma, Prisma } from "@reqres/database";
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

router.get("/admin/all", requireAuth, requireAdmin, async (req, res) => {
  try {
    const problems = await prisma.problem.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        difficulty: true,
        tags: true,
        track: true,
        isPublished: true,
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({ problems });
  } catch (error) {
    apiLogger.error(
      {
        correlationId: req.correlationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to fetch admin problems list"
    );
    res.status(500).json({ error: "Failed to fetch problems", correlationId: req.correlationId });
  }
});

router.get("/admin/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: req.params.id },
      include: { testConfig: true },
    });

    if (!problem) {
      return res.status(404).json({ error: "Problem not found", correlationId: req.correlationId });
    }

    res.json({ problem });
  } catch (error) {
    apiLogger.error(
      {
        correlationId: req.correlationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to fetch problem for editing"
    );
    res.status(500).json({ error: "Failed to fetch problem", correlationId: req.correlationId });
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
      let parsedExamples = null;
      if (body.examples) {
        try {
          parsedExamples = JSON.parse(body.examples);
        } catch {
          parsedExamples = null;
        }
      }

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
          examples: parsedExamples,
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

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body as CreateProblemDTO;

    const existing = await prisma.problem.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Problem not found", correlationId: req.correlationId });
    }

    if (body.slug && body.slug !== existing.slug) {
      const slugConflict = await prisma.problem.findUnique({ where: { slug: body.slug } });
      if (slugConflict) {
        return res
          .status(409)
          .json({
            error: "A problem with this slug already exists",
            correlationId: req.correlationId,
          });
      }
    }

    let parsedExamples: Prisma.InputJsonValue | typeof Prisma.JsonNull =
      existing.examples ?? Prisma.JsonNull;
    if (body.examples !== undefined) {
      try {
        parsedExamples = body.examples ? JSON.parse(body.examples) : Prisma.JsonNull;
      } catch {
        parsedExamples = Prisma.JsonNull;
      }
    }

    const problemId = id as string;

    const updated = await prisma.$transaction(async (tx) => {
      const updatedProblem = await tx.problem.update({
        where: { id: problemId },
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
          examples: parsedExamples,
          isPublished: body.isPublished,
        },
      });

      if (body.testConfig) {
        await tx.testConfig.upsert({
          where: { problemId },
          update: {
            timeoutMs: body.testConfig.timeoutMs,
            memoryMb: body.testConfig.memoryMb,
          },
          create: {
            problemId,
            timeoutMs: body.testConfig.timeoutMs,
            memoryMb: body.testConfig.memoryMb,
          },
        });
      }

      return updatedProblem;
    });

    apiLogger.info(
      {
        correlationId: req.correlationId,
        problemId: updated.id,
        slug: updated.slug,
        adminId: req.user?.id,
      },
      "Problem updated successfully"
    );

    res.json({
      message: "Problem updated successfully",
      problem: { id: updated.id, slug: updated.slug, title: updated.title },
    });
  } catch (error) {
    apiLogger.error(
      {
        correlationId: req.correlationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to update problem"
    );
    res.status(500).json({ error: "Failed to update problem", correlationId: req.correlationId });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.problem.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Problem not found", correlationId: req.correlationId });
    }

    await prisma.problem.delete({ where: { id } });

    apiLogger.info(
      { correlationId: req.correlationId, problemId: id, adminId: req.user?.id },
      "Problem deleted successfully"
    );

    res.json({ message: "Problem deleted successfully" });
  } catch (error) {
    apiLogger.error(
      {
        correlationId: req.correlationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to delete problem"
    );
    res.status(500).json({ error: "Failed to delete problem", correlationId: req.correlationId });
  }
});

export default router;
