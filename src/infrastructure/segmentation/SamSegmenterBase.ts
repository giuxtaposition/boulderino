import {
  buildOrigImSize,
  buildPointCoords,
  buildPointLabels,
  ENCODE_TIMEOUT_MS,
  EMBED_DIM,
  EMBED_GRID,
  IMAGE_SIZE,
  maskedDimensions,
  preprocessImage,
  raceWithTimeout,
  selectBestMask,
  SegmentResult,
} from "./samCore";

export interface OrtTensorLike {
  readonly data: unknown;
}

export interface OrtTensorConstructor {
  new (
    type: "float32",
    data: Float32Array,
    dims: readonly number[],
  ): OrtTensorLike;
}

export interface OrtSession {
  readonly inputNames: readonly string[];
  readonly outputNames: readonly string[];
  run(
    feeds: Record<string, OrtTensorLike>,
  ): Promise<Record<string, OrtTensorLike>>;
}

export interface OrtLike {
  readonly Tensor: OrtTensorConstructor;
}

export abstract class SamSegmenterBase {
  protected ort: OrtLike | null = null;
  protected encoder: OrtSession | null = null;
  protected decoder: OrtSession | null = null;
  private cachedEmbedding: Float32Array | null = null;
  private cachedImageKey: string | null = null;

  abstract load(): Promise<void>;

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

    const inputTensor = preprocessImage(pixels, width, height);
    const inputName = this.encoder.inputNames[0];
    const feeds: Record<string, OrtTensorLike> = {
      [inputName]: new this.ort.Tensor("float32", inputTensor, [
        IMAGE_SIZE,
        IMAGE_SIZE,
        3,
      ]),
    };

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

    const Tensor = this.ort.Tensor;
    const pointCoords = buildPointCoords(tapX, tapY, srcWidth, srcHeight);
    const pointLabels = buildPointLabels();
    const maskInput = new Float32Array(1 * 1 * 256 * 256);
    const hasMaskInput = new Float32Array([0]);
    const origImSize = buildOrigImSize(srcWidth, srcHeight);

    const feeds: Record<string, OrtTensorLike> = {
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

    const { width: maskW, height: maskH } = maskedDimensions(
      srcWidth,
      srcHeight,
    );
    return selectBestMask(
      masksOutput.data as Float32Array,
      iouOutput.data as Float32Array,
      maskW,
      maskH,
    );
  }

  dispose(): void {
    this.encoder = null;
    this.decoder = null;
    this.ort = null;
    this.cachedEmbedding = null;
    this.cachedImageKey = null;
  }
}
