import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { Input } from "../atoms/Input";
import { Swatch } from "../atoms/Swatch";
import {
  BorderWidth,
  Radius,
  Spacing,
  Theme,
  RainbowColors,
  toHex,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

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
  const hexValue = isValidHex(value) ? value : toHex(value);
  const hasInvalidHex = hexValue.length > 0 && !isValidHex(hexValue);

  return (
    <View style={styles.container}>
      <View style={styles.palette} testID={`${testIDPrefix}-row`}>
        {RainbowColors.map((color) => (
          <Swatch
            key={color}
            color={color}
            selected={value === color}
            onPress={() => onChange(color)}
            accessibilityLabel={
              accessibilityPrefix
                ? `${accessibilityPrefix} color ${color}`
                : `color ${color}`
            }
            testID={`${testIDPrefix}-${color}`}
          />
        ))}
      </View>
      <View style={styles.hexRow}>
        <View
          style={[
            styles.preview,
            hasInvalidHex && styles.previewInvalid,
            {
              backgroundColor: isValidHex(hexValue) ? hexValue : "transparent",
            },
          ]}
          testID={`${testIDPrefix}-preview`}
        />
        <Input
          value={hexValue}
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
    container: { gap: Spacing.md },
    palette: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
    hexRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
    },
    preview: {
      width: 44,
      height: 44,
      borderRadius: Radius.sm,
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
    },
    previewInvalid: {
      borderColor: theme.danger,
      borderStyle: "dashed",
    },
    hexInput: {
      flex: 1,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
  });
