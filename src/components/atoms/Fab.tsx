import { useMemo } from "react";
import { Platform, Pressable, PressableProps, StyleSheet } from "react-native";

import {
  onColor,
  PressableState,
  Radius,
  Spacing,
  Theme,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Plus } from "lucide-react-native";

type FabProps = Omit<PressableProps, "children"> & {
  color?: string;
};

export function Fab({ style, color, disabled, ...rest }: FabProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled === true }}
      {...rest}
      style={(state: PressableState) => [
        styles.base,
        color ? { backgroundColor: color } : { backgroundColor: theme.blue },
        state.pressed && !disabled && styles.pressed,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <Plus color={color ? onColor(color) : onColor(theme.blue)} />
    </Pressable>
  );
}

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    base: {
      borderRadius: Radius.pill,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.two,
      alignItems: "center",
      justifyContent: "center",
      color: theme.text,
      width: 56,
      height: 56,
      position: "absolute",
      bottom: Platform.OS === "web" ? 80 : 20,
      right: 30,
      elevation: 5,
      shadowColor: "#000", // For iOS shadow
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    pressed: {
      transform: [{ translateX: 3 }, { translateY: 3 }],
      opacity: 0.85,
    },
  });
};
