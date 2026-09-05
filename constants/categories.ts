import type { Ionicons } from '@expo/vector-icons';

type IconName = keyof typeof Ionicons.glyphMap;

type Category = { key: string; label: string; icon: IconName };

export const expenseCategories: Category[] = [
  { key: 'makanan', label: 'Makanan', icon: 'fast-food-outline' },
  { key: 'transportasi', label: 'Transportasi', icon: 'car-outline' },
  { key: 'belanja', label: 'Belanja', icon: 'bag-handle-outline' },
  { key: 'hiburan', label: 'Hiburan', icon: 'game-controller-outline' },
  { key: 'tagihan', label: 'Tagihan', icon: 'receipt-outline' },
  { key: 'kesehatan', label: 'Kesehatan', icon: 'medkit-outline' },
  { key: 'pendidikan', label: 'Pendidikan', icon: 'school-outline' },
  { key: 'lainnya-pengeluaran', label: 'Lainnya', icon: 'ellipsis-horizontal-outline' },
];

export const incomeCategories: Category[] = [
  { key: 'gaji', label: 'Gaji', icon: 'cash-outline' },
  { key: 'bonus', label: 'Bonus', icon: 'gift-outline' },
  { key: 'investasi', label: 'Investasi', icon: 'trending-up-outline' },
  { key: 'hadiah', label: 'Hadiah', icon: 'heart-outline' },
  { key: 'lainnya-pemasukan', label: 'Lainnya', icon: 'ellipsis-horizontal-outline' },
];

export function iconForCategory(label: string): IconName {
  const all = [...expenseCategories, ...incomeCategories];
  return all.find((c) => c.label === label)?.icon ?? 'pricetag-outline';
}
