"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

type EnergyIndicatorProps = {
  mode?: "pulse" | "processing";
  label?: string;
  className?: string;
};

export function EnergyIndicator({
  mode = "pulse",
  label,
  className,
}: EnergyIndicatorProps) {
  if (mode === "processing") {
    return (
      <div className={cn("flex flex-col items-center gap-4", className)}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
          className="relative h-20 w-20"
        >
          <div className="absolute inset-0 rounded-full border border-electric/25" />
          <div className="absolute inset-2 rounded-full border-2 border-electric border-t-transparent" />
        </motion.div>
        {label ? (
          <p className="text-sm tracking-[0.2em] text-muted">{label}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-5", className)}>
      <div className="relative flex h-52 w-52 items-center justify-center">
        {[0, 1, 2].map((ring) => (
          <motion.span
            key={ring}
            className="absolute rounded-full border border-electric/45"
            initial={{ scale: 0.42, opacity: 0.65 }}
            animate={{ scale: 1.25, opacity: 0 }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              delay: ring * 0.36,
              ease: "easeOut",
            }}
            style={{ width: 170, height: 170 }}
          />
        ))}

        <motion.div
          animate={{
            boxShadow: [
              "0 0 0 1px rgba(246,231,29,0.35), 0 0 12px rgba(246,231,29,0.2)",
              "0 0 0 1px rgba(246,231,29,0.65), 0 0 42px rgba(246,231,29,0.38)",
              "0 0 0 1px rgba(246,231,29,0.35), 0 0 12px rgba(246,231,29,0.2)",
            ],
          }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          className="h-24 w-24 rounded-full border border-electric bg-electric/10"
        />
      </div>

      {label ? (
        <p className="text-sm tracking-[0.2em] text-muted">{label}</p>
      ) : null}
    </div>
  );
}
