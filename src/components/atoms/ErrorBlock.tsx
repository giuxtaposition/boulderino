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

type ErrorBlockProps = { message: string; testID?: string };

export function ErrorBlock({ message, testID }: ErrorBlockProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View
      testID={testID}
      style={styles.block}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert">
      <ThemedText style={styles.text}>{message}</ThemedText>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    block: {
      marginTop: Spacing.two,
      backgroundColor: theme.dangerSurface,
      borderWidth: BorderWidth.thick,
      borderColor: theme.dangerBorder,
      borderRadius: Radius.small,
      padding: Spacing.three,
    },
    text: {
      color: theme.dangerText,
      fontWeight: '700',
    },
  });
