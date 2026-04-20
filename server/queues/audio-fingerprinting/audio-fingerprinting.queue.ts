import { Queue } from "bullmq";
import { QueueNames } from "../enums";
import Env from "../../config/env";
import { AudioFingerprintingJobData } from "./audio-fingerprinting.worker";

export const audioFingerprintingQueue = new Queue<AudioFingerprintingJobData>(
  QueueNames.AudioFingerPrinting,
  {
    connection: {
      url: Env.redis.url,
    },
  },
);
