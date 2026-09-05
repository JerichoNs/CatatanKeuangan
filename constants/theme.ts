// Biru sebagai warna utama, kuning sebagai aksen (CTA, highlight, badge).
// Hijau/merah tetap dipakai khusus buat indikator pemasukan & pengeluaran
// karena itu konvensi paling gampang dikenali di aplikasi finance.

export const colors = {
  primary: '#2B5CE6',
  primaryDark: '#16234F',
  primaryLight: '#EAF0FD',
  accent: '#FFC145',
  accentDark: '#E6A317',
  background: '#F7F8FC',
  surface: '#FFFFFF',
  ink: '#14181F',
  inkMuted: '#6B7280',
  border: '#E5E9F0',
  income: '#16A34A',
  expense: '#DC2626',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

// Shadow buat kasih efek "terangkat" di card/tombol. Pakai `boxShadow` (bukan
// shadowColor/shadowOffset/shadowOpacity/shadowRadius) - itu udah deprecated di
// React Native versi baru, digantiin syntax boxShadow ala CSS. `elevation` tetap
// dipertahankan buat shadow native Android.
export const shadow = {
  card: {
    boxShadow: '0px 6px 16px rgba(15, 23, 42, 0.06)',
    elevation: 3,
  },
  button: {
    boxShadow: '0px 4px 10px rgba(15, 23, 42, 0.12)',
    elevation: 4,
  },
} as const;
