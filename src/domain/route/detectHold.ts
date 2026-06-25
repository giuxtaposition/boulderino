export interface Point {
  x: number;
  y: number;
}

export interface Lab {
  L: number;
  a: number;
  b: number;
}

export interface DetectHoldOptions {
  tolerance?: number;
  minRegionPixels?: number;
  maxRegionFraction?: number;
  simplifyEpsilonPixels?: number;
  edgeThreshold?: number;
  maxRadiusFraction?: number;
}

export interface DetectSimilarHoldsOptions {
  tolerance?: number;
  minRegionPixels?: number;
  maxRegionFraction?: number;
  simplifyEpsilonPixels?: number;
  maxHolds?: number;
  edgeThreshold?: number;
  minCompactness?: number;
}

const DEFAULT_TOLERANCE = 12;
const DEFAULT_MIN_REGION = 32;
const DEFAULT_MAX_REGION_FRACTION = 0.05;
const DEFAULT_SIMPLIFY_FRACTION = 0.004;
const DEFAULT_MAX_HOLDS = 64;
const DEFAULT_EDGE_THRESHOLD = 32;
const DEFAULT_MAX_RADIUS_FRACTION = 0.18;
const DEFAULT_MIN_COMPACTNESS = 0.15;

const inBounds = (x: number, y: number, width: number, height: number): boolean =>
  x >= 0 && y >= 0 && x < width && y < height;

const srgbToLinear = (c: number): number => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};

const XYZ_REF_X = 0.95047;
const XYZ_REF_Y = 1.0;
const XYZ_REF_Z = 1.08883;
const LAB_EPSILON = 216 / 24389;
const LAB_KAPPA = 24389 / 27;

const fLab = (t: number): number =>
  t > LAB_EPSILON ? Math.cbrt(t) : (LAB_KAPPA * t + 16) / 116;

export function rgbToLab(r: number, g: number, b: number): Lab {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const x = (lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375) / XYZ_REF_X;
  const y = (lr * 0.2126729 + lg * 0.7151522 + lb * 0.072175) / XYZ_REF_Y;
  const z = (lr * 0.0193339 + lg * 0.119192 + lb * 0.9503041) / XYZ_REF_Z;
  const fx = fLab(x);
  const fy = fLab(y);
  const fz = fLab(z);
  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

export function deltaE76(p: Lab, q: Lab): number {
  const dL = p.L - q.L;
  const da = p.a - q.a;
  const db = p.b - q.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

export function rgbaToLabBuffer(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): Float32Array {
  const out = new Float32Array(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    const p = i * 4;
    const lab = rgbToLab(pixels[p], pixels[p + 1], pixels[p + 2]);
    const o = i * 3;
    out[o] = lab.L;
    out[o + 1] = lab.a;
    out[o + 2] = lab.b;
  }
  return out;
}

const FOUR_NEIGHBORS: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

const deltaELab = (lab: Float32Array, i: number, L: number, a: number, b: number): number => {
  const o = i * 3;
  const dL = lab[o] - L;
  const da = lab[o + 1] - a;
  const db = lab[o + 2] - b;
  return Math.sqrt(dL * dL + da * da + db * db);
};

export function computeGradient(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8Array {
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < gray.length; i++) {
    const p = i * 4;
    gray[i] = Math.round(
      0.299 * pixels[p] + 0.587 * pixels[p + 1] + 0.114 * pixels[p + 2],
    );
  }
  const grad = new Uint8Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const tl = gray[(y - 1) * width + (x - 1)];
      const t = gray[(y - 1) * width + x];
      const tr = gray[(y - 1) * width + (x + 1)];
      const l = gray[y * width + (x - 1)];
      const r = gray[y * width + (x + 1)];
      const bl = gray[(y + 1) * width + (x - 1)];
      const b = gray[(y + 1) * width + x];
      const br = gray[(y + 1) * width + (x + 1)];
      const gx = -tl - 2 * l - bl + tr + 2 * r + br;
      const gy = -tl - 2 * t - tr + bl + 2 * b + br;
      const mag = Math.sqrt(gx * gx + gy * gy);
      grad[y * width + x] = mag > 255 ? 255 : Math.round(mag);
    }
  }
  return grad;
}

export interface RegionGrowConstraints {
  readonly tolerance: number;
  readonly edgeThreshold?: number;
  readonly maxRadius?: number;
  readonly gradient?: Uint8Array;
}

