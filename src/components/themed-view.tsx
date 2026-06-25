import { View, type ViewProps } from "react-native";

import { useTheme } from "@/hooks/use-theme";
import type { Theme } from "@/constants/theme";

type SurfaceKey = Extract<
  keyof Theme,
  "background" | "surface1" | "surface2" | "surface3"
>;

export type ThemedViewProps = ViewProps & {
  surface?: SurfaceKey;
};

export function ThemedView({
  style,
  surface = "background",
  ...otherProps
}: ThemedViewProps) {
  const theme = useTheme();

  return (
    <View
      style={[{ backgroundColor: theme[surface] }, style]}
      {...otherProps}
    />
  );
}
