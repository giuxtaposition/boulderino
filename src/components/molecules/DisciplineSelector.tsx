import { StyleSheet, View } from "react-native";

import { Chip } from "../atoms/Chip";
import { Spacing, Rainbow } from "@/constants/theme";
import { Discipline } from "@/domain/route/Discipline";

export const DISCIPLINES_OPTIONS: {
  value: Discipline;
  label: string;
  color: string;
}[] = [
  { value: "bouldering", label: "Boulder", color: Rainbow[1] },
  { value: "lead-sport", label: "Sport", color: Rainbow[3] },
  { value: "lead-trad", label: "Trad", color: Rainbow[6] },
];

type DisciplineSelectorProps = {
  value: Discipline;
  onChange: (next: Discipline) => void;
};

export function DisciplineSelector({
  value,
  onChange,
}: DisciplineSelectorProps) {
  return (
    <View style={styles.row} testID="discipline-options">
      {DISCIPLINES_OPTIONS.map((option) => (
        <Chip
          key={option.value}
          selected={option.value === value}
          selectedColor={option.color}
          onPress={() => onChange(option.value)}
          testID={`select-discipline-${option.value}`}
        >
          {option.label}
        </Chip>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: Spacing.two, flexWrap: "wrap" },
});
