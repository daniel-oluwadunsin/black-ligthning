import chalk from "chalk";
import app from "./app";
import "./queues";

const startApp = async () => {
  try {
    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
      console.log(chalk.green(`Server is running on port ${PORT}`));
    });

    process.on("SIGINT", async () => {
      console.log(chalk.yellow("Shutting down server gracefully... 👋"));
      process.exit(0);
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.log(
        chalk.red("Unhandled Rejection at:", promise, "reason:", reason),
      );
    });

    process.on("uncaughtException", (error) => {
      console.log(chalk.red("Uncaught Exception:", error));
      process.exit(1);
    });

    process.on("SIGTERM", async () => {
      console.log(
        chalk.yellow("Received SIGTERM, shutting down server gracefully... 👋"),
      );
      process.exit(0);
    });
  } catch (error) {
    console.log(chalk.red("Failed to start the server:"), error);
    process.exit(1);
  }
};

startApp();
