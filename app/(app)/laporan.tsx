import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import { spacing, radius } from '../../constants/theme';
import { Card, SectionLabel, EmptyState, ErrorState, Button } from '../../components/ui';
import { CalendarModal } from '../../components/CalendarModal';
import { currentMonthKey, formatBulanTahun, monthKey, shiftMonth } from '../../utils/date';
import type { Transaction } from '../../types';
import { useFocusEffect } from 'expo-router';

function formatRupiah(value: number) {
  return 'Rp' + Math.round(Math.abs(value)).toLocaleString('id-ID');
}

export default function LaporanScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [month, setMonth] = useState(currentMonthKey());
  const [exporting, setExporting] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setError(false);
    setLoading(true);
    try {
      const data = await api.get<Transaction[]>('/transactions');
      setTransactions(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [fetchTransactions])
  );

  const monthTransactions = useMemo(
    () => transactions.filter((t) => monthKey(t.date) === month),
    [transactions, month]
  );
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
          return `<tr>
            <td style="padding: 10px 8px; border-bottom: 1px solid #E2E8F0;">${t.date}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #E2E8F0; font-weight: 600;">${t.category}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #E2E8F0; color: #64748B;">${t.note ?? '-'}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #E2E8F0; text-align: right; font-weight: 700; color: ${color};">
              ${sign}Rp ${t.amount.toLocaleString('id-ID')}
            </td>
          </tr>`;
        })
        .join('');

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Laporan Keuangan - ${formatBulanTahun(month)}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px; color: #0F172A; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 2px solid #2B5CE6; padding-bottom: 16px; margin-bottom: 24px; }
            h1 { font-size: 24px; font-weight: 800; color: #16234F; margin: 0 0 4px 0; }
            .period { color: #64748B; font-size: 14px; font-weight: 500; }
            .summary { display: flex; gap: 16px; margin-bottom: 30px; }
            .box { flex: 1; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; background-color: #F8FAFC; }
            .box .label { font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; }
            .box .value { font-size: 20px; font-weight: 800; margin-top: 6px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 16px; }
            th { text-align: left; border-bottom: 2px solid #CBD5E1; padding: 10px 8px; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
            .footer { margin-top: 40px; text-align: center; color: #94A3B8; font-size: 12px; border-top: 1px solid #E2E8F0; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Catatan Keuangan</h1>
            <div class="period">Laporan Bulanan: ${formatBulanTahun(month)}</div>
          </div>
          <div class="summary">
            <div class="box">
              <div class="label">Total Pemasukan</div>
              <div class="value" style="color: #16A34A;">Rp ${totalIncome.toLocaleString('id-ID')}</div>
            </div>
            <div class="box">
              <div class="label">Total Pengeluaran</div>
              <div class="value" style="color: #DC2626;">Rp ${totalExpense.toLocaleString('id-ID')}</div>
            </div>
            <div class="box">
              <div class="label">Saldo Bersih</div>
              <div class="value" style="color: #2B5CE6;">Rp ${net.toLocaleString('id-ID')}</div>
            </div>
          </div>
          <h3>Rincian Transaksi</h3>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Kategori</th>
                <th>Catatan</th>
                <th style="text-align: right;">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <div class="footer">
            Dicetak otomatis dari Aplikasi Catatan Keuangan
          </div>
        </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        // Print.printAsync pada web langsung membuka dialog browser Print / Save PDF
        await Print.printAsync({ html });
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Laporan Keuangan ${month}`,
            UTI: 'com.adobe.pdf',
          });
        } else {
          await Print.printAsync({ html });
        }
      }
    } catch (err: any) {
      console.error('Export PDF error:', err);
      Alert.alert('Gagal export', err?.message || 'Coba lagi beberapa saat lagi.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.container}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.ink }]}>Laporan Keuangan</Text>
          <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
            Analisis dan rekap arus kas bulanan
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.calendarIconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setCalendarVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar" size={18} color={colors.primary} />
          <Text style={[styles.calendarBtnText, { color: colors.primary }]}>Pilih Bulan</Text>
        </TouchableOpacity>
      </View>

      {/* Month Row */}
      <View style={[styles.monthCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => setMonth((m) => shiftMonth(m, -1))}
          hitSlop={8}
          style={[styles.monthArrow, { backgroundColor: colors.surfaceAlt }]}
        >
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.monthCenter}
          onPress={() => setCalendarVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.monthLabel, { color: colors.ink }]}>{formatBulanTahun(month)}</Text>
          <View style={styles.monthTag}>
            <Ionicons name="calendar-outline" size={12} color={colors.primary} />
            <Text style={[styles.monthTagText, { color: colors.primary }]}>Lompat Bulan</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMonth((m) => shiftMonth(m, 1))}
          disabled={isCurrentOrFutureMonth}
          hitSlop={8}
          style={[
            styles.monthArrow,
            { backgroundColor: isCurrentOrFutureMonth ? 'transparent' : colors.surfaceAlt },
          ]}
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color={isCurrentOrFutureMonth ? colors.border : colors.primary}
          />
        </TouchableOpacity>
      </View>

      {error ? (
        <Card>
          <ErrorState onRetry={fetchTransactions} />
        </Card>
      ) : (
        <>
          <SectionLabel>Rekap Arus Kas</SectionLabel>
          <View style={styles.summaryGrid}>
            <Card style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: colors.incomeBg }]}>
                <Ionicons name="arrow-down" size={16} color={colors.income} />
              </View>
              <Text style={[styles.summaryCardLabel, { color: colors.inkMuted }]}>Pemasukan</Text>
              <Text style={[styles.summaryCardValue, { color: colors.income }]}>
                {formatRupiah(totalIncome)}
              </Text>
            </Card>

            <Card style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: colors.expenseBg }]}>
                <Ionicons name="arrow-up" size={16} color={colors.expense} />
              </View>
              <Text style={[styles.summaryCardLabel, { color: colors.inkMuted }]}>Pengeluaran</Text>
              <Text style={[styles.summaryCardValue, { color: colors.expense }]}>
                {formatRupiah(totalExpense)}
              </Text>
            </Card>
          </View>

          <Card style={styles.netCard}>
            <View style={styles.netRow}>
              <View>
                <Text style={[styles.netLabel, { color: colors.inkMuted }]}>
                  Saldo Bersih Bulan Ini
                </Text>
                <Text
                  style={[
                    styles.netValue,
                    { color: net >= 0 ? colors.income : colors.expense },
                  ]}
                >
                  {net >= 0 ? '+' : '-'}
                  {formatRupiah(net)}
                </Text>
              </View>
              <View
                style={[
                  styles.netBadge,
                  { backgroundColor: net >= 0 ? colors.incomeBg : colors.expenseBg },
                ]}
              >
                <Text
                  style={[
                    styles.netBadgeText,
                    { color: net >= 0 ? colors.income : colors.expense },
                  ]}
                >
                  {net >= 0 ? 'Surplus' : 'Defisit'}
                </Text>
              </View>
            </View>
          </Card>

          <View style={styles.block}>
            <SectionLabel>Pengeluaran per Kategori</SectionLabel>
            <Card>
              {loading ? (
                <Text style={[styles.loadingText, { color: colors.inkMuted }]}>Memuat...</Text>
              ) : byCategory.length === 0 ? (
                <EmptyState
                  icon="pie-chart-outline"
                  title="Belum ada pengeluaran"
                  description="Grafik kategori bakal muncul begitu ada transaksi pengeluaran bulan ini."
                />
              ) : (
                byCategory.map((c, i) => {
                  const percentage =
                    totalExpense > 0 ? Math.round((c.amount / totalExpense) * 100) : 0;
                  return (
                    <View
                      key={c.category}
                      style={[styles.categoryRow, i > 0 && styles.categoryRowSpacing]}
                    >
                      <View style={styles.categoryHeader}>
                        <Text style={[styles.categoryLabel, { color: colors.ink }]}>
                          {c.category} ({percentage}%)
                        </Text>
                        <Text style={[styles.categoryAmount, { color: colors.ink }]}>
                          {formatRupiah(c.amount)}
                        </Text>
                      </View>
                      <View style={[styles.categoryTrack, { backgroundColor: colors.border }]}>
                        <View
                          style={[
                            styles.categoryFill,
                            {
                              backgroundColor: colors.primary,
                              width: `${Math.max(4, (c.amount / maxCategoryAmount) * 100)}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })
              )}
            </Card>
          </View>
        </>
      )}

      <View style={[styles.block, styles.exportBlock]}>
        <SectionLabel>Ekspor Laporan</SectionLabel>
        <Button
          label="Ekspor ke PDF"
          onPress={handleExportPdf}
          loading={exporting}
          icon="download-outline"
          variant="accent"
        />
      </View>

      {/* Modal Kalender untuk Laporan */}
      <CalendarModal
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        currentMonth={month}
        selectedDate={null}
        onSelectMonth={(m) => setMonth(m)}
        onSelectDate={(d) => {
          if (d) setMonth(monthKey(d));
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    width: '100%',
    maxWidth: 580,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, marginTop: 2 },
  calendarIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  calendarBtnText: { fontSize: 13, fontWeight: '700' },
  monthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  monthArrow: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCenter: { alignItems: 'center', paddingVertical: 2 },
  monthLabel: { fontSize: 16, fontWeight: '800' },
  monthTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  monthTagText: { fontSize: 11, fontWeight: '600' },
  summaryGrid: { flexDirection: 'row', gap: spacing.sm },
  summaryCard: { flex: 1, padding: spacing.md },
  summaryIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  summaryCardLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  summaryCardValue: { fontSize: 17, fontWeight: '800', marginTop: 4 },
  netCard: { marginTop: spacing.sm, padding: spacing.md },
  netRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  netLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  netValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  netBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  netBadgeText: { fontSize: 12, fontWeight: '700' },
  block: { marginTop: spacing.lg },
  exportBlock: { marginBottom: spacing.md },
  loadingText: { textAlign: 'center', paddingVertical: spacing.md },
  categoryRow: {},
  categoryRowSpacing: { marginTop: spacing.md },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  categoryLabel: { fontSize: 13, fontWeight: '600' },
  categoryAmount: { fontSize: 13, fontWeight: '700' },
  categoryTrack: { height: 8, borderRadius: radius.pill, overflow: 'hidden' },
  categoryFill: { height: '100%', borderRadius: radius.pill },
});
