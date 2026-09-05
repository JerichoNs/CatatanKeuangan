// Definisi warna light dan dark mode dengan kontras tinggi dan estetika modern.

export const lightColors = {
  primary: '#2B5CE6',
  primaryDark: '#16234F',
  primaryLight: '#EAF0FD',
  accent: '#FFC145',
  accentDark: '#E6A317',
  background: '#F7F8FC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  ink: '#14181F',
  inkMuted: '#64748B',
  border: '#E2E8F0',
  income: '#16A34A',
  incomeBg: '#E9F9EF',
  expense: '#DC2626',
  expenseBg: '#FEECEC',
};

export const darkColors = {
  primary: '#4F7DF9',
  primaryDark: '#0B0F19',
  primaryLight: '#1C283E',
  accent: '#FBBF24',
  accentDark: '#D97706',
  background: '#0B0F19',
  surface: '#161F30',
  surfaceAlt: '#1F2B42',
  ink: '#F8FAFC',
  inkMuted: '#94A3B8',
  border: '#243046',
  income: '#22C55E',
  incomeBg: '#064E3B50',
  expense: '#F87171',
  expenseBg: '#7F1D1D50',
};

export type ThemeColors = typeof lightColors;

// Default static fallback untuk kompatibilitas mundur
export const colors: ThemeColors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  xs: 6,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const shadow = {
  card: {
    boxShadow: '0px 6px 18px rgba(15, 23, 42, 0.07)',
    elevation: 3,
  },
  cardDark: {
    boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.35)',
    elevation: 4,
  },
  button: {
    boxShadow: '0px 4px 12px rgba(43, 92, 230, 0.25)',
    elevation: 4,
  },
  popover: {
    boxShadow: '0px 10px 30px rgba(15, 23, 42, 0.15)',
    elevation: 8,
  },
} as const;
