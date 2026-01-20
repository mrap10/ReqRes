import { prisma, UserRole } from "@reqres/database";
import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth.js";

interface ExtendedUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  xp: number;
  image?: string | null;
  emailVerified?: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: ExtendedUser;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    });

    if (!session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = session.user as ExtendedUser;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function optionalAuth(req: Request, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    });

    if (session?.user) {
      req.user = session.user as ExtendedUser;
    }

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    next();
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
}

export function requireOwnership(paramName: string = "userId") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const resourceOwnerId = req.params[paramName];

    if (req.user.role === "ADMIN") {
      return next();
    }

    if (req.user.id !== resourceOwnerId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}

export async function requireSubmissionOwnership(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const submissionId = req.params.id;

  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        userId: true,
      },
    });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    if (req.user.role === "ADMIN") {
      return next();
    }

    if (submission.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (error) {
    console.error("Error checking submission ownership:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
