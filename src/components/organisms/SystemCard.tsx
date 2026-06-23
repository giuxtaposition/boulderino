import { StyleSheet, View } from "react-native";

import { ThemedText } from "../themed-text";
import {
  BorderWidth,
  Radius,
  Spacing,
  Theme,
  blockShadow,
  onColor,
} from "@/constants/theme";
import { GradingSystem } from "@/domain/grading/GradingSystem";
import { useTheme } from "@/hooks/use-theme";

type SystemCardProps = {
  system: GradingSystem;
  background: string;
};

export function SystemCard({ system, background }: SystemCardProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const cardTextColor = onColor(background);

  return (
    <View
      testID={`system-row-${system.name}`}
      style={[styles.card, { backgroundColor: background }]}
    >
      <View style={styles.header}>
        <ThemedText style={[styles.name, { color: cardTextColor }]}>
          {system.name}
        </ThemedText>
        <ThemedText
          style={[styles.meta, { color: cardTextColor, opacity: 0.75 }]}
        >
          {system.grades.length} grades
        </ThemedText>
      </View>
      <View style={styles.chipRow}>
        {system.grades.map((grade) => {
          const chipTextColor = onColor(grade.color);
          return (
            <View
              key={grade.name}
              style={[
                styles.chip,
                {
                  backgroundColor: grade.color,
                  borderColor: theme.border,
                },
              ]}
              testID={`system-grade-${system.name}-${grade.name}`}
            >
              <ThemedText style={[styles.chipText, { color: chipTextColor }]}>
                {grade.name}
              </ThemedText>
              <ThemedText
                style={[
                  styles.chipMeta,
                  { color: chipTextColor, opacity: 0.75 },
                ]}
              >
                #{grade.order}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      borderWidth: BorderWidth.chunky,
      borderColor: theme.border,
      borderRadius: Radius.medium,
      padding: Spacing.three,
      gap: Spacing.two,
      ...blockShadow(theme),
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    name: {
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: -0.3,
    },
    meta: {
      fontSize: 11,
      fontWeight: "700",
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.two,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.one,
      borderWidth: BorderWidth.thick,
      borderRadius: Radius.small,
      paddingVertical: Spacing.one,
      paddingHorizontal: Spacing.two,
    },
    chipText: { fontSize: 13, fontWeight: "800" },
    chipMeta: { fontSize: 10, fontWeight: "700" },
  });
