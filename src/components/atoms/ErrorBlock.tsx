import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "../themed-text";
import { BorderWidth, Radius, Spacing, Theme } from "@/constants/theme";
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
      marginTop: Spacing.two,
      backgroundColor: theme.errorSurface,
      borderWidth: BorderWidth.thick,
      borderColor: theme.errorBorder,
      borderRadius: Radius.small,
      padding: Spacing.three,
      gap: Spacing.one,
    },
    label: {
      color: theme.errorText,
      fontWeight: "900",
      fontSize: 11,
      letterSpacing: 1.5,
    },
    text: {
      color: theme.errorText,
      fontWeight: "700",
    },
  });
