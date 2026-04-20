import { AddSongDto } from "../types";
import { uploadFileToGcs } from "../utils";
import { prisma } from "../config/db";
import { AudioFingerprintingJobData } from "../queues/audio-fingerprinting/audio-fingerprinting.worker";
import { audioFingerprintingQueue } from "../queues/audio-fingerprinting/audio-fingerprinting.queue";
import { CustomError, HttpStatusCode } from "../types/global";
import fsp from "fs/promises";
import {
  compareFingerprints,
  createAudioFingerPrint,
  findBestMatch,
  getAudioWaveform,
  MatchType,
  SongFingerprint,
} from "../utils/song.util";
import chalk from "chalk";

export const addSong = async (body: AddSongDto) => {
  const { title, artist, artwork, song: songFile } = body;

  const [artworkImageUrl, songUrl] = await Promise.all([
    uploadFileToGcs(artwork),
    uploadFileToGcs(songFile),
  ]);

  const song = await prisma.song.create({
    data: {
      title,
      artist,
      artwork: artworkImageUrl,
      song: songUrl,
    },
  });

  const audioJobData: AudioFingerprintingJobData = {
    audio: songFile.path,
    songId: song.id,
    artworkPath: artwork.path,
  };

  await audioFingerprintingQueue.add(song.id, audioJobData);

  return {
    success: true,
    message: "Song added successfully",
    statusCode: HttpStatusCode.Created,
    data: {
      id: song.id,
    },
  };
};

export const identifySong = async (songFile: Express.Multer.File) => {
  const waveform = await getAudioWaveform(songFile.path);
  const fingerprints = createAudioFingerPrint(waveform);

  await fsp.unlink(songFile.path);

  const songsFp = await prisma.songFingerprint.findMany({
    select: {
      hash: true,
      offset: true,
      songId: true,
    },
  });

  console.log(
    chalk.blue("[identifySong] Retrieved matching fingerprints from DB"),
    {
      inputFingerprints: fingerprints.length,
      matchingFingerprints: songsFp.length,
    },
  );

  const dbFingerprints: SongFingerprint[] = songsFp.map((fp) => ({
    hash: fp.hash,
    offset: fp.offset,
    songId: fp.songId,
  }));

  const matchMap: MatchType = compareFingerprints(fingerprints, dbFingerprints);

  const bestMatch = findBestMatch(matchMap);

  if (!bestMatch.songId)
    throw new CustomError("No matching song found", HttpStatusCode.NotFound);

  const matchedSong = await prisma.song.findUnique({
    where: {
      id: bestMatch.songId,
    },
  });

  if (!matchedSong)
    throw new CustomError("No matching song found", HttpStatusCode.NotFound);

  return {
    success: true,
    message: "Song identified successfully",
    statusCode: HttpStatusCode.Ok,
    data: {
      song: matchedSong,
      confidence: bestMatch.confidence,
    },
  };
};
