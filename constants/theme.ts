// monday.com — Style Reference
// White workshop with pastel sticky notes

export const mondayTokens = {
  mondayViolet: '#6161FF',
  ink: '#333333',
  slate: '#535768',
  iron: '#808080',
  fog: '#CACBCD',
  mist: '#D0D4E4',
  pebble: '#DDDFEB',
  cloud: '#F5F6F8',
  snow: '#FFFFFF',
  shadowDust: '#E6E7EA',
  mint: '#BCFE90',
  sky: '#ABF0FF',
  apricot: '#FF8940',
  lavender: '#EDDFF7',
  periwinkle: '#E7ECFF',
  cornflower: '#93BEFF',
  aqua: '#D1FAFF',
  cottonCandy: '#E98DFE',
  ultraViolet: '#9450FD',
  electricCyan: '#3AC9FF',
  forest: '#2A5C4E',
  peony: '#FCD0F8',
  periwinkleWash: '#DBDBFF',
  prism: '#8181FF',
} as const;

export const lightColors = {
  primary: '#6161FF',
  primaryDark: '#4A4AE2',
  primaryLight: '#E7ECFF',
  accent: '#BCFE90',
  accentDark: '#2A5C4E',
  background: '#F5F6F8',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F6F8',
  ink: '#333333',
  inkMuted: '#535768',
  border: '#D0D4E4',
  borderLight: '#CACBCD',
  income: '#10B981',
  incomeBg: '#E8FCED',
  expense: '#E11D48',
  expenseBg: '#FFE4E6',
  // Pastel Card & Accent Palette
  mint: '#BCFE90',
  sky: '#ABF0FF',
  apricot: '#FF8940',
  lavender: '#EDDFF7',
  periwinkle: '#E7ECFF',
  cornflower: '#93BEFF',
  aqua: '#D1FAFF',
  peony: '#FCD0F8',
  cottonCandy: '#E98DFE',
  forest: '#2A5C4E',
  // Liquid Glass Tokens (iOS Liquid Glass aesthetic)
  surfaceGlass: 'rgba(255, 255, 255, 0.72)',
  surfaceGlassStrong: 'rgba(255, 255, 255, 0.86)',
  borderGlass: 'rgba(255, 255, 255, 0.65)',
  glassHighlight: 'rgba(255, 255, 255, 0.9)',
};

export const darkColors = {
  primary: '#7C7CFF',
  primaryDark: '#121420',
  primaryLight: '#26294A',
  accent: '#BCFE90',
  accentDark: '#34D399',
  background: '#161824',
  surface: '#1E2235',
  surfaceAlt: '#272B40',
  ink: '#F5F6F8',
  inkMuted: '#9CA3AF',
  border: '#32374E',
  borderLight: '#282C40',
  income: '#34D399',
  incomeBg: 'rgba(52, 211, 153, 0.16)',
  expense: '#FB7185',
  expenseBg: 'rgba(251, 113, 133, 0.16)',
  // Dark adapted pastel accents
  mint: '#1E3A2F',
  sky: '#1E3244',
  apricot: '#3A271C',
  lavender: '#2F233C',
  periwinkle: '#242A45',
  cornflower: '#203352',
  aqua: '#1A353A',
  peony: '#3A1E35',
  cottonCandy: '#3D2040',
  forest: '#132822',
  // Liquid Glass Tokens (Dark Mode)
  surfaceGlass: 'rgba(30, 34, 53, 0.72)',
  surfaceGlassStrong: 'rgba(30, 34, 53, 0.88)',
  borderGlass: 'rgba(255, 255, 255, 0.12)',
  glassHighlight: 'rgba(255, 255, 255, 0.18)',
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
  sm: 6, // badges & inputs (monday 6px)
  md: 12, // images & subcards (monday 12px)
  lg: 16,
  xl: 24, // cards (monday 24px)
  cards: 24,
  badges: 6,
  inputs: 6,
  buttons: 160, // pill buttons (monday 160px)
  pill: 9999,
} as const;

export const shadow = {
  card: {
    boxShadow: '0px 2px 48px rgba(205, 208, 223, 0.4)',
    elevation: 3,
  },
  cardDark: {
    boxShadow: '0px 6px 30px rgba(0, 0, 0, 0.45)',
    elevation: 4,
  },
  button: {
    boxShadow: '0px 4px 16px rgba(97, 97, 255, 0.35)',
    elevation: 4,
  },
  popover: {
    boxShadow: '0px 10px 48px rgba(205, 208, 223, 0.6)',
    elevation: 8,
  },
  liquidGlass: {
    boxShadow: '0px 10px 36px rgba(97, 97, 255, 0.08), 0px 2px 8px rgba(0, 0, 0, 0.03), inset 0px 1.5px 1.5px rgba(255, 255, 255, 0.9)',
    elevation: 4,
  },
  liquidGlassDark: {
    boxShadow: '0px 12px 36px rgba(0, 0, 0, 0.45), inset 0px 1px 1px rgba(255, 255, 255, 0.15)',
    elevation: 5,
  },
  liquidHero: {
    boxShadow: '0px 14px 44px rgba(97, 97, 255, 0.38), inset 0px 1.5px 1.5px rgba(255, 255, 255, 0.6)',
    elevation: 6,
  },
} as const;
