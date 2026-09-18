import {
  getPocket,
  formatNoteWithPocket,
  cleanPocketNote,
  calculatePocketMetrics,
  POCKET_LIST,
  POCKET_CONFIG,
} from '../constants/pockets';
import type { Transaction } from '../types';

describe('Pockets Constants & Helpers', () => {
  it('defines Simpanan Pertama and Pocket Nabung correctly', () => {
    expect(POCKET_LIST).toHaveLength(2);
    expect(POCKET_CONFIG.simpanan_pertama.name).toBe('Simpanan Pertama');
    expect(POCKET_CONFIG.pocket_nabung.name).toBe('Pocket Nabung');
  });

  describe('getPocket', () => {
    it('defaults to simpanan_pertama if no pocket or tag is provided', () => {
      expect(getPocket({ note: 'Beli nasi goreng' })).toBe('simpanan_pertama');
      expect(getPocket({})).toBe('simpanan_pertama');
    });

    it('identifies pocket directly from the pocket field', () => {
      expect(getPocket({ pocket: 'pocket_nabung' })).toBe('pocket_nabung');
      expect(getPocket({ pocket: 'simpanan_pertama' })).toBe('simpanan_pertama');
    });

    it('identifies pocket_nabung from [Nabung] tag in note', () => {
      expect(getPocket({ note: 'Uang cadangan [Nabung]' })).toBe('pocket_nabung');
      expect(getPocket({ note: 'Tabungan bulanan [nabung]' })).toBe('pocket_nabung');
      expect(getPocket({ note: '[Pocket: Nabung] Investasi' })).toBe('pocket_nabung');
    });
  });

  describe('formatNoteWithPocket and cleanPocketNote', () => {
    it('formats note cleanly for simpanan_pertama without tag', () => {
      const formatted = formatNoteWithPocket('Beli bensin', 'simpanan_pertama');
      expect(formatted).toBe('Beli bensin');
    });

    it('formats note for pocket_nabung with [Nabung] tag', () => {
      const formatted = formatNoteWithPocket('Uang sisa', 'pocket_nabung');
      expect(formatted).toBe('Uang sisa [Nabung]');
    });

    it('cleans pocket tags from note for UI display', () => {
      expect(cleanPocketNote('Uang sisa [Nabung]')).toBe('Uang sisa');
      expect(cleanPocketNote('[Pocket: Nabung] Dana darurat')).toBe('Dana darurat');
      expect(cleanPocketNote('Catatan normal')).toBe('Catatan normal');
      expect(cleanPocketNote(undefined)).toBe('');
    });
  });

  describe('calculatePocketMetrics', () => {
    const sampleTransactions: Transaction[] = [
      {
        id: '1',
        userId: 'u1',
        type: 'income',
        amount: 1000000,
        category: 'Gaji',
        pocket: 'simpanan_pertama',
        date: '2026-09-01',
        createdAt: 1,
      },
      {
        id: '2',
        userId: 'u1',
        type: 'expense',
        amount: 200000,
        category: 'Makanan',
        pocket: 'simpanan_pertama',
        date: '2026-09-02',
        createdAt: 2,
      },
      {
        id: '3',
        userId: 'u1',
        type: 'income',
        amount: 500000,
        category: 'Investasi',
        pocket: 'pocket_nabung',
        date: '2026-09-03',
        createdAt: 3,
      },
      {
        id: '4',
        userId: 'u1',
        type: 'expense',
        amount: 50000,
        category: 'Tagihan',
        note: 'Biaya admin [Nabung]',
        date: '2026-09-04',
        createdAt: 4,
      },
    ];

    it('calculates metrics for both pockets accurately', () => {
      const metrics = calculatePocketMetrics(sampleTransactions);

      // Simpanan Pertama: 1,000,000 - 200,000 = 800,000
      expect(metrics.simpanan.income).toBe(1000000);
      expect(metrics.simpanan.expense).toBe(200000);
      expect(metrics.simpanan.saldo).toBe(800000);

      // Pocket Nabung: 500,000 - 50,000 = 450,000
      expect(metrics.nabung.income).toBe(500000);
      expect(metrics.nabung.expense).toBe(50000);
      expect(metrics.nabung.saldo).toBe(450000);

      // Total Saldo: 800,000 + 450,000 = 1,250,000
      expect(metrics.totalSaldo).toBe(1250000);
    });
  });
});
