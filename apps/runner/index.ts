import express from "express";
import { executeRouter } from "./src/routes/execute.js";

const PORT = process.env.PORT;

const app = express();
app.use(express.json({ limit: "10mb" }));

app.use("/internal/execute", executeRouter);

app.get("/", (_, res) => {
  res.json({ status: "runner ok" });
});

app.listen(PORT, () => {
  console.log(`Runner server is running on port ${PORT}: http://localhost:${PORT}`);
});
