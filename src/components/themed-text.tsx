import { Text, type TextProps } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { Typography } from "@/constants/theme";

type Variant = keyof typeof Typography;

type Tone = "default" | "link" | "code";

export type ThemedTextProps = TextProps & {
  variant?: Variant;
  tone?: Tone;
};

export function ThemedText({
  style,
  variant = "body",
  tone = "default",
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  const baseStyle = Typography[variant];

  const color =
    tone === "link"
      ? theme.link
      : tone === "code"
        ? theme.textSecondary
        : theme.text;

  return <Text style={[{ color }, baseStyle, style]} {...rest} />;
}
