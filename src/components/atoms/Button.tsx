import { ReactNode, useMemo } from "react";
import { Pressable, PressableProps, StyleSheet } from "react-native";

import { ThemedText } from "../themed-text";
import {
  BorderWidth,
  Radius,
  RainbowTokens,
  Spacing,
  Theme,
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
      hitSlop={
        size === "small" ? { top: 4, bottom: 4, left: 4, right: 4 } : undefined
      }
      {...rest}
      style={(state) => [
        styles.base,
        size === "small" && styles.small,
        styles[`${variant}_${action}`],
        state.pressed && !disabled && styles.pressed,
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
  const solidText = ({ on }: { bg: string; on: string }) => ({
    color: on,
  });
  const outlineText = () => ({
    color: theme.text,
  });
  const solidBox = ({ bg, on }: { bg: string; on: string }) => ({
    backgroundColor: bg,
    borderColor: on,
  });
  const outlineBox = ({ bg, on }: { bg: string; on: string }) => ({
    backgroundColor: "transparent",
    borderColor: bg,
  });

  return StyleSheet.create({
    base: {
      borderRadius: Radius.sm,
      borderWidth: BorderWidth.thick,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.xl,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 44,
    },
    small: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      minHeight: 44,
    },
    pressed: {
      transform: [{ translateX: 3 }, { translateY: 3 }],
      opacity: 0.85,
    },
    disabled: {
      opacity: 0.5,
    },
    text: {
      fontSize: 15,
      fontWeight: "800",
      letterSpacing: 0.8,
      textAlign: "center",
    },
    solid_primary: solidBox(RainbowTokens.navy),
    solid_secondary: solidBox(RainbowTokens.purple),
    solid_positive: solidBox(RainbowTokens.green),
    solid_negative: solidBox(RainbowTokens.red),
    solid_primary_text: solidText(RainbowTokens.navy),
    solid_secondary_text: solidText(RainbowTokens.purple),
    solid_positive_text: solidText(RainbowTokens.green),
    solid_negative_text: solidText(RainbowTokens.red),
    outline_primary: outlineBox(RainbowTokens.navy),
    outline_secondary: outlineBox(RainbowTokens.purple),
    outline_positive: outlineBox(RainbowTokens.green),
    outline_negative: outlineBox(RainbowTokens.red),
    outline_primary_text: outlineText(),
    outline_secondary_text: outlineText(),
    outline_positive_text: outlineText(),
    outline_negative_text: outlineText(),
  });
};
