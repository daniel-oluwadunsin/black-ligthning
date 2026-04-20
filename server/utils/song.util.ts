import audioDecode from "audio-decode";
import { execFile } from "child_process";
import fsp from "fs/promises";
import FFT from "fft.js";
import chalk from "chalk";
import { promisify } from "util";

const HASH_DELIMITER = "_";

type Fingerprint = {
  hash: string;
  offset: number;
};

export type SongFingerprint = {
  hash: string;
  offset: number;
  songId: string;
};

export type MatchType = Map<string, number>;

const execFileAsync = promisify(execFile);

const normalizeHash = (hash: string) => {
  const parts = hash.split(HASH_DELIMITER);

  if (parts.length >= 2) {
    const firstPart = parts[0] ?? "";
    const secondPart = parts[1] ?? "";
    const first = Number(firstPart);
    const second = Number(secondPart);

    if (Number.isFinite(first) && Number.isFinite(second)) {
      const [low, high] = first <= second ? [first, second] : [second, first];
      return `${low}${HASH_DELIMITER}${high}`;
    }

    const [left, right] =
      firstPart <= secondPart
        ? [firstPart, secondPart]
        : [secondPart, firstPart];
    return `${left}${HASH_DELIMITER}${right}`;
  }

  return hash;
};

export const getAudioWaveform = async (
  filePath: string,
): Promise<Float32Array> => {
  console.log(chalk.blue("[song.util:getAudioWaveform] Extracting waveform"), {
    filePath,
  });

  const wavFilePath = filePath.replace(/\.\w+$/, ".wav").replace(/\s/g, "_");
  // convert audio to wav using ffmpeg
  await execFileAsync("ffmpeg", [
    "-i",
    filePath,
    "-ar",
    "44100",
    "-ac",
    "1",
    wavFilePath,
  ]);
  const wavBuffer = await fsp.readFile(wavFilePath);
  const decodedAudio = await audioDecode(new Uint8Array(wavBuffer));

  const mono = decodedAudio.channelData[0]!;

  await fsp.unlink(wavFilePath);

  return mono; // return mono channel data
};

export const convertAudioDataAmplitudeOvertimeToFrequencyWithFourierTransform =
  (audioData: Float32Array) => {
    const windowSize = 4096;
    const hopSize = windowSize / 2;

    const fft = new FFT(windowSize);
    const out = fft.createComplexArray();

    let pointer = 0;
    let timeIndex = 0;

    return {
      next: () => {
        if (pointer >= audioData.length - windowSize) return null;

        const window = audioData.subarray(pointer, pointer + windowSize);

        fft.realTransform(out, window);
        fft.completeSpectrum(out);

        const magnitudes = new Array(out.length / 2);

        for (let i = 0, j = 0; i < out.length; i += 2, j++) {
          const real = out[i];
          const imag = out[i + 1];
          magnitudes[j] = real * real + imag * imag; // no sqrt
        }

        pointer += hopSize;

        return {
          magnitudes,
          timeIndex: timeIndex++,
        };
      },
    };
  };

export const findPeakAmplitudes = (
  spectrum: number[],
  threshold: number = 1000,
  maxPeaks: number = 20,
) => {
  const peaks: { index: number; value: number }[] = [];

  for (let i = 1; i < spectrum.length - 1; i++) {
    if (
      spectrum[i]! > threshold &&
      spectrum[i]! > spectrum[i - 1]! &&
      spectrum[i]! > spectrum[i + 1]!
    ) {
      peaks.push({ index: i, value: spectrum[i]! });
    }
  }

  // sort in descending order of amplitude and take top N peaks
  peaks.sort((a, b) => b.value - a.value);

  // Keep only strong peaks, then sort by frequency bin so hash generation
  // stays stable across recordings with slight amplitude variations.
  return peaks
    .slice(0, maxPeaks)
    .map((peak) => peak.index)
    .sort((a, b) => a - b);
};

export const createHashesFromPeakAmplitudes = (peaks: number[]) => {
  if (peaks.length === 0) {
    return [];
  }

  console.log(
    chalk.blue("[song.util:createHashesFromPeakAmplitudes] Creating hashes"),
    {
      peaksLength: peaks.length,
    },
  );

  const hashes: string[] = [];

  for (let i = 0; i < peaks.length; i++) {
    for (let j = i + 1; j < Math.min(i + 5, peaks.length); j++) {
      // Keep hash independent from absolute frame index to support clips captured from any song offset.
      const hash = `${peaks[i]}${HASH_DELIMITER}${peaks[j]}`;
      hashes.push(hash);
    }
  }

  return hashes;
};

export const createAudioFingerPrint = (
  audioData: Float32Array,
): Fingerprint[] => {
  console.log(
    chalk.blue("[song.util:createAudioFingerPrint] Building fingerprints"),
    {
      samples: audioData.length,
    },
  );

  const spectogramStream =
    convertAudioDataAmplitudeOvertimeToFrequencyWithFourierTransform(audioData);
  const fingerprints: Fingerprint[] = [];

  let frame;

  while ((frame = spectogramStream.next()) !== null) {
    const { magnitudes, timeIndex } = frame;
    const peaks = findPeakAmplitudes(magnitudes);
    const hashes = createHashesFromPeakAmplitudes(peaks);

    fingerprints.push(
      ...hashes.map((hash) => ({
        hash,
        offset: timeIndex,
      })),
    );
  }

  console.log(
    chalk.green(
      "[song.util:createAudioFingerPrint] Fingerprint creation completed",
    ),
    {
      totalFingerprints: fingerprints.length,
    },
  );

  return fingerprints;
};

export const compareFingerprints = (
  sampleFingerprints: Fingerprint[],
  dbFingerprints: SongFingerprint[],
) => {
  const matchMap: MatchType = new Map<string, number>();

  const dbByHash = new Map<string, SongFingerprint[]>();

  for (const fp of dbFingerprints) {
    const normalized = normalizeHash(fp.hash);
    const existing = dbByHash.get(normalized);

    if (existing) {
      existing.push(fp);
    } else {
      dbByHash.set(normalized, [fp]);
    }
  }

  for (const sampleFp of sampleFingerprints) {
    // Support legacy hashes that included time index by normalizing both sides.
    const matches = dbByHash.get(normalizeHash(sampleFp.hash)) ?? [];

    if (matches.length) {
      for (const match of matches) {
        const offsetDifference = match.offset - sampleFp.offset;

        const key = `${match.songId}${HASH_DELIMITER}${offsetDifference}`;
        matchMap.set(key, (matchMap.get(key) || 0) + 1);
      }
    }
  }

  return matchMap;
};

export const findBestMatch = (matchMap: MatchType) => {
  let bestSongKey = "";
  let bestSongScore = 0;
  const totalScore = Array.from(matchMap.values()).reduce((a, b) => a + b, 0);

  for (const entry of matchMap.entries()) {
    const [songKey, songScore] = entry;

    if (songScore > bestSongScore) {
      bestSongKey = songKey;
      bestSongScore = songScore;
    }
  }

  const [songId] = bestSongKey.split(HASH_DELIMITER);

  return {
    songId,
    confidence: totalScore > 0 ? bestSongScore / totalScore : 0,
  };
};
