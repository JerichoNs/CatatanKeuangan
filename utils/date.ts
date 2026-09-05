// Semua helper tanggal di sini kerja di zona waktu lokal device (bukan UTC),
// biar nggak geser hari pas deket tengah malam. Format kanonik: "YYYY-MM-DD".

export function toLocalISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toLocalISODate(new Date());
}

export function yesterdayISO(): string {
  return toLocalISODate(new Date(Date.now() - 86400000));
}

// "YYYY-MM-DD" -> "YYYY-MM"
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function shiftMonth(monthKeyStr: string, delta: number): string {
  const [y, m] = monthKeyStr.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatTanggalPanjang(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatBulanTahun(monthKeyStr: string): string {
  const [y, m] = monthKeyStr.split('-').map(Number);
  const date = new Date(y, m - 1, 1);
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

export const DAY_NAMES_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function getDaysInMonth(year: number, monthZeroIndexed: number): number {
  return new Date(year, monthZeroIndexed + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, monthZeroIndexed: number): number {
  return new Date(year, monthZeroIndexed, 1).getDay();
}
