import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '../themed-text';
import {
  BorderWidth,
  Radius,
  Spacing,
  Theme,
} from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type EmptyBlockProps = { message: string; testID?: string };

export function EmptyBlock({ message, testID }: EmptyBlockProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View testID={testID} style={styles.block}>
      <ThemedText style={styles.text}>{message}</ThemedText>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    block: {
      padding: Spacing.xxl,
      borderWidth: BorderWidth.thick,
      borderStyle: 'dashed',
      borderColor: theme.borderMuted,
      borderRadius: Radius.md,
      alignItems: 'center',
    },
    text: { color: theme.textSecondary, fontWeight: '600' },
  });
