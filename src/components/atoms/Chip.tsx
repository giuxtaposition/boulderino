import { ReactNode, useMemo } from "react";
import { Pressable, PressableProps, StyleSheet } from "react-native";

import { ThemedText } from "../themed-text";
import {
  BorderWidth,
  Radius,
  Spacing,
  Theme,
  onColor,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type ChipProps = Omit<PressableProps, "children"> & {
  selected?: boolean;
  selectedColor?: string;
  children: ReactNode;
};

export function Chip({
  selected,
  selectedColor,
  style,
  children,
  ...rest
}: ChipProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const selectedTextColor =
    selected && selectedColor ? onColor(selectedColor) : theme.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      {...rest}
      style={(state) => [
        styles.chip,
        selected && selectedColor ? { backgroundColor: selectedColor } : null,
        state.pressed && styles.pressed,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <ThemedText
        style={[
          styles.text,
          { color: selectedTextColor },
          selected && styles.selectedText,
        ]}
      >
        {selected ? "✓ " : null}
        {children}
      </ThemedText>
    </Pressable>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    chip: {
      flexGrow: 1,
      flexBasis: 90,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: Radius.sm,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      backgroundColor: theme.surface1,
      minHeight: 44,
      justifyContent: "center",
      alignItems: "center",
    },
    pressed: { transform: [{ translateX: 2 }, { translateY: 2 }] },
    text: {
      fontSize: 14,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    selectedText: {
      fontWeight: "900",
    },
  });
