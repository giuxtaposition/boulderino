import { useMemo } from 'react';
import { Pressable, PressableProps, StyleSheet } from 'react-native';

import { ThemedText } from '../themed-text';
import {
  BorderWidth,
  Radius,
  Theme,
  blockShadow,
} from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SwatchProps = Omit<PressableProps, 'children'> & {
  color: string;
  selected?: boolean;
};

export function Swatch({ color, selected, style, ...rest }: SwatchProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      {...rest}
      style={(state) => [
        styles.swatch,
        { backgroundColor: color },
        selected && styles.selected,
        typeof style === 'function' ? style(state) : style,
      ]}>
      {selected && <ThemedText style={styles.check}>✓</ThemedText>}
    </Pressable>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    swatch: {
      width: 44,
      height: 44,
      borderRadius: Radius.small,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selected: {
      borderWidth: BorderWidth.chunky + 1,
      ...blockShadow(theme, 3),
    },
    check: {
      color: '#0F172A',
      fontSize: 18,
      fontWeight: '900',
    },
  });
