import '@/global.css';

import { Platform } from 'react-native';

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
};

export const Colors: { light: Theme; dark: Theme } = {
  light: {
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    background: '#FAFAFA',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#FDE047',
    inputBackground: '#FFFFFF',
    inputPlaceholder: '#94A3B8',
    border: '#0F172A',
    borderMuted: 'rgba(15,23,42,0.18)',
    shadow: '#0F172A',
    accent: '#22C55E',
    accentText: '#0F172A',
    danger: '#DC2626',
    dangerSurface: '#FEE2E2',
    dangerBorder: '#991B1B',
    dangerText: '#7F1D1D',
    brand: '#EF4444',
    brandText: '#FFFFFF',
    tabBar: '#FFFFFFEE',
    tabBarInactive: '#FFFFFF',
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',
    background: '#0B1120',
    backgroundElement: '#1E293B',
    backgroundSelected: '#FACC15',
    inputBackground: '#0F172A',
    inputPlaceholder: '#64748B',
    border: '#F8FAFC',
    borderMuted: 'rgba(248,250,252,0.22)',
    shadow: '#000000',
    accent: '#34D399',
    accentText: '#0B1120',
    danger: '#F87171',
    dangerSurface: '#7F1D1D',
    dangerBorder: '#FCA5A5',
    dangerText: '#FEE2E2',
    brand: '#F87171',
    brandText: '#0B1120',
    tabBar: '#1E293BEE',
    tabBarInactive: '#0F172A',
  },
};

export type ThemeColor = keyof Theme;

export const Tetromino = {
  I: '#00B8D9',
  O: '#FACC15',
  T: '#9333EA',
  S: '#22C55E',
  Z: '#EF4444',
  J: '#2563EB',
  L: '#F97316',
} as const;

export type TetrominoKey = keyof typeof Tetromino;

const tetrominoOrder: TetrominoKey[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export const pickTetromino = (index: number): string =>
  Tetromino[tetrominoOrder[((index % tetrominoOrder.length) + tetrominoOrder.length) % tetrominoOrder.length]];

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
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
