import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import Env from "./env";
import chalk from "chalk";

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var, vars-on-top
  var prisma: PrismaClient | null;
}

if (!globalThis.prisma) {
  globalThis.prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: Env.databaseUrl,
    }),
  });

  globalThis.prisma
    .$connect()
    .then(() => {
      console.log(chalk.green("Successfully connected to the database."));
    })
    .catch((err) => {
      console.error(chalk.red("Failed to connect to the database:"), err);
      process.exit(1);
    });
}

export const testDbConnection = async () => {
  try {
    await globalThis.prisma?.$queryRawUnsafe("SELECT 1");
    return true;
  } catch (err) {
    console.error(chalk.red("Database connection test failed:"), err);
    return false;
  }
};

export const prisma = globalThis.prisma;
