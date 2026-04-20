import { Router } from "express";
import { validateSchema } from "../schema";
import {
  addSongSchema,
  getSongsSchema,
  identifySongSchema,
} from "../schema/add-song.schema";
import { addSong, getSongs, identifySong } from "../controllers/song.controller";
import {
  uploadMiddleware,
  uploadWithFieldMiddleware,
} from "../middleware/upload.middleware";

export const songRoutes = Router();

songRoutes.get("/", validateSchema(getSongsSchema), getSongs);

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
