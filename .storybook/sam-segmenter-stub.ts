export interface SegmentResult {
  readonly mask: Uint8Array;
  readonly width: number;
  readonly height: number;
}

export class SamSegmenter {
  isLoaded = false;

  async load(): Promise<void> {
    throw new Error('SamSegmenter is unavailable in Storybook');
  }

  async encode(): Promise<void> {}

  async segment(): Promise<SegmentResult | null> {
    return null;
  }
}
