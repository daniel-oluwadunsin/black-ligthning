import express from "express";
import { testDbConnection } from "./config/db";
import { testCacheConnection } from "./config/redis";
import { errorHandler } from "./utils";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import router from "./routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(cors());
app.use(helmet());
app.use(
  compression({
    threshold: 1024,
  }),
);

app.get("/health-check", async (req, res) => {
  const checks = await Promise.all([testDbConnection(), testCacheConnection()]);
  const allHealthy = checks.every((check) => check);

  res
    .status(allHealthy ? 200 : 500)
    .json({ status: allHealthy ? "ok" : "error" });
});

app.use(router);

app.use(errorHandler);

export default app;
