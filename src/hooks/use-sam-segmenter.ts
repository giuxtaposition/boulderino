import { useEffect, useRef, useState } from "react";

import { SamSegmenter } from "@/infrastructure/segmentation/SamSegmenter";

export type SegmenterState =
  | { status: "loading" }
  | { status: "ready"; segmenter: SamSegmenter }
  | { status: "unavailable"; message: string }
  | { status: "error"; message: string };

function isNativeUnavailableError(message: string): boolean {
  return (
    message.includes("Native module not found") ||
    message.includes("no available backend") ||
    message.includes("install") ||
    message.includes("Cannot read property")
  );
}

let sharedInstance: SamSegmenter | null = null;
let loadPromise: Promise<SamSegmenter> | null = null;
let loadFailed: { unavailable: boolean; message: string } | null = null;

function getOrLoadSegmenter(): Promise<SamSegmenter> {
  if (sharedInstance) return Promise.resolve(sharedInstance);
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const segmenter = new SamSegmenter();
    await segmenter.load();
    sharedInstance = segmenter;
    return segmenter;
  })();

  loadPromise.catch((err: Error) => {
    loadPromise = null;
    loadFailed = {
      unavailable: isNativeUnavailableError(err.message),
      message: err.message,
    };
  });

  return loadPromise;
}

export function useSamSegmenter(): SegmenterState {
  const [state, setState] = useState<SegmenterState>(() => {
    if (sharedInstance) return { status: "ready", segmenter: sharedInstance };
    if (loadFailed) {
      return loadFailed.unavailable
        ? { status: "unavailable", message: loadFailed.message }
        : { status: "error", message: loadFailed.message };
    }
    return { status: "loading" };
  });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    if (sharedInstance) {
      setState({ status: "ready", segmenter: sharedInstance });
      return;
    }

    if (loadFailed) {
      setState(
        loadFailed.unavailable
          ? { status: "unavailable", message: loadFailed.message }
          : { status: "error", message: loadFailed.message },
      );
      return;
    }

    setState({ status: "loading" });

    getOrLoadSegmenter()
      .then((segmenter) => {
        if (mounted.current) {
          setState({ status: "ready", segmenter });
        }
      })
      .catch((err: Error) => {
        if (!mounted.current) return;
        setState(
          isNativeUnavailableError(err.message)
            ? { status: "unavailable", message: err.message }
            : { status: "error", message: err.message },
        );
      });

    return () => {
      mounted.current = false;
    };
  }, []);

  return state;
}
