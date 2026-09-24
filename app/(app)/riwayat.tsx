import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import { spacing, radius, shadow } from '../../constants/theme';
import { Card, EmptyState, ErrorState, Chip } from '../../components/ui';
import { CalendarModal } from '../../components/CalendarModal';
import { ScreenTransitionWrapper } from '../../components/ScreenTransitionWrapper';
import { iconForCategory } from '../../constants/categories';
import {
  currentMonthKey,
  formatBulanTahun,
  formatTanggalPanjang,
  monthKey,
  shiftMonth,
} from '../../utils/date';
import {
  POCKET_LIST,
  POCKET_CONFIG,
  getPocket,
  cleanPocketNote,
} from '../../constants/pockets';
import type { Transaction, PocketType } from '../../types';

function formatRupiah(value: number) {
  return 'Rp ' + Math.round(Math.abs(value)).toLocaleString('id-ID');
}

export default function RiwayatScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [month, setMonth] = useState(currentMonthKey());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activePocket, setActivePocket] = useState<'all' | PocketType>('all');
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filter berdasar tanggal spesifik, kategori, pocket, dan kata kunci pencarian
  const filtered = useMemo(() => {
    let list = monthTransactions;
    if (selectedDate) {
      list = list.filter((t) => t.date === selectedDate);
    }
    if (activeCategory) {
      list = list.filter((t) => t.category === activeCategory);
    }
    if (activePocket !== 'all') {
      list = list.filter((t) => getPocket(t) === activePocket);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.category.toLowerCase().includes(q) ||
          (t.note && t.note.toLowerCase().includes(q)) ||
          t.amount.toString().includes(q)
      );
    }
    return list;
  }, [monthTransactions, selectedDate, activeCategory, activePocket, searchQuery]);

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netSaldo = totalIncome - totalExpense;
  const isCurrentOrFutureMonth = month >= currentMonthKey();

  const goMonth = (delta: number) => {
    setMonth((m) => shiftMonth(m, delta));
    setSelectedDate(null);
    setActiveCategory(null);
    setActivePocket('all');
    setSearchQuery('');
  };

  const handleSelectMonth = (newMonth: string) => {
    setMonth(newMonth);
    setActiveCategory(null);
    setActivePocket('all');
    setSearchQuery('');
  };

  const handleSelectDate = (dateISO: string | null) => {
    setSelectedDate(dateISO);
  };

  const clearAllFilters = () => {
    setSelectedDate(null);
    setActiveCategory(null);
    setActivePocket('all');
    setSearchQuery('');
  };

  const isFilterActive =
    selectedDate !== null ||
    activeCategory !== null ||
    activePocket !== 'all' ||
    searchQuery.trim().length > 0;

  return (
    <ScreenTransitionWrapper>
      <ScrollView
        style={[styles.flex, { backgroundColor: 'transparent' }]}
        contentContainerStyle={[
          styles.container,
          {
            maxWidth: isDesktop ? 960 : 540,
            paddingHorizontal: isDesktop ? 24 : 14,
            paddingBottom: isDesktop ? 100 : 85,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Toolbar */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.ink }]}>Riwayat Transaksi</Text>
            <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
              Kelola & pantau mutasi arus kas
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.calendarIconButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isDark ? shadow.cardDark : shadow.card,
            ]}
            onPress={() => setCalendarVisible(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Ionicons name="calendar" size={16} color={colors.primary} />
            <Text style={[styles.calendarBtnText, { color: colors.primary }]}>Kalender</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Month Selector Card */}
        <View
          style={[
            styles.monthCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
            isDark ? shadow.cardDark : shadow.card,
          ]}
        >
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
          >
            <Text style={[styles.monthLabel, { color: colors.ink }]}>
              {formatBulanTahun(month)}
            </Text>
            <View style={styles.monthTag}>
              <Ionicons name="calendar-outline" size={11} color={colors.primary} />
              <Text style={[styles.monthTagText, { color: colors.primary }]}>Ganti Bulan</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => goMonth(1)}
            disabled={isCurrentOrFutureMonth}
            hitSlop={8}
            style={[
              styles.monthArrow,
              {
                backgroundColor: isCurrentOrFutureMonth ? 'transparent' : colors.surfaceAlt,
                opacity: isCurrentOrFutureMonth ? 0.3 : 1,
              },
            ]}
            accessibilityLabel="Bulan berikutnya"
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isCurrentOrFutureMonth ? colors.inkMuted : colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* 3. Ringkasan Finansial 3 Metrik (Pemasukan, Pengeluaran, Bersih) */}
        {!error && (
          <View
            style={[
              styles.summaryRow,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isDark ? shadow.cardDark : shadow.card,
            ]}
          >
            {/* Pemasukan */}
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: 'rgba(34, 197, 94, 0.12)' }]}>
                <Ionicons name="arrow-down" size={14} color="#16A34A" />
              </View>
              <View style={styles.summaryTextWrap}>
                <Text style={[styles.summaryLabel, { color: colors.inkMuted }]}>Pemasukan</Text>
                <Text style={[styles.summaryValue, { color: '#16A34A' }]} numberOfLines={1}>
                  +{formatRupiah(totalIncome)}
                </Text>
              </View>
            </View>

            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

            {/* Pengeluaran */}
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                <Ionicons name="arrow-up" size={14} color="#DC2626" />
              </View>
              <View style={styles.summaryTextWrap}>
                <Text style={[styles.summaryLabel, { color: colors.inkMuted }]}>Pengeluaran</Text>
                <Text style={[styles.summaryValue, { color: '#DC2626' }]} numberOfLines={1}>
                  -{formatRupiah(totalExpense)}
                </Text>
              </View>
            </View>

            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

            {/* Bersih / Surplus */}
            <View style={styles.summaryItem}>
              <View
                style={[
                  styles.summaryIcon,
                  {
                    backgroundColor:
                      netSaldo >= 0
                        ? 'rgba(34, 197, 94, 0.12)'
                        : 'rgba(239, 68, 68, 0.12)',
                  },
                ]}
              >
                <Ionicons
                  name="wallet-outline"
                  size={14}
                  color={netSaldo >= 0 ? '#16A34A' : '#DC2626'}
                />
              </View>
              <View style={styles.summaryTextWrap}>
                <Text style={[styles.summaryLabel, { color: colors.inkMuted }]}>Bersih</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: netSaldo >= 0 ? colors.primary : '#DC2626' },
                  ]}
                  numberOfLines={1}
                >
                  {netSaldo < 0 ? '-' : '+'}{formatRupiah(netSaldo)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 4. Filter Pocket Kas (Horizontal Scrollable Chips - Never Cropped on HP) */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollRow}
          >
            <Chip
              label={`Semua Pocket (${monthTransactions.length})`}
              selected={activePocket === 'all'}
              onPress={() => setActivePocket('all')}
            />
            {POCKET_LIST.map((p) => {
              const count = monthTransactions.filter((t) => getPocket(t) === p.id).length;
              return (
                <Chip
                  key={p.id}
                  label={`${p.name} (${count})`}
                  icon={p.icon}
                  selected={activePocket === p.id}
                  onPress={() => setActivePocket(p.id)}
                />
              );
            })}
          </ScrollView>
        </View>

        {/* 5. Filter Kategori (Horizontal Scrollable Chips) */}
        {categoriesInMonth.length > 0 && (
          <View style={styles.filterSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollRow}
            >
              <Chip
                label="Semua Kategori"
                selected={activeCategory === null}
                onPress={() => setActiveCategory(null)}
              />
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
          </View>
        )}

        {/* 6. Search Bar Input */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            isDark ? shadow.cardDark : shadow.card,
          ]}
        >
          <Ionicons name="search" size={16} color={colors.inkMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.ink }]}
            placeholder="Cari transaksi, kategori, atau catatan..."
            placeholderTextColor={colors.inkMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.inkMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Active Filters Reset Banner */}
        {isFilterActive && (
          <View
            style={[
              styles.activeFilterBanner,
              {
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(37, 99, 235, 0.08)',
                borderColor: isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.18)',
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <Ionicons name="funnel" size={13} color={colors.primary} />
              <Text style={[styles.activeFilterText, { color: colors.ink }]} numberOfLines={1}>
                {selectedDate
                  ? `Tanggal: ${formatTanggalPanjang(selectedDate)}`
                  : activeCategory
                  ? `Kategori: ${activeCategory}`
                  : activePocket !== 'all'
                  ? `Pocket: ${POCKET_CONFIG[activePocket].name}`
                  : `Cari: "${searchQuery}"`}
              </Text>
            </View>
            <TouchableOpacity onPress={clearAllFilters} hitSlop={8} style={styles.clearFilterBtn}>
              <Ionicons name="close-circle" size={14} color="#DC2626" />
              <Text style={styles.clearFilterBtnText}>Reset Filter</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 7. Daftar Transaksi List Card */}
        <Card style={styles.listCard}>
          {error ? (
            <ErrorState onRetry={fetchTransactions} />
          ) : loading ? (
            <Text style={[styles.loadingText, { color: colors.inkMuted }]}>
              Memuat data transaksi...
            </Text>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="Tidak ada transaksi"
              description={
                isFilterActive
                  ? 'Tidak ada mutasi yang sesuai dengan filter atau kata kunci.'
                  : `Belum ada catatan transaksi pada bulan ${formatBulanTahun(month)}.`
              }
            />
          ) : (
            filtered.map((t, i) => {
              const itemPocket = getPocket(t);
              const pocketCfg = POCKET_CONFIG[itemPocket];
              const cleanNote = cleanPocketNote(t.note);
              const isIncome = t.type === 'income';

              return (
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
                        backgroundColor: isIncome
                          ? 'rgba(34, 197, 94, 0.12)'
                          : 'rgba(239, 68, 68, 0.12)',
                      },
                    ]}
                  >
                    <Ionicons
                      name={iconForCategory(t.category)}
                      size={18}
                      color={isIncome ? '#16A34A' : '#DC2626'}
                    />
                  </View>

                  <View style={styles.flex1}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.txCategory, { color: colors.ink }]} numberOfLines={1}>
                        {t.category}
                      </Text>
                      <View
                        style={[
                          styles.miniPocketBadge,
                          {
                            backgroundColor:
                              itemPocket === 'pocket_nabung'
                                ? 'rgba(16, 185, 129, 0.12)'
                                : 'rgba(37, 99, 235, 0.12)',
                          },
                        ]}
                      >
                        <Ionicons
                          name={pocketCfg.icon}
                          size={10}
                          color={itemPocket === 'pocket_nabung' ? '#10B981' : '#2563EB'}
                        />
                        <Text
                          style={[
                            styles.miniPocketBadgeText,
                            { color: itemPocket === 'pocket_nabung' ? '#059669' : '#2563EB' },
                          ]}
                        >
                          {pocketCfg.shortName}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.txMeta, { color: colors.inkMuted }]} numberOfLines={1}>
                      {t.date}
                      {cleanNote ? ` · ${cleanNote}` : ''}
                    </Text>
                  </View>

                  <View style={styles.txRight}>
                    <Text
                      style={[
                        styles.txAmount,
                        { color: isIncome ? '#16A34A' : '#DC2626' },
                      ]}
                      numberOfLines={1}
                    >
                      {isIncome ? '+' : '-'}
                      {formatRupiah(t.amount)}
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.inkMuted} />
                  </View>
                </TouchableOpacity>
              );
            })
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
    </ScreenTransitionWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flex1: { flex: 1 },
  container: {
    paddingVertical: spacing.md,
    alignSelf: 'center',
    width: '100%',
  },

  // Header Row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  calendarIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  calendarBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Month Card
  monthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.cards,
    borderWidth: 1,
    marginBottom: 12,
  },
  monthArrow: {
    width: 34,
    height: 34,
    borderRadius: radius.buttons,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCenter: {
    alignItems: 'center',
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  monthTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  monthTagText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // 3-Metrik Financial Summary Row (Responsive & Compact on Mobile)
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.cards,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextWrap: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 1,
  },
  summaryDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 4,
  },

  // Filter Chips Scroll Rows
  filterSection: {
    marginBottom: 10,
  },
  filterScrollRow: {
    gap: 8,
    paddingRight: 10,
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.buttons,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    fontWeight: '600',
  },

  // Active Filter Banner
  activeFilterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.badges,
    borderWidth: 1,
    marginBottom: 12,
  },
  activeFilterText: {
    fontSize: 11,
    fontWeight: '600',
  },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  clearFilterBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },

  // List Card & Items
  listCard: {
    borderRadius: radius.cards,
  },
  loadingText: {
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  txRowBorder: {
    borderTopWidth: 1,
  },
  txIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txCategory: {
    fontSize: 14,
    fontWeight: '700',
  },
  txMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  txRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  miniPocketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.badges,
  },
  miniPocketBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
});
