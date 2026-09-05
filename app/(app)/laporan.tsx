import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, radius } from '../../constants/theme';
import { Card, SectionLabel, EmptyState, ErrorState, Button } from '../../components/ui';
import { currentMonthKey, formatBulanTahun, monthKey, shiftMonth } from '../../utils/date';
import type { Transaction } from '../../types';

function formatRupiah(value: number) {
  return 'Rp' + Math.round(Math.abs(value)).toLocaleString('id-ID');
}

export default function LaporanScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [month, setMonth] = useState(currentMonthKey());
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setError(false);
    setLoading(true);
    const q = query(collection(db, 'transactions'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setTransactions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Transaction));
        setLoading(false);
      },
      () => {
        setError(true);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user, retryKey]);

  const monthTransactions = useMemo(() => transactions.filter((t) => monthKey(t.date) === month), [transactions, month]);

  const totalIncome = monthTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = monthTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net = totalIncome - totalExpense;

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
    return Array.from(map.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthTransactions]);

  const maxCategoryAmount = byCategory[0]?.amount ?? 0;
  const isCurrentOrFutureMonth = month >= currentMonthKey();

  const handleExportPdf = async () => {
    if (monthTransactions.length === 0) {
      Alert.alert('Belum ada data', 'Nggak ada transaksi buat bulan ini.');
      return;
    }
    setExporting(true);
    try {
      const rows = monthTransactions
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((t) => {
          const color = t.type === 'income' ? '#16A34A' : '#DC2626';
          const sign = t.type === 'income' ? '+' : '-';
          return `<tr><td>${t.date}</td><td>${t.category}</td><td>${t.note ?? ''}</td><td style="text-align:right;color:${color}">${sign}Rp ${t.amount.toLocaleString('id-ID')}</td></tr>`;
        })
        .join('');

      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 24px; color: #14181F; }
              h1 { font-size: 20px; color: #16234F; margin-bottom: 4px; }
              .period { color: #6B7280; margin-bottom: 20px; }
              .summary { display: flex; gap: 16px; margin-bottom: 24px; }
              .box { flex: 1; border: 1px solid #E5E9F0; border-radius: 10px; padding: 12px; }
              .box .label { font-size: 11px; color: #6B7280; text-transform: uppercase; }
              .box .value { font-size: 18px; font-weight: 700; margin-top: 4px; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; }
              th { text-align: left; border-bottom: 2px solid #E5E9F0; padding: 8px 6px; color: #6B7280; font-size: 11px; text-transform: uppercase; }
              td { padding: 8px 6px; border-bottom: 1px solid #F0F2F6; }
            </style>
          </head>
          <body>
            <h1>Laporan Keuangan - Catatan Keuangan</h1>
            <div class="period">Periode: ${formatBulanTahun(month)}</div>
            <div class="summary">
              <div class="box"><div class="label">Pemasukan</div><div class="value" style="color:#16A34A">Rp ${totalIncome.toLocaleString('id-ID')}</div></div>
              <div class="box"><div class="label">Pengeluaran</div><div class="value" style="color:#DC2626">Rp ${totalExpense.toLocaleString('id-ID')}</div></div>
              <div class="box"><div class="label">Saldo Bersih</div><div class="value" style="color:#16234F">Rp ${net.toLocaleString('id-ID')}</div></div>
            </div>
            <table>
              <thead><tr><th>Tanggal</th><th>Kategori</th><th>Catatan</th><th style="text-align:right">Jumlah</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        // expo-print di web nggak generate file & ngabaikan HTML custom -
        // dia cuma manggil window.print() buat halaman yang lagi aktif.
        // Solusinya: buka window baru berisi HTML laporan ini, baru print window itu.
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          Alert.alert('Gagal export', 'Browser memblokir pop-up. Izinkan pop-up buat situs ini lalu coba lagi.');
          return;
        }
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Laporan Keuangan' });
        }
      }
    } catch (e) {
      Alert.alert('Gagal export', 'Coba lagi beberapa saat lagi.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Laporan Bulanan</Text>

      <View style={styles.monthRow}>
        <TouchableOpacity onPress={() => setMonth((m) => shiftMonth(m, -1))} hitSlop={8} style={styles.monthArrow}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{formatBulanTahun(month)}</Text>
        <TouchableOpacity
          onPress={() => setMonth((m) => shiftMonth(m, 1))}
          disabled={isCurrentOrFutureMonth}
          hitSlop={8}
          style={styles.monthArrow}
        >
          <Ionicons name="chevron-forward" size={20} color={isCurrentOrFutureMonth ? colors.border : colors.primary} />
        </TouchableOpacity>
      </View>

      {error ? (
        <Card>
          <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
        </Card>
      ) : (
        <>
          <SectionLabel>Rekap Otomatis</SectionLabel>
          <View style={styles.summaryGrid}>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Pemasukan</Text>
              <Text style={[styles.summaryCardValue, { color: colors.income }]}>{formatRupiah(totalIncome)}</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Pengeluaran</Text>
              <Text style={[styles.summaryCardValue, { color: colors.expense }]}>{formatRupiah(totalExpense)}</Text>
            </Card>
          </View>
          <Card style={styles.netCard}>
            <Text style={styles.netLabel}>Saldo Bersih Bulan Ini</Text>
            <Text style={[styles.netValue, { color: net >= 0 ? colors.income : colors.expense }]}>
              {net >= 0 ? '+' : '-'}
              {formatRupiah(net)}
            </Text>
          </Card>

          <View style={styles.block}>
            <SectionLabel>Grafik Analisis - Pengeluaran per Kategori</SectionLabel>
            <Card>
              {loading ? (
                <Text style={styles.loadingText}>Memuat...</Text>
              ) : byCategory.length === 0 ? (
                <EmptyState
                  icon="pie-chart-outline"
                  title="Belum ada pengeluaran"
                  description="Grafik kategori bakal muncul begitu ada transaksi pengeluaran bulan ini."
                />
              ) : (
                byCategory.map((c, i) => (
                  <View key={c.category} style={[styles.categoryRow, i > 0 && styles.categoryRowSpacing]}>
                    <View style={styles.categoryHeader}>
                      <Text style={styles.categoryLabel}>{c.category}</Text>
                      <Text style={styles.categoryAmount}>{formatRupiah(c.amount)}</Text>
                    </View>
                    <View style={styles.categoryTrack}>
                      <View
                        style={[
                          styles.categoryFill,
                          { width: `${Math.max(4, (c.amount / maxCategoryAmount) * 100)}%` },
                        ]}
                      />
                    </View>
                  </View>
                ))
              )}
            </Card>
          </View>
        </>
      )}

      <View style={[styles.block, styles.exportBlock]}>
        <SectionLabel>Ekspor Laporan</SectionLabel>
        <Button label="Ekspor PDF" onPress={handleExportPdf} loading={exporting} icon="download-outline" variant="accent" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: spacing.xl, width: '100%', maxWidth: 560, alignSelf: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, marginBottom: spacing.md },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg, marginBottom: spacing.md },
  monthArrow: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  monthLabel: { fontSize: 16, fontWeight: '700', color: colors.ink, minWidth: 150, textAlign: 'center' },
  summaryGrid: { flexDirection: 'row', gap: spacing.sm },
  summaryCard: { flex: 1 },
  summaryCardLabel: { fontSize: 12, color: colors.inkMuted, fontWeight: '600' },
  summaryCardValue: { fontSize: 17, fontWeight: '800', marginTop: 4 },
  netCard: { marginTop: spacing.sm },
  netLabel: { fontSize: 12, color: colors.inkMuted, fontWeight: '600' },
  netValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  block: { marginTop: spacing.lg },
  exportBlock: { marginBottom: spacing.md },
  loadingText: { color: colors.inkMuted, textAlign: 'center', paddingVertical: spacing.md },
  categoryRow: {},
  categoryRowSpacing: { marginTop: spacing.md },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  categoryLabel: { fontSize: 13, fontWeight: '600', color: colors.ink },
  categoryAmount: { fontSize: 13, fontWeight: '700', color: colors.ink },
  categoryTrack: { height: 8, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' },
  categoryFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.pill },
});