export function regionGrowLab(
  lab: Float32Array,
  width: number,
  height: number,
  seedX: number,
  seedY: number,
  toleranceOrConstraints: number | RegionGrowConstraints,
): Uint8Array {
  const mask = new Uint8Array(width * height);
  if (!inBounds(seedX, seedY, width, height)) return mask;

  const c: RegionGrowConstraints =
    typeof toleranceOrConstraints === "number"
      ? { tolerance: toleranceOrConstraints }
      : toleranceOrConstraints;
  const tolerance = c.tolerance;
  const edgeThreshold = c.edgeThreshold ?? Infinity;
  const maxRadius = c.maxRadius ?? Infinity;
  const gradient = c.gradient;
  const maxRadiusSq = maxRadius * maxRadius;

  let seedL = 0;
  let seedA = 0;
  let seedB = 0;
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = seedX + dx;
      const ny = seedY + dy;
      if (!inBounds(nx, ny, width, height)) continue;
      const o = (ny * width + nx) * 3;
      seedL += lab[o];
      seedA += lab[o + 1];
      seedB += lab[o + 2];
      count++;
    }
  }
  seedL /= count;
  seedA /= count;
  seedB /= count;

  const seedIdx = seedY * width + seedX;
  mask[seedIdx] = 1;
  const stack: number[] = [seedX, seedY];

  while (stack.length > 0) {
    const y = stack.pop() as number;
    const x = stack.pop() as number;
    for (const [dx, dy] of FOUR_NEIGHBORS) {
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(nx, ny, width, height)) continue;
      const flat = ny * width + nx;
      if (mask[flat] === 1) continue;
      if (gradient && gradient[flat] > edgeThreshold) continue;
      const rdx = nx - seedX;
      const rdy = ny - seedY;
      if (rdx * rdx + rdy * rdy > maxRadiusSq) continue;
      if (deltaELab(lab, flat, seedL, seedA, seedB) > tolerance) continue;
      mask[flat] = 1;
      stack.push(nx, ny);
    }
  }

  return mask;
}

interface SegmentTable {
  readonly first: readonly [number, number] | null;
  readonly second: readonly [number, number] | null;
}

const T = 0;
const R = 1;
const B = 2;
const L = 3;

const CASES: ReadonlyArray<SegmentTable> = [
  { first: null, second: null },
  { first: [B, L], second: null },
  { first: [R, B], second: null },
  { first: [R, L], second: null },
  { first: [T, R], second: null },
  { first: [T, R], second: [B, L] },
  { first: [T, B], second: null },
  { first: [T, L], second: null },
  { first: [L, T], second: null },
  { first: [B, T], second: null },
  { first: [L, T], second: [R, B] },
  { first: [R, T], second: null },
  { first: [L, R], second: null },
  { first: [B, R], second: null },
  { first: [L, B], second: null },
  { first: null, second: null },
];

const sideMidpoint = (side: number, cx: number, cy: number): Point => {
  switch (side) {
    case T:
      return { x: cx + 0.5, y: cy };
    case R:
      return { x: cx + 1, y: cy + 0.5 };
    case B:
      return { x: cx + 0.5, y: cy + 1 };
    case L:
      return { x: cx, y: cy + 0.5 };
  }
  return { x: cx, y: cy };
};

const keyOf = (p: Point, gridW: number): number =>
  Math.round(p.x * 2) * (gridW * 2 + 4) + Math.round(p.y * 2);

export function marchingSquares(
  mask: Uint8Array,
  width: number,
  height: number,
): Point[] | null {
  if (width < 2 || height < 2) return null;

  const nextMap = new Map<number, Point>();
  const startPoints: Point[] = [];

  const addSegment = (a: Point, b: Point): void => {
    nextMap.set(keyOf(a, width), b);
    startPoints.push(a);
  };

  const sample = (x: number, y: number): number =>
    x < 0 || y < 0 || x >= width || y >= height ? 0 : mask[y * width + x];

  for (let y = -1; y < height; y++) {
    for (let x = -1; x < width; x++) {
      const tl = sample(x, y);
      const tr = sample(x + 1, y);
      const br = sample(x + 1, y + 1);
      const bl = sample(x, y + 1);
      const code = (tl << 3) | (tr << 2) | (br << 1) | bl;
      const seg = CASES[code];
      if (seg.first) {
        addSegment(sideMidpoint(seg.first[0], x, y), sideMidpoint(seg.first[1], x, y));
      }
      if (seg.second) {
        addSegment(sideMidpoint(seg.second[0], x, y), sideMidpoint(seg.second[1], x, y));
      }
    }
  }

  if (startPoints.length === 0) return null;

  let bestLoop: Point[] | null = null;
  const visited = new Set<number>();
  for (const start of startPoints) {
    const startKey = keyOf(start, width);
    if (visited.has(startKey)) continue;
    const loop: Point[] = [];
    let current: Point | undefined = start;
    let safety = startPoints.length + 2;
    while (current && safety-- > 0) {
      const key = keyOf(current, width);
      if (visited.has(key)) break;
      visited.add(key);
      loop.push(current);
      current = nextMap.get(key);
      if (current && keyOf(current, width) === startKey) break;
    }
    if (loop.length >= 3) {
      if (!bestLoop || loop.length > bestLoop.length) bestLoop = loop;
    }
  }

  return bestLoop;
}

