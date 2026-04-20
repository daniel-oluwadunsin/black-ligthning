import { Router } from "express";
import { validateSchema } from "../schema";
import { addSongSchema, identifySongSchema } from "../schema/add-song.schema";
import { addSong, identifySong } from "../controllers/song.controller";
import {
  uploadMiddleware,
  uploadWithFieldMiddleware,
} from "../middleware/upload.middleware";

export const songRoutes = Router();

songRoutes.post(
  "/",
  uploadWithFieldMiddleware([
    {
      name: "song",
      maxCount: 1,
    },
    {
      name: "artwork",
      maxCount: 1,
    },
  ]),
  validateSchema(addSongSchema),
  addSong,
);

songRoutes.post(
  "/identify",
  uploadMiddleware,
  validateSchema(identifySongSchema),
  identifySong,
);

export default songRoutes;
