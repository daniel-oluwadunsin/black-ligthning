import express from "express";
import { testDbConnection } from "./config/db";
import { testCacheConnection } from "./config/redis";

const app = express();

app.get("/health-check", async (req, res) => {
  const checks = await Promise.all([testDbConnection(), testCacheConnection()]);
  const allHealthy = checks.every((check) => check);

  res
    .status(allHealthy ? 200 : 500)
    .json({ status: allHealthy ? "ok" : "error" });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
