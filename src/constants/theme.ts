import "@/global.css";

import { Platform, type PressableStateCallbackType } from "react-native";

export type PressableState = PressableStateCallbackType & {
  focused?: boolean;
};

export type Theme = {
  text: string;
  textSecondary: string;
  textMuted: string;
  background: string;
  backgroundElement: string;
  backgroundSelected: string;
  inputBackground: string;
  inputPlaceholder: string;
  border: string;
  borderMuted: string;
  shadow: string;
  accent: string;
  accentText: string;
  danger: string;
  dangerSurface: string;
  dangerBorder: string;
  dangerText: string;
  brand: string;
  brandText: string;
  tabBar: string;
  tabBarInactive: string;
  link: string;
  focusRing: string;
};

export const Colors: { light: Theme; dark: Theme } = {
  light: {
    text: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#64748B",
    background: "#FAFAFA",
    backgroundElement: "#FFFFFF",
    backgroundSelected: "#FDE047",
    inputBackground: "#FFFFFF",
    inputPlaceholder: "#64748B",
    border: "#0F172A",
    borderMuted: "rgba(15,23,42,0.18)",
    shadow: "#0F172A",
    accent: "#22C55E",
    accentText: "#0F172A",
    danger: "#DC2626",
    dangerSurface: "#FEE2E2",
    dangerBorder: "#991B1B",
    dangerText: "#7F1D1D",
    brand: "#EF4444",
    brandText: "#FFFFFF",
    tabBar: "#FFFFFFEE",
    tabBarInactive: "#FFFFFF",
    link: "#1D4ED8",
    focusRing: "#1D4ED8",
  },
  dark: {
    text: "#F8FAFC",
    textSecondary: "#CBD5E1",
    textMuted: "#94A3B8",
    background: "#0B1120",
    backgroundElement: "#1E293B",
    backgroundSelected: "#FACC15",
    inputBackground: "#0F172A",
    inputPlaceholder: "#94A3B8",
    border: "#F8FAFC",
    borderMuted: "rgba(248,250,252,0.22)",
    shadow: "#000000",
    accent: "#34D399",
    accentText: "#0B1120",
    danger: "#F87171",
    dangerSurface: "#7F1D1D",
    dangerBorder: "#FCA5A5",
    dangerText: "#FEE2E2",
    brand: "#F87171",
    brandText: "#0B1120",
    tabBar: "#1E293BEE",
    tabBarInactive: "#0F172A",
    link: "#60A5FA",
    focusRing: "#60A5FA",
  },
};

export type ThemeColor = keyof Theme;

export const Rainbow = {
  0: "#f3f4f6",
  1: "#f59e0b",
  2: "#10b981",
  3: "#3b82f6",
  4: "#ef4444",
  5: "#0B1120",
  6: "#F97316",
} as const;

export type RainbowKey = keyof typeof Rainbow;

const rainbowOrder: RainbowKey[] = [0, 1, 2, 3, 4, 5, 6];

export const pickRainbowColor = (index: number): string =>
  Rainbow[
    rainbowOrder[
      ((index % rainbowOrder.length) + rainbowOrder.length) %
        rainbowOrder.length
    ]
  ];

const srgbChannel = (value: number): number =>
  value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);

const relativeLuminance = (hex: string): number => {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  return (
    0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b)
  );
};

export const onColor = (background: string): string =>
  relativeLuminance(background) > 0.5 ? "#0F172A" : "#F8FAFC";

export const focusRing = (theme: Theme) =>
  Platform.select({
    web: {
      outlineColor: theme.focusRing,
      outlineStyle: "solid",
      outlineWidth: 2,
      outlineOffset: 2,
    },
    default: { borderColor: theme.focusRing },
  }) as object;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
  seven: 48,
} as const;

export const Radius = {
  none: 0,
  small: 6,
  medium: 10,
  large: 14,
  pill: 999,
} as const;

export const BorderWidth = {
  hairline: 1,
  thick: 2,
  chunky: 3,
} as const;

export const blockShadow = (theme: Theme, offset = 5) =>
  Platform.select({
    web: { boxShadow: `${offset}px ${offset}px 0 ${theme.shadow}` },
    default: {
      shadowColor: theme.shadow,
      shadowOffset: { width: offset, height: offset },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 0,
    },
  }) as object;

export const BottomTabHeight = 64;
export const MaxContentWidth = 560;
