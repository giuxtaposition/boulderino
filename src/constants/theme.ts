import "@/global.css";
import { Platform } from "react-native";

export type Theme = {
  background: string;
  surface1: string;
  surface2: string;
  surface3: string;

  text: string;
  textSecondary: string;

  border: string;
  borderMuted: string;

  brand: string;
  success: string;
  warning: string;
  danger: string;

  onBrand: string;
  onSuccess: string;
  onWarning: string;
  onDanger: string;

  link: string;
  focusRing: string;

  shadow: string;

  tabBar: string;
  tabBarInactive: string;
};

const hsla = (h: number, s: number, l: number, a = 1) =>
  `hsla(${h}, ${s}%, ${l}%, ${a})`;

const HSLA_RE =
  /hsla?\(\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%(?:,\s*([\d.]+))?\s*\)/;

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export const withAlpha = (color: string, alpha: number) => {
  const m = color.match(HSLA_RE);
  if (!m) return color;
  const [, h, s, l] = m;
  return hsla(Number(h), Number(s), Number(l), clamp(alpha, 0, 1));
};

const BRAND = { h: 252, s: 90 };
const SUCCESS = { h: 160, s: 85 };
const WARNING = { h: 45, s: 95 };
const DANGER = { h: 345, s: 85 };
const LINK = { h: 200, s: 85 };

const ON_LIGHT = "hsla(220, 40%, 10%, 1)";
const ON_DARK = "hsla(210, 40%, 98%, 1)";

export const Colors: { light: Theme; dark: Theme } = {
  light: {
    background: hsla(210, 40, 98),
    surface1: hsla(210, 40, 99),
    surface2: hsla(210, 40, 96),
    surface3: hsla(210, 40, 92),

    text: hsla(220, 40, 10),
    textSecondary: hsla(220, 15, 45),

    border: hsla(220, 15, 60),
    borderMuted: hsla(220, 15, 78),

    brand: hsla(BRAND.h, BRAND.s, 60),
    success: hsla(SUCCESS.h, SUCCESS.s, 40),
    warning: hsla(WARNING.h, WARNING.s, 40),
    danger: hsla(DANGER.h, DANGER.s, 50),

    onBrand: ON_DARK,
    onSuccess: ON_DARK,
    onWarning: ON_LIGHT,
    onDanger: ON_DARK,

    link: hsla(LINK.h, LINK.s, 40),
    focusRing: hsla(LINK.h, LINK.s, 40),

    shadow: "hsla(220, 20%, 25%, 0.3)",

    tabBar: hsla(210, 40, 100),
    tabBarInactive: hsla(210, 40, 92),
  },

  dark: {
    background: hsla(220, 40, 8),
    surface1: hsla(220, 35, 12),
    surface2: hsla(220, 30, 16),
    surface3: hsla(220, 25, 20),

    text: hsla(210, 40, 98),
    textSecondary: hsla(210, 15, 70),

    border: hsla(220, 15, 45),
    borderMuted: hsla(220, 15, 32),

    brand: hsla(BRAND.h, BRAND.s, 65),
    success: hsla(SUCCESS.h, SUCCESS.s, 50),
    warning: hsla(WARNING.h, WARNING.s, 60),
    danger: hsla(DANGER.h, DANGER.s, 60),

    onBrand: ON_DARK,
    onSuccess: ON_DARK,
    onWarning: ON_LIGHT,
    onDanger: ON_DARK,

    link: hsla(LINK.h, LINK.s, 65),
    focusRing: hsla(LINK.h, LINK.s, 65),

    shadow: "hsla(0, 0%, 0%, 0.6)",

    tabBar: hsla(220, 35, 14),
    tabBarInactive: hsla(220, 35, 6),
  },
};

