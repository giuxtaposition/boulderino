import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "../themed-text";
import {
  BorderWidth,
  Radius,
  Spacing,
  Theme,
  elevation,
  onColor,
} from "@/constants/theme";
import { GradeDefinition } from "@/domain/grading/GradeDefinition";
import { useTheme } from "@/hooks/use-theme";

type GradePickerProps = {
  grades: readonly GradeDefinition[];
  selected: string | null;
  onSelect: (gradeValue: string) => void;
};

export function GradePicker({ grades, selected, onSelect }: GradePickerProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.row} testID="route-grade-options">
      {grades.map((grade) => {
        const isSelected = grade.name === selected;
        const textColor = onColor(grade.color);
        return (
          <Pressable
            key={grade.name}
            onPress={() => onSelect(grade.name)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            testID={`select-grade-${grade.name}`}
            style={({ pressed }) => [
              styles.option,
              { backgroundColor: grade.color, borderColor: textColor },
              isSelected && styles.selected,
              pressed && styles.pressed,
            ]}
          >
            {isSelected ? (
              <View style={[styles.checkBadge, { backgroundColor: textColor }]}>
                <ThemedText style={[styles.checkMark, { color: grade.color }]}>
                  ✓
                </ThemedText>
              </View>
            ) : null}
            <ThemedText
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.label,
                { color: textColor },
                isSelected && styles.labelSelected,
              ]}
            >
              {grade.name}
            </ThemedText>
            <ThemedText
              style={[styles.meta, { color: textColor, opacity: 0.75 }]}
            >
              #{grade.order}
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
      paddingLeft: Spacing.lg,
      paddingRight: Spacing.xxl + Spacing.sm,
      borderRadius: Radius.sm,
      borderWidth: BorderWidth.thick + 1,
      minHeight: 52,
      justifyContent: "center",
      gap: 2,
    },
    selected: {
      transform: [{ translateY: -2 }],
      ...elevation(theme, "lg"),
    },
    pressed: { transform: [{ translateX: 2 }, { translateY: 2 }] },
    label: { fontSize: 15, lineHeight: 20, fontWeight: "800" },
    labelSelected: { fontWeight: "900" },
    meta: { fontSize: 11, lineHeight: 14, fontWeight: "700" },
    checkBadge: {
      position: "absolute",
      top: 4,
      right: 4,
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
    },
    checkMark: { fontSize: 12, fontWeight: "900", lineHeight: 14 },
  });
