import { prisma } from "@reqres/database";
import { Router } from "express";
import { ProblemListDTO, ProblemDetailDTO } from "@reqres/types";
import { apiLogger } from "../lib/logger.js";

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

// will add admin only routes here.

export default router;
