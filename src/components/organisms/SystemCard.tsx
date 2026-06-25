import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "../atoms/Button";
import { ThemedText } from "../themed-text";
import {
  BorderWidth,
  Radius,
  Spacing,
  Theme,
  elevation,
  onColor,
} from "@/constants/theme";
import { GradingSystem } from "@/domain/grading/GradingSystem";
import { useTheme } from "@/hooks/use-theme";
import { Tag } from "../atoms/Tag";

type SystemCardProps = {
  system: GradingSystem;
  background: string;
  onDelete?: (name: string) => void;
  onEdit?: (name: string) => void;
};

export function SystemCard({
  system,
  background,
  onDelete,
  onEdit,
}: SystemCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const theme = useTheme();
  const styles = makeStyles(theme);
  const cardTextColor = onColor(background);

  return (
    <View
      testID={`system-row-${system.name}`}
      style={[
        styles.card,
        { backgroundColor: background, borderColor: cardTextColor },
      ]}
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
          return (
            <Tag
              border={true}
              key={grade.name}
              color={grade.color}
              size="large"
            >
              {grade.name}
            </Tag>
          );
        })}
      </View>
      {onDelete || onEdit ? (
        <View style={styles.actionRow}>
          {confirmingDelete ? (
            <>
              <Button
                size="small"
                action="negative"
                onPress={() => {
                  onDelete?.(system.name);
                  setConfirmingDelete(false);
                }}
                testID={`system-confirm-delete-${system.name}`}
              >
                CONFIRM
              </Button>
              <Button
                size="small"
                onPress={() => setConfirmingDelete(false)}
                testID={`system-cancel-delete-${system.name}`}
              >
                CANCEL
              </Button>
            </>
          ) : (
            <>
              {onEdit ? (
                <Button
                  size="small"
                  onPress={() => onEdit(system.name)}
                  testID={`system-edit-${system.name}`}
                >
                  EDIT
                </Button>
              ) : null}
              {onDelete ? (
                <Button
                  size="small"
                  action="negative"
                  onPress={() => setConfirmingDelete(true)}
                  testID={`system-delete-${system.name}`}
                >
                  DELETE
                </Button>
              ) : null}
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      borderWidth: BorderWidth.thick,
      borderRadius: Radius.md,
      padding: Spacing.lg,
      gap: Spacing.md,
      ...elevation(theme, "md"),
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
      gap: Spacing.md,
    },
    actionRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.md,
    },
  });
