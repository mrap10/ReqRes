import express from "express";

const PORT = process.env.PORT;

const app = express();
app.use(express.json());

app.get("/", (_, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}: http://localhost:${PORT}`);
});
