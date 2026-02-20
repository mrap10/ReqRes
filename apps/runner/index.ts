import { initializeSentry, setupSentryErrorHandler } from "./src/lib/sentry.js";

initializeSentry();

import express, { Request, Response, NextFunction } from "express";
import { executeRouter } from "./src/routes/execute.js";
import { runnerLogger } from "./src/lib/logger.js";

const PORT = process.env.PORT;

export const app = express();
app.use(express.json({ limit: "10mb" }));

app.use("/internal/execute", executeRouter);

app.get("/", (_, res) => {
  res.json({ status: "runner ok" });
});

app.get("/health", (_, res) => {
  res.json({ status: "healthy" });
});

if (process.env.NODE_ENV !== "production") {
  app.get("/debug/error", (_req: Request, _res: Response) => {
    throw new Error("Test runner error - this should appear in Sentry!");
  });
}

setupSentryErrorHandler(app);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  runnerLogger.error({ error: err.message, stack: err.stack }, "Unhandled error occurred");
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  runnerLogger.info({ port: PORT }, "Runner server started");
});
