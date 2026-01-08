import { NextFunction, Request, Response } from "express";

export function requireRunnerSecret(req: Request, res: Response, next: NextFunction) {
  const secret = req.headers["x-runner-secret"];
  if (secret !== process.env.RUNNER_SHARED_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}