export const RainbowTokens = {
  white: { bg: hsla(0, 0, 95), on: ON_LIGHT },
  yellow: { bg: hsla(45, 95, 65), on: ON_LIGHT },
  green: { bg: hsla(160, 85, 45), on: ON_DARK },
  cyan: { bg: hsla(200, 85, 45), on: ON_DARK },
  red: { bg: hsla(345, 85, 55), on: ON_DARK },
  navy: { bg: hsla(220, 40, 20), on: ON_DARK },
  purple: { bg: hsla(252, 90, 65), on: ON_DARK },
} as const;

export const RainbowColors = Object.values(RainbowTokens).map(
  (token) => token.bg,
);

export const pickRainbowColor = (index: number) =>
  Object.values(RainbowTokens)[index % Object.values(RainbowTokens).length].bg;

export const findRainbowColor = (color: string) =>
  Object.values(RainbowTokens).find((token) => token.bg === color);

export type Outcome = "sent" | "flash" | "fell";

export const outcomeColor = (theme: Theme, outcome: Outcome) => {
  switch (outcome) {
    case "flash":
      return theme.success;
    case "sent":
      return theme.warning;
    case "fell":
      return theme.danger;
  }
};

export const focusRing = (theme: Theme) =>
  Platform.select({
    web: {
      outlineColor: theme.focusRing,
      outlineStyle: "solid",
      outlineWidth: 2,
      outlineOffset: 2,
    },
    default: {
      borderColor: theme.focusRing,
    },
  });

export const Elevation = {
  none: 0,
  sm: 3,
  md: 5,
  lg: 6,
} as const;

export type ElevationLevel = keyof typeof Elevation;

export const elevation = (theme: Theme, level: ElevationLevel = "md") => {
  const offset = Elevation[level];
  if (offset === 0) return {};
  return Platform.select({
    web: {
      boxShadow: `${offset}px ${offset}px 0 ${theme.shadow}`,
    },
    default: {
      shadowColor: theme.shadow,
      shadowOffset: { width: offset, height: offset },
      shadowOpacity: 1,
      shadowRadius: 0,
    },
  });
};

export const Spacing = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const Radius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
} as const;

export const BorderWidth = {
  thin: 1,
  thick: 2,
} as const;

export const BottomTabHeight = 64;
export const MaxContentWidth = 560;

const srgb = (v: number) =>
  v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);

const hslToRgb = (h: number, s: number, l: number) => {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  return [r + m, g + m, b + m] as const;
};

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

const hexToRgb = (hex: string) => {
  const m = hex.match(HEX_RE);
  if (!m) return null;
  const h = m[1];
  const expanded =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return [
    parseInt(expanded.slice(0, 2), 16) / 255,
    parseInt(expanded.slice(2, 4), 16) / 255,
    parseInt(expanded.slice(4, 6), 16) / 255,
  ] as const;
};

const toRgb = (color: string) => {
  const hsl = color.match(HSLA_RE);
  if (hsl) return hslToRgb(Number(hsl[1]), Number(hsl[2]), Number(hsl[3]));
  return hexToRgb(color);
};

const relativeLuminance = (color: string) => {
  const rgb = toRgb(color);
  if (!rgb) return null;
  const [r, g, b] = rgb;
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
};

export const onColor = (background: string) => {
  const baked = findRainbowColor(background);
  if (baked) return baked.on;
  const l = relativeLuminance(background);
  if (l === null) return ON_LIGHT;
  return l > 0.5 ? ON_LIGHT : ON_DARK;
};

export const Media = {
  backdrop: "hsla(220, 10%, 0%, 0.6)",
  scrim: "hsla(220, 10%, 0%, 0.5)",
  badge: "hsla(220, 10%, 0%, 0.55)",
  onMedia: "hsla(0, 0%, 100%, 1)",
} as const;

export const Typography = {
  title: {
    fontSize: 48,
    lineHeight: 52,
    fontWeight: "600",
  },

  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: "600",
  },

  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
  },

  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },

  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
  },

  code: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "monospace",
    }),
  },
} as const;
