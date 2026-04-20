"use client";

import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/cn";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: "primary" | "secondary";
  loading?: boolean;
};

export function Button({
  children,
  className,
  variant = "primary",
  loading,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "relative inline-flex h-12 items-center justify-center gap-2 border px-6 text-sm font-semibold uppercase tracking-[0.1em] transition-all duration-300",
        "rounded-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        variant === "primary" &&
          "border-electric bg-electric text-black shadow-[0_0_26px_rgba(246,231,29,0.25)] hover:shadow-[0_0_38px_rgba(246,231,29,0.35)]",
        variant === "secondary" &&
          "border-line bg-panel text-foreground hover:border-electric/70 hover:text-electric",
        isDisabled && "cursor-not-allowed opacity-60",
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? "Working..." : children}
    </motion.button>
  );
}
