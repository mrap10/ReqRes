import { Request, Response, Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Prisma, prisma } from "@reqres/database";
import { apiLogger } from "../lib/logger.js";

const router = Router();

router.get("/me", requireAuth, async (req: Request, res: Response) => {
  res.json(req.user);
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

export default router;
