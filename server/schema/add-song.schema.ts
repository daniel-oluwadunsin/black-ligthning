import zod, { ZodSchema } from "zod/v3";

const fileSchema = zod.object({
  fieldname: zod.string(),
  originalname: zod.string(),
  encoding: zod.string(),
  mimetype: zod.string(),
  size: zod.number(),
  buffer: zod.instanceof(Buffer).optional(),
});

export const addSongSchema: ZodSchema = zod.object({
  body: zod.object({
    title: zod.string().min(1, "Title is required"),
    artist: zod.string().min(1, "Artist is required"),
  }),
  files: zod.object({
    song: zod.array(fileSchema).min(1, "At least one song file is required"),
    artwork: zod
      .array(fileSchema)
      .min(1, "At least one artwork file is required"),
  }),
});

export const identifySongSchema: ZodSchema = zod.object({
  file: fileSchema,
});
