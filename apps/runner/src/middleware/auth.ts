import { NextFunction, Request, Response } from "express";

export function requireRunnerSecret(req: Request, res: Response, next: NextFunction) {
  const configuredSecret = process.env.RUNNER_SHARED_SECRET;
  if (!configuredSecret) {
    return res.status(503).json({ error: "Runner secret is not configured" });
  }

  const incomingSecret = req.headers["x-runner-secret"];
  if (typeof incomingSecret !== "string" || incomingSecret !== configuredSecret) {
    return res.status(403).json({ error: "Forbidden" });
  }

  next();
}
