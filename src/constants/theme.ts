import "@/global.css";

import { Platform, type PressableStateCallbackType } from "react-native";

export type PressableState = PressableStateCallbackType & {
  focused?: boolean;
};

export type Theme = {
  base: string;
  surface: string;
  overlay: string;
  muted: string;
  subtle: string;
  text: string;
  red: string;
  yellow: string;
  green: string;
  blue: string;
  purple: string;
  dark_blue: string;
  highlightLow: string;
  highlightMedium: string;
  highlightHigh: string;
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
  success: string;
  warning: string;
  danger: string;
  dangerSurface: string;
  dangerBorder: string;
  dangerText: string;
  errorSurface: string;
  errorBorder: string;
  errorText: string;
  brand: string;
  brandText: string;
  tabBar: string;
  tabBarInactive: string;
  link: string;
  focusRing: string;
};

export const Rainbow = {
  0: "#F3F4F6",
  1: "#FFD166",
  2: "#06D6A0",
  3: "#118AB2",
  4: "#EF476F",
  5: "#073B4C",
  6: "#7B61FF",
} as const;

export const Colors: { light: Theme; dark: Theme } = {
  light: {
    base: "#F8FAFC",
    surface: "#FFFFFF",
    overlay: "#F1F5F9",
    muted: "#64748B",
    subtle: "#CBD5E1",
    text: "#0F172A",

    red: "#EF476F",
    yellow: "#FFD166",
    green: "#06D6A0",
    blue: "#118AB2",
    purple: "#7B61FF",
    dark_blue: "#073B4C",

    highlightLow: "#E2E8F0",
    highlightMedium: "#CBD5E1",
    highlightHigh: "#94A3B8",

    textSecondary: "#64748B",
    textMuted: "#64748B",
    background: "#F8FAFC",
    backgroundElement: "#FFFFFF",
    backgroundSelected: "#FFD166",
    inputBackground: "#FFFFFF",
    inputPlaceholder: "#64748B",
    border: "#64748B",
    borderMuted: "#94A3B8",
    shadow: "#CBD5E1",
    accent: "#06D6A0",
    accentText: "#0F172A",
    success: "#06D6A0",
    warning: "#FFD166",
    danger: "#EF476F",
    dangerSurface: "#FEE2E2",
    dangerBorder: "#EF476F",
    dangerText: "#B91C1C",
    errorSurface: "#FEE2E2",
    errorBorder: "#EF476F",
    errorText: "#B91C1C",
    brand: "#7B61FF",
    brandText: "#F8FAFC",
    tabBar: "#FFFFFF",
    tabBarInactive: "#F8FAFC",
    link: "#118AB2",
    focusRing: "#118AB2",
  },
  dark: {
    base: "#0B1320",
    surface: "#141E30",
    overlay: "#1D2A40",
    muted: "#4A5568",
    subtle: "#94A3B8",
    text: "#F8FAFC",
    red: "#EF476F",
    yellow: "#FFD166",
    green: "#06D6A0",
    blue: "#118AB2",
    purple: "#7B61FF",
    dark_blue: "#073B4C",
    highlightLow: "#1A2436",
    highlightMedium: "#25324A",
    highlightHigh: "#334155",

    textSecondary: "#94A3B8",
    textMuted: "#94A3B8",
    background: "#0B1320",
    backgroundElement: "#141E30",
    backgroundSelected: "#FFD166",
    inputBackground: "#141E30",
    inputPlaceholder: "#94A3B8",
    border: "#94A3B8",
    borderMuted: "#4A5568",
    shadow: "#25324A",
    accent: "#06D6A0",
    accentText: "#0F172A",
    success: "#06D6A0",
    warning: "#FFD166",
    danger: "#EF476F",
    dangerSurface: "#1A2436",
    dangerBorder: "#EF476F",
    dangerText: "#EF476F",
    errorSurface: "#1A2436",
    errorBorder: "#EF476F",
    errorText: "#EF476F",
    brand: "#7B61FF",
    brandText: "#F8FAFC",
    tabBar: "#141E30",
    tabBarInactive: "#0B1320",
    link: "#118AB2",
    focusRing: "#118AB2",
  },
};

export type ThemeColor = keyof Theme;

export type RainbowKey = keyof typeof Rainbow;

const rainbowOrder: RainbowKey[] = [0, 1, 2, 3, 4, 5, 6];

export const pickRainbowColor = (index: number): string =>
  Rainbow[
    rainbowOrder[
      ((index % rainbowOrder.length) + rainbowOrder.length) %
        rainbowOrder.length
    ]
  ];

export type Outcome = "sent" | "flash" | "fell";

export const outcomeColor = (theme: Theme, outcome: Outcome): string => {
  switch (outcome) {
    case "flash":
      return theme.success;
    case "sent":
      return theme.warning;
    case "fell":
      return theme.danger;
  }
};

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
  relativeLuminance(background) > 0.36 ? "#0F172A" : "#F8FAFC";

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
  thin: 1,
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

export const Media = {
  backdrop: "#000000",
  scrim: "rgba(0,0,0,0.45)",
  badge: "rgba(0,0,0,0.6)",
  onMedia: "#FFFFFF",
} as const;

export const BottomTabHeight = 64;
export const MaxContentWidth = 560;
