import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "../themed-text";
import {
  BorderWidth,
  Radius,
  Spacing,
  Theme,
  withAlpha,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type ErrorBlockProps = { message: string; testID?: string };

export function ErrorBlock({ message, testID }: ErrorBlockProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View
      testID={testID}
      style={styles.block}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <ThemedText style={styles.label}>⚠ ERROR</ThemedText>
      <ThemedText style={styles.text}>{message}</ThemedText>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    block: {
      marginTop: Spacing.md,
      backgroundColor: withAlpha(theme.danger, 0.12),
      borderWidth: BorderWidth.thick,
      borderColor: theme.danger,
      borderRadius: Radius.sm,
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    label: {
      color: theme.danger,
      fontWeight: "900",
      fontSize: 11,
      letterSpacing: 1.5,
    },
    text: {
      color: theme.danger,
      fontWeight: "700",
    },
  });
