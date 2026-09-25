// FintechX Modern Design Tokens & Glass Theme Reference

export const fintechTokens = {
  electricBlue: '#3B82F6',
  royalBlue: '#2563EB',
  deepNavy: '#1D4ED8',
  softSky: '#EFF6FF',
  glowBlue: 'rgba(59, 130, 246, 0.35)',
  emerald: '#10B981',
  emeraldGlow: 'rgba(16, 185, 129, 0.25)',
  rose: '#F43F5E',
  roseGlow: 'rgba(244, 63, 94, 0.25)',
  amber: '#F59E0B',
  violet: '#8B5CF6',
  cyan: '#06B6D4',
  darkBg: '#090D16',
  darkSurface: '#111827',
  darkSurfaceAlt: '#182234',
  darkBorder: '#1F293D',
  lightBg: '#F8FAFC',
  lightSurface: '#FFFFFF',
  lightSurfaceAlt: '#F1F5F9',
  lightBorder: '#E2E8F0',
} as const;

// Backward-compatibility token alias
export const mondayTokens = fintechTokens;

export const lightColors = {
  primary: '#3B82F6',
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',
  accent: '#10B981',
  accentDark: '#047857',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  ink: '#0F172A',
  inkMuted: '#64748B',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  income: '#10B981',
  incomeBg: '#ECFDF5',
  expense: '#F43F5E',
  expenseBg: '#FFF1F2',
  // Fintech Card & Accent Palette
  mint: '#D1FAE5',
  sky: '#E0F2FE',
  apricot: '#FFEDD5',
  lavender: '#EDE9FE',
  periwinkle: '#EEF2FF',
  cornflower: '#DBEAFE',
  aqua: '#CFFAFE',
  peony: '#FCE7F3',
  cottonCandy: '#FAE8FF',
  forest: '#064E3B',
  // Liquid Glass Tokens (FintechX Glass aesthetic)
  surfaceGlass: 'rgba(255, 255, 255, 0.82)',
  surfaceGlassStrong: 'rgba(255, 255, 255, 0.94)',
  borderGlass: 'rgba(255, 255, 255, 0.85)',
  glassHighlight: 'rgba(255, 255, 255, 0.95)',
};

export const darkColors = {
  primary: '#3B82F6',
  primaryDark: '#1D4ED8',
  primaryLight: 'rgba(59, 130, 246, 0.16)',
  accent: '#10B981',
  accentDark: '#34D399',
  background: '#090D16',
  surface: '#111827',
  surfaceAlt: '#182234',
  ink: '#F8FAFC',
  inkMuted: '#94A3B8',
  border: '#1F293D',
  borderLight: '#161F2E',
  income: '#10B981',
  incomeBg: 'rgba(16, 185, 129, 0.16)',
  expense: '#F43F5E',
  expenseBg: 'rgba(244, 63, 94, 0.16)',
  // Dark adapted pastel accents
  mint: 'rgba(16, 185, 129, 0.18)',
  sky: 'rgba(56, 189, 248, 0.18)',
  apricot: 'rgba(251, 146, 60, 0.18)',
  lavender: 'rgba(167, 139, 250, 0.18)',
  periwinkle: 'rgba(99, 102, 241, 0.18)',
  cornflower: 'rgba(59, 130, 246, 0.18)',
  aqua: 'rgba(6, 182, 212, 0.18)',
  peony: 'rgba(244, 114, 182, 0.18)',
  cottonCandy: 'rgba(232, 121, 249, 0.18)',
  forest: 'rgba(5, 150, 105, 0.22)',
  // Liquid Glass Tokens (Dark Mode)
  surfaceGlass: 'rgba(17, 24, 39, 0.78)',
  surfaceGlassStrong: 'rgba(17, 24, 39, 0.92)',
  borderGlass: 'rgba(255, 255, 255, 0.10)',
  glassHighlight: 'rgba(255, 255, 255, 0.15)',
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
  xxl: 48,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  cards: 24,
  badges: 9999,
  inputs: 12,
  buttons: 9999,
  pill: 9999,
} as const;

export const shadow = {
  card: {
    boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
    elevation: 3,
  },
  cardDark: {
    boxShadow: '0 8px 30px -4px rgba(0, 0, 0, 0.5), 0 2px 8px -1px rgba(0, 0, 0, 0.3)',
    elevation: 4,
  },
  button: {
    boxShadow: '0 8px 24px -4px rgba(59, 130, 246, 0.42)',
    elevation: 4,
  },
  popover: {
    boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.18)',
    elevation: 8,
  },
  liquidGlass: {
    boxShadow: '0 10px 32px -4px rgba(59, 130, 246, 0.08), 0 2px 8px rgba(0, 0, 0, 0.02), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
    elevation: 4,
  },
  liquidGlassDark: {
    boxShadow: '0 14px 40px -4px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.12)',
    elevation: 5,
  },
  liquidHero: {
    boxShadow: '0 16px 48px -6px rgba(59, 130, 246, 0.36), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
    elevation: 6,
  },
} as const;
