import {
  toLocalISODate,
  monthKey,
  shiftMonth,
  formatTanggalPanjang,
  formatBulanTahun,
  todayISO,
  yesterdayISO,
} from '../utils/date';

describe('toLocalISODate', () => {
  it('formats a date as YYYY-MM-DD, zero-padded', () => {
    expect(toLocalISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toLocalISODate(new Date(2026, 8, 4))).toBe('2026-09-04');
    expect(toLocalISODate(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('todayISO / yesterdayISO', () => {
  it('yesterday is exactly one day before today', () => {
    const today = new Date(todayISO() + 'T12:00:00');
    const yesterday = new Date(yesterdayISO() + 'T12:00:00');
    const diffDays = Math.round((today.getTime() - yesterday.getTime()) / 86400000);
    expect(diffDays).toBe(1);
  });
});

describe('monthKey', () => {
  it('extracts YYYY-MM from a YYYY-MM-DD string', () => {
    expect(monthKey('2026-09-04')).toBe('2026-09');
    expect(monthKey('2025-01-31')).toBe('2025-01');
  });
});

describe('shiftMonth', () => {
  it('moves forward within the same year', () => {
    expect(shiftMonth('2026-01', 1)).toBe('2026-02');
  });

  it('moves backward within the same year', () => {
    expect(shiftMonth('2026-09', -1)).toBe('2026-08');
  });

  it('rolls over to the next year from December', () => {
    expect(shiftMonth('2025-12', 1)).toBe('2026-01');
  });

  it('rolls back to the previous year from January', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
  });
});

describe('formatTanggalPanjang', () => {
  it('formats a YYYY-MM-DD string as a long Indonesian date', () => {
    expect(formatTanggalPanjang('2026-09-04')).toBe('Jumat, 4 September 2026');
  });
});

describe('formatBulanTahun', () => {
  it('formats a YYYY-MM month key as "Bulan Tahun" in Indonesian', () => {
    expect(formatBulanTahun('2026-09')).toBe('September 2026');
    expect(formatBulanTahun('2025-12')).toBe('Desember 2025');
  });
});