const pointLineDistance = (p: Point, a: Point, b: Point): number => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const num = Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x);
  return num / Math.hypot(dx, dy);
};

const dpRecursive = (points: Point[], epsilon: number): Point[] => {
  if (points.length < 3) return points.slice();
  let maxDist = 0;
  let idx = 0;
  const first = points[0];
  const last = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i++) {
    const d = pointLineDistance(points[i], first, last);
    if (d > maxDist) {
      maxDist = d;
      idx = i;
    }
  }
  if (maxDist > epsilon) {
    const left = dpRecursive(points.slice(0, idx + 1), epsilon);
    const right = dpRecursive(points.slice(idx), epsilon);
    return left.slice(0, -1).concat(right);
  }
  return [first, last];
};

export function simplifyPolygon(points: Point[], epsilon: number): Point[] {
  if (points.length < 3) return points.slice();
  return dpRecursive(points, epsilon);
}

const countMaskPixels = (mask: Uint8Array): number => {
  let n = 0;
  for (let i = 0; i < mask.length; i++) if (mask[i] === 1) n++;
  return n;
};

const polygonToNormalized = (
  points: readonly Point[],
  width: number,
  height: number,
): Point[] =>
  points.map((p) => ({
    x: Math.max(0, Math.min(1, p.x / width)),
    y: Math.max(0, Math.min(1, p.y / height)),
  }));

interface PolygonFromMaskOptions {
  readonly simplifyEpsilonPixels: number;
}

const polygonFromMask = (
  mask: Uint8Array,
  width: number,
  height: number,
  options: PolygonFromMaskOptions,
): Point[] | null => {
  const contour = marchingSquares(mask, width, height);
  if (!contour || contour.length < 3) return null;
  let simplified = simplifyPolygon(contour, options.simplifyEpsilonPixels);
  if (simplified.length < 3) {
    simplified = simplifyPolygon(contour, options.simplifyEpsilonPixels / 4);
  }
  if (simplified.length < 3) simplified = contour.slice();
  if (simplified.length < 3) return null;
  return polygonToNormalized(simplified, width, height);
};

export function detectHoldAtTap(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  tapX: number,
  tapY: number,
  options: DetectHoldOptions = {},
): Point[] | null {
  const mask = detectHoldMaskAtTap(pixels, width, height, tapX, tapY, options);
  if (!mask) return null;
  const epsilon =
    options.simplifyEpsilonPixels ??
    Math.max(0.5, Math.min(width, height) * DEFAULT_SIMPLIFY_FRACTION);
  return polygonFromMask(mask, width, height, { simplifyEpsilonPixels: epsilon });
}

interface SeedStats {
  readonly L: number;
  readonly a: number;
  readonly b: number;
}

const meanLabFromMask = (
  lab: Float32Array,
  mask: Uint8Array,
): SeedStats | null => {
  let sumL = 0;
  let sumA = 0;
  let sumB = 0;
  let n = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] !== 1) continue;
    const o = i * 3;
    sumL += lab[o];
    sumA += lab[o + 1];
    sumB += lab[o + 2];
    n++;
  }
  if (n === 0) return null;
  return { L: sumL / n, a: sumA / n, b: sumB / n };
};

const buildSimilarityMask = (
  lab: Float32Array,
  width: number,
  height: number,
  ref: SeedStats,
  tolerance: number,
): Uint8Array => {
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    if (deltaELab(lab, i, ref.L, ref.a, ref.b) <= tolerance) mask[i] = 1;
  }
  return mask;
};

