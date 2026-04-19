import RedisClient from "ioredis";
import Env from "./env";
import chalk from "chalk";

declare global {
  // allow global `var` declarations
  var redis: RedisClient | null;
}

const redisClient = new RedisClient({
  host: Env.redis.host,
  port: Env.redis.port,
  password: Env.redis.password,
  username: Env.redis.username,
});

if (!globalThis.redis) {
  globalThis.redis = redisClient;

  globalThis.redis.on("connect", () => {
    console.log(chalk.green("Successfully connected to Redis."));
  });

  globalThis.redis.on("error", (err) => {
    console.error(chalk.red("Failed to connect to Redis:"), err);
    process.exit(1);
  });
}

export const testCacheConnection = async () => {
  try {
    await globalThis.redis?.ping();
    return true;
  } catch (err) {
    console.error(chalk.red("Redis connection test failed:"), err);
    return false;
  }
};

const redis = globalThis.redis;

export default redis;
