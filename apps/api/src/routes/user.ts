import { Request, Response, Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Prisma, prisma } from "@reqres/database";
import { apiLogger } from "../lib/logger.js";
import { getUserStreakData, getActivityGrid } from "../services/streak.service.js";

const router = Router();

router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        role: true,
        xp: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found", correlationId: req.correlationId });
    }

    res.json(user);
  } catch (error) {
    apiLogger.error(
      {
        correlationId: req.correlationId,
        userId: req.user?.id,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to fetch user profile"
    );
    res.status(500).json({ error: "Failed to fetch profile", correlationId: req.correlationId });
  }
});

router.patch("/username", requireAuth, async (req: Request, res: Response) => {
  const { username } = req.body;

  if (!username || username.length < 3) {
    return res
      .status(400)
      .json({ error: "Username must be at least 3 characters.", correlationId: req.correlationId });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: { username },
    });

    apiLogger.info(
      { correlationId: req.correlationId, userId: req.user!.id },
      "Username updated successfully"
    );
    res.json({ username: updated.username });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      res
        .status(400)
        .json({ error: "Username is already taken.", correlationId: req.correlationId });
    } else {
      apiLogger.error(
        {
          correlationId: req.correlationId,
          userId: req.user?.id,
          error: error instanceof Error ? error.message : String(error),
        },
        "Failed to update username"
      );
      res.status(500).json({ error: "Internal server error.", correlationId: req.correlationId });
    }
  }
});

router.get("/streak", requireAuth, async (req: Request, res: Response) => {
  try {
    const timezone = (req.query.timezone as string) || "UTC";
    const streak = await getUserStreakData(req.user!.id, timezone);
    res.json(streak);
  } catch (error) {
    apiLogger.error(
      {
        correlationId: req.correlationId,
        userId: req.user?.id,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to fetch streak data"
    );
    res
      .status(500)
      .json({ error: "Failed to fetch streak data", correlationId: req.correlationId });
  }
});

router.get("/activity-grid", requireAuth, async (req: Request, res: Response) => {
  try {
    const grid = await getActivityGrid(req.user!.id);
    res.json({ grid });
  } catch (error) {
    apiLogger.error(
      {
        correlationId: req.correlationId,
        userId: req.user?.id,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to fetch activity grid"
    );
    res
      .status(500)
      .json({ error: "Failed to fetch activity grid", correlationId: req.correlationId });
  }
});

const ALLOWED_AVATARS = [
  "/avatar1.svg",
  "/avatar2.svg",
  "/avatar3.svg",
  "/avatar4.svg",
  "/avatar5.svg",
  "/avatar6.svg",
];

router.patch("/avatar", requireAuth, async (req: Request, res: Response) => {
  const { avatar } = req.body;

  if (!avatar || !ALLOWED_AVATARS.includes(avatar)) {
    return res
      .status(400)
      .json({ error: "Invalid avatar selection.", correlationId: req.correlationId });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: { image: avatar },
    });

    apiLogger.info(
      { correlationId: req.correlationId, userId: req.user!.id },
      "Avatar updated successfully"
    );
    res.json({ image: updated.image });
  } catch (error) {
    apiLogger.error(
      {
        correlationId: req.correlationId,
        userId: req.user?.id,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to update avatar"
    );
    res.status(500).json({ error: "Internal server error.", correlationId: req.correlationId });
  }
});

router.patch("/name", requireAuth, async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name || name.trim().length < 1) {
    return res
      .status(400)
      .json({ error: "Name cannot be empty.", correlationId: req.correlationId });
  }

  if (name.length > 50) {
    return res
      .status(400)
      .json({ error: "Name must be at most 50 characters.", correlationId: req.correlationId });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name: name.trim() },
    });

    apiLogger.info(
      { correlationId: req.correlationId, userId: req.user!.id },
      "Name updated successfully"
    );
    res.json({ name: updated.name });
  } catch (error) {
    apiLogger.error(
      {
        correlationId: req.correlationId,
        userId: req.user?.id,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to update name"
    );
    res.status(500).json({ error: "Internal server error.", correlationId: req.correlationId });
  }
});

router.get("/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const solvedProblems = await prisma.submission.findMany({
      where: { userId, status: "PASSED" },
      distinct: ["problemId"],
      select: {
        problemId: true,
        problem: { select: { difficulty: true } },
      },
    });

    const byDifficulty = { easy: 0, medium: 0, hard: 0 };
    for (const s of solvedProblems) {
      const d = s.problem.difficulty.toLowerCase() as keyof typeof byDifficulty;
      if (d in byDifficulty) byDifficulty[d]++;
    }

    const leaderboard = await prisma.submission.groupBy({
      by: ["userId"],
      where: { status: "PASSED" },
      _sum: { score: true },
    });

    const sorted = leaderboard
      .map((e) => ({ userId: e.userId, score: e._sum.score || 0 }))
      .sort((a, b) => b.score - a.score);

    const rank = sorted.findIndex((e) => e.userId === userId) + 1;

    res.json({
      rank: rank || null,
      totalSolved: solvedProblems.length,
      byDifficulty,
    });
  } catch (error) {
    apiLogger.error(
      {
        correlationId: req.correlationId,
        userId: req.user?.id,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to fetch user stats"
    );
    res.status(500).json({ error: "Failed to fetch user stats", correlationId: req.correlationId });
  }
});

router.delete("/account", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    await prisma.user.delete({
      where: { id: userId },
    });

    apiLogger.info(
      { correlationId: req.correlationId, userId },
      "User account deleted successfully"
    );
    res.json({ message: "Account deleted successfully." });
  } catch (error) {
    apiLogger.error(
      {
        correlationId: req.correlationId,
        userId: req.user?.id,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to delete account"
    );
    res.status(500).json({ error: "Failed to delete account.", correlationId: req.correlationId });
  }
});

export default router;
