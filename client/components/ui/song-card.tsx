"use client";

import { motion } from "framer-motion";

type SongCardProps = {
  artwork: string;
  title: string;
  artist: string;
  confidence?: number;
  isFingerprintComplete?: boolean;
};

export function SongCard({
  artwork,
  title,
  artist,
  confidence,
  isFingerprintComplete,
}: SongCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="edge-glow flex w-full max-w-md flex-col gap-4 rounded-[10px] border border-line bg-panel p-4"
    >
      <img
        src={artwork}
        alt={`${title} artwork`}
        className="h-64 w-full rounded-lg object-cover"
      />
      <div>
        {typeof isFingerprintComplete === "boolean" ? (
          <p
            className={`mb-3 inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
              isFingerprintComplete
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                : "border-amber-400/40 bg-amber-400/10 text-amber-200"
            }`}
          >
            {isFingerprintComplete
              ? "Fingerprint Ready"
              : "Fingerprint Processing"}
          </p>
        ) : null}

        <h3 className="display-title text-4xl leading-none text-foreground">
          {title}
        </h3>
        <p className="mt-2 text-sm tracking-[0.16em] text-muted uppercase">
          {artist}
        </p>
        {typeof confidence === "number" ? (
          <p className="mt-3 text-xs tracking-[0.15em] text-electric uppercase">
            Signal Match Score: {confidence}
          </p>
        ) : null}
      </div>
    </motion.article>
  );
}
