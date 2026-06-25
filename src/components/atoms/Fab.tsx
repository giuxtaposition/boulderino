import { useMemo } from "react";
import { Platform, Pressable, PressableProps, StyleSheet } from "react-native";

import { Radius, RainbowTokens, Spacing, Theme } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Plus } from "lucide-react-native";

type FabProps = Omit<PressableProps, "children"> & {
  backgroundColor?: string;
  color?: string;
};

export function Fab({
  style,
  backgroundColor,
  color,
  disabled,
  ...rest
}: FabProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled === true }}
      {...rest}
      style={(state) => [
        styles.base,
        backgroundColor
          ? { backgroundColor: backgroundColor }
          : { backgroundColor: RainbowTokens.navy.bg },
        state.pressed && !disabled && styles.pressed,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <Plus color={color ? color : RainbowTokens.navy.on} />
    </Pressable>
  );
}

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    base: {
      borderRadius: Radius.pill,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      alignItems: "center",
      justifyContent: "center",
      color: theme.text,
      width: 56,
      height: 56,
      position: "absolute",
      bottom: Platform.OS === "web" ? 80 : 20,
      right: 30,
      elevation: 5,
      boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)",
    },
    pressed: {
      transform: [{ translateX: 3 }, { translateY: 3 }],
      opacity: 0.85,
    },
  });
};
