import { lazy, Suspense, useMemo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import {
  BorderWidth,
  Radius,
  Spacing,
  Theme,
  onColor,
  outcomeColor,
} from "@/constants/theme";
import { Attempt } from "@/domain/route/Attempt";
import { useTheme } from "@/hooks/use-theme";

const HoldOverlay = lazy(() => import("./HoldOverlay"));

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export interface AttemptListProps {
  readonly attempts: readonly Attempt[];
  readonly photoUri: string;
  readonly photoWidth: number;
  readonly photoHeight: number;
  readonly testID?: string;
}

export function AttemptList({
  attempts,
  photoUri,
  photoWidth,
  photoHeight,
  testID,
}: AttemptListProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const sorted = useMemo(
    () => [...attempts].sort((a, b) => b.date.getTime() - a.date.getTime()),
    [attempts],
  );

  if (sorted.length === 0) {
    return (
      <View style={styles.empty} testID={`${testID}-empty`}>
        <ThemedText style={styles.emptyText}>
          No attempts logged yet.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.list} testID={testID}>
      {sorted.map((attempt) => (
        <View
          key={attempt.id}
          style={styles.item}
          testID={`attempt-item-${attempt.id}`}
        >
          <View style={styles.header}>
            <ThemedText style={styles.date}>
              {dateFormatter.format(attempt.date)}
            </ThemedText>
            <View
              style={[
                styles.outcomeTag,
                { backgroundColor: outcomeColor(theme, attempt.outcome) },
              ]}
            >
              <ThemedText
                style={[
                  styles.outcomeText,
                  { color: onColor(outcomeColor(theme, attempt.outcome)) },
                ]}
              >
                {attempt.outcome.toUpperCase()}
              </ThemedText>
            </View>
          </View>
          {attempt.notes ? (
            <ThemedText style={styles.notes}>{attempt.notes}</ThemedText>
          ) : null}
          {attempt.fallHold ? (
            <Suspense
              fallback={
                <View style={styles.fallFrame}>
                  <ActivityIndicator />
                </View>
              }
            >
              <HoldOverlay
                photoUri={photoUri}
                photoWidth={photoWidth}
                photoHeight={photoHeight}
                holds={[attempt.fallHold]}
                accessibilityLabel="fall hold"
                style={styles.fallFrame}
              />
            </Suspense>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    list: { gap: Spacing.three },
    empty: {
      padding: Spacing.four,
      borderWidth: BorderWidth.thick,
      borderStyle: "dashed",
      borderColor: theme.borderMuted,
      borderRadius: Radius.medium,
      alignItems: "center",
    },
    emptyText: { color: theme.textSecondary, fontWeight: "700" },
    item: {
      gap: Spacing.two,
      padding: Spacing.three,
      backgroundColor: theme.overlay,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      borderRadius: Radius.small,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: Spacing.two,
    },
    date: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.text,
    },
    outcomeTag: {
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      borderRadius: Radius.small,
      paddingVertical: Spacing.half,
      paddingHorizontal: Spacing.two,
    },
    outcomeText: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1,
      color: theme.text,
    },
    notes: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 20,
    },
    fallFrame: {
      width: "100%",
      borderRadius: Radius.small,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      overflow: "hidden",
    },
  });
