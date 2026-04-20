"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { EnergyIndicator } from "@/components/ui/energy-indicator";
import { SongCard } from "@/components/ui/song-card";
import { identifySongApi } from "@/lib/api";
import { useApiCall } from "@/hooks/use-api-call";

type ScanState = "idle" | "recording" | "processing" | "result";
const listenDuration = 15000;

type IdentifyResult = {
  title: string;
  artist: string;
  artwork: string;
  confidenceScore: number;
};

export default function IdentifyPage() {
  const [state, setState] = useState<ScanState>("idle");
  const [flowError, setFlowError] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [recordingHint, setRecordingHint] = useState(
    "Tap to Scan and allow microphone access.",
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const stopTimerRef = useRef<number | null>(null);

  const identifyRequest = useApiCall(identifySongApi);

  useEffect(() => {
    return () => {
      if (stopTimerRef.current) {
        window.clearTimeout(stopTimerRef.current);
      }

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const pickRecordingMimeType = () => {
    const candidates = [
      "audio/mp4",
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
    ];

    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
  };

  const startScan = async () => {
    if (state !== "idle" || identifyRequest.loading) {
      return;
    }

    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setFlowError("Microphone recording is not supported in this browser.");
      return;
    }

    setFlowError(null);
    setResult(null);
    setRecordingHint("Listening for ambient audio...");
    setState("recording");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      mediaStreamRef.current = stream;

      const mimeType = pickRecordingMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        setState("processing");
        setRecordingHint("Analyzing the recorded signal...");

        const blobType = mimeType || "audio/webm";
        const audioBlob = new Blob(chunks, { type: blobType });
        const extension = blobType.includes("ogg")
          ? "ogg"
          : blobType.includes("mp4")
            ? "m4a"
            : "webm";
        const recordedFile = new File([audioBlob], `scan.${extension}`, {
          type: blobType,
        });

        try {
          const response = await identifyRequest.execute(recordedFile);
          const matchedSong = response.data.song;

          setResult({
            title: matchedSong.title,
            artist: matchedSong.artist,
            artwork: matchedSong.artwork,
            confidenceScore: response.data.confidence,
          });

          window.setTimeout(() => {
            setState("result");
            setRecordingHint("Tap Scan Again to run a new capture.");
          }, 900);
        } catch (error) {
          if (error instanceof Error && error.name !== "AbortError") {
            setFlowError(error.message);
          }

          setState("idle");
          setRecordingHint("Tap to Scan and allow microphone access.");
        }
      };

      recorder.start(250);
      stopTimerRef.current = window.setTimeout(() => {
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      }, listenDuration);
    } catch (error) {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;

      if (error instanceof Error) {
        if (
          error.name === "NotAllowedError" ||
          error.name === "SecurityError"
        ) {
          setFlowError(
            "Microphone access was denied. Please allow permission and try again.",
          );
        } else if (error.name === "NotFoundError") {
          setFlowError("No microphone was found on this device.");
        } else {
          setFlowError("Could not start microphone capture. Please try again.");
        }
      } else {
        setFlowError("Could not start microphone capture. Please try again.");
      }

      setState("idle");
      setRecordingHint("Tap to Scan and allow microphone access.");
    }
  };

  const reset = () => {
    setState("idle");
    setFlowError(null);
    setResult(null);
    setRecordingHint("Tap to Scan and allow microphone access.");
  };

  return (
    <div className="page-wrap">
      <div className="electric-atmosphere" />
      <div className="electric-grid" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-14 md:px-10">
        <div className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-muted hover:text-electric"
          >
            Back Home
          </Link>
          <p className="text-xs uppercase tracking-[0.2em] text-electric">
            Identify Song
          </p>
        </div>

        <section className="edge-glow flex flex-1 items-center justify-center rounded-[10px] border border-line bg-panel/70 p-6 md:p-10">
          <AnimatePresence mode="wait">
            {state === "idle" ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center gap-8 text-center"
              >
                <h1 className="display-title text-5xl leading-none text-foreground md:text-6xl">
                  Ready To Strike
                </h1>
                <p className="max-w-md text-sm leading-7 text-muted">
                  {recordingHint}
                </p>

                {flowError ? (
                  <div className="max-w-md rounded-[8px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {flowError}
                  </div>
                ) : null}

                <Button onClick={startScan} loading={identifyRequest.loading}>
                  Tap to Scan
                </Button>
              </motion.div>
            ) : null}

            {state === "recording" ? (
              <motion.div
                key="recording"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center"
              >
                <EnergyIndicator mode="pulse" label="Listening..." />
              </motion.div>
            ) : null}

            {state === "processing" ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center"
              >
                <EnergyIndicator
                  mode="processing"
                  label="Analyzing Signal..."
                />
              </motion.div>
            ) : null}

            {state === "result" && result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex w-full flex-col items-center gap-6"
              >
                <SongCard
                  artwork={result.artwork}
                  title={result.title}
                  artist={result.artist}
                  confidence={result.confidenceScore}
                />
                <Button variant="secondary" onClick={reset}>
                  Scan Again
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
