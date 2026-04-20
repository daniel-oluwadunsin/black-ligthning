import multer from "multer";
import { Request, Response, NextFunction } from "express";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${process.cwd()}/uploads/`);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const bufferUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export const uploadMiddleware = upload.single("file");
export const uploadMultipleMiddleware = upload.array("files");
export const uploadWithFieldMiddleware = (
  fields: { name: string; maxCount: number }[],
) => upload.fields(fields);

export const uploadMiddlewareWithBuffer = bufferUpload.single("file");
export const uploadMultipleMiddlewareWithBuffer = bufferUpload.array("files");
export const uploadWithFieldMiddlewareWithBuffer = (
  fields: { name: string; maxCount: number }[],
) => bufferUpload.fields(fields);
