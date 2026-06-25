import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  Canvas,
  Circle,
  Group,
  Image as SkiaImage,
  Line,
  Path,
  Skia,
  useImage,
} from "@shopify/react-native-skia";

import { Button } from "@/components/atoms/Button";
import { ThemedText } from "@/components/themed-text";
import {
  BorderWidth,
  Media,
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
const FALLBACK_MAX_SIDE = 540;
const DEFAULT_SIMPLIFY_FRACTION = 0.004;
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

const LAB_OPTIONS = {
  tolerance: 26,
  edgeThreshold: 35,
  maxRadiusFraction: 0.35,
  minRegionPixels: 4,
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
  rect: { x: number; y: number; width: number; height: number },
) => {
  const builder = Skia.PathBuilder.Make();
  points.forEach((p, i) => {
    const x = rect.x + p.x * rect.width;
    const y = rect.y + p.y * rect.height;
    if (i === 0) builder.moveTo(x, y);
    else builder.lineTo(x, y);
  });
  builder.close();
  return builder.build();
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
  if (!contour || contour.length < 3) return null;
  const epsilon = Math.max(0.5, Math.min(maskW, maskH) * DEFAULT_SIMPLIFY_FRACTION);
  let simplified = simplifyPolygon(contour, epsilon);
  if (simplified.length < 3) simplified = simplifyPolygon(contour, epsilon / 4);
  if (simplified.length < 3) simplified = contour.slice();
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

  const aspect =
    photoWidth > 0 && photoHeight > 0 ? photoWidth / photoHeight : 4 / 3;

  // Compute the rect where fit="contain" places the image inside the canvas
  const imageRect = useMemo(() => {
    const cw = canvasSize.width;
    const ch = canvasSize.height;
    const canvasAspect = cw / ch;
    if (aspect > canvasAspect) {
      // image is wider than canvas → letterbox top/bottom
      const imgW = cw;
      const imgH = cw / aspect;
      return { x: 0, y: (ch - imgH) / 2, width: imgW, height: imgH };
    }
    // image is taller than canvas → letterbox left/right
    const imgH = ch;
    const imgW = ch * aspect;
    return { x: (cw - imgW) / 2, y: 0, width: imgW, height: imgH };
  }, [canvasSize.width, canvasSize.height, aspect]);

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

  const canvasFrameRef = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const node = canvasFrameRef.current as unknown as HTMLElement | null;
    if (!node) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, savedZoom.current * factor));

      const rect = node.getBoundingClientRect();
      const border = BorderWidth.thick;
      const cursorX = e.clientX - rect.left - border;
      const cursorY = e.clientY - rect.top - border;
      const cx = canvasSize.width / 2;
      const cy = canvasSize.height / 2;

      const scaleRatio = newScale / savedZoom.current;
      const newPanX = cursorX - cx - scaleRatio * (cursorX - cx - savedPanX.current);
      const newPanY = cursorY - cy - scaleRatio * (cursorY - cy - savedPanY.current);

      const clamped = clampPan(newPanX, newPanY, newScale);
      setZoom(newScale);
      setPanX(clamped.x);
      setPanY(clamped.y);
      savedZoom.current = newScale;
      savedPanX.current = clamped.x;
      savedPanY.current = clamped.y;
    };

    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => node.removeEventListener("wheel", handleWheel);
  }, [canvasSize.width, canvasSize.height, clampPan]);

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

  const [drawMode, setDrawMode] = useState<"auto" | "manual">("auto");
  const [manualPoints, setManualPoints] = useState<Point[]>([]);

  const finishManualPolygon = useCallback(() => {
    if (manualPoints.length < 3) {
      setError("Need at least 3 points to create a hold.");
      return;
    }
    const hold = buildHoldFromPolygon(manualPoints);
    if (!hold) {
      setError("Polygon too small.");
      return;
    }
    const current = holdsRef.current;
    if (current.some((h) => polygonsOverlap(h.points, manualPoints))) {
      setError("That overlaps an existing hold.");
      return;
    }
    onChange([...current, hold]);
    setManualPoints([]);
    setDrawMode("auto");
    setError(null);
  }, [manualPoints, buildHoldFromPolygon, onChange]);

  const cancelManualPolygon = useCallback(() => {
    setManualPoints([]);
    setDrawMode("auto");
    setError(null);
  }, []);

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

  const dragGesture = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .minPointers(1)
        .maxPointers(1)
        .minDistance(10)
        .enabled(zoom > 1)
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
          // Undo zoom/pan to get canvas-space coordinates
          const canvasX = (event.x - cx - panX) / zoom + cx;
          const canvasY = (event.y - cy - panY) / zoom + cy;
          // Convert canvas-space to image-normalized [0,1] using imageRect
          const nx = (canvasX - imageRect.x) / imageRect.width;
          const ny = (canvasY - imageRect.y) / imageRect.height;
          if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return;
          if (drawMode === "manual") {
            setManualPoints((pts) => [...pts, { x: nx, y: ny }]);
            return;
          }
          if (tryRemoveHoldAt(nx, ny)) return;
          detectAtNormalized(nx, ny);
        }),
    [canvasSize.width, canvasSize.height, detecting, encoding, zoom, panX, panY, drawMode, imageRect, detectAtNormalized, tryRemoveHoldAt],
  );

  const composedGesture = useMemo(
    () =>
      Gesture.Race(
        doubleTapGesture,
        Gesture.Simultaneous(pinchGesture, panGesture),
        dragGesture,
        tapGesture,
      ),
    [doubleTapGesture, pinchGesture, panGesture, dragGesture, tapGesture],
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
    if (drawMode === "manual") return "Tap corners of the hold to draw its outline. Press DONE when finished.";
    if (samState.status === "error") return `Model error: ${samState.message}`;
    if (samState.status === "unavailable") return "Using color-based detection (no native module).";
    if (holds.length === 0) return "Tap a hold to outline it. Use DRAW for tricky holds.";
    return "Tap empty space to add. Tap a hold to remove. Double-tap to reset zoom.";
  })();

  return (
    <View style={styles.wrapper} testID={testID}>
      <View
        ref={canvasFrameRef}
        style={styles.canvasFrame}
        onLayout={handleLayout}
      >
        <GestureDetector gesture={composedGesture}>
            <View style={{ width: canvasSize.width, height: canvasSize.height }}>
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
                    fit="contain"
                    x={0}
                    y={0}
                    width={canvasSize.width}
                    height={canvasSize.height}
                  />
                )}
                {holds.map((hold) => (
                  <Path
                    key={hold.id}
                    path={buildClosedPath(hold.points, imageRect)}
                    color={hold.color}
                    opacity={0.4}
                    style="fill"
                  />
                ))}
                {holds.map((hold) => (
                  <Path
                    key={`${hold.id}-stroke`}
                    path={buildClosedPath(hold.points, imageRect)}
                    color={hold.color}
                    style="stroke"
                    strokeWidth={3 / zoom}
                  />
                ))}
                {manualPoints.length > 1 &&
                  manualPoints.map((p, i) => {
                    if (i === 0) return null;
                    const prev = manualPoints[i - 1];
                    return (
                      <Line
                        key={`manual-line-${i}`}
                        p1={{ x: imageRect.x + prev.x * imageRect.width, y: imageRect.y + prev.y * imageRect.height }}
                        p2={{ x: imageRect.x + p.x * imageRect.width, y: imageRect.y + p.y * imageRect.height }}
                        color={color}
                        strokeWidth={2 / zoom}
                        style="stroke"
                      />
                    );
                  })}
                {manualPoints.map((p, i) => (
                  <Circle
                    key={`manual-pt-${i}`}
                    cx={imageRect.x + p.x * imageRect.width}
                    cy={imageRect.y + p.y * imageRect.height}
                    r={5 / zoom}
                    color={color}
                  />
                ))}
              </Group>
            </Canvas>
          </View>
        </GestureDetector>
        {isLoading && (
          <View style={[styles.overlay, { pointerEvents: "none" }]}>
            <ActivityIndicator size="small" />
            {statusLabel && (
              <ThemedText style={styles.overlayText}>{statusLabel}</ThemedText>
            )}
          </View>
        )}
        {zoom > 1.05 && (
          <View style={[styles.zoomBadge, { pointerEvents: "none" }]}>
            <ThemedText style={styles.zoomText}>
              {zoom.toFixed(1)}x
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        {drawMode === "auto" && (
          <Button
            onPress={() => setDrawMode("manual")}
            testID="hold-editor-draw"
            style={styles.secondary}
          >
            DRAW
          </Button>
        )}
        {drawMode === "manual" && (
          <Button
            onPress={finishManualPolygon}
            testID="hold-editor-done"
            disabled={manualPoints.length < 3}
          >
            DONE ({manualPoints.length} pts)
          </Button>
        )}
        {drawMode === "manual" && (
          <Button
            onPress={cancelManualPolygon}
            testID="hold-editor-cancel-draw"
            style={styles.secondary}
          >
            CANCEL
          </Button>
        )}
        {zoom > 1.05 && (
          <Button
            onPress={resetZoom}
            testID="hold-editor-reset-zoom"
            style={styles.secondary}
          >
            RESET ZOOM
          </Button>
        )}
        {holds.length > 0 && drawMode === "auto" && (
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
    wrapper: { gap: Spacing.three, flex: 1 },
    canvasFrame: {
      flex: 1,
      borderRadius: Radius.small,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      overflow: "hidden",
      backgroundColor: Media.backdrop,
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Media.scrim,
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
      backgroundColor: Media.badge,
      borderRadius: Radius.small,
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.one,
    },
    zoomText: {
      fontSize: 11,
      fontWeight: "800",
      color: Media.onMedia,
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
