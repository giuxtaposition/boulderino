import { ReactNode, useMemo } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import {
  BorderWidth,
  Radius,
  Spacing,
  Theme,
  blockShadow,
} from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FormCardProps = ViewProps & { children: ReactNode };

export function FormCard({ style, children, ...rest }: FormCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View {...rest} style={[styles.card, style]}>
      {children}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.backgroundElement,
      borderWidth: BorderWidth.chunky,
      borderColor: theme.border,
      borderRadius: Radius.medium,
      padding: Spacing.four,
      gap: Spacing.two,
      ...blockShadow(theme),
    },
  });
