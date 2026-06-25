import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { Button } from "./Button";
import { ThemedText } from "../themed-text";
import {
  BorderWidth,
  Radius,
  Spacing,
  Theme,
  elevation,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const ITEM_HEIGHT = 40;
const VISIBLE_ROWS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
const CENTER_OFFSET = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2;

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTHS = Array.from({ length: 12 }, (_, i) => i);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const pad2 = (value: number) => value.toString().padStart(2, "0");

const daysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

const triggerFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

type DatePart = "month" | "day" | "hour" | "minute";

export type DateTimePickerProps = {
  value: Date;
  onChange: (date: Date) => void;
  testID?: string;
  accessibilityLabel?: string;
};

export function DateTimePicker({
  value,
  onChange,
  testID,
  accessibilityLabel,
}: DateTimePickerProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleOpen = useCallback(() => {
    setDraft(value);
    setOpen(true);
  }, [value]);

  const handleCancel = useCallback(() => setOpen(false), []);

  const handleConfirm = useCallback(() => {
    onChange(draft);
    setOpen(false);
  }, [draft, onChange]);

  const updateDraft = useCallback((part: DatePart, next: number) => {
    setDraft((current) => {
      const year = current.getFullYear();
      const month = part === "month" ? next : current.getMonth();
      const lastDay = daysInMonth(year, month);
      const day = part === "day" ? next : Math.min(current.getDate(), lastDay);
      const hour = part === "hour" ? next : current.getHours();
      const minute = part === "minute" ? next : current.getMinutes();
      return new Date(year, month, day, hour, minute);
    });
  }, []);

  const days = useMemo(
    () =>
      Array.from(
        { length: daysInMonth(draft.getFullYear(), draft.getMonth()) },
        (_, i) => i + 1,
      ),
    [draft],
  );

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? "select date and time"}
        onPress={handleOpen}
        testID={testID}
        style={(state) => [
          styles.trigger,
          state.pressed && styles.triggerPressed,
        ]}
      >
        <ThemedText style={styles.triggerText}>
          {triggerFormatter.format(value)}
        </ThemedText>
      </Pressable>

      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={handleCancel}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.backdrop}
            onPress={handleCancel}
            accessibilityLabel="dismiss date picker"
          />
          <View
            style={styles.sheet}
            testID={testID ? `${testID}-sheet` : undefined}
          >
            <ThemedText style={styles.sheetTitle}>DATE & TIME</ThemedText>

            <View style={styles.wheels}>
              <Wheel
                label="MON"
                data={MONTHS}
                value={draft.getMonth()}
                onChange={(v) => updateDraft("month", v)}
                format={(i) => MONTH_LABELS[i]}
              />
              <Wheel
                label="DAY"
                data={days}
                value={draft.getDate()}
                onChange={(v) => updateDraft("day", v)}
                format={pad2}
              />
              <Wheel
                label="HR"
                data={HOURS}
                value={draft.getHours()}
                onChange={(v) => updateDraft("hour", v)}
                format={pad2}
              />
              <Wheel
                label="MIN"
                data={MINUTES}
                value={draft.getMinutes()}
                onChange={(v) => updateDraft("minute", v)}
                format={pad2}
              />
            </View>

            <View style={styles.actions}>
              <Button
                onPress={handleConfirm}
                testID={testID ? `${testID}-confirm` : undefined}
              >
                DONE
              </Button>
              <Button
                variant="outline"
                action="secondary"
                onPress={handleCancel}
                testID={testID ? `${testID}-cancel` : undefined}
              >
                CANCEL
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

type WheelProps = {
  label: string;
  data: readonly number[];
  value: number;
  onChange: (value: number) => void;
  format: (item: number) => string;
};

function Wheel({ label, data, value, onChange, format }: WheelProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const ref = useRef<FlatList<number>>(null);
  const selectedIndex = data.indexOf(value);

  useEffect(() => {
    if (selectedIndex < 0) return;
    ref.current?.scrollToOffset({
      offset: selectedIndex * ITEM_HEIGHT,
      animated: false,
    });
  }, [selectedIndex]);

  const snapToIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(data.length - 1, index));
      ref.current?.scrollToOffset({
        offset: clamped * ITEM_HEIGHT,
        animated: true,
      });
      const next = data[clamped];
      if (next !== value) onChange(next);
    },
    [data, onChange, value],
  );

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      snapToIndex(Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT));
    },
    [snapToIndex],
  );

  return (
    <View style={styles.wheel}>
      <ThemedText style={styles.wheelLabel}>{label}</ThemedText>
      <View style={styles.wheelBody}>
        <View style={[styles.wheelSelection, { pointerEvents: "none" }]} />
        <FlatList
          ref={ref}
          data={data as number[]}
          extraData={value}
          keyExtractor={(item) => String(item)}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: index * ITEM_HEIGHT,
            index,
          })}
          contentContainerStyle={{ paddingVertical: CENTER_OFFSET }}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => snapToIndex(index)}
              style={styles.wheelItem}
              accessibilityRole="button"
              accessibilityLabel={format(item)}
            >
              <ThemedText
                style={[
                  styles.wheelText,
                  item === value && styles.wheelTextActive,
                ]}
              >
                {format(item)}
              </ThemedText>
            </Pressable>
          )}
        />
      </View>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    trigger: {
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      borderRadius: Radius.sm,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      backgroundColor: theme.surface1,
      minHeight: 48,
      justifyContent: "center",
    },
    triggerPressed: {
      transform: [{ translateX: 2 }, { translateY: 2 }],
      opacity: 0.85,
    },
    triggerText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "700",
    },
    modalRoot: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: Spacing.xl,
    },
    backdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.45)",
    },
    sheet: {
      width: "100%",
      maxWidth: 480,
      backgroundColor: theme.surface1,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      borderRadius: Radius.md,
      padding: Spacing.xl,
      gap: Spacing.lg,
      ...elevation(theme, "md"),
    },
    sheetTitle: {
      fontSize: 14,
      fontWeight: "800",
      letterSpacing: 1.5,
      color: theme.text,
      textAlign: "center",
    },
    wheels: {
      flexDirection: "row",
      gap: Spacing.md,
    },
    wheel: {
      flex: 1,
      gap: Spacing.md,
    },
    wheelLabel: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.2,
      color: theme.textSecondary,
      textAlign: "center",
    },
    wheelBody: {
      height: WHEEL_HEIGHT,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      borderRadius: Radius.sm,
      backgroundColor: theme.surface1,
      overflow: "hidden",
    },
    wheelSelection: {
      position: "absolute",
      left: 0,
      right: 0,
      top: CENTER_OFFSET,
      height: ITEM_HEIGHT,
      borderTopWidth: BorderWidth.thick,
      borderBottomWidth: BorderWidth.thick,
      borderColor: theme.border,
      backgroundColor: theme.brand, // TODO: check
      opacity: 0.3,
      zIndex: 1,
    },
    wheelItem: {
      height: ITEM_HEIGHT,
      alignItems: "center",
      justifyContent: "center",
    },
    wheelText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.textSecondary,
    },
    wheelTextActive: {
      color: theme.text,
      fontWeight: "800",
    },
    actions: {
      flexDirection: "row",
      gap: Spacing.md,
    },
  });
