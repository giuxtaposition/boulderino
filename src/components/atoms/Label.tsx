import { StyleSheet } from 'react-native';

import { ThemedText, ThemedTextProps } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';

type LabelProps = Omit<ThemedTextProps, 'variant'> & {
  variant?: 'default' | 'small';
};

export function Label({ variant = 'default', style, ...rest }: LabelProps) {
  const theme = useTheme();
  return (
    <ThemedText
      {...rest}
      style={[
        variant === 'small' ? styles.small : styles.default,
        { color: theme.textSecondary },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  small: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
