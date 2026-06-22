import { StyleSheet, View } from 'react-native';

import { ThemedText } from '../themed-text';
import {
  BorderWidth,
  Radius,
  Spacing,
  Theme,
  blockShadow,
} from '@/constants/theme';
import { GradingSystem } from '@/domain/grading/GradingSystem';
import { useTheme } from '@/hooks/use-theme';

type SystemCardProps = {
  system: GradingSystem;
  background: string;
};

export function SystemCard({ system, background }: SystemCardProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View
      testID={`system-row-${system.name}`}
      style={[styles.card, { backgroundColor: background }]}>
      <View style={styles.header}>
        <ThemedText style={styles.name}>{system.name}</ThemedText>
        <ThemedText style={styles.meta}>
          {system.grades.length} grades
        </ThemedText>
      </View>
      <View style={styles.chipRow}>
        {system.grades.map((grade) => (
          <View
            key={grade.value}
            style={[styles.chip, { backgroundColor: grade.color }]}
            testID={`system-grade-${system.name}-${grade.value}`}>
            <ThemedText style={styles.chipText}>{grade.label}</ThemedText>
            <ThemedText style={styles.chipMeta}>#{grade.order}</ThemedText>
          </View>
        ))}
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    name: {
      fontSize: 22,
      fontWeight: '800',
      color: '#0F172A',
      letterSpacing: -0.3,
    },
    meta: {
      fontSize: 11,
      fontWeight: '700',
      color: '#0F172A',
      opacity: 0.7,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.one,
      borderWidth: BorderWidth.thick,
      borderColor: '#0F172A',
      borderRadius: Radius.small,
      paddingVertical: Spacing.one,
      paddingHorizontal: Spacing.two,
    },
    chipText: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
    chipMeta: {
      fontSize: 10,
      fontWeight: '700',
      color: '#0F172A',
      opacity: 0.7,
    },
  });
