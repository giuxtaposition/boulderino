import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "../themed-text";
import {
  BorderWidth,
  Radius,
  Spacing,
  Theme,
  onColor,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type TagProps = {
  color: string;
  border?: boolean;
  testID?: string;
  leftIcon?: React.ReactNode;
  size?: "small" | "medium" | "large";
  children: React.ReactNode;
};

export function Tag({
  color,
  size = "small",
  border,
  children,
  testID,
  leftIcon,
}: TagProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme, color), [theme]);
  return (
    <View
      style={[
        styles.tag,
        styles[size],
        { backgroundColor: color },
        border && styles.border,
      ]}
      testID={testID}
    >
      {leftIcon && leftIcon}
      <ThemedText
        variant="caption"
        style={{ color: onColor(color), fontWeight: "700" }}
      >
        {children}
      </ThemedText>
    </View>
  );
}

const makeStyles = (theme: Theme, color: string) =>
  StyleSheet.create({
    tag: {
      borderRadius: Radius.sm,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: Spacing.md,
    },
    small: {
      height: 20,
      paddingHorizontal: Spacing.md,
    },
    medium: {
      height: 24,
      paddingHorizontal: Spacing.lg,
    },
    large: {
      height: 28,
      paddingHorizontal: Spacing.xl,
    },
    border: {
      borderWidth: BorderWidth.thin,
      borderColor: onColor(color),
    },
  });
