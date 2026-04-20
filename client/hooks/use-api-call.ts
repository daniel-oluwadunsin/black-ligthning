"use client";

import { useCallback, useRef, useState } from "react";

export function useApiCall<TArgs extends unknown[], TResult>(
  requestFn: (...args: [...TArgs, AbortSignal]) => Promise<TResult>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult> => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const result = await requestFn(...args, controller.signal);
        return result;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          throw err;
        }

        const message =
          err instanceof Error ? err.message : "Unexpected request error.";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [requestFn],
  );

  const resetError = useCallback(() => setError(null), []);

  return {
    execute,
    loading,
    error,
    resetError,
  };
}
