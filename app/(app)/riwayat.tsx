import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import { spacing, radius } from '../../constants/theme';
import { Card, EmptyState, ErrorState, Chip } from '../../components/ui';
import { CalendarModal } from '../../components/CalendarModal';
import { iconForCategory } from '../../constants/categories';
import {
  currentMonthKey,
  formatBulanTahun,
  formatTanggalPanjang,
  monthKey,
  shiftMonth,
} from '../../utils/date';
import type { Transaction } from '../../types';

function formatRupiah(value: number) {
  return 'Rp' + Math.round(Math.abs(value)).toLocaleString('id-ID');
}

export default function RiwayatScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [month, setMonth] = useState(currentMonthKey());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
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

  // Refresh otomatis setiap kali halaman ini difokuskan
  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [fetchTransactions])
  );

  // Map tanggal transaksi untuk dot indikator di kalender
  const transactionDatesMap = useMemo(() => {
    const map: Record<string, { incomeCount: number; expenseCount: number }> = {};
    for (const t of transactions) {
      if (!map[t.date]) {
        map[t.date] = { incomeCount: 0, expenseCount: 0 };
      }
      if (t.type === 'income') {
        map[t.date].incomeCount += 1;
      } else {
        map[t.date].expenseCount += 1;
      }
    }
    return map;
  }, [transactions]);

  // Transaksi di bulan aktif
  const monthTransactions = useMemo(
    () => transactions.filter((t) => monthKey(t.date) === month),
    [transactions, month]
  );

  const categoriesInMonth = useMemo(
    () => Array.from(new Set(monthTransactions.map((t) => t.category))),
    [monthTransactions]
  );

  // Filter berdasar tanggal spesifik dan/atau kategori
  const filtered = useMemo(() => {
    let list = monthTransactions;
    if (selectedDate) {
      list = list.filter((t) => t.date === selectedDate);
    }
    if (activeCategory) {
      list = list.filter((t) => t.category === activeCategory);
    }
    return list;
  }, [monthTransactions, selectedDate, activeCategory]);

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const isCurrentOrFutureMonth = month >= currentMonthKey();

  const goMonth = (delta: number) => {
    setMonth((m) => shiftMonth(m, delta));
    setSelectedDate(null);
    setActiveCategory(null);
  };

  const handleSelectMonth = (newMonth: string) => {
    setMonth(newMonth);
    setActiveCategory(null);
  };

  const handleSelectDate = (dateISO: string | null) => {
    setSelectedDate(dateISO);
  };

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.container,
        { maxWidth: isDesktop ? 1080 : 540, paddingBottom: isDesktop ? 110 : 85 },
      ]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.ink }]}>Riwayat Transaksi</Text>
          <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
            Kelola dan pantau arus keuanganmu
          </Text>
        </View>

        {/* Tombol Buka Kalender Utama */}
        <TouchableOpacity
          style={[styles.calendarIconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setCalendarVisible(true)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Buka Kalender"
        >
          <Ionicons name="calendar" size={18} color={colors.primary} />
          <Text style={[styles.calendarBtnText, { color: colors.primary }]}>Kalender</Text>
        </TouchableOpacity>
      </View>

      {/* Navigasi Bulan dengan Quick Calendar Modal Opener */}
      <View style={[styles.monthCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => goMonth(-1)}
          hitSlop={8}
          style={[styles.monthArrow, { backgroundColor: colors.surfaceAlt }]}
          accessibilityLabel="Bulan sebelumnya"
        >
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.monthCenter}
          onPress={() => setCalendarVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Pilih bulan atau tanggal"
        >
          <Text style={[styles.monthLabel, { color: colors.ink }]}>{formatBulanTahun(month)}</Text>
          <View style={styles.monthTag}>
            <Ionicons name="calendar-outline" size={12} color={colors.primary} />
            <Text style={[styles.monthTagText, { color: colors.primary }]}>Pilih Cepat</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => goMonth(1)}
          disabled={isCurrentOrFutureMonth}
          hitSlop={8}
          style={[
            styles.monthArrow,
            { backgroundColor: isCurrentOrFutureMonth ? 'transparent' : colors.surfaceAlt },
          ]}
          accessibilityLabel="Bulan berikutnya"
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color={isCurrentOrFutureMonth ? colors.border : colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Banner Filter Tanggal Aktif (jika tanggal spesifik dipilih via kalender) */}
      {selectedDate && (
        <View style={[styles.dateFilterBanner, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
          <View style={styles.dateFilterLeft}>
            <Ionicons name="filter" size={16} color={colors.primary} />
            <Text style={[styles.dateFilterText, { color: colors.ink }]}>
              Hanya {formatTanggalPanjang(selectedDate)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.clearDateBtn, { backgroundColor: colors.surface }]}
            onPress={() => setSelectedDate(null)}
            hitSlop={8}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle" size={16} color={colors.primary} />
            <Text style={[styles.clearDateText, { color: colors.primary }]}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Ringkasan Finansial */}
      {!error && (
        <View style={[styles.summaryRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.incomeBg }]}>
              <Ionicons name="arrow-down" size={16} color={colors.income} />
            </View>
            <View style={styles.summaryTextWrap}>
              <Text style={styles.summaryLabel}>Pemasukan</Text>
              <Text style={[styles.summaryValue, { color: colors.income }]}>
                +{formatRupiah(totalIncome)}
              </Text>
            </View>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.expenseBg }]}>
              <Ionicons name="arrow-up" size={16} color={colors.expense} />
            </View>
            <View style={styles.summaryTextWrap}>
              <Text style={styles.summaryLabel}>Pengeluaran</Text>
              <Text style={[styles.summaryValue, { color: colors.expense }]}>
                -{formatRupiah(totalExpense)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Filter Kategori */}
      {categoriesInMonth.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          <Chip label="Semua" selected={activeCategory === null} onPress={() => setActiveCategory(null)} />
          {categoriesInMonth.map((c) => (
            <Chip
              key={c}
              label={c}
              icon={iconForCategory(c)}
              selected={activeCategory === c}
              onPress={() => setActiveCategory(c)}
            />
          ))}
        </ScrollView>
      )}

      {/* Daftar Transaksi */}
      <Card style={styles.listCard}>
        {error ? (
          <ErrorState onRetry={fetchTransactions} />
        ) : loading ? (
          <Text style={[styles.loadingText, { color: colors.inkMuted }]}>Memuat catatan...</Text>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="Nggak ada transaksi"
            description={
              selectedDate
                ? `Belum ada catatan transaksi pada tanggal ${selectedDate}.`
                : 'Nggak ada transaksi buat bulan/kategori ini.'
            }
          />
        ) : (
          filtered.map((t, i) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.txRow,
                i > 0 && [styles.txRowBorder, { borderTopColor: colors.border }],
              ]}
              onPress={() => router.push({ pathname: '/transaksi', params: { id: t.id } })}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.txIconWrap,
                  {
                    backgroundColor: t.type === 'income' ? colors.incomeBg : colors.expenseBg,
                  },
                ]}
              >
                <Ionicons
                  name={iconForCategory(t.category)}
                  size={18}
                  color={t.type === 'income' ? colors.income : colors.expense}
                />
              </View>

              <View style={styles.flex1}>
                <Text style={[styles.txCategory, { color: colors.ink }]}>{t.category}</Text>
                <Text style={[styles.txMeta, { color: colors.inkMuted }]} numberOfLines={1}>
                  {t.date}
                  {t.note ? ` · ${t.note}` : ''}
                </Text>
              </View>

              <View style={styles.txRight}>
                <Text
                  style={[
                    styles.txAmount,
                    { color: t.type === 'income' ? colors.income : colors.expense },
                  ]}
                >
                  {t.type === 'income' ? '+' : '-'}
                  {formatRupiah(t.amount)}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={colors.inkMuted} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </Card>

      {/* Modal Kalender */}
      <CalendarModal
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        currentMonth={month}
        selectedDate={selectedDate}
        onSelectMonth={handleSelectMonth}
        onSelectDate={handleSelectDate}
        transactionDates={transactionDatesMap}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flex1: { flex: 1 },
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  calendarIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  calendarBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
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
  monthCenter: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  monthTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  monthTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dateFilterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  dateFilterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dateFilterText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  clearDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  clearDateText: {
    fontSize: 11,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextWrap: {
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    marginHorizontal: spacing.xs,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#8E9BAE',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  filterScroll: {
    marginBottom: spacing.sm,
  },
  filterRow: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  listCard: {
    marginTop: spacing.xs,
  },
  loadingText: {
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  txRowBorder: {
    borderTopWidth: 1,
  },
  txIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txCategory: {
    fontSize: 15,
    fontWeight: '700',
  },
  txMeta: {
    fontSize: 12,
    marginTop: 3,
  },
  txRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
});
