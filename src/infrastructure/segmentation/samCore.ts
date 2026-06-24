export const IMAGE_SIZE = 1024;
export const EMBED_DIM = 256;
export const EMBED_GRID = 64;
export const MASK_THRESHOLD = 0.0;
export const ENCODE_TIMEOUT_MS = 60_000;

export interface SegmentResult {
  readonly mask: Uint8Array;
  readonly width: number;
  readonly height: number;
  readonly score: number;
}

export function raceWithTimeout<T>(
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

export function preprocessImage(
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

export function buildPointCoords(
  tapX: number,
  tapY: number,
  srcWidth: number,
  srcHeight: number,
): Float32Array {
  const scale = IMAGE_SIZE / Math.max(srcWidth, srcHeight);
  const coords = new Float32Array(4);
  coords[0] = tapX * scale;
  coords[1] = tapY * scale;
  coords[2] = 0;
  coords[3] = 0;
  return coords;
}

export function buildPointLabels(): Float32Array {
  return Float32Array.from([1, -1]);
}

export function buildOrigImSize(
  srcWidth: number,
  srcHeight: number,
): Float32Array {
  const scale = IMAGE_SIZE / Math.max(srcWidth, srcHeight);
  return Float32Array.from([srcHeight * scale, srcWidth * scale]);
}

export function maskedDimensions(srcWidth: number, srcHeight: number) {
  const scale = IMAGE_SIZE / Math.max(srcWidth, srcHeight);
  return {
    width: Math.round(srcWidth * scale),
    height: Math.round(srcHeight * scale),
  };
}

export function selectBestMask(
  masksData: Float32Array,
  iouScores: Float32Array,
  maskW: number,
  maskH: number,
): SegmentResult | null {
  let bestIdx = 0;
  let bestScore = iouScores[0];
  for (let i = 1; i < iouScores.length; i++) {
    if (iouScores[i] > bestScore) {
      bestScore = iouScores[i];
      bestIdx = i;
    }
  }

  const maskSize = maskW * maskH;
  const maskOffset = bestIdx * maskSize;
  const binaryMask = new Uint8Array(maskSize);
  for (let i = 0; i < maskSize; i++) {
    binaryMask[i] = masksData[maskOffset + i] > MASK_THRESHOLD ? 1 : 0;
  }

  let area = 0;
  for (let i = 0; i < binaryMask.length; i++) area += binaryMask[i];
  const minArea = maskSize * 0.0005;
  if (area < minArea) return null;

  return { mask: binaryMask, width: maskW, height: maskH, score: bestScore };
}
