import { ReactNode, useMemo } from "react";
import { Pressable, PressableProps, StyleSheet } from "react-native";

import { ThemedText } from "../themed-text";
import {
  BorderWidth,
  PressableState,
  Radius,
  Spacing,
  Theme,
  focusRing,
  onColor,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Variant = "solid" | "outline";
type Action = "primary" | "secondary" | "positive" | "negative";
type Size = "medium" | "small";

type ButtonProps = Omit<PressableProps, "children"> & {
  variant?: Variant;
  action?: Action;
  size?: Size;
  children: ReactNode;
};

export function Button({
  variant = "solid",
  size = "medium",
  action = "primary",
  style,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled === true }}
      hitSlop={size === "small" ? { top: 4, bottom: 4, left: 4, right: 4 } : undefined}
      {...rest}
      style={(state: PressableState) => [
        styles.base,
        size === "small" && styles.small,
        styles[`${variant}_${action}`],
        state.pressed && !disabled && styles.pressed,
        state.focused && styles.focused,
        disabled && styles.disabled,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <ThemedText style={[styles.text, styles[`${variant}_${action}_text`]]}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

const makeStyles = (theme: Theme) => {
  const solidText = (color: string) => ({ color: onColor(color) });
  const outlineText = (color: string) => ({ color });
  const solidBox = (color: string) => ({
    backgroundColor: color,
    borderColor: theme.text,
  });
  const outlineBox = (color: string) => ({
    backgroundColor: "transparent",
    borderColor: color,
  });

  return StyleSheet.create({
    base: {
      borderRadius: Radius.small,
      borderWidth: BorderWidth.thick,
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.four,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 44,
    },
    small: {
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      minHeight: 40,
    },
    pressed: {
      transform: [{ translateX: 3 }, { translateY: 3 }],
      opacity: 0.85,
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
    solid_primary: solidBox(theme.blue),
    solid_secondary: solidBox(theme.purple),
    solid_positive: solidBox(theme.green),
    solid_negative: solidBox(theme.red),
    solid_primary_text: solidText(theme.blue),
    solid_secondary_text: solidText(theme.purple),
    solid_positive_text: solidText(theme.green),
    solid_negative_text: solidText(theme.red),
    outline_primary: outlineBox(theme.blue),
    outline_secondary: outlineBox(theme.purple),
    outline_positive: outlineBox(theme.green),
    outline_negative: outlineBox(theme.red),
    outline_primary_text: outlineText(theme.blue),
    outline_secondary_text: outlineText(theme.purple),
    outline_positive_text: outlineText(theme.green),
    outline_negative_text: outlineText(theme.red),
  });
};
