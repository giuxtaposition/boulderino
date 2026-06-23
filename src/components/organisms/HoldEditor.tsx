import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  StyleSheet,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  Canvas,
  Group,
  Image as SkiaImage,
  Path,
  Skia,
  useImage,
} from "@shopify/react-native-skia";

import { Button } from "@/components/atoms/Button";
import { ThemedText } from "@/components/themed-text";
import {
  BorderWidth,
  Radius,
  Rainbow,
  Spacing,
  Theme,
} from "@/constants/theme";
import {
  detectHoldAtTap,
  detectHoldMaskAtTap,
  detectSimilarHolds,
  marchingSquares,
  Point,
  polygonFromMaskNormalized,
  simplifyPolygon,
} from "@/domain/route/detectHold";
import { Hold, HoldPoint } from "@/domain/route/Hold";
import { useSamSegmenter } from "@/hooks/use-sam-segmenter";
import { useTheme } from "@/hooks/use-theme";
import { SamSegmenter } from "@/infrastructure/segmentation/SamSegmenter";

const SAM_INPUT_SIZE = 1024;
const FALLBACK_MAX_SIDE = 360;
const DEFAULT_SIMPLIFY_FRACTION = 0.004;
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

const LAB_OPTIONS = {
  tolerance: 22,
  edgeThreshold: 50,
  maxRadiusFraction: 0.35,
  minRegionPixels: 20,
} as const;

interface PixelData {
  readonly pixels: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
}

const isPointInPolygon = (
  point: { x: number; y: number },
  polygon: readonly HoldPoint[],
): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

const buildClosedPath = (
  points: readonly Point[],
  width: number,
  height: number,
) => {
  const path = Skia.Path.Make();
  points.forEach((p, i) => {
    const x = p.x * width;
    const y = p.y * height;
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  });
  path.close();
  return path;
};

const polygonsOverlap = (
  a: readonly HoldPoint[],
  b: readonly HoldPoint[],
): boolean => {
  for (const p of a) if (isPointInPolygon(p, b)) return true;
  for (const p of b) if (isPointInPolygon(p, a)) return true;
  return false;
};

function maskToPolygon(
  mask: Uint8Array,
  maskW: number,
  maskH: number,
): Point[] | null {
  const contour = marchingSquares(mask, maskW, maskH);
  if (!contour) return null;
  const epsilon = Math.max(0.5, Math.min(maskW, maskH) * DEFAULT_SIMPLIFY_FRACTION);
  const simplified = simplifyPolygon(contour, epsilon);
  if (simplified.length < 3) return null;
  return simplified.map((p) => ({
    x: Math.max(0, Math.min(1, p.x / maskW)),
    y: Math.max(0, Math.min(1, p.y / maskH)),
  }));
}

export interface HoldEditorProps {
  readonly photoUri: string;
  readonly photoWidth: number;
  readonly photoHeight: number;
  readonly holds: readonly Hold[];
  readonly onChange: (holds: readonly Hold[]) => void;
  readonly color?: string;
  readonly testID?: string;
}

