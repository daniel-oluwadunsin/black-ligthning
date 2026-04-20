import { NextFunction, Request, Response } from "express";
import * as songService from "../services/song.service";

export const addSong = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const songFile = files["song"]?.[0];
    const artworkFile = files["artwork"]?.[0];

    const response = await songService.addSong({
      title: req.body.title,
      artist: req.body.artist,
      song: songFile!,
      artwork: artworkFile!,
    });

    res.status(response?.statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

export const identifySong = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const songFile = req.file as Express.Multer.File;

    const response = await songService.identifySong(songFile);

    res.status(response?.statusCode).json(response);
  } catch (error) {
    next(error);
  }
};
