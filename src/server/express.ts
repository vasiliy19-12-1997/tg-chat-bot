import express from "express";
import { PORT } from "../config/config.ts";

const app = express();
app.get("/", (_req, res) => {
  res.send("Bot is runnnng...");
});
app.get("/health", (_req, res) => {
  res.status(200).json({ status: true });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
