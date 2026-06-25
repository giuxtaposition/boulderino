import { ReactNode, useMemo } from "react";
import { Pressable, PressableProps, StyleSheet } from "react-native";

import { Radius, Spacing, Theme } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type IconButtonProps = Omit<PressableProps, "children"> & {
  children: ReactNode;
};

export function IconButton({
  style,
  children,
  disabled,
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
        state.pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
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
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      alignItems: "center",
      justifyContent: "center",
    },
    pressed: {
      transform: [{ translateX: 3 }, { translateY: 3 }],
      opacity: 0.85,
      backgroundColor: theme.surface3,
    },
    disabled: {
      opacity: 0.5,
    },
  });
};
