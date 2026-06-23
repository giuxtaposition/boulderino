import { describe, expect, it } from "vitest";
import {
  deltaE76,
  detectHoldAtTap,
  detectHoldMaskAtTap,
  detectSimilarHolds,
  marchingSquares,
  rgbaToLabBuffer,
  rgbToLab,
  regionGrowLab,
  simplifyPolygon,
} from "./detectHold";

type Color = readonly [number, number, number];

const WHITE: Color = [245, 245, 245];
const RED: Color = [220, 30, 30];
const NEAR_RED: Color = [225, 40, 35];
const BLUE: Color = [30, 30, 220];

const makeBitmap = (
  width: number,
  height: number,
  fill: (x: number, y: number) => Color,
): Uint8ClampedArray => {
  const buf = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = fill(x, y);
      const i = (y * width + x) * 4;
      buf[i] = r;
      buf[i + 1] = g;
      buf[i + 2] = b;
      buf[i + 3] = 255;
    }
  }
  return buf;
};

const squareBitmap = (
  size: number,
  square: { x: number; y: number; w: number; h: number },
  color: Color = RED,
  background: Color = WHITE,
) =>
  makeBitmap(size, size, (x, y) => {
    const inside =
      x >= square.x &&
      x < square.x + square.w &&
      y >= square.y &&
      y < square.y + square.h;
    return inside ? color : background;
  });

describe("rgbToLab", () => {
  it("converts pure white close to L=100 a=0 b=0", () => {
    const lab = rgbToLab(255, 255, 255);
    expect(lab.L).toBeCloseTo(100, 0);
    expect(Math.abs(lab.a)).toBeLessThan(0.5);
    expect(Math.abs(lab.b)).toBeLessThan(0.5);
  });

  it("converts black close to L=0", () => {
    const lab = rgbToLab(0, 0, 0);
    expect(lab.L).toBeCloseTo(0, 0);
  });

  it("places red in the positive a region", () => {
    const lab = rgbToLab(255, 0, 0);
    expect(lab.a).toBeGreaterThan(60);
  });
});

describe("deltaE76", () => {
  it("returns zero for identical Lab colors", () => {
    const lab = rgbToLab(120, 30, 200);
    expect(deltaE76(lab, lab)).toBe(0);
  });

  it("is symmetric", () => {
    const a = rgbToLab(100, 50, 20);
    const b = rgbToLab(20, 200, 80);
    expect(deltaE76(a, b)).toBeCloseTo(deltaE76(b, a), 6);
  });

  it("separates dissimilar colors with a large distance", () => {
    const red = rgbToLab(220, 30, 30);
    const blue = rgbToLab(30, 30, 220);
    expect(deltaE76(red, blue)).toBeGreaterThan(40);
  });
});

describe("regionGrowLab", () => {
  it("fills a uniform red square within tolerance", () => {
    const pixels = squareBitmap(10, { x: 3, y: 3, w: 4, h: 4 });
    const lab = rgbaToLabBuffer(pixels, 10, 10);
    const mask = regionGrowLab(lab, 10, 10, 4, 4, 8);

    let count = 0;
    for (let i = 0; i < mask.length; i++) if (mask[i] === 1) count++;
    expect(count).toBe(16);
  });

  it("tolerates small color variations inside the region", () => {
    const pixels = makeBitmap(5, 5, (x, y) => {
      const inSquare = x >= 1 && x <= 3 && y >= 1 && y <= 3;
      if (!inSquare) return WHITE;
      return x === 2 && y === 2 ? RED : NEAR_RED;
    });
    const lab = rgbaToLabBuffer(pixels, 5, 5);
    const mask = regionGrowLab(lab, 5, 5, 2, 2, 8);

    let count = 0;
    for (let i = 0; i < mask.length; i++) if (mask[i] === 1) count++;
    expect(count).toBe(9);
  });

  it("does not cross sharp color boundaries", () => {
    const pixels = makeBitmap(6, 6, (x) => (x < 3 ? RED : BLUE));
    const lab = rgbaToLabBuffer(pixels, 6, 6);
    const mask = regionGrowLab(lab, 6, 6, 0, 0, 8);

    let count = 0;
    for (let i = 0; i < mask.length; i++) if (mask[i] === 1) count++;
    expect(count).toBe(18);
  });

  it("returns an empty mask when the seed is out of bounds", () => {
    const pixels = squareBitmap(5, { x: 0, y: 0, w: 5, h: 5 });
    const lab = rgbaToLabBuffer(pixels, 5, 5);
    const mask = regionGrowLab(lab, 5, 5, -1, 0, 8);
    expect(mask.every((v) => v === 0)).toBe(true);
  });
});

