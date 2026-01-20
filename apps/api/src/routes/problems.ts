import { prisma } from "@reqres/database";
import { Router } from "express";
import { ProblemListDTO, ProblemDetailDTO } from "@reqres/types";

const router = Router();

router.get("/", async (_req, res) => {
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
});

router.get("/:slug", async (req, res) => {
  const slug = req.params.slug;

  if (!slug) {
    return res.status(400).json({ error: "Invalid problem slug." });
  }

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
    return res.status(404).json({ error: "Problem not found." });
  }

  res.json({ problem: problem as ProblemDetailDTO });
});

// will add admin only routes here.

export default router;
