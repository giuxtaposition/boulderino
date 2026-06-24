import { Asset } from "expo-asset";
import type * as OrtNs from "onnxruntime-web";

import {
  OrtLike,
  OrtSession,
  SamSegmenterBase,
} from "./SamSegmenterBase";
import { SegmentResult } from "./samCore";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ENCODER_ASSET = require("@/assets/models/mobilesam.encoder.onnx");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const DECODER_ASSET = require("@/assets/models/mobilesam.decoder.quant.onnx");

const ORT_VERSION = "1.27.0";
const ORT_SCRIPT = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/ort.webgpu.min.js`;
const ORT_WASM_BASE = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;

type OrtGlobal = typeof OrtNs;

declare global {
  interface Window {
    ort?: OrtGlobal;
  }
}

export type { SegmentResult };

let ortPromise: Promise<OrtGlobal> | null = null;

function loadOrtScript(): Promise<OrtGlobal> {
  if (ortPromise) return ortPromise;
  if (typeof window === "undefined") {
    return Promise.reject(new Error("onnxruntime-web requires a browser"));
  }
  if (window.ort) {
    ortPromise = Promise.resolve(window.ort);
    return ortPromise;
  }

  ortPromise = new Promise<OrtGlobal>((resolve, reject) => {
    const finish = () => {
      if (!window.ort) {
        reject(new Error("ORT script loaded but window.ort is missing"));
        return;
      }
      window.ort.env.wasm.numThreads = 1;
      window.ort.env.wasm.wasmPaths = ORT_WASM_BASE;
      resolve(window.ort);
    };
    const onError = () => reject(new Error("ORT script failed to load"));

    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-ort="${ORT_VERSION}"]`,
    );
    if (existing) {
      existing.addEventListener("load", finish);
      existing.addEventListener("error", onError);
      return;
    }
    const script = document.createElement("script");
    script.src = ORT_SCRIPT;
    script.async = true;
    script.dataset.ort = ORT_VERSION;
    script.onload = finish;
    script.onerror = onError;
    document.head.appendChild(script);
  });

  ortPromise.catch(() => {
    ortPromise = null;
  });

  return ortPromise;
}

async function fetchModelBytes(assetModule: number): Promise<Uint8Array> {
  const [asset] = await Asset.loadAsync(assetModule);
  const url = asset.localUri ?? asset.uri;
  if (!url) throw new Error("Failed to resolve model asset URL");
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch model (${response.status}) ${url}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

function hasWebGPU(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

export class SamSegmenter extends SamSegmenterBase {
  async load(): Promise<void> {
    if (this.encoder && this.decoder) return;

    const ort = await loadOrtScript();

    const [encoderBytes, decoderBytes] = await Promise.all([
      fetchModelBytes(ENCODER_ASSET),
      fetchModelBytes(DECODER_ASSET),
    ]);

    const providers: OrtNs.InferenceSession.ExecutionProviderConfig[] =
      hasWebGPU() ? ["webgpu", "wasm"] : ["wasm"];

    const sessionOptions: OrtNs.InferenceSession.SessionOptions = {
      executionProviders: providers,
      graphOptimizationLevel: "all",
    };

    const [encoder, decoder] = await Promise.all([
      ort.InferenceSession.create(encoderBytes, sessionOptions),
      ort.InferenceSession.create(decoderBytes, sessionOptions),
    ]);

    this.ort = ort as unknown as OrtLike;
    this.encoder = encoder as unknown as OrtSession;
    this.decoder = decoder as unknown as OrtSession;
  }
}