describe("marchingSquares", () => {
  it("produces a closed contour around a filled square", () => {
    const w = 10;
    const h = 10;
    const mask = new Uint8Array(w * h);
    for (let y = 3; y < 7; y++) {
      for (let x = 3; x < 7; x++) {
        mask[y * w + x] = 1;
      }
    }
    const contour = marchingSquares(mask, w, h);

    expect(contour).not.toBeNull();
    expect(contour!.length).toBeGreaterThanOrEqual(4);
    const xs = contour!.map((p) => p.x);
    const ys = contour!.map((p) => p.y);
    expect(Math.min(...xs)).toBeCloseTo(2.5, 1);
    expect(Math.max(...xs)).toBeCloseTo(6.5, 1);
    expect(Math.min(...ys)).toBeCloseTo(2.5, 1);
    expect(Math.max(...ys)).toBeCloseTo(6.5, 1);
  });

  it("returns null for an empty mask", () => {
    const mask = new Uint8Array(25);
    expect(marchingSquares(mask, 5, 5)).toBeNull();
  });

  it("picks the largest loop when multiple components exist", () => {
    const w = 12;
    const h = 6;
    const mask = new Uint8Array(w * h);
    mask[2 * w + 2] = 1;
    for (let y = 2; y < 5; y++) {
      for (let x = 7; x < 11; x++) {
        mask[y * w + x] = 1;
      }
    }
    const contour = marchingSquares(mask, w, h);
    expect(contour).not.toBeNull();
    const xs = contour!.map((p) => p.x);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(6);
  });
});

describe("simplifyPolygon", () => {
  it("removes collinear points", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 3 },
      { x: 0, y: 3 },
    ];
    const simplified = simplifyPolygon(points, 0.1);
    expect(simplified.length).toBe(4);
  });

  it("keeps the polygon untouched when all points exceed epsilon", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ];
    expect(simplifyPolygon(points, 0.1)).toEqual(points);
  });

  it("returns the input when it has fewer than 3 points", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ];
    expect(simplifyPolygon(points, 0.1)).toEqual(points);
  });
});

describe("detectHoldAtTap", () => {
  it("returns normalized polygon for a tapped red square", () => {
    const pixels = squareBitmap(20, { x: 5, y: 5, w: 10, h: 10 });
    const polygon = detectHoldAtTap(pixels, 20, 20, 10, 10, {
      maxRegionFraction: 0.4,
      maxRadiusFraction: 1,
    });

    expect(polygon).not.toBeNull();
    expect(polygon!.length).toBeGreaterThanOrEqual(3);
    for (const point of polygon!) {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(1);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(1);
    }
    const xs = polygon!.map((p) => p.x);
    const ys = polygon!.map((p) => p.y);
    expect(Math.min(...xs)).toBeGreaterThan(0.15);
    expect(Math.max(...xs)).toBeLessThan(0.85);
    expect(Math.min(...ys)).toBeGreaterThan(0.15);
    expect(Math.max(...ys)).toBeLessThan(0.85);
  });

  it("returns null when the detected region is below the minimum size", () => {
    const pixels = makeBitmap(10, 10, (x, y) =>
      x === 5 && y === 5 ? RED : WHITE,
    );
    const polygon = detectHoldAtTap(pixels, 10, 10, 5, 5, {
      minRegionPixels: 50,
    });
    expect(polygon).toBeNull();
  });

  it("returns null when the tap is out of bounds", () => {
    const pixels = squareBitmap(10, { x: 0, y: 0, w: 10, h: 10 });
    expect(detectHoldAtTap(pixels, 10, 10, 100, 100)).toBeNull();
  });

  it("returns null when the region grows larger than the configured fraction", () => {
    const pixels = makeBitmap(10, 10, () => RED);
    const polygon = detectHoldAtTap(pixels, 10, 10, 5, 5, {
      maxRegionFraction: 0.2,
    });
    expect(polygon).toBeNull();
  });

  it("stops region grow at a strong color edge between same-color zones", () => {
    const pixels = makeBitmap(30, 30, (x, y) => {
      const onLeft = x < 12;
      const onRight = x >= 18;
      if (onLeft || onRight) return RED;
      return WHITE;
    });
    const polygon = detectHoldAtTap(pixels, 30, 30, 5, 15, {
      maxRegionFraction: 0.5,
      maxRadiusFraction: 1,
      edgeThreshold: 35,
    });
    expect(polygon).not.toBeNull();
    const xs = polygon!.map((p) => p.x);
    expect(Math.max(...xs)).toBeLessThan(0.5);
  });

  it("respects maxRadiusFraction by bounding grown region size", () => {
    const pixels = makeBitmap(40, 40, () => RED);
    const polygon = detectHoldAtTap(pixels, 40, 40, 20, 20, {
      maxRegionFraction: 1,
      edgeThreshold: 255,
      maxRadiusFraction: 0.1,
    });
    expect(polygon).not.toBeNull();
    const xs = polygon!.map((p) => p.x);
    const ys = polygon!.map((p) => p.y);
    const w = Math.max(...xs) - Math.min(...xs);
    const h = Math.max(...ys) - Math.min(...ys);
    expect(w).toBeLessThan(0.3);
    expect(h).toBeLessThan(0.3);
  });
});

