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
  children: React.ReactNode;
};

export function Tag({ color, border, children, testID, leftIcon }: TagProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme, color), [theme]);
  return (
    <View
      style={[styles.tag, { backgroundColor: color }, border && styles.border]}
      testID={testID}
    >
      {leftIcon && leftIcon}
      <ThemedText type="extraSmallBold" style={[{ color: onColor(color) }]}>
        {children}
      </ThemedText>
    </View>
  );
}

const makeStyles = (theme: Theme, color: string) =>
  StyleSheet.create({
    tag: {
      borderRadius: Radius.small,
      paddingHorizontal: Spacing.two,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: Spacing.one,
    },
    border: {
      borderWidth: BorderWidth.thin,
      borderColor: onColor(color),
    },
  });
