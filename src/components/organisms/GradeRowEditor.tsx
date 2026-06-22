import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { ColorPicker } from '../molecules/ColorPicker';
import { FormField } from '../molecules/FormField';
import {
  BorderWidth,
  Radius,
  Spacing,
  Theme,
} from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type GradeRowValue = {
  value: string;
  label: string;
  color: string;
  order: string;
};

type GradeRowEditorProps = {
  index: number;
  row: GradeRowValue;
  removable: boolean;
  onChange: (patch: Partial<GradeRowValue>) => void;
  onRemove: () => void;
};

export function GradeRowEditor({
  index,
  row,
  removable,
  onChange,
  onRemove,
}: GradeRowEditorProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.card} testID={`grade-row-${index}`}>
      <View style={styles.row}>
        <View style={styles.valueField}>
          <FormField label="Value" variant="small">
            <Input
              placeholder="5.10a"
              value={row.value}
              onChangeText={(value) => onChange({ value })}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel={`grade ${index + 1} value`}
              testID={`input-grade-value-${index}`}
            />
          </FormField>
        </View>
        <View style={styles.orderField}>
          <FormField label="Order" variant="small">
            <Input
              value={row.order}
              onChangeText={(order) => onChange({ order })}
              keyboardType="numeric"
              accessibilityLabel={`grade ${index + 1} order`}
              testID={`input-grade-order-${index}`}
              style={styles.orderInput}
            />
          </FormField>
        </View>
      </View>

      <FormField label="Label" variant="small">
        <Input
          placeholder="Display label (optional)"
          value={row.label}
          onChangeText={(label) => onChange({ label })}
          autoCorrect={false}
          accessibilityLabel={`grade ${index + 1} label`}
          testID={`input-grade-label-${index}`}
        />
      </FormField>

      <FormField label="Color" variant="small">
        <ColorPicker
          value={row.color}
          onChange={(color) => onChange({ color })}
          testIDPrefix={`select-grade-color-${index}`}
          accessibilityPrefix={`grade ${index + 1}`}
        />
      </FormField>

      {removable && (
        <Button
          variant="danger"
          size="small"
          onPress={onRemove}
          accessibilityLabel={`remove grade ${index + 1}`}
          testID={`remove-grade-row-${index}`}
          style={styles.removeButton}>
          REMOVE
        </Button>
      )}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      borderWidth: BorderWidth.thick,
      borderColor: theme.borderMuted,
      borderRadius: Radius.small,
      padding: Spacing.three,
      gap: Spacing.two,
      backgroundColor: theme.inputBackground,
    },
    row: {
      flexDirection: 'row',
      gap: Spacing.two,
      alignItems: 'flex-end',
    },
    valueField: { flex: 1 },
    orderField: { width: 80 },
    orderInput: { textAlign: 'center' },
    removeButton: { alignSelf: 'flex-start' },
  });
