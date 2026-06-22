import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '../themed-text';
import {
  BorderWidth,
  Radius,
  Spacing,
  Tetromino,
  Theme,
} from '@/constants/theme';
import { GradingSystem } from '@/domain/grading/GradingSystem';
import { useTheme } from '@/hooks/use-theme';

type GradingSystemPickerProps = {
  systems: readonly GradingSystem[];
  selected: string | null;
  onSelect: (systemName: string) => void;
};

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
            ]}>
            <ThemedText
              style={[styles.name, isSelected && styles.nameSelected]}>
              {system.name}
            </ThemedText>
            <ThemedText style={styles.meta}>
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
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
    option: {
      flexGrow: 1,
      flexBasis: 140,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderRadius: Radius.small,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      backgroundColor: theme.inputBackground,
      minHeight: 56,
      justifyContent: 'center',
      gap: Spacing.half,
    },
    optionSelected: { backgroundColor: Tetromino.I },
    pressed: { transform: [{ translateX: 2 }, { translateY: 2 }] },
    name: { fontSize: 16, fontWeight: '800', color: theme.text },
    nameSelected: { color: '#0F172A' },
    meta: { fontSize: 11, fontWeight: '700', color: theme.textSecondary },
  });
