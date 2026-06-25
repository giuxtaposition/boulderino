import { useMemo, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";

import { Theme } from "@/constants/theme";
import { Hold, HoldPoint } from "@/domain/route/Hold";
import { useTheme } from "@/hooks/use-theme";

const buildPath = (
  points: readonly HoldPoint[],
  width: number,
  height: number,
) => {
  const builder = Skia.PathBuilder.Make();
  points.forEach((p, i) => {
    const x = p.x * width;
    const y = p.y * height;
    if (i === 0) builder.moveTo(x, y);
    else builder.lineTo(x, y);
  });
  builder.close();
  return builder.build();
};

export interface HoldOverlayProps {
  readonly photoUri: string;
  readonly photoWidth: number;
  readonly photoHeight: number;
  readonly holds: readonly Hold[];
  readonly accessibilityLabel?: string;
  readonly testID?: string;
  readonly style?: object;
}

export default function HoldOverlay({
  photoUri,
  photoWidth,
  photoHeight,
  holds,
  accessibilityLabel,
  testID,
  style,
}: HoldOverlayProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [size, setSize] = useState({ width: 1, height: 1 });
  const aspect =
    photoWidth > 0 && photoHeight > 0 ? photoWidth / photoHeight : 4 / 3;

  return (
    <View
      style={[styles.frame, { aspectRatio: aspect }, style]}
      testID={testID}
      onLayout={(event) =>
        setSize({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height,
        })
      }
    >
      <Image
        source={{ uri: photoUri }}
        style={StyleSheet.absoluteFill}
        accessibilityLabel={accessibilityLabel}
      />
      {holds.length > 0 && (
        <Canvas style={StyleSheet.absoluteFill}>
          {holds.map((hold) => (
            <Path
              key={hold.id}
              path={buildPath(hold.points, size.width, size.height)}
              color={hold.color}
              opacity={0.4}
              style="fill"
            />
          ))}
          {holds.map((hold) => (
            <Path
              key={`${hold.id}-stroke`}
              path={buildPath(hold.points, size.width, size.height)}
              color={hold.color}
              style="stroke"
              strokeWidth={3}
            />
          ))}
        </Canvas>
      )}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    frame: {
      width: "100%",
      overflow: "hidden",
      backgroundColor: theme.surface,
    },
  });
