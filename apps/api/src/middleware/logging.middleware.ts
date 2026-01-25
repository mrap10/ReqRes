import { createId } from "@paralleldrive/cuid2";
import { NextFunction, Request, Response } from "express";
import { apiLogger } from "../lib/logger.js";

export function correlationMiddleware(req: Request, res: Response, next: NextFunction) {
  req.correlationId = (req.headers["x-correlation-id"] as string) || createId();

  res.setHeader("X-Correlation-ID", req.correlationId);

  next();
}

export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  apiLogger.info(
    {
      correlationId: req.correlationId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    },
    "Incoming request"
  );

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    const logData = {
      correlationId: req.correlationId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    };

    if (res.statusCode >= 500) {
      apiLogger.error(logData, "Request resulted in server error");
    } else if (res.statusCode >= 400) {
      apiLogger.warn(logData, "Request resulted in client error");
    } else {
      apiLogger.info(logData, "Request completed successfully");
    }
  });

  next();
}
