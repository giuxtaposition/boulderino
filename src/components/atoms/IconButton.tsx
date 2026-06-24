import { ReactNode, useMemo } from "react";
import { Pressable, PressableProps, StyleSheet } from "react-native";

import {
  PressableState,
  Radius,
  Spacing,
  Theme,
  focusRing,
} from "@/constants/theme";
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
      style={(state: PressableState) => [
        styles.base,
        state.pressed && !disabled && styles.pressed,
        state.focused && styles.focused,
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
      borderRadius: Radius.small,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.two,
      alignItems: "center",
      justifyContent: "center",
    },
    pressed: {
      transform: [{ translateX: 3 }, { translateY: 3 }],
      opacity: 0.85,
      backgroundColor: theme.highlightMedium,
    },
    focused: focusRing(theme),
    disabled: {
      opacity: 0.5,
    },
  });
};
