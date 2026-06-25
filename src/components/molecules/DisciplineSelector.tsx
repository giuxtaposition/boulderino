import { StyleSheet, View } from "react-native";

import { Chip } from "../atoms/Chip";
import { RainbowTokens, Spacing } from "@/constants/theme";
import { Discipline } from "@/domain/route/Discipline";

export const DISCIPLINES_OPTIONS: {
  value: Discipline;
  label: string;
  color: string;
}[] = [
  { value: "bouldering", label: "Boulder", color: RainbowTokens.yellow.bg },
  { value: "lead-sport", label: "Sport", color: RainbowTokens.cyan.bg },
  { value: "lead-trad", label: "Trad", color: RainbowTokens.purple.bg },
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
  row: { flexDirection: "row", gap: Spacing.md, flexWrap: "wrap" },
});
