import { forwardRef, useMemo, useState } from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

import { BorderWidth, Radius, Spacing, Theme } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type InputProps = TextInputProps & {
  error?: boolean;
};

export const Input = forwardRef<TextInput, InputProps>(
  ({ error, style, onFocus, onBlur, ...props }, ref) => {
    const theme = useTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]);
    const [focused, setFocused] = useState(false);

    const handleFocus: TextInputProps["onFocus"] = (e) => {
      setFocused(true);
      onFocus?.(e);
    };
    const handleBlur: TextInputProps["onBlur"] = (e) => {
      setFocused(false);
      onBlur?.(e);
    };

    return (
      <TextInput
        ref={ref}
        placeholderTextColor={theme.textSecondary}
        {...props}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[
          styles.input,
          focused && !error && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
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
      borderRadius: Radius.sm,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      backgroundColor: theme.surface1,
      minHeight: 48,
    },
    inputFocused: {
      borderColor: theme.focusRing,
    },
    inputError: {
      borderColor: theme.danger,
    },
  });
