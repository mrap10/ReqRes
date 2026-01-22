import express from "express";
import cors from "cors";
import submissionsRouter from "./src/routes/submissions.js";
import callbackRouter from "./src/routes/internalRunnerCallback.js";
import problemsRouter from "./src/routes/problems.js";
import userRouter from "./src/routes/user.js";
import { auth } from "./src/lib/auth.js";
import { toNodeHandler } from "better-auth/node";

const PORT = process.env.PORT;

const app = express();

app.use(
  cors({
    origin: process.env.WEB_BASE_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", toNodeHandler(auth));

app.use("/submissions", submissionsRouter);
app.use("/internal/runner", callbackRouter);
app.use("/problems", problemsRouter);
app.use("/user", userRouter);

app.get("/", (_, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}: http://localhost:${PORT}`);
});
