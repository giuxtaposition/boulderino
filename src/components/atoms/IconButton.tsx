import { ReactNode, useMemo } from "react";
import { Pressable, PressableProps, StyleSheet } from "react-native";

import {
  BorderWidth,
  Radius,
  Spacing,
  Theme,
  elevation,
  withAlpha,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type IconButtonProps = Omit<PressableProps, "children"> & {
  children: ReactNode;
  backgroundColor?: string;
  border?: boolean;
};

export function IconButton({
  style,
  children,
  disabled,
  backgroundColor,
  border = false,
  ...rest
}: IconButtonProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled === true }}
      {...rest}
      style={(state) => [
        styles.base,
        border && styles.border,
        state.pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        backgroundColor && { backgroundColor },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    base: {
      borderRadius: Radius.sm,
      padding: Spacing.md,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 44,
      minHeight: 44,
    },
    border: {
      borderWidth: BorderWidth.thick,
      borderColor: theme.text,
      ...elevation(theme, "sm"),
    },
    pressed: {
      transform: [{ translateX: 2 }, { translateY: 2 }],
      opacity: 0.9,
    },
    disabled: {
      opacity: 0.4,
    },
  });
};
