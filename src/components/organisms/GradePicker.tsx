import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '../themed-text';
import {
  BorderWidth,
  PressableState,
  Radius,
  Spacing,
  Theme,
  blockShadow,
  focusRing,
  onColor,
} from '@/constants/theme';
import { GradeDefinition } from '@/domain/grading/GradeDefinition';
import { useTheme } from '@/hooks/use-theme';

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
        const isSelected = grade.value === selected;
        const textColor = onColor(grade.color);
        return (
          <Pressable
            key={grade.value}
            onPress={() => onSelect(grade.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            testID={`select-grade-${grade.value}`}
            style={({ pressed, focused }: PressableState) => [
              styles.option,
              { backgroundColor: grade.color },
              isSelected && styles.selected,
              pressed && styles.pressed,
              focused && styles.focused,
            ]}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              {grade.label}
            </ThemedText>
            <ThemedText
              style={[styles.meta, { color: textColor, opacity: 0.75 }]}>
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
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
    option: {
      flexGrow: 1,
      flexBasis: 96,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderRadius: Radius.small,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      minHeight: 52,
      justifyContent: 'center',
      gap: 2,
    },
    selected: {
      borderWidth: BorderWidth.chunky + 1,
      ...blockShadow(theme, 3),
    },
    pressed: { transform: [{ translateX: 2 }, { translateY: 2 }] },
    focused: focusRing(theme),
    label: { fontSize: 15, fontWeight: '800' },
    meta: { fontSize: 11, fontWeight: '700' },
  });
