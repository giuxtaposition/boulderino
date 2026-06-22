import { StyleSheet, View } from 'react-native';

import { Button } from '../atoms/Button';
import { GradeRowEditor, GradeRowValue } from './GradeRowEditor';

export type { GradeRowValue };
import { Spacing } from '@/constants/theme';

type GradeRowListProps = {
  rows: GradeRowValue[];
  onChangeRow: (index: number, patch: Partial<GradeRowValue>) => void;
  onRemoveRow: (index: number) => void;
  onAddRow: () => void;
};

export function GradeRowList({
  rows,
  onChangeRow,
  onRemoveRow,
  onAddRow,
}: GradeRowListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.list}>
        {rows.map((row, index) => (
          <GradeRowEditor
            key={index}
            index={index}
            row={row}
            removable={rows.length > 1}
            onChange={(patch) => onChangeRow(index, patch)}
            onRemove={() => onRemoveRow(index)}
          />
        ))}
      </View>
      <Button variant="dashed" onPress={onAddRow} testID="add-grade-row">
        + ADD GRADE
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.two },
  list: { gap: Spacing.two },
});
