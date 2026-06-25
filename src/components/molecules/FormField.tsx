import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Label } from '../atoms/Label';
import { Spacing } from '@/constants/theme';

type FormFieldProps = {
  label: string;
  variant?: 'default' | 'small';
  helper?: ReactNode;
  children: ReactNode;
};

export function FormField({
  label,
  variant = 'default',
  helper,
  children,
}: FormFieldProps) {
  return (
    <View style={styles.field}>
      <View style={styles.header}>
        <Label variant={variant}>{label}</Label>
        {helper}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: Spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
});
