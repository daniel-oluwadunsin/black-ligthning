"use client";

import { motion } from "framer-motion";

type SongCardProps = {
  artwork: string;
  title: string;
  artist: string;
  confidence?: number;
};

export function SongCard({
  artwork,
  title,
  artist,
  confidence,
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
        className="h-64 w-full rounded-[8px] object-cover"
      />
      <div>
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
