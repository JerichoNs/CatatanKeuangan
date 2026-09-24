import type { Ionicons } from '@expo/vector-icons';
import type { PocketType, Transaction } from '../types';

export type PocketMeta = {
  id: PocketType;
  name: string;
  shortName: string;
  tagline: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  darkColor: string;
  badgeBg: string;
  badgeText: string;
  description: string;
};

export const POCKET_NABUNG_TAG = '[Nabung]';

export const POCKET_LIST: PocketMeta[] = [
  {
    id: 'simpanan_pertama',
    name: 'Simpanan Pertama',
    shortName: 'Utama',
    tagline: 'Kas Harian & Pokok',
    icon: 'wallet-outline',
    color: '#6161FF',
    darkColor: '#7C7CFF',
    badgeBg: '#E7ECFF',
    badgeText: '#6161FF',
    description: 'Kantong utama untuk operasional belanja dan arus kas harian.',
  },
  {
    id: 'pocket_nabung',
    name: 'Pocket Nabung',
    shortName: 'Nabung',
    tagline: 'Tabungan & Impian',
    icon: 'leaf-outline',
    color: '#2A5C4E',
    darkColor: '#34D399',
    badgeBg: '#BCFE90',
    badgeText: '#2A5C4E',
    description: 'Kantong khusus tabungan untuk mengamankan sisa kas dan target masa depan.',
  },
];

export const POCKET_CONFIG: Record<PocketType, PocketMeta> = {
  simpanan_pertama: POCKET_LIST[0],
  pocket_nabung: POCKET_LIST[1],
};

/**
 * Mendeteksi pocket dari sebuah transaksi.
 * Memeriksa properti `pocket`, lalu memeriksa penanda tag pada `note`.
 * Standarnya adalah 'simpanan_pertama'.
 */
export function getPocket(transaction: Pick<Transaction, 'pocket' | 'note'>): PocketType {
  if (transaction.pocket === 'pocket_nabung' || transaction.pocket === 'simpanan_pertama') {
    return transaction.pocket;
  }
  if (transaction.note) {
    const noteLower = transaction.note.toLowerCase();
    if (noteLower.includes('[nabung]') || noteLower.includes('[pocket: nabung]')) {
      return 'pocket_nabung';
    }
  }
  return 'simpanan_pertama';
}

/**
 * Memformat catatan transaksi dengan menyematkan tag pocket secara aman
 * agar kompatibel dengan API server tanpa mengubah skema tabel database.
 */
export function formatNoteWithPocket(note: string, pocket: PocketType): string {
  const clean = cleanPocketNote(note);
  if (pocket === 'pocket_nabung') {
    return clean ? `${clean} ${POCKET_NABUNG_TAG}` : POCKET_NABUNG_TAG;
  }
  return clean;
}

/**
 * Menghapus tag penanda pocket dari catatan sehingga teks yang dilihat user tetap rapi.
 */
export function cleanPocketNote(note?: string | null): string {
  if (!note) return '';
  return note
    .replace(/\[nabung\]/gi, '')
    .replace(/\[pocket:\s*nabung\]/gi, '')
    .replace(/\[pocket:\s*simpanan_pertama\]/gi, '')
    .trim();
}

/**
 * Menghitung saldo, pemasukan, dan pengeluaran per pocket
 */
export function calculatePocketMetrics(transactions: Transaction[]) {
  let simpananIncome = 0;
  let simpananExpense = 0;
  let nabungIncome = 0;
  let nabungExpense = 0;

  for (const t of transactions) {
    const p = getPocket(t);
    if (p === 'pocket_nabung') {
      if (t.type === 'income') nabungIncome += t.amount;
      else nabungExpense += t.amount;
    } else {
      if (t.type === 'income') simpananIncome += t.amount;
      else simpananExpense += t.amount;
    }
  }

  const simpananSaldo = simpananIncome - simpananExpense;
  const nabungSaldo = nabungIncome - nabungExpense;
  const totalSaldo = simpananSaldo + nabungSaldo;

  const simpananShare = totalSaldo > 0 ? Math.round((Math.max(0, simpananSaldo) / totalSaldo) * 100) : 50;
  const nabungShare = totalSaldo > 0 ? Math.round((Math.max(0, nabungSaldo) / totalSaldo) * 100) : 50;

  return {
    simpanan: {
      income: simpananIncome,
      expense: simpananExpense,
      saldo: simpananSaldo,
      share: simpananShare,
    },
    nabung: {
      income: nabungIncome,
      expense: nabungExpense,
      saldo: nabungSaldo,
      share: nabungShare,
    },
    totalSaldo,
  };
}
