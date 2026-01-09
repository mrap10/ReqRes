import express from "express";
import submissionsRouter from "./src/routes/submissions.js";

const PORT = process.env.PORT;

const app = express();
app.use(express.json());

app.use("/submissions", submissionsRouter);

app.get("/", (_, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}: http://localhost:${PORT}`);
});
