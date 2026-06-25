import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { Button } from "@/components/atoms/Button";
import { ThemedText } from "@/components/themed-text";
import {
  BorderWidth,
  PressableState,
  Radius,
  Spacing,
  Theme,
  focusRing,
  outcomeColor,
} from "@/constants/theme";
import { Attempt } from "@/domain/route/Attempt";
import { useTheme } from "@/hooks/use-theme";
import { Tag } from "../atoms/Tag";

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
  readonly onDelete?: (attemptId: string) => void;
  readonly testID?: string;
}

export function AttemptList({
  attempts,
  photoUri,
  photoWidth,
  photoHeight,
  onDelete,
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
        <AttemptItem
          key={attempt.id}
          attempt={attempt}
          photoUri={photoUri}
          photoWidth={photoWidth}
          photoHeight={photoHeight}
          styles={styles}
          theme={theme}
          onDelete={onDelete}
        />
      ))}
    </View>
  );
}

interface AttemptItemProps {
  readonly attempt: Attempt;
  readonly photoUri: string;
  readonly photoWidth: number;
  readonly photoHeight: number;
  readonly styles: ReturnType<typeof makeStyles>;
  readonly theme: Theme;
  readonly onDelete?: (attemptId: string) => void;
}

function AttemptItem({
  attempt,
  photoUri,
  photoWidth,
  photoHeight,
  styles,
  theme,
  onDelete,
}: AttemptItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const toggle = useCallback(() => setExpanded((prev) => !prev), []);
  const bg = outcomeColor(theme, attempt.outcome);

  return (
    <View style={styles.item} testID={`attempt-item-${attempt.id}`}>
      <View style={styles.header}>
        <ThemedText style={styles.date}>
          {dateFormatter.format(attempt.date)}
        </ThemedText>
        <Tag color={bg}>{attempt.outcome.toUpperCase()}</Tag>
      </View>
      {attempt.notes ? (
        <ThemedText style={styles.notes}>{attempt.notes}</ThemedText>
      ) : null}
      {attempt.fallHold ? (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            onPress={toggle}
            testID={`attempt-item-${attempt.id}-toggle`}
            style={(state: PressableState) => [
              styles.toggle,
              state.pressed && styles.togglePressed,
              state.focused && styles.toggleFocused,
            ]}
          >
            <ThemedText style={styles.toggleText}>
              {expanded ? "Hide fall hold ▴" : "Show fall hold ▾"}
            </ThemedText>
          </Pressable>
          {expanded ? (
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
        </>
      ) : null}
      {onDelete ? (
        <View style={styles.actionRow}>
          {confirmingDelete ? (
            <>
              <Button
                size="small"
                action="negative"
                onPress={() => {
                  onDelete(attempt.id);
                  setConfirmingDelete(false);
                }}
                testID={`attempt-item-${attempt.id}-confirm-delete`}
              >
                CONFIRM
              </Button>
              <Button
                size="small"
                onPress={() => setConfirmingDelete(false)}
                testID={`attempt-item-${attempt.id}-cancel-delete`}
              >
                CANCEL
              </Button>
            </>
          ) : (
            <Button
              size="small"
              action="negative"
              onPress={() => setConfirmingDelete(true)}
              testID={`attempt-item-${attempt.id}-delete`}
            >
              DELETE
            </Button>
          )}
        </View>
      ) : null}
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
    toggle: {
      alignSelf: "flex-start",
      paddingVertical: Spacing.one,
      paddingHorizontal: Spacing.two,
      borderRadius: Radius.small,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      backgroundColor: theme.inputBackground,
      minHeight: 32,
      justifyContent: "center",
    },
    togglePressed: { transform: [{ translateX: 2 }, { translateY: 2 }] },
    toggleFocused: focusRing(theme),
    toggleText: {
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.5,
      color: theme.text,
    },
    actionRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.two,
    },
  });