const extractComponent = (
  source: Uint8Array,
  width: number,
  height: number,
  seedIdx: number,
): Uint8Array => {
  const comp = new Uint8Array(width * height);
  const startX = seedIdx % width;
  const startY = Math.floor(seedIdx / width);
  const stack: number[] = [startX, startY];
  comp[seedIdx] = 1;
  source[seedIdx] = 0;
  while (stack.length > 0) {
    const y = stack.pop() as number;
    const x = stack.pop() as number;
    for (const [dx, dy] of FOUR_NEIGHBORS) {
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(nx, ny, width, height)) continue;
      const flat = ny * width + nx;
      if (source[flat] !== 1) continue;
      source[flat] = 0;
      comp[flat] = 1;
      stack.push(nx, ny);
    }
  }
  return comp;
};

const compactnessOf = (mask: Uint8Array, width: number, area: number): number => {
  if (area === 0) return 0;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] !== 1) continue;
    const x = i % width;
    const y = (i - x) / width;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const bboxArea = (maxX - minX + 1) * (maxY - minY + 1);
  return bboxArea === 0 ? 0 : area / bboxArea;
};

export function detectSimilarHolds(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  seedMask: Uint8Array,
  options: DetectSimilarHoldsOptions = {},
): Point[][] {
  const tolerance = options.tolerance ?? DEFAULT_TOLERANCE;
  const minRegion = options.minRegionPixels ?? DEFAULT_MIN_REGION;
  const maxRegionFraction = options.maxRegionFraction ?? DEFAULT_MAX_REGION_FRACTION;
  const epsilon =
    options.simplifyEpsilonPixels ??
    Math.max(0.5, Math.min(width, height) * DEFAULT_SIMPLIFY_FRACTION);
  const maxHolds = options.maxHolds ?? DEFAULT_MAX_HOLDS;
  const edgeThreshold = options.edgeThreshold ?? DEFAULT_EDGE_THRESHOLD;
  const minCompactness = options.minCompactness ?? DEFAULT_MIN_COMPACTNESS;

  const lab = rgbaToLabBuffer(pixels, width, height);
  const ref = meanLabFromMask(lab, seedMask);
  if (!ref) return [];

  const gradient = computeGradient(pixels, width, height);
  const similarity = buildSimilarityMask(lab, width, height, ref, tolerance);
  for (let i = 0; i < similarity.length; i++) {
    if (gradient[i] > edgeThreshold) similarity[i] = 0;
  }
  for (let i = 0; i < seedMask.length; i++) if (seedMask[i] === 1) similarity[i] = 0;

  const maxRegion = width * height * maxRegionFraction;
  const polygons: Point[][] = [];

  for (let i = 0; i < similarity.length && polygons.length < maxHolds; i++) {
    if (similarity[i] !== 1) continue;
    const comp = extractComponent(similarity, width, height, i);
    const area = countMaskPixels(comp);
    if (area < minRegion || area > maxRegion) continue;
    if (compactnessOf(comp, width, area) < minCompactness) continue;
    const polygon = polygonFromMask(comp, width, height, {
      simplifyEpsilonPixels: epsilon,
    });
    if (polygon) polygons.push(polygon);
  }

  return polygons;
}

export function detectHoldMaskAtTap(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  tapX: number,
  tapY: number,
  options: DetectHoldOptions = {},
): Uint8Array | null {
  if (!inBounds(tapX, tapY, width, height)) return null;
  const tolerance = options.tolerance ?? DEFAULT_TOLERANCE;
  const minRegion = options.minRegionPixels ?? DEFAULT_MIN_REGION;
  const maxRegionFraction = options.maxRegionFraction ?? DEFAULT_MAX_REGION_FRACTION;
  const edgeThreshold = options.edgeThreshold ?? DEFAULT_EDGE_THRESHOLD;
  const maxRadius =
    Math.min(width, height) *
    (options.maxRadiusFraction ?? DEFAULT_MAX_RADIUS_FRACTION);
  const lab = rgbaToLabBuffer(pixels, width, height);
  const gradient = computeGradient(pixels, width, height);
  const mask = regionGrowLab(lab, width, height, tapX, tapY, {
    tolerance,
    edgeThreshold,
    maxRadius,
    gradient,
  });
  const area = countMaskPixels(mask);
  if (area < minRegion) return null;
  if (area > width * height * maxRegionFraction) return null;
  return mask;
}

export function polygonFromMaskNormalized(
  mask: Uint8Array,
  width: number,
  height: number,
  options: DetectHoldOptions = {},
): Point[] | null {
  const epsilon =
    options.simplifyEpsilonPixels ??
    Math.max(0.5, Math.min(width, height) * DEFAULT_SIMPLIFY_FRACTION);
  return polygonFromMask(mask, width, height, { simplifyEpsilonPixels: epsilon });
}
