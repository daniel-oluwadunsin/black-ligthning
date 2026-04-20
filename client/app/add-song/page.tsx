"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { addSongApi } from "@/lib/api";
import {
  validateArtworkFile,
  validateAudioFile,
  validateTextField,
} from "@/lib/validation";
import { useApiCall } from "@/hooks/use-api-call";

type AddSongForm = {
  title: string;
  artist: string;
  artwork: File | null;
  song: File | null;
};

const initialForm: AddSongForm = {
  title: "",
  artist: "",
  artwork: null,
  song: null,
};

export default function AddSongPage() {
  const [form, setForm] = useState<AddSongForm>(initialForm);
  const [artworkError, setArtworkError] = useState<string | null>(null);
  const [songError, setSongError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const addSongRequest = useApiCall(addSongApi);

  const canSubmit = useMemo(() => {
    return Boolean(form.title && form.artist && form.artwork && form.song);
  }, [form]);

  const onArtworkChange = (artwork: File | null) => {
    setSuccessMessage(null);
    const validationError = validateArtworkFile(artwork);
    setArtworkError(validationError);
    setForm((prev) => ({ ...prev, artwork }));
  };

  const onSongChange = (song: File | null) => {
    setSuccessMessage(null);
    const validationError = validateAudioFile(song, "Song file");
    setSongError(validationError);
    setForm((prev) => ({ ...prev, song }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit || addSongRequest.loading) {
      return;
    }

    setFormError(null);
    setSuccessMessage(null);

    const titleError = validateTextField(form.title, "Title");
    const artistError = validateTextField(form.artist, "Artist");
    const nextArtworkError = validateArtworkFile(form.artwork);
    const nextSongError = validateAudioFile(form.song, "Song file");

    setArtworkError(nextArtworkError);
    setSongError(nextSongError);

    const firstError =
      titleError || artistError || nextArtworkError || nextSongError;
    if (firstError) {
      setFormError(firstError);
      return;
    }

    setProgress(0);

    const progressTimer = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          return prev;
        }

        return Math.min(prev + 8, 90);
      });
    }, 180);

    try {
      await addSongRequest.execute({
        title: form.title.trim(),
        artist: form.artist.trim(),
        artwork: form.artwork!,
        song: form.song!,
      });

      setProgress(100);
      setSuccessMessage(
        "Song uploaded. Fingerprinting is running in the background and can take a short moment.",
      );
      setForm(initialForm);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        setFormError(error.message);
      }
      setProgress(0);
    } finally {
      window.clearInterval(progressTimer);
    }
  };

  return (
    <div className="page-wrap">
      <div className="electric-atmosphere" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-14 md:px-10">
        <div className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-muted hover:text-electric"
          >
            Back Home
          </Link>
          <p className="text-xs uppercase tracking-[0.2em] text-electric">
            Add Song
          </p>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="edge-glow rounded-[10px] border border-line bg-panel/70 p-6 md:p-8"
        >
          <h1 className="display-title text-5xl leading-none text-foreground md:text-6xl">
            Build The Lightning Library
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            Drop metadata and files below. This page writes songs directly to
            your backend and queues fingerprint generation for recognition.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
                  Title
                </span>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Enter song title"
                  className="h-12 rounded-[8px] border border-line bg-black/20 px-4 text-sm text-foreground outline-none transition-all focus:border-electric/70 focus:shadow-[0_0_0_1px_rgba(246,231,29,0.35)]"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
                  Artist
                </span>
                <input
                  value={form.artist}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, artist: event.target.value }))
                  }
                  placeholder="Enter artist name"
                  className="h-12 rounded-[8px] border border-line bg-black/20 px-4 text-sm text-foreground outline-none transition-all focus:border-electric/70 focus:shadow-[0_0_0_1px_rgba(246,231,29,0.35)]"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FileUpload
                label="Artwork"
                accept="image/*"
                helper="JPG, PNG, WEBP"
                kind="artwork"
                file={form.artwork}
                onFileChange={onArtworkChange}
                error={artworkError}
              />
              <FileUpload
                label="Song"
                accept="audio/*"
                helper="MP3, WAV, M4A"
                kind="song"
                file={form.song}
                onFileChange={onSongChange}
                error={songError}
              />
            </div>

            {formError ? (
              <div className="rounded-[8px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {formError}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-[8px] border border-electric/30 bg-electric/10 px-4 py-3 text-sm text-foreground">
                {successMessage}
              </div>
            ) : null}

            <div className="space-y-3">
              <div className="h-2 overflow-hidden rounded-[6px] border border-line bg-black/30">
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="h-full bg-electric"
                />
              </div>
              <p className="text-xs tracking-[0.14em] text-muted uppercase">
                {addSongRequest.loading
                  ? `Uploading... ${progress}%`
                  : successMessage
                    ? "Upload complete"
                    : "Ready"}
              </p>
            </div>

            <Button
              type="submit"
              loading={addSongRequest.loading}
              disabled={!canSubmit}
            >
              Submit Song
            </Button>
          </form>
        </motion.section>
      </main>
    </div>
  );
}
