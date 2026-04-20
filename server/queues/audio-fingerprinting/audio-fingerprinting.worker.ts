import { Worker } from "bullmq";
import { QueueNames } from "../enums";
import Env from "../../config/env";
import chalk from "chalk";
import {
  createAudioFingerPrint,
  getAudioWaveform,
} from "../../utils/song.util";
import { prisma } from "../../config/db";
import fsp from "fs/promises";

export type AudioFingerprintingJobData = {
  audio: string;
  songId: string;
  artworkPath?: string;
};

export const audioFingerprintingWorker = new Worker<AudioFingerprintingJobData>(
  QueueNames.AudioFingerPrinting,
  async (job) => {
    const { audio, songId, artworkPath } = job.data;
    console.log(
      chalk.blue(
        `[Audio Fingerprinting Worker] Processing job ${job.id} for song ID ${songId}`,
      ),
    );

    const decodedWaveForm = await getAudioWaveform(audio);

    const fingerprints = createAudioFingerPrint(decodedWaveForm);

    const chunkSize = 5000;

    for (let i = 0; i < fingerprints.length; i += chunkSize) {
      const chunk = fingerprints.slice(i, i + chunkSize);

      console.log(
        chalk.blue(
          `[Audio Fingerprinting Worker] Inserting fingerprints for song ID ${songId} (chunk ${i / chunkSize + 1}/${Math.ceil(
            fingerprints.length / chunkSize,
          )})`,
        ),
      );

      await prisma.songFingerprint.createMany({
        data: chunk.map((fingerprint) => ({
          hash: fingerprint.hash,
          offset: fingerprint.offset,
          songId,
        })),
        skipDuplicates: true,
      });
    }

    await prisma.song.update({
      where: {
        id: songId,
      },
      data: {
        isFingerprintComplete: true,
      },
    });

    await fsp.unlink(audio);

    if (artworkPath) {
      await fsp.unlink(artworkPath);
    }

    console.log(
      chalk.green(
        `[Audio Fingerprinting Worker] Completed job ${job.id} for song ID ${songId}`,
      ),
    );
  },
  {
    skipStalledCheck: true,
    concurrency: 5,
    connection: {
      url: Env.redis.url,
    },
  },
);
