import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/atoms/Button";
import { EmptyBlock } from "@/components/atoms/EmptyBlock";
import { ErrorBlock } from "@/components/atoms/ErrorBlock";
import { FormCard } from "@/components/atoms/FormCard";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import {
  GradeRowList,
  GradeRowValue,
} from "@/components/organisms/GradeRowList";
import { SystemCard } from "@/components/organisms/SystemCard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  BottomTabHeight,
  MaxContentWidth,
  Spacing,
  Theme,
  pickRainbowColor,
} from "@/constants/theme";
import { useContainer } from "@/composition/Container";
import { GradeDefinition } from "@/domain/grading/GradeDefinition";
import { GradingSystem } from "@/domain/grading/GradingSystem";
import { useTheme } from "@/hooks/use-theme";

const emptyRow = (index: number): GradeRowValue => ({
  name: "",
  color: pickRainbowColor(index),
  order: String(index + 1),
});

const rowsToDefinitions = (rows: GradeRowValue[]): GradeDefinition[] =>
  rows
    .map((row) => ({
      name: row.name.trim(),
      color: row.color,
      order: Number.parseInt(row.order, 10),
    }))
    .filter((grade) => grade.name.length > 0);

export default function GradingSystemsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { addGradingSystem, deleteGradingSystem, gradingSystemRegistry } =
    useContainer();

  const [name, setName] = useState("");
  const [rows, setRows] = useState<GradeRowValue[]>(() => [emptyRow(0)]);
  const [systems, setSystems] = useState<GradingSystem[]>(() =>
    gradingSystemRegistry.findAll(),
  );
  const [error, setError] = useState<string | null>(null);

  const updateRow = (index: number, patch: Partial<GradeRowValue>) =>
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );

  const addRow = () => setRows((prev) => [...prev, emptyRow(prev.length)]);

  const removeRow = (index: number) =>
    setRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );

  const handleDelete = (name: string) => {
    try {
      deleteGradingSystem.execute({ name });
      setSystems(gradingSystemRegistry.findAll());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSubmit = () => {
    try {
      addGradingSystem.execute({
        name: name.trim(),
        grades: rowsToDefinitions(rows),
      });
      setSystems(gradingSystemRegistry.findAll());
      setName("");
      setRows([emptyRow(0)]);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText style={styles.kicker}>GRADES · LEVEL 01</ThemedText>
            <ThemedText style={styles.heading}>Grading systems</ThemedText>
          </View>

          <FormCard testID="form-grading-system">
            <FormField label="System name">
              <Input
                placeholder="e.g. YDS"
                value={name}
                onChangeText={setName}
                accessibilityLabel="grading system name"
                autoCapitalize="characters"
                autoCorrect={false}
                testID="input-system-name"
              />
            </FormField>

            <FormField
              label="Grades"
              helper={
                <ThemedText style={styles.helper}>
                  Easiest = lowest order
                </ThemedText>
              }
            >
              <GradeRowList
                rows={rows}
                onChangeRow={updateRow}
                onRemoveRow={removeRow}
                onAddRow={addRow}
              />
            </FormField>

            <Button
              onPress={handleSubmit}
              testID="submit-system"
              style={styles.submit}
            >
              SAVE GRADING SYSTEM
            </Button>

            {error && <ErrorBlock testID="error-system" message={error} />}
          </FormCard>

          <View testID="list-systems" style={styles.list}>
            {systems.length === 0 ? (
              <EmptyBlock message="No grading systems yet. Add your first." />
            ) : (
              systems.map((system, index) => (
                <SystemCard
                  key={system.name}
                  system={system}
                  background={pickRainbowColor(index)}
                  onDelete={handleDelete}
                />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    scroll: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.four,
      paddingBottom: BottomTabHeight + Spacing.six,
      gap: Spacing.five,
      maxWidth: MaxContentWidth,
      width: "100%",
      alignSelf: "center",
    },
    header: { gap: Spacing.one },
    kicker: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 2,
      color: theme.textSecondary,
    },
    heading: {
      fontSize: 30,
      fontWeight: "800",
      letterSpacing: -0.5,
      color: theme.text,
    },
    helper: { fontSize: 11, color: theme.textMuted, fontWeight: "600" },
    submit: { marginTop: Spacing.three },
    list: { gap: Spacing.three },
  });
