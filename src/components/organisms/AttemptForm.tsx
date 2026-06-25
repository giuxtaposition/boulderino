import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Button } from "@/components/atoms/Button";
import { Chip } from "@/components/atoms/Chip";
import { DateTimePicker } from "@/components/atoms/DateTimePicker";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { ThemedText } from "@/components/themed-text";
import {
  BorderWidth,
  Radius,
  Spacing,
  Theme,
  outcomeColor,
} from "@/constants/theme";
import { AttemptOutcome } from "@/domain/route/Attempt";
import { Hold } from "@/domain/route/Hold";
import { useTheme } from "@/hooks/use-theme";

const HoldEditor = lazy(() => import("./HoldEditor"));

const OUTCOMES: readonly AttemptOutcome[] = ["sent", "fell", "flash"];

export interface AttemptFormInput {
  readonly outcome: AttemptOutcome;
  readonly notes: string;
  readonly fallHolds: readonly Hold[];
  readonly date?: Date;
}

export interface AttemptFormProps {
  readonly photoUri: string;
  readonly photoWidth: number;
  readonly photoHeight: number;
  readonly onSubmit: (input: AttemptFormInput) => void;
  readonly onCancel: () => void;
  readonly testID?: string;
}

export function AttemptForm({
  photoUri,
  photoWidth,
  photoHeight,
  onSubmit,
  onCancel,
  testID,
}: AttemptFormProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const [outcome, setOutcome] = useState<AttemptOutcome>("fell");
  const [notes, setNotes] = useState("");
  const [fallHolds, setFallHolds] = useState<readonly Hold[]>([]);
  const [markingFall, setMarkingFall] = useState(false);
  const [date, setDate] = useState<Date>(() => new Date());

  const handleEditorChange = useCallback((next: readonly Hold[]) => {
    setFallHolds(next);
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit({ outcome, notes, fallHolds, date });
  }, [outcome, notes, fallHolds, date, onSubmit]);

  return (
    <View style={styles.form} testID={testID}>
      <View style={styles.field}>
        <Label>OUTCOME</Label>
        <View style={styles.chipRow}>
          {OUTCOMES.map((value) => (
            <Chip
              key={value}
              selected={outcome === value}
              selectedColor={outcomeColor(theme, value)}
              onPress={() => setOutcome(value)}
              testID={`attempt-form-outcome-${value}`}
            >
              {value.toUpperCase()}
            </Chip>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Label>DATE</Label>
        <DateTimePicker
          value={date}
          onChange={setDate}
          testID="attempt-form-date"
        />
      </View>

      <View style={styles.field}>
        <Label>NOTES</Label>
        <Input
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional notes"
          multiline
          numberOfLines={3}
          style={styles.notesInput}
          testID="attempt-form-notes"
        />
      </View>

      <View style={styles.field}>
        <Label>FALL HOLDS</Label>
        {markingFall ? (
          <View style={styles.editorBlock}>
            <Suspense
              fallback={
                <View style={styles.editorPlaceholder}>
                  <ActivityIndicator />
                </View>
              }
            >
              <HoldEditor
                photoUri={photoUri}
                photoWidth={photoWidth}
                photoHeight={photoHeight}
                holds={fallHolds}
                onChange={handleEditorChange}
                color={outcomeColor(theme, "fell")}
                testID="attempt-form-hold-editor"
              />
            </Suspense>
            <View style={styles.editorActions}>
              <Button
                size="small"
                variant="outline"
                onPress={() => {
                  setFallHolds([]);
                  setMarkingFall(false);
                }}
                testID="attempt-form-clear-fall"
              >
                CLEAR
              </Button>
              <Button
                size="small"
                onPress={() => setMarkingFall(false)}
                testID="attempt-form-done-fall"
              >
                DONE
              </Button>
            </View>
          </View>
        ) : (
          <View style={styles.fallSummary}>
            <ThemedText style={styles.fallSummaryText}>
              {fallHolds.length > 0
                ? `${fallHolds.length} fall hold${fallHolds.length > 1 ? "s" : ""} marked.`
                : "No fall holds marked."}
            </ThemedText>
            <Button
              size="small"
              variant="outline"
              onPress={() => setMarkingFall(true)}
              testID="attempt-form-mark-fall"
            >
              {fallHolds.length > 0 ? "EDIT FALL HOLDS" : "MARK FALL HOLDS"}
            </Button>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Button onPress={handleSubmit} testID="attempt-form-save">
          SAVE ATTEMPT
        </Button>
        <Button
          variant="outline"
          action="secondary"
          onPress={onCancel}
          testID="attempt-form-cancel"
        >
          CANCEL
        </Button>
      </View>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    form: {
      gap: Spacing.lg,
      padding: Spacing.lg,
      backgroundColor: theme.surface1,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      borderRadius: Radius.sm,
    },
    field: { gap: Spacing.md },
    chipRow: {
      flexDirection: "row",
      gap: Spacing.md,
      flexWrap: "wrap",
    },
    notesInput: {
      minHeight: 72,
      textAlignVertical: "top",
    },
    editorBlock: { gap: Spacing.md },
    editorPlaceholder: {
      minHeight: 200,
      alignItems: "center",
      justifyContent: "center",
    },
    editorActions: {
      flexDirection: "row",
      gap: Spacing.md,
      flexWrap: "wrap",
    },
    fallSummary: {
      gap: Spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
    },
    fallSummaryText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: "600",
    },
    actions: {
      gap: Spacing.md,
      flexDirection: "row",
      flexWrap: "wrap",
    },
  });
