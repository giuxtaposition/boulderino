import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/atoms/Button";
import { EmptyBlock } from "@/components/atoms/EmptyBlock";
import { ErrorBlock } from "@/components/atoms/ErrorBlock";
import { FormCardDrawer } from "@/components/atoms/FormCardDrawer";
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
import { Fab } from "../components/atoms/Fab";

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
  const {
    addGradingSystem,
    editGradingSystem,
    deleteGradingSystem,
    gradingSystemRegistry,
  } = useContainer();

  const [name, setName] = useState("");
  const [rows, setRows] = useState<GradeRowValue[]>(() => [emptyRow(0)]);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [systems, setSystems] = useState<GradingSystem[]>(() =>
    gradingSystemRegistry.findAll(),
  );
  const [showAddForm, setShowAddForm] = useState(false);
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

  const resetForm = () => {
    setName("");
    setRows([emptyRow(0)]);
    setEditingName(null);
    setError(null);
  };

  const handleDelete = (target: string) => {
    try {
      deleteGradingSystem.execute({ name: target });
      setSystems(gradingSystemRegistry.findAll());
      if (editingName === target) resetForm();
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEdit = (target: string) => {
    const system = gradingSystemRegistry.getByName(target);
    if (!system) return;
    setShowAddForm(true);
    setEditingName(system.name);
    setName(system.name);
    setRows(
      system.grades.map((grade) => ({
        name: grade.name,
        color: grade.color,
        order: String(grade.order),
      })),
    );
    setError(null);
  };

  const handleSubmit = () => {
    try {
      if (editingName) {
        editGradingSystem.execute({
          name: editingName,
          grades: rowsToDefinitions(rows),
        });
      } else {
        addGradingSystem.execute({
          name: name.trim(),
          grades: rowsToDefinitions(rows),
        });
      }
      setSystems(gradingSystemRegistry.findAll());
      resetForm();
      setShowAddForm(false);
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

          <View testID="list-systems" style={styles.list}>
            {systems.length === 0 ? (
              <EmptyBlock message="No grading systems yet. Add your first by clicking the + button." />
            ) : (
              systems.map((system, index) => (
                <SystemCard
                  key={system.name}
                  system={system}
                  background={pickRainbowColor(index)}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))
            )}
          </View>
          <FormCardDrawer
            testID="form-grading-system"
            visible={showAddForm}
            title={editingName ? "Edit grading system" : "Add grading system"}
            setVisible={setShowAddForm}
          >
            <FormField label="System name">
              <Input
                placeholder="e.g. YDS"
                value={name}
                onChangeText={setName}
                accessibilityLabel="grading system name"
                autoCapitalize="none"
                autoCorrect={false}
                testID="input-system-name"
                editable={editingName === null}
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
              {editingName ? "UPDATE GRADING SYSTEM" : "SAVE GRADING SYSTEM"}
            </Button>

            {editingName ? (
              <Button
                variant="outline"
                onPress={resetForm}
                testID="cancel-edit-system"
              >
                CANCEL EDIT
              </Button>
            ) : null}

            {error && <ErrorBlock testID="error-system" message={error} />}
          </FormCardDrawer>
        </ScrollView>

        <Fab onPress={() => setShowAddForm(true)} />
      </SafeAreaView>
    </ThemedView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    scroll: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.xl,
      paddingBottom: BottomTabHeight + Spacing.xxl,
      gap: Spacing.xxl,
      maxWidth: MaxContentWidth,
      width: "100%",
      alignSelf: "center",
    },
    header: { gap: Spacing.sm },
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
    helper: { fontSize: 11, color: theme.textSecondary, fontWeight: "600" },
    submit: { marginTop: Spacing.lg },
    list: { gap: Spacing.lg },
  });
