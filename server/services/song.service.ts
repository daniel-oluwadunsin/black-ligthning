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

const HASH_DELIMITER = "_";

const normalizeHash = (hash: string) => {
  const [left, right] = hash.split(HASH_DELIMITER);

  if (!left || !right) {
    return hash;
  }

  const first = Number(left);
  const second = Number(right);

  if (Number.isFinite(first) && Number.isFinite(second)) {
    const [low, high] = first <= second ? [first, second] : [second, first];
    return `${low}${HASH_DELIMITER}${high}`;
  }

  const [a, b] = left <= right ? [left, right] : [right, left];
  return `${a}${HASH_DELIMITER}${b}`;
};

const LEGACY_HASH_QUERY_BATCH_SIZE = 200;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

type GetSongsParams = {
  page: number;
  limit: number;
};

export const getSongs = async ({ page, limit }: GetSongsParams) => {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : DEFAULT_PAGE;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), MAX_LIMIT) : DEFAULT_LIMIT;
  const skip = (safePage - 1) * safeLimit;

  const [songs, total] = await Promise.all([
    prisma.song.findMany({
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: safeLimit,
      select: {
        id: true,
        title: true,
        artist: true,
        artwork: true,
        createdAt: true,
      },
    }),
    prisma.song.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / safeLimit));

  return {
    success: true,
    message: "Songs fetched successfully",
    statusCode: HttpStatusCode.Ok,
    data: {
      songs,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
      },
    },
  };
};

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
      song: songUrl,
      artwork: artworkImageUrl,
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
  const normalizedHashes = Array.from(
    new Set(fingerprints.map((fp) => normalizeHash(fp.hash))),
  );

  await fsp.unlink(songFile.path);

  if (fingerprints.length === 0)
    throw new CustomError(
      "No fingerprints could be generated from the audio",
      HttpStatusCode.BadRequest,
    );

  let songsFp = await prisma.songFingerprint.findMany({
    where: {
      hash: {
        in: normalizedHashes,
      },
    },
    select: {
      hash: true,
      offset: true,
      songId: true,
    },
  });

  if (songsFp.length === 0) {
    const legacyMatches: SongFingerprint[] = [];

    for (
      let i = 0;
      i < normalizedHashes.length;
      i += LEGACY_HASH_QUERY_BATCH_SIZE
    ) {
      const hashBatch = normalizedHashes.slice(
        i,
        i + LEGACY_HASH_QUERY_BATCH_SIZE,
      );

      const batchMatches = await prisma.songFingerprint.findMany({
        where: {
          OR: hashBatch.map((hash) => ({
            hash: {
              startsWith: `${hash}${HASH_DELIMITER}`,
            },
          })),
        },
        select: {
          hash: true,
          offset: true,
          songId: true,
        },
      });

      legacyMatches.push(...batchMatches);
    }

    songsFp = legacyMatches;
  }

  if (songsFp.length === 0)
    throw new CustomError("No matching song found.", HttpStatusCode.NotFound);

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
