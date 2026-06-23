import { Asset } from "expo-asset";

const IMAGE_SIZE = 1024;
const EMBED_DIM = 256;
const EMBED_GRID = 64;
const MASK_THRESHOLD = 0.0;

const ENCODE_TIMEOUT_MS = 30_000;

function raceWithTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ENCODER_ASSET = require("@/assets/models/mobilesam.encoder.onnx");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const DECODER_ASSET = require("@/assets/models/mobilesam.decoder.quant.onnx");

type OrtModule = typeof import("onnxruntime-react-native");

export interface SegmentResult {
  readonly mask: Uint8Array;
  readonly width: number;
  readonly height: number;
  readonly score: number;
}

function preprocessImage(
  pixels: Uint8ClampedArray,
  srcWidth: number,
  srcHeight: number,
): Float32Array {
  const tensor = new Float32Array(IMAGE_SIZE * IMAGE_SIZE * 3);

  const scale = IMAGE_SIZE / Math.max(srcWidth, srcHeight);
  const newW = Math.round(srcWidth * scale);
  const newH = Math.round(srcHeight * scale);

  for (let y = 0; y < IMAGE_SIZE; y++) {
    for (let x = 0; x < IMAGE_SIZE; x++) {
      const dstBase = (y * IMAGE_SIZE + x) * 3;
      if (x >= newW || y >= newH) {
        tensor[dstBase] = 0;
        tensor[dstBase + 1] = 0;
        tensor[dstBase + 2] = 0;
        continue;
      }
      const srcX = Math.min(Math.floor(x / scale), srcWidth - 1);
      const srcY = Math.min(Math.floor(y / scale), srcHeight - 1);
      const srcBase = (srcY * srcWidth + srcX) * 4;
      tensor[dstBase] = pixels[srcBase];
      tensor[dstBase + 1] = pixels[srcBase + 1];
      tensor[dstBase + 2] = pixels[srcBase + 2];
    }
  }

  return tensor;
}

function buildPointCoords(
  tapX: number,
  tapY: number,
  srcWidth: number,
  srcHeight: number,
): Float32Array {
  const scale = IMAGE_SIZE / Math.max(srcWidth, srcHeight);
  const coords = new Float32Array(2 * 2);
  coords[0] = tapX * scale;
  coords[1] = tapY * scale;
  coords[2] = 0;
  coords[3] = 0;
  return coords;
}

function buildPointLabels(): Float32Array {
  const labels = new Float32Array(2);
  labels[0] = 1;
  labels[1] = -1;
  return labels;
}

async function resolveModelPath(assetModule: number): Promise<string> {
  const [asset] = await Asset.loadAsync(assetModule);
  const localUri = asset.localUri;
  if (!localUri) {
    throw new Error(`Failed to resolve local path for model asset`);
  }
  return localUri.replace(/^file:\/\//, "");
}

export class SamSegmenter {
  private ort: OrtModule | null = null;
  private encoder: import("onnxruntime-react-native").InferenceSession | null = null;
  private decoder: import("onnxruntime-react-native").InferenceSession | null = null;
  private cachedEmbedding: Float32Array | null = null;
  private cachedImageKey: string | null = null;

  async load(): Promise<void> {
    if (this.encoder && this.decoder) return;

    const ort = await import("onnxruntime-react-native");
    this.ort = ort;

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

    this.encoder = encoder;
    this.decoder = decoder;
  }

  get isLoaded(): boolean {
    return this.encoder !== null && this.decoder !== null;
  }

  async encode(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    imageKey: string,
  ): Promise<void> {
    if (this.cachedImageKey === imageKey && this.cachedEmbedding) return;
    if (!this.encoder || !this.ort) throw new Error("Encoder not loaded");

    const { Tensor } = this.ort;
    const inputTensor = preprocessImage(pixels, width, height);
    const feeds: Record<string, InstanceType<typeof Tensor>> = {};
    const inputName = this.encoder.inputNames[0];
    feeds[inputName] = new Tensor("float32", inputTensor, [
      IMAGE_SIZE,
      IMAGE_SIZE,
      3,
    ]);

    const results = await raceWithTimeout(
      this.encoder.run(feeds),
      ENCODE_TIMEOUT_MS,
      "Encoder inference timed out",
    );
    const outputName = this.encoder.outputNames[0];
    const embedding = results[outputName];

    this.cachedEmbedding = Float32Array.from(embedding.data as Float32Array);
    this.cachedImageKey = imageKey;
  }

  async segment(
    tapX: number,
    tapY: number,
    srcWidth: number,
    srcHeight: number,
  ): Promise<SegmentResult | null> {
    if (!this.decoder || !this.cachedEmbedding || !this.ort) {
      throw new Error("Must call encode() before segment()");
    }

    const { Tensor } = this.ort;
    const pointCoords = buildPointCoords(tapX, tapY, srcWidth, srcHeight);
    const pointLabels = buildPointLabels();
    const maskInput = new Float32Array(1 * 1 * 256 * 256);
    const hasMaskInput = new Float32Array([0]);
    const origImSize = new Float32Array([
      srcHeight * (IMAGE_SIZE / Math.max(srcWidth, srcHeight)),
      srcWidth * (IMAGE_SIZE / Math.max(srcWidth, srcHeight)),
    ]);

    const feeds: Record<string, InstanceType<typeof Tensor>> = {
      image_embeddings: new Tensor("float32", this.cachedEmbedding, [
        1,
        EMBED_DIM,
        EMBED_GRID,
        EMBED_GRID,
      ]),
      point_coords: new Tensor("float32", pointCoords, [1, 2, 2]),
      point_labels: new Tensor("float32", pointLabels, [1, 2]),
      mask_input: new Tensor("float32", maskInput, [1, 1, 256, 256]),
      has_mask_input: new Tensor("float32", hasMaskInput, [1]),
      orig_im_size: new Tensor("float32", origImSize, [2]),
    };

    const results = await this.decoder.run(feeds);

    const masksOutput = results[this.decoder.outputNames[0]];
    const iouOutput = results[this.decoder.outputNames[1]];

    const iouScores = iouOutput.data as Float32Array;
    let bestIdx = 0;
    let bestScore = iouScores[0];
    for (let i = 1; i < iouScores.length; i++) {
      if (iouScores[i] > bestScore) {
        bestScore = iouScores[i];
        bestIdx = i;
      }
    }

    const maskH = Math.round(
      srcHeight * (IMAGE_SIZE / Math.max(srcWidth, srcHeight)),
    );
    const maskW = Math.round(
      srcWidth * (IMAGE_SIZE / Math.max(srcWidth, srcHeight)),
    );
    const masksData = masksOutput.data as Float32Array;
    const maskSize = maskH * maskW;
    const maskOffset = bestIdx * maskSize;

    const binaryMask = new Uint8Array(maskW * maskH);
    for (let i = 0; i < maskSize; i++) {
      binaryMask[i] = masksData[maskOffset + i] > MASK_THRESHOLD ? 1 : 0;
    }

    const area = binaryMask.reduce((sum, v) => sum + v, 0);
    const minArea = maskW * maskH * 0.0005;
    if (area < minArea) return null;

    return {
      mask: binaryMask,
      width: maskW,
      height: maskH,
      score: bestScore,
    };
  }

  dispose(): void {
    this.encoder = null;
    this.decoder = null;
    this.ort = null;
    this.cachedEmbedding = null;
    this.cachedImageKey = null;
  }
}