export default function HoldEditor({
  photoUri,
  photoWidth,
  photoHeight,
  holds,
  onChange,
  color = Rainbow[0],
  testID,
}: HoldEditorProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const image = useImage(photoUri);
  const [canvasSize, setCanvasSize] = useState({ width: 1, height: 1 });
  const [pixelData, setPixelData] = useState<PixelData | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [encoding, setEncoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const samState = useSamSegmenter();
  const useSam = samState.status === "ready" || samState.status === "loading";

  const segmenterRef = useRef<SamSegmenter | null>(null);
  const encodedUriRef = useRef<string | null>(null);
  const pixelRef = useRef<PixelData | null>(null);
  const holdsRef = useRef<readonly Hold[]>(holds);

  useEffect(() => {
    pixelRef.current = pixelData;
  }, [pixelData]);

  useEffect(() => {
    holdsRef.current = holds;
  }, [holds]);

  useEffect(() => {
    if (samState.status === "ready") {
      segmenterRef.current = samState.segmenter;
    }
  }, [samState]);

  const aspect =
    photoWidth > 0 && photoHeight > 0 ? photoWidth / photoHeight : 4 / 3;

  const maxSide = useSam ? SAM_INPUT_SIZE : FALLBACK_MAX_SIDE;

  useEffect(() => {
    if (!image) return;
    const imgW = image.width();
    const imgH = image.height();
    const scale = Math.min(1, maxSide / Math.max(imgW, imgH));
    const dW = Math.max(1, Math.round(imgW * scale));
    const dH = Math.max(1, Math.round(imgH * scale));
    const surface = Skia.Surface.Make(dW, dH);
    if (!surface) return;
    const canvas = surface.getCanvas();
    canvas.drawImageRect(
      image,
      { x: 0, y: 0, width: imgW, height: imgH },
      { x: 0, y: 0, width: dW, height: dH },
      Skia.Paint(),
    );
    surface.flush();
    const snapshot = surface.makeImageSnapshot();
    const raw = snapshot.readPixels();
    if (!raw) return;
    const rawBytes = raw as Uint8Array;
    const pixels = new Uint8ClampedArray(
      rawBytes.buffer,
      rawBytes.byteOffset,
      rawBytes.byteLength,
    );
    setPixelData({ pixels, width: dW, height: dH });
  }, [image, maxSide]);

  const samTimedOut = useRef(false);

  useEffect(() => {
    const px = pixelData;
    const segmenter = segmenterRef.current;
    if (!px || !segmenter) return;
    if (encodedUriRef.current === photoUri) return;

    let cancelled = false;
    setEncoding(true);

    segmenter
      .encode(px.pixels, px.width, px.height, photoUri)
      .then(() => {
        if (!cancelled) {
          encodedUriRef.current = photoUri;
          setEncoding(false);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error
            ? err.message
            : typeof err === "string"
              ? err
              : typeof err === "object" && err !== null && "message" in err
                ? String((err as { message: unknown }).message)
                : String(err);
        const isTimeout = message.includes("timed out");
        if (isTimeout) {
          samTimedOut.current = true;
          segmenterRef.current = null;
        }
        setError(
          isTimeout
            ? "SAM encoder too slow on this device. Using color detection."
            : `Encoder failed: ${message}`,
        );
        setEncoding(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pixelData, samState, photoUri]);

  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  const savedZoom = useRef(1);
  const savedPanX = useRef(0);
  const savedPanY = useRef(0);

  const clampPan = useCallback(
    (tx: number, ty: number, scale: number) => {
      const maxPanX = (canvasSize.width * (scale - 1)) / 2;
      const maxPanY = (canvasSize.height * (scale - 1)) / 2;
      return {
        x: Math.max(-maxPanX, Math.min(maxPanX, tx)),
        y: Math.max(-maxPanY, Math.min(maxPanY, ty)),
      };
    },
    [canvasSize.width, canvasSize.height],
  );

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    savedZoom.current = 1;
    savedPanX.current = 0;
    savedPanY.current = 0;
  }, []);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setCanvasSize({ width: Math.max(width, 1), height: Math.max(height, 1) });
  }, []);

  const tryRemoveHoldAt = useCallback(
    (nx: number, ny: number): boolean => {
      const current = holdsRef.current;
      const idx = current.findIndex((hold) =>
        isPointInPolygon({ x: nx, y: ny }, hold.points),
      );
      if (idx === -1) return false;
      const next = current.filter((_, i) => i !== idx);
      onChange(next);
      return true;
    },
    [onChange],
  );

  const buildHoldFromPolygon = useCallback(
    (points: readonly HoldPoint[]): Hold | null => {
      try {
        return Hold.create({ color, points });
      } catch {
        return null;
      }
    },
    [color],
  );

  const detectWithSam = useCallback(
    async (nx: number, ny: number, px: PixelData) => {
      const segmenter = segmenterRef.current;
      if (!segmenter || !segmenter.isLoaded) {
        setError("Model still loading…");
        return;
      }
      if (encodedUriRef.current !== photoUri) {
        setError("Encoding image…");
        return;
      }

      const tapX = Math.max(0, Math.min(px.width - 1, Math.round(nx * px.width)));
      const tapY = Math.max(0, Math.min(px.height - 1, Math.round(ny * px.height)));

      const result = await segmenter.segment(tapX, tapY, px.width, px.height);

      if (!result) {
        setError("Couldn't isolate a hold there. Try tapping its center.");
        return;
      }

      const polygon = maskToPolygon(result.mask, result.width, result.height);
      if (!polygon) {
        setError("Detected region too thin to outline.");
        return;
      }

      const hold = buildHoldFromPolygon(polygon);
      if (!hold) {
        setError("Detected outline too small.");
        return;
      }

      const current = holdsRef.current;
      if (current.some((h) => polygonsOverlap(h.points, polygon))) {
        setError("That overlaps an existing hold.");
        return;
      }

      onChange([...current, hold]);
    },
    [buildHoldFromPolygon, onChange, photoUri],
  );

  const detectWithFallback = useCallback(
    (nx: number, ny: number, px: PixelData) => {
      const tapX = Math.max(0, Math.min(px.width - 1, Math.round(nx * px.width)));
      const tapY = Math.max(0, Math.min(px.height - 1, Math.round(ny * px.height)));
      const isFirstHold = holdsRef.current.length === 0;

      if (isFirstHold) {
        const seedMask = detectHoldMaskAtTap(px.pixels, px.width, px.height, tapX, tapY, LAB_OPTIONS);
        if (!seedMask) {
          setError("Couldn't isolate a hold there. Try tapping its center.");
          return;
        }
        const seedPolygon = polygonFromMaskNormalized(seedMask, px.width, px.height);
        if (!seedPolygon) {
          setError("Detected region too thin to outline.");
          return;
        }
        const siblings = detectSimilarHolds(px.pixels, px.width, px.height, seedMask, LAB_OPTIONS);
        const polygons = [seedPolygon, ...siblings];
        const newHolds: Hold[] = [];
        for (const polygon of polygons) {
          if (newHolds.some((h) => polygonsOverlap(h.points, polygon))) continue;
          const hold = buildHoldFromPolygon(polygon);
          if (hold) newHolds.push(hold);
        }
        if (newHolds.length === 0) {
          setError("Detected outline too small.");
          return;
        }
        onChange(newHolds);
      } else {
        const polygon = detectHoldAtTap(px.pixels, px.width, px.height, tapX, tapY, LAB_OPTIONS);
        if (!polygon) {
          setError("Couldn't isolate a hold there.");
          return;
        }
        const hold = buildHoldFromPolygon(polygon);
        if (!hold) {
          setError("Detected outline too small.");
          return;
        }
        const current = holdsRef.current;
        if (current.some((h) => polygonsOverlap(h.points, polygon))) {
          setError("That overlaps an existing hold.");
          return;
        }
        onChange([...current, hold]);
      }
    },
    [buildHoldFromPolygon, onChange],
  );

  const detectAtNormalized = useCallback(
    async (nx: number, ny: number) => {
      const px = pixelRef.current;
      if (!px) {
        setError("Image not ready yet.");
        return;
      }

      setDetecting(true);
      setError(null);

      try {
        if (segmenterRef.current?.isLoaded) {
          await detectWithSam(nx, ny, px);
        } else {
          detectWithFallback(nx, ny, px);
        }
      } catch (err) {
        setError(`Detection failed: ${(err as Error).message}`);
      } finally {
        setDetecting(false);
      }
    },
    [detectWithSam, detectWithFallback],
  );

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .runOnJS(true)
        .onStart(() => {
          savedZoom.current = zoom;
        })
        .onUpdate((event) => {
          const newScale = Math.max(
            MIN_ZOOM,
            Math.min(MAX_ZOOM, savedZoom.current * event.scale),
          );
          setZoom(newScale);
          const clamped = clampPan(savedPanX.current, savedPanY.current, newScale);
          setPanX(clamped.x);
          setPanY(clamped.y);
        })
        .onEnd(() => {
          savedZoom.current = zoom;
        }),
    [zoom, clampPan],
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .minPointers(2)
        .onStart(() => {
          savedPanX.current = panX;
          savedPanY.current = panY;
        })
        .onUpdate((event) => {
          const clamped = clampPan(
            savedPanX.current + event.translationX,
            savedPanY.current + event.translationY,
            zoom,
          );
          setPanX(clamped.x);
          setPanY(clamped.y);
        })
        .onEnd(() => {
          savedPanX.current = panX;
          savedPanY.current = panY;
        }),
    [panX, panY, zoom, clampPan],
  );

  const doubleTapGesture = useMemo(
    () =>
      Gesture.Tap()
        .runOnJS(true)
        .numberOfTaps(2)
        .maxDuration(300)
        .onEnd(() => {
          resetZoom();
        }),
    [resetZoom],
  );

  const tapGesture = useMemo(
    () =>
      Gesture.Tap()
        .runOnJS(true)
        .maxDistance(8)
        .onEnd((event) => {
          if (detecting || encoding) return;
          const cw = canvasSize.width;
          const ch = canvasSize.height;
          const cx = cw / 2;
          const cy = ch / 2;
          const imgX = (event.x - cx - panX) / zoom + cx;
          const imgY = (event.y - cy - panY) / zoom + cy;
          const nx = imgX / cw;
          const ny = imgY / ch;
          if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return;
          if (tryRemoveHoldAt(nx, ny)) return;
          detectAtNormalized(nx, ny);
        }),
    [canvasSize.width, canvasSize.height, detecting, encoding, zoom, panX, panY, detectAtNormalized, tryRemoveHoldAt],
  );

  const composedGesture = useMemo(
    () =>
      Gesture.Race(
        doubleTapGesture,
        Gesture.Simultaneous(pinchGesture, panGesture),
        tapGesture,
      ),
    [doubleTapGesture, pinchGesture, panGesture, tapGesture],
  );

  const handleClear = useCallback(() => {
    onChange([]);
    setError(null);
  }, [onChange]);

  const isLoading =
    samState.status === "loading" ||
    encoding ||
    detecting ||
    (!pixelData && !!image);

  const statusLabel = (() => {
    if (samState.status === "loading") return "LOADING MODEL…";
    if (encoding) return "ENCODING IMAGE…";
    if (detecting) return "DETECTING…";
    return undefined;
  })();

  const hintText = (() => {
    if (samState.status === "error") return `Model error: ${samState.message}`;
    if (samState.status === "unavailable") return "Using color-based detection (no native module).";
    if (holds.length === 0) return "Pinch to zoom, tap a hold to outline it.";
    return "Tap empty space to add. Tap a hold to remove. Double-tap to reset zoom.";
  })();

  return (
    <View style={styles.wrapper} testID={testID}>
      <View
        style={[styles.canvasFrame, { aspectRatio: aspect }]}
        onLayout={handleLayout}
      >
        <GestureDetector gesture={composedGesture}>
          <View style={styles.pressArea} testID="hold-editor-press">
            <Canvas style={StyleSheet.absoluteFill}>
              <Group
                transform={[
                  { translateX: canvasSize.width / 2 + panX },
                  { translateY: canvasSize.height / 2 + panY },
                  { scale: zoom },
                  { translateX: -canvasSize.width / 2 },
                  { translateY: -canvasSize.height / 2 },
                ]}
              >
                {image && (
                  <SkiaImage
                    image={image}
                    fit="cover"
                    x={0}
                    y={0}
                    width={canvasSize.width}
                    height={canvasSize.height}
                  />
                )}
                {holds.map((hold) => (
                  <Path
                    key={hold.id}
                    path={buildClosedPath(
                      hold.points,
                      canvasSize.width,
                      canvasSize.height,
                    )}
                    color={hold.color}
                    opacity={0.4}
                    style="fill"
                  />
                ))}
                {holds.map((hold) => (
                  <Path
                    key={`${hold.id}-stroke`}
                    path={buildClosedPath(
                      hold.points,
                      canvasSize.width,
                      canvasSize.height,
                    )}
                    color={hold.color}
                    style="stroke"
                    strokeWidth={3 / zoom}
                  />
                ))}
              </Group>
            </Canvas>
          </View>
        </GestureDetector>
        {isLoading && (
          <View style={styles.overlay} pointerEvents="none">
            <ActivityIndicator size="small" />
            {statusLabel && (
              <ThemedText style={styles.overlayText}>{statusLabel}</ThemedText>
            )}
          </View>
        )}
        {zoom > 1.05 && (
          <View style={styles.zoomBadge} pointerEvents="none">
            <ThemedText style={styles.zoomText}>
              {zoom.toFixed(1)}x
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        {zoom > 1.05 && (
          <Button
            onPress={resetZoom}
            testID="hold-editor-reset-zoom"
            style={styles.secondary}
          >
            RESET ZOOM
          </Button>
        )}
        {holds.length > 0 && (
          <Button
            onPress={handleClear}
            testID="hold-editor-clear"
            style={styles.secondary}
          >
            CLEAR ALL
          </Button>
        )}
      </View>

      <ThemedText style={styles.hint}>{hintText}</ThemedText>

      {error && (
        <View style={styles.error} testID="hold-editor-error">
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: { gap: Spacing.three },
    canvasFrame: {
      width: "100%",
      borderRadius: Radius.small,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      overflow: "hidden",
      backgroundColor: "#000",
    },
    pressArea: { flex: 1 },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.35)",
      gap: Spacing.one,
    },
    overlayText: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.5,
      color: theme.text,
    },
    zoomBadge: {
      position: "absolute",
      top: Spacing.two,
      right: Spacing.two,
      backgroundColor: "rgba(0,0,0,0.6)",
      borderRadius: Radius.small,
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.one,
    },
    zoomText: {
      fontSize: 11,
      fontWeight: "800",
      color: "#fff",
    },
    controls: {
      flexDirection: "row",
      gap: Spacing.two,
      flexWrap: "wrap",
    },
    secondary: {
      flexGrow: 1,
      backgroundColor: theme.inputBackground,
    },
    hint: {
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },
    error: {
      backgroundColor: theme.inputBackground,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      borderRadius: Radius.small,
      padding: Spacing.two,
    },
    errorText: { color: theme.text, fontSize: 12, fontWeight: "700" },
  });
