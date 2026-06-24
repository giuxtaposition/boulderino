import { Asset } from "expo-asset";

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

export type { SegmentResult };

async function resolveModelPath(assetModule: number): Promise<string> {
  const [asset] = await Asset.loadAsync(assetModule);
  const localUri = asset.localUri;
  if (!localUri) {
    throw new Error(`Failed to resolve local path for model asset`);
  }
  return localUri.replace(/^file:\/\//, "");
}

export class SamSegmenter extends SamSegmenterBase {
  async load(): Promise<void> {
    if (this.encoder && this.decoder) return;

    const ort = await import("onnxruntime-react-native");

    const [encoderPath, decoderPath] = await Promise.all([
      resolveModelPath(ENCODER_ASSET),
      resolveModelPath(DECODER_ASSET),
    ]);

    const sessionOptions: Parameters<typeof ort.InferenceSession.create>[1] = {
      executionProviders: [{ name: "xnnpack" }, { name: "cpu" }],
      graphOptimizationLevel: "all",
      intraOpNumThreads: 4,
    };

    const [encoder, decoder] = await Promise.all([
      ort.InferenceSession.create(encoderPath, sessionOptions),
      ort.InferenceSession.create(decoderPath, sessionOptions),
    ]);

    this.ort = ort as unknown as OrtLike;
    this.encoder = encoder as unknown as OrtSession;
    this.decoder = decoder as unknown as OrtSession;
  }
}
