import express from "express";

const PORT = process.env.PORT;

const app = express();
app.use(express.json());

app.get("/", (_, res) => {
  res.json({ status: "runner ok" });
});

app.listen(PORT, () => {
  console.log(`Runner server is running on port ${PORT}: http://localhost:${PORT}`);
});