describe("detectSimilarHolds", () => {
  it("finds other holds sharing the seed color, excluding the seed mask", () => {
    const size = 32;
    const pixels = makeBitmap(size, size, (x, y) => {
      const inA = x >= 2 && x < 10 && y >= 2 && y < 10;
      const inB = x >= 18 && x < 26 && y >= 4 && y < 12;
      const inC = x >= 8 && x < 16 && y >= 20 && y < 28;
      if (inA || inB || inC) return RED;
      return WHITE;
    });

    const seedMask = detectHoldMaskAtTap(pixels, size, size, 6, 6, {
      maxRegionFraction: 0.4,
      maxRadiusFraction: 1,
    });
    expect(seedMask).not.toBeNull();

    const polygons = detectSimilarHolds(pixels, size, size, seedMask!, {
      tolerance: 14,
      maxRegionFraction: 0.4,
      edgeThreshold: 255,
      minCompactness: 0,
    });

    expect(polygons.length).toBe(2);
    for (const polygon of polygons) {
      expect(polygon.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("ignores components that do not match the seed color", () => {
    const size = 24;
    const pixels = makeBitmap(size, size, (x, y) => {
      const inRed = x >= 2 && x < 10 && y >= 2 && y < 10;
      const inBlue = x >= 14 && x < 22 && y >= 14 && y < 22;
      if (inRed) return RED;
      if (inBlue) return BLUE;
      return WHITE;
    });

    const seedMask = detectHoldMaskAtTap(pixels, size, size, 5, 5, {
      maxRegionFraction: 0.4,
      maxRadiusFraction: 1,
    });
    expect(seedMask).not.toBeNull();
    const polygons = detectSimilarHolds(pixels, size, size, seedMask!, {
      tolerance: 14,
      maxRegionFraction: 0.4,
      edgeThreshold: 255,
      minCompactness: 0,
    });
    expect(polygons.length).toBe(0);
  });

  it("respects the maxHolds limit", () => {
    const size = 24;
    const pixels = makeBitmap(size, size, (x, y) => {
      const cellX = Math.floor(x / 6);
      const cellY = Math.floor(y / 6);
      const inHold = (x % 6 < 3) && (y % 6 < 3);
      const isHoldCell = (cellX + cellY) % 1 === 0;
      return inHold && isHoldCell ? RED : WHITE;
    });
    const seedMask = detectHoldMaskAtTap(pixels, size, size, 1, 1, {
      maxRegionFraction: 0.4,
      maxRadiusFraction: 1,
    });
    if (!seedMask) {
      return;
    }
    const polygons = detectSimilarHolds(pixels, size, size, seedMask, {
      tolerance: 14,
      maxHolds: 2,
      maxRegionFraction: 0.4,
      edgeThreshold: 255,
      minCompactness: 0,
    });
    expect(polygons.length).toBeLessThanOrEqual(2);
  });
});
