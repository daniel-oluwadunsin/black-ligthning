import { QueueEvents } from "bullmq";
import { audioFingerprintingQueue } from "./audio-fingerprinting.queue";
import { QueueNames } from "../enums";
import Env from "../../config/env";
import chalk from "chalk";
import { audioFingerprintingWorker } from "./audio-fingerprinting.worker";

const audioFingerprintingQueueEvents = new QueueEvents(
  QueueNames.AudioFingerPrinting,
  {
    connection: {
      url: Env.redis.url,
    },
  },
);

audioFingerprintingQueueEvents.on("completed", ({ jobId }) => {
  console.log(
    chalk.green(`[Audio Fingerprinting] Job ${jobId} completed successfully`),
  );
});

audioFingerprintingQueueEvents.on("failed", ({ jobId, failedReason }) => {
  console.log(
    chalk.red(
      `[Audio Fingerprinting] Job ${jobId} failed with reason: ${failedReason}`,
    ),
  );
});

audioFingerprintingQueueEvents.on("active", ({ jobId }) => {
  console.log(chalk.blue(`[Audio Fingerprinting] Job ${jobId} is now active`));
});

audioFingerprintingQueueEvents.on("stalled", ({ jobId }) => {
  console.log(chalk.yellow(`[Audio Fingerprinting] Job ${jobId} has stalled`));
});

audioFingerprintingQueueEvents.on("error", (error) => {
  console.log(
    chalk.red(`[Audio Fingerprinting] Queue error: ${error.message}`),
  );
});

const closeAudioFingerprintingWorker = async () => {
  try {
    await audioFingerprintingWorker.close();
    await audioFingerprintingQueueEvents.close();
    await audioFingerprintingQueue.close();
    console.log(
      chalk.green("[Audio Fingerprinting] Worker and events closed gracefully"),
    );
  } catch (error) {
    console.log(
      chalk.red("[Audio Fingerprinting] Error closing worker or events:"),
      error,
    );
  }
};

process.on("SIGINT", async () => {
  closeAudioFingerprintingWorker();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  closeAudioFingerprintingWorker();
  process.exit(0);
});

process.on("uncaughtException", async (error) => {
  console.log(chalk.red("[Audio Fingerprinting] Uncaught exception:"), error);
  closeAudioFingerprintingWorker();
  process.exit(1);
});

process.on("unhandledRejection", async (reason) => {
  console.log(chalk.red("[Audio Fingerprinting] Unhandled rejection:"), reason);
  closeAudioFingerprintingWorker();
  process.exit(1);
});

export { audioFingerprintingQueueEvents };
