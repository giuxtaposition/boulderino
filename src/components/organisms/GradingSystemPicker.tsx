import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "../themed-text";
import {
  BorderWidth,
  Radius,
  RainbowTokens,
  Spacing,
  Theme,
  onColor,
} from "@/constants/theme";
import { GradingSystem } from "@/domain/grading/GradingSystem";
import { useTheme } from "@/hooks/use-theme";

type GradingSystemPickerProps = {
  systems: readonly GradingSystem[];
  selected: string | null;
  onSelect: (systemName: string) => void;
};

const SELECTED_BG = RainbowTokens.navy.bg;
const SELECTED_TEXT = onColor(SELECTED_BG);

export function GradingSystemPicker({
  systems,
  selected,
  onSelect,
}: GradingSystemPickerProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.row} testID="route-system-options">
      {systems.map((system) => {
        const isSelected = system.name === selected;
        return (
          <Pressable
            key={system.name}
            onPress={() => onSelect(system.name)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            testID={`select-system-${system.name}`}
            style={({ pressed }) => [
              styles.option,
              isSelected && styles.optionSelected,
              pressed && styles.pressed,
            ]}
          >
            <ThemedText
              style={[
                styles.name,
                { color: isSelected ? SELECTED_TEXT : theme.text },
              ]}
            >
              {system.name}
            </ThemedText>
            <ThemedText
              style={[
                styles.meta,
                {
                  color: isSelected ? SELECTED_TEXT : theme.textSecondary,
                  opacity: isSelected ? 0.75 : 1,
                },
              ]}
            >
              {system.grades.length} grades
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
    option: {
      flexGrow: 1,
      flexBasis: 140,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: Radius.sm,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      backgroundColor: theme.surface1,
      minHeight: 56,
      justifyContent: "center",
      gap: Spacing.sm,
    },
    optionSelected: { backgroundColor: SELECTED_BG },
    pressed: { transform: [{ translateX: 2 }, { translateY: 2 }] },
    name: { fontSize: 16, fontWeight: "800" },
    meta: { fontSize: 11, fontWeight: "700" },
  });
