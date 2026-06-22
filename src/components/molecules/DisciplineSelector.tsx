import { StyleSheet, View } from 'react-native';

import { Chip } from '../atoms/Chip';
import { Spacing, Tetromino } from '@/constants/theme';
import { Discipline } from '@/domain/route/Discipline';

const OPTIONS: { value: Discipline; label: string; color: string }[] = [
  { value: 'bouldering', label: 'Boulder', color: Tetromino.O },
  { value: 'lead-sport', label: 'Sport', color: Tetromino.J },
  { value: 'lead-trad', label: 'Trad', color: Tetromino.L },
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
      {OPTIONS.map((option) => (
        <Chip
          key={option.value}
          selected={option.value === value}
          selectedColor={option.color}
          onPress={() => onChange(option.value)}
          testID={`select-discipline-${option.value}`}>
          {option.label}
        </Chip>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
});
