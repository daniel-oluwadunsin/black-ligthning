"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type FileUploadProps = {
  label: string;
  accept: string;
  helper: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  kind: "artwork" | "song";
  error?: string | null;
};

const toMegabytes = (size: number) => `${(size / 1024 / 1024).toFixed(2)} MB`;

export function FileUpload({
  label,
  accept,
  helper,
  file,
  onFileChange,
  kind,
  error,
}: FileUploadProps) {
  const isImage = kind === "artwork";
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !isImage) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, isImage]);

  const onDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const nextFile = event.dataTransfer.files?.[0] ?? null;
    onFileChange(nextFile);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
        {label}
      </p>
      <label
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        className={cn(
          "group edge-glow relative flex min-h-40 cursor-pointer flex-col justify-between rounded-[8px] border border-line bg-panel p-4 transition-colors",
          "hover:border-electric/60",
        )}
      >
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />

        <div>
          <p className="text-sm font-medium text-foreground">
            Drop file here or click to browse
          </p>
          <p className="mt-1 text-xs text-muted">{helper}</p>
        </div>

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key={file.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mt-4 rounded-[8px] border border-line bg-black/30 p-3"
            >
              {isImage ? (
                <img
                  src={previewUrl ?? ""}
                  alt="Artwork preview"
                  className="mb-3 h-28 w-full rounded-[6px] object-cover"
                />
              ) : null}

              <p className="truncate text-sm text-foreground">{file.name}</p>
              <p className="mt-1 text-xs text-muted">
                {toMegabytes(file.size)}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-xs text-muted"
            >
              Nothing selected yet.
            </motion.div>
          )}
        </AnimatePresence>
      </label>
      {error ? (
        <p className="text-xs uppercase tracking-[0.12em] text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
