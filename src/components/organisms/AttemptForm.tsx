import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Button } from "@/components/atoms/Button";
import { Chip } from "@/components/atoms/Chip";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { ThemedText } from "@/components/themed-text";
import {
  BorderWidth,
  Radius,
  Spacing,
  Theme,
} from "@/constants/theme";
import { AttemptOutcome } from "@/domain/route/Attempt";
import { Hold } from "@/domain/route/Hold";
import { useTheme } from "@/hooks/use-theme";

const HoldEditor = lazy(() => import("./HoldEditor"));

const OUTCOMES: readonly AttemptOutcome[] = ["sent", "fell", "flash"];

const outcomeColor: Record<AttemptOutcome, string> = {
  sent: "#22C55E",
  flash: "#FACC15",
  fell: "#EF4444",
};

export interface AttemptFormInput {
  readonly outcome: AttemptOutcome;
  readonly notes: string;
  readonly fallHold: Hold | null;
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
  const [fallHold, setFallHold] = useState<Hold | null>(null);
  const [markingFall, setMarkingFall] = useState(false);

  const editorHolds = useMemo(
    () => (fallHold ? [fallHold] : []),
    [fallHold],
  );

  const handleEditorChange = useCallback((next: readonly Hold[]) => {
    setFallHold(next.length > 0 ? next[next.length - 1] : null);
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit({ outcome, notes, fallHold });
  }, [outcome, notes, fallHold, onSubmit]);

  return (
    <View style={styles.form} testID={testID}>
      <View style={styles.field}>
        <Label>OUTCOME</Label>
        <View style={styles.chipRow}>
          {OUTCOMES.map((value) => (
            <Chip
              key={value}
              selected={outcome === value}
              selectedColor={outcomeColor[value]}
              onPress={() => setOutcome(value)}
              testID={`attempt-form-outcome-${value}`}
            >
              {value.toUpperCase()}
            </Chip>
          ))}
        </View>
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
        <Label>FALL HOLD</Label>
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
                holds={editorHolds}
                onChange={handleEditorChange}
                color={outcomeColor.fell}
                testID="attempt-form-hold-editor"
              />
            </Suspense>
            <View style={styles.editorActions}>
              <Button
                size="small"
                variant="ghost"
                onPress={() => {
                  setFallHold(null);
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
              {fallHold ? "Fall hold marked." : "No fall hold marked."}
            </ThemedText>
            <Button
              size="small"
              variant="dashed"
              onPress={() => setMarkingFall(true)}
              testID="attempt-form-mark-fall"
            >
              {fallHold ? "EDIT FALL HOLD" : "MARK FALL HOLD"}
            </Button>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Button onPress={handleSubmit} testID="attempt-form-save">
          SAVE ATTEMPT
        </Button>
        <Button
          variant="ghost"
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
      gap: Spacing.three,
      padding: Spacing.three,
      backgroundColor: "rgba(255,255,255,0.85)",
      borderWidth: BorderWidth.thick,
      borderColor: "#0F172A",
      borderRadius: Radius.small,
    },
    field: { gap: Spacing.one },
    chipRow: {
      flexDirection: "row",
      gap: Spacing.two,
      flexWrap: "wrap",
    },
    notesInput: {
      minHeight: 72,
      textAlignVertical: "top",
    },
    editorBlock: { gap: Spacing.two },
    editorPlaceholder: {
      minHeight: 200,
      alignItems: "center",
      justifyContent: "center",
    },
    editorActions: {
      flexDirection: "row",
      gap: Spacing.two,
      flexWrap: "wrap",
    },
    fallSummary: {
      gap: Spacing.two,
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
      gap: Spacing.two,
      flexDirection: "row",
      flexWrap: "wrap",
    },
  });
