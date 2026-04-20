"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SongCard } from "@/components/ui/song-card";
import { getSongsApi, PublicSongWithFingerprintRecord } from "@/lib/api";
import { useApiCall } from "@/hooks/use-api-call";

const PAGE_SIZE = 9;
const REFRESH_INTERVAL_MS = 30_000;

export default function SongsPage() {
  const [songs, setSongs] = useState<PublicSongWithFingerprintRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSongs, setTotalSongs] = useState(0);
  const [hasPendingFingerprinting, setHasPendingFingerprinting] =
    useState(false);
  const [pendingFingerprintCount, setPendingFingerprintCount] = useState(0);

  const songsRequest = useApiCall(getSongsApi);

  useEffect(() => {
    const loadSongs = async () => {
      try {
        const response = await songsRequest.execute({
          page,
          limit: PAGE_SIZE,
        });

        setSongs(response.data.songs);
        setTotalPages(response.data.pagination.totalPages);
        setTotalSongs(response.data.pagination.total);
        setHasPendingFingerprinting(response.data.fingerprinting.hasPending);
        setPendingFingerprintCount(response.data.fingerprinting.pendingCount);
      } catch {
        setSongs([]);
        setHasPendingFingerprinting(false);
        setPendingFingerprintCount(0);
      }
    };

    void loadSongs();
  }, [page]);

  useEffect(() => {
    if (!hasPendingFingerprinting) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const response = await songsRequest.execute({
          page,
          limit: PAGE_SIZE,
        });

        setSongs(response.data.songs);
        setTotalPages(response.data.pagination.totalPages);
        setTotalSongs(response.data.pagination.total);
        setHasPendingFingerprinting(response.data.fingerprinting.hasPending);
        setPendingFingerprintCount(response.data.fingerprinting.pendingCount);
      } catch {}
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hasPendingFingerprinting, page]);

  const goToPreviousPage = () => {
    if (songsRequest.loading || page <= 1) {
      return;
    }

    setPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    if (songsRequest.loading || page >= totalPages) {
      return;
    }

    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="page-wrap">
      <div className="electric-atmosphere" />
      <div className="electric-grid" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-14 md:px-10">
        <div className="mb-10 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-muted hover:text-electric"
          >
            Back Home
          </Link>
          <p className="text-xs uppercase tracking-[0.2em] text-electric">
            Songs Library
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <h1 className="display-title text-5xl leading-none text-foreground md:text-6xl">
              Added Songs
            </h1>
            <p className="mt-4 text-sm text-muted">
              Explore all songs currently added to the platform.
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Total
            </p>
            <p className="mt-1 text-2xl text-electric">{totalSongs}</p>

            {hasPendingFingerprinting ? (
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-amber-200">
                {pendingFingerprintCount} processing · auto refresh every 30s
              </p>
            ) : (
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-emerald-300">
                All fingerprints ready
              </p>
            )}
          </div>
        </motion.div>

        {songsRequest.error ? (
          <div className="mb-8 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {songsRequest.error}
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {songs.map((song) => (
            <SongCard
              key={song.id}
              artwork={song.artwork}
              title={song.title}
              artist={song.artist}
              isFingerprintComplete={song.isFingerprintComplete}
            />
          ))}
        </section>

        {!songsRequest.loading && songs.length === 0 && !songsRequest.error ? (
          <div className="mt-10 rounded-[10px] border border-line bg-panel/60 p-6 text-sm text-muted">
            No songs available yet. Add your first song to populate this
            library.
          </div>
        ) : null}

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            Page {page} of {totalPages}
          </p>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={goToPreviousPage}
              disabled={songsRequest.loading || page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              onClick={goToNextPage}
              disabled={songsRequest.loading || page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
