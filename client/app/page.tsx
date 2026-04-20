"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  return (
    <div className="page-wrap">
      <div className="electric-atmosphere" />
      <div className="electric-grid" />

      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ backgroundPositionX: ["0%", "100%"] }}
        transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
        style={{
          backgroundImage:
            "linear-gradient(110deg, transparent 15%, rgba(246,231,29,0.08) 30%, transparent 45%)",
          backgroundSize: "220% 100%",
        }}
      />

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-20 md:px-10">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6 text-xs uppercase tracking-[0.26em] text-electric"
        >
          Black Lightning ⚡️
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="display-title max-w-4xl text-6xl leading-[0.95] text-foreground sm:text-7xl md:text-8xl"
        >
          Unleash the Power of Sound Recognition
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 max-w-2xl text-base leading-7 text-muted md:text-lg"
        >
          Precision audio intelligence, wrapped in a cinematic electric
          interface. Discover tracks in seconds and build your own fingerprint
          library with a sharp, lightning-driven flow.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="mt-4 max-w-xl text-sm leading-6 text-muted"
        >
          Fun lore drop: Black Lightning is Marvel&apos;s alternative to
          DC&apos;s Shazam, so this app listens like a storm and strikes with
          answers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Button onClick={() => router.push("/add-song")}>Add Song</Button>
          <Button variant="secondary" onClick={() => router.push("/identify")}>
            Identify Song
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
