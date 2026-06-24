import { forwardRef, useMemo } from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

import { BorderWidth, Radius, Spacing, Theme } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type InputProps = TextInputProps & {
  error?: boolean;
};

export const Input = forwardRef<TextInput, InputProps>(
  ({ error, style, ...props }, ref) => {
    const theme = useTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]);

    return (
      <TextInput
        ref={ref}
        placeholderTextColor={theme.inputPlaceholder}
        {...props}
        style={[styles.input, error && styles.inputError, style]}
      />
    );
  },
);

Input.displayName = "Input";

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    input: {
      borderWidth: BorderWidth.thick,
      borderColor: theme.border,
      borderRadius: Radius.small,
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.three,
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      backgroundColor: theme.inputBackground,
      minHeight: 48,
    },
    inputError: {
      borderColor: theme.errorBorder,
    },
  });
