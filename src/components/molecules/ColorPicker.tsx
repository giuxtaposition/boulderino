import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { Input } from "../atoms/Input";
import { Swatch } from "../atoms/Swatch";
import {
  BorderWidth,
  Radius,
  Spacing,
  Rainbow,
  RainbowKey,
  Theme,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const PALETTE: { key: RainbowKey; hex: string }[] = (
  [0, 1, 2, 3, 4, 5, 6] as RainbowKey[]
).map((key) => ({ key, hex: Rainbow[key] }));

const HEX_REGEX = /^#[0-9A-F]{6}$/;

export const isValidHex = (value: string): boolean => HEX_REGEX.test(value);

export const normalizeHex = (raw: string): string => {
  const upper = raw.toUpperCase().replace(/[^#0-9A-F]/g, "");
  if (upper.length === 0) return "";
  return upper.startsWith("#") ? upper : `#${upper}`;
};

type ColorPickerProps = {
  value: string;
  onChange: (next: string) => void;
  testIDPrefix: string;
  accessibilityPrefix?: string;
};

export function ColorPicker({
  value,
  onChange,
  testIDPrefix,
  accessibilityPrefix,
}: ColorPickerProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const hasInvalidHex = value.length > 0 && !isValidHex(value);

  return (
    <View style={styles.container}>
      <View style={styles.palette} testID={`${testIDPrefix}-row`}>
        {PALETTE.map(({ key, hex }) => (
          <Swatch
            key={key}
            color={hex}
            selected={value === hex}
            onPress={() => onChange(hex)}
            accessibilityLabel={
              accessibilityPrefix
                ? `${accessibilityPrefix} color ${key}`
                : `color ${key}`
            }
            testID={`${testIDPrefix}-${key}`}
          />
        ))}
      </View>
      <View style={styles.hexRow}>
        <View
          style={[
            styles.preview,
            hasInvalidHex && styles.previewInvalid,
            {
              backgroundColor: isValidHex(value) ? value : "transparent",
            },
          ]}
          testID={`${testIDPrefix}-preview`}
        />
        <Input
          value={value}
          onChangeText={(text) => onChange(normalizeHex(text))}
          placeholder="#22C55E"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={7}
          error={hasInvalidHex}
          accessibilityLabel={
            accessibilityPrefix
              ? `${accessibilityPrefix} custom hex`
              : "custom hex color"
          }
          testID={`${testIDPrefix}-hex`}
          style={styles.hexInput}
        />
      </View>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { gap: Spacing.two },
    palette: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
    hexRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.two,
    },
    preview: {
      width: 44,
      height: 44,
      borderRadius: Radius.small,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
    },
    previewInvalid: {
      borderColor: theme.errorBorder,
      borderStyle: "dashed",
    },
    hexInput: {
      flex: 1,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
  });
