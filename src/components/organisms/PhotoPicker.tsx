import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '../themed-text';
import {
  BorderWidth,
  PressableState,
  Radius,
  Spacing,
  Theme,
  focusRing,
} from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type PickedPhoto = {
  uri: string;
  width: number;
  height: number;
};

type PhotoPickerProps = {
  photo: PickedPhoto | null;
  onPick: () => void;
};

export function PhotoPicker({ photo, onPick }: PhotoPickerProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Pressable
      onPress={onPick}
      accessibilityRole="button"
      testID="pick-photo-button"
      style={({ pressed, focused }: PressableState) => [
        styles.picker,
        pressed && styles.pressed,
        focused && styles.focused,
      ]}>
      {photo ? (
        <View style={styles.previewWrap}>
          <Image
            source={{ uri: photo.uri }}
            style={styles.preview}
            accessibilityLabel="selected route photo"
          />
          <ThemedText style={styles.meta}>
            {photo.width}×{photo.height} · tap to replace
          </ThemedText>
        </View>
      ) : (
        <ThemedText style={styles.cta}>+ PICK FROM GALLERY</ThemedText>
      )}
    </Pressable>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    picker: {
      borderWidth: BorderWidth.thick,
      borderStyle: 'dashed',
      borderColor: theme.border,
      borderRadius: Radius.small,
      backgroundColor: theme.inputBackground,
      padding: Spacing.three,
      minHeight: 72,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pressed: { transform: [{ translateX: 2 }, { translateY: 2 }] },
    focused: focusRing(theme),
    cta: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 1,
    },
    previewWrap: { gap: Spacing.two, alignItems: 'center' },
    preview: {
      width: 140,
      height: 105,
      borderRadius: Radius.small,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
    },
    meta: { fontSize: 11, fontWeight: '700', color: theme.textSecondary },
  });
