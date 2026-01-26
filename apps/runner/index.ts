import { initializeSentry, setupSentryErrorHandler } from "./src/lib/sentry.js";

initializeSentry();

import express, { Request, Response, NextFunction } from "express";
import { executeRouter } from "./src/routes/execute.js";

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

app.get("/debug/error", (_req: Request, _res: Response) => {
  throw new Error("Test runner error - this should appear in Sentry!");
});

setupSentryErrorHandler(app);

// xustom error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[Runner] Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Runner server is running on port ${PORT}: http://localhost:${PORT}`);
});
