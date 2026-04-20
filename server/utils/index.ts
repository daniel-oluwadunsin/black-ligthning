import chalk from "chalk";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../types/global";
import multer from "multer";
import Env from "../config/env";
import { Storage as GoogleCloudStorage } from "@google-cloud/storage";
import fsp from "fs/promises";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(chalk.red("An error occurred:"), error);

  if (error instanceof CustomError) {
    return res.status(error.statusCode).json({
      statusCode: error.statusCode,
      message: error.message,
      name: error.name,
    });
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
      name: error.name,
    });
  }

  return res.status(500).json({
    statusCode: 500,
    message: error?.message || "An unexpected error occurred.",
    name: error?.name || "InternalServerError",
  });
};

export const uploadFileToGcs = async (
  file: Express.Multer.File,
): Promise<string> => {
  const startedAt = Date.now();
  const bucketName = Env.gcs.bucketName;

  const bucket = gcsStorage.bucket(bucketName);
  const fileName = `${Date.now()}_${file.originalname}`;
  const blob = bucket.file(fileName);

  let buffer: Buffer;

  if (file.buffer && file.buffer.length > 0) {
    buffer = file.buffer;
  } else if (file.path) {
    buffer = await fsp.readFile(file.path);
  } else {
    throw new Error("No valid file buffer or file path found for upload");
  }

  await blob.save(buffer, {
    resumable: false,
    contentType: "auto",
    public: true,
  });

  const url = `https://storage.googleapis.com/${bucketName}/${fileName}`;

  console.log(chalk.green("[uploadFileToGcs] Upload completed"), {
    originalname: file.originalname,
    durationMs: Date.now() - startedAt,
    url,
  });

  return url;
};

const privateKey = Env.gcs.privateKey.replace(/\\n/g, "\n");
const clientEmail = Env.gcs.clientEmail;
const projectId = Env.gcs.projectId;

const gcsStorage = new GoogleCloudStorage({
  projectId,
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  },
});
