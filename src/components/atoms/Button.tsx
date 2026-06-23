import { ReactNode, useMemo } from "react";
import { Pressable, PressableProps, StyleSheet } from "react-native";

import { ThemedText } from "../themed-text";
import {
  BorderWidth,
  PressableState,
  Radius,
  Spacing,
  Theme,
  blockShadow,
  focusRing,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Variant = "primary" | "ghost" | "danger" | "dashed";
type Size = "medium" | "small";

type ButtonProps = Omit<PressableProps, "children"> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "medium",
  style,
  children,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: rest.disabled === true }}
      {...rest}
      style={(state: PressableState) => [
        styles.base,
        size === "small" && styles.small,
        styles[variant],
        state.pressed && !rest.disabled && styles.pressed,
        state.focused && styles.focused,
        rest.disabled && styles.disabled,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <ThemedText style={[styles.text, styles[`${variant}Text`]]}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      borderRadius: Radius.small,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.four,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 52,
    },
    small: {
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      minHeight: 44,
    },
    pressed: {
      transform: [{ translateX: 3 }, { translateY: 3 }],
    },
    focused: focusRing(theme),
    disabled: {
      opacity: 0.5,
    },
    text: {
      fontSize: 15,
      fontWeight: "800",
      letterSpacing: 0.8,
      textAlign: "center",
    },
    primary: {
      backgroundColor: theme.accent,
      borderWidth: BorderWidth.chunky,
      ...blockShadow(theme),
    },
    primaryText: { color: theme.accentText },
    ghost: {
      backgroundColor: theme.inputBackground,
    },
    ghostText: { color: theme.text },
    danger: {
      backgroundColor: theme.dangerSurface,
      borderColor: theme.dangerBorder,
    },
    dangerText: {
      color: theme.dangerText,
    },
    dashed: {
      backgroundColor: theme.inputBackground,
      borderStyle: "dashed",
    },
    dashedText: {
      color: theme.text,
    },
  });
