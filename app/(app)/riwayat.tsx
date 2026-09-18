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

  // Ringkasan per Pocket di bulan aktif
  const monthPocketMetrics = useMemo(() => {
    let simpananIn = 0;
    let simpananOut = 0;
    let nabungIn = 0;
    let nabungOut = 0;

    for (const t of monthTransactions) {
      const p = getPocket(t);
      if (p === 'pocket_nabung') {
        if (t.type === 'income') nabungIn += t.amount;
        else nabungOut += t.amount;
      } else {
        if (t.type === 'income') simpananIn += t.amount;
        else simpananOut += t.amount;
      }
    }

    const simpananNet = simpananIn - simpananOut;
    const nabungNet = nabungIn - nabungOut;
    return { simpananNet, nabungNet, simpananIn, nabungIn };
  }, [monthTransactions]);

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

  const isFilterActive = selectedDate !== null || activeCategory !== null || activePocket !== 'all' || searchQuery.trim().length > 0;

  return (
    <ScreenTransitionWrapper>
      <ScrollView
        style={[styles.flex, { backgroundColor: 'transparent' }]}
        contentContainerStyle={[
          styles.container,
          {
            maxWidth: isDesktop ? 1160 : 560,
            paddingHorizontal: isDesktop ? 28 : 16,
            paddingBottom: isDesktop ? 110 : 85,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Toolbar & Month Control */}
        <View style={[styles.headerRow, isDesktop ? styles.headerRowDesktop : null]}>
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.title, { color: colors.ink }]}>Riwayat Transaksi</Text>
            <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
              Kelola, lacak & tinjau seluruh mutasi arus kas masuk dan keluar
            </Text>
          </View>

          {/* Month Controller Bar */}
          <View
            style={[
              styles.monthControlCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              isDark ? shadow.cardDark : shadow.card,
            ]}
          >
            <TouchableOpacity
              onPress={() => goMonth(-1)}
              hitSlop={8}
              style={[styles.monthNavBtn, { backgroundColor: colors.surfaceAlt }]}
              accessibilityLabel="Bulan sebelumnya"
            >
              <Ionicons name="chevron-back" size={16} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.monthLabelBtn}
              onPress={() => setCalendarVisible(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
            >
              <Ionicons name="calendar" size={14} color={colors.primary} />
              <Text style={[styles.monthLabelText, { color: colors.ink }]}>
                {formatBulanTahun(month)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => goMonth(1)}
              disabled={isCurrentOrFutureMonth}
              hitSlop={8}
              style={[
                styles.monthNavBtn,
                {
                  backgroundColor: isCurrentOrFutureMonth ? 'transparent' : colors.surfaceAlt,
                  opacity: isCurrentOrFutureMonth ? 0.4 : 1,
                },
              ]}
              accessibilityLabel="Bulan berikutnya"
            >
              <Ionicons
                name="chevron-forward"
                size={16}
                color={isCurrentOrFutureMonth ? colors.inkMuted : colors.primary}
              />
            </TouchableOpacity>

            <View style={[styles.monthDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={[
                styles.calendarQuickBtn,
                { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.16)' : 'rgba(37, 99, 235, 0.08)' },
              ]}
              onPress={() => setCalendarVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.calendarQuickBtnText, { color: colors.primary }]}>Kalender</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Top 3 KPI Financial Summary Cards */}
        {!error && (
          <View style={isDesktop ? styles.kpiGridDesktop : styles.kpiGridMobile}>
            {/* Card Pemasukan */}
            <View
              style={[
                styles.kpiCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDark ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.2)',
                },
                isDark ? shadow.cardDark : shadow.card,
              ]}
            >
              <View style={styles.kpiCardHeader}>
                <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.12)' }]}>
                  <Ionicons name="arrow-down" size={18} color="#16A34A" />
                </View>
                <View style={[styles.kpiBadgePill, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                  <Text style={[styles.kpiBadgeText, { color: '#16A34A' }]}>Kas Masuk</Text>
                </View>
              </View>
              <Text style={[styles.kpiLabel, { color: colors.inkMuted }]}>TOTAL PEMASUKAN</Text>
              <Text style={[styles.kpiValue, { color: '#16A34A' }]}>
                +{formatRupiah(totalIncome)}
              </Text>
            </View>

            {/* Card Pengeluaran */}
            <View
              style={[
                styles.kpiCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDark ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.2)',
                },
                isDark ? shadow.cardDark : shadow.card,
              ]}
            >
              <View style={styles.kpiCardHeader}>
                <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                  <Ionicons name="arrow-up" size={18} color="#DC2626" />
                </View>
                <View style={[styles.kpiBadgePill, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <Text style={[styles.kpiBadgeText, { color: '#DC2626' }]}>Kas Keluar</Text>
                </View>
              </View>
              <Text style={[styles.kpiLabel, { color: colors.inkMuted }]}>TOTAL PENGELUARAN</Text>
              <Text style={[styles.kpiValue, { color: '#DC2626' }]}>
                -{formatRupiah(totalExpense)}
              </Text>
            </View>

            {/* Card Selisih / Surplus Bersih */}
            <View
              style={[
                styles.kpiCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.2)',
                },
                isDark ? shadow.cardDark : shadow.card,
              ]}
            >
              <View style={styles.kpiCardHeader}>
                <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                  <Ionicons name="wallet-outline" size={18} color={colors.primary} />
                </View>
                <View
                  style={[
                    styles.kpiBadgePill,
                    {
                      backgroundColor:
                        netSaldo >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.kpiBadgeText,
                      { color: netSaldo >= 0 ? '#16A34A' : '#DC2626' },
                    ]}
                  >
                    {netSaldo >= 0 ? 'Surplus Bersih' : 'Defisit'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.kpiLabel, { color: colors.inkMuted }]}>ARUS KAS BERSIH</Text>
              <Text
                style={[
                  styles.kpiValue,
                  { color: netSaldo >= 0 ? colors.primary : '#DC2626' },
                ]}
              >
                {netSaldo < 0 ? '-' : '+'}{formatRupiah(netSaldo)}
              </Text>
            </View>
          </View>
        )}

        {/* 3. Main Desktop Dual-Pane Layout / Mobile Stack */}
        <View style={isDesktop ? styles.mainSplitDesktop : styles.mainSplitMobile}>
          {/* Left Panel: Pocket Breakdown & Categories Filter */}
          <View style={isDesktop ? styles.sideColDesktop : styles.sideColMobile}>
            {/* Pocket Allocation & Filter Card */}
            <View
              style={[
                styles.sideCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                isDark ? shadow.cardDark : shadow.card,
              ]}
            >
              <View style={styles.sideCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="albums-outline" size={17} color={colors.primary} />
                  <Text style={[styles.sideCardTitle, { color: colors.ink }]}>Filter Pocket</Text>
                </View>
              </View>

              <View style={styles.pocketFilterBtns}>
                <TouchableOpacity
                  style={[
                    styles.pocketBtn,
                    activePocket === 'all'
                      ? { backgroundColor: colors.primary, borderColor: colors.primary }
                      : { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                  ]}
                  onPress={() => setActivePocket('all')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pocketBtnText,
                      { color: activePocket === 'all' ? '#FFFFFF' : colors.ink },
                    ]}
                  >
                    Semua Pocket
                  </Text>
                  <View
                    style={[
                      styles.pocketCountBadge,
                      { backgroundColor: activePocket === 'all' ? 'rgba(255,255,255,0.2)' : colors.border },
                    ]}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '700', color: activePocket === 'all' ? '#FFFFFF' : colors.inkMuted }}>
                      {monthTransactions.length}
                    </Text>
                  </View>
                </TouchableOpacity>

                {POCKET_LIST.map((p) => {
                  const isSelected = activePocket === p.id;
                  const count = monthTransactions.filter((t) => getPocket(t) === p.id).length;
                  const netAmount = p.id === 'pocket_nabung' ? monthPocketMetrics.nabungNet : monthPocketMetrics.simpananNet;

                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.pocketBtn,
                        isSelected
                          ? { backgroundColor: p.color, borderColor: p.color }
                          : { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                      ]}
                      onPress={() => setActivePocket(p.id)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons
                          name={p.icon}
                          size={14}
                          color={isSelected ? '#FFFFFF' : p.color}
                        />
                        <Text
                          style={[
                            styles.pocketBtnText,
                            { color: isSelected ? '#FFFFFF' : colors.ink },
                          ]}
                        >
                          {p.name}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text
                          style={[
                            styles.pocketNetSmall,
                            { color: isSelected ? 'rgba(255,255,255,0.9)' : colors.inkMuted },
                          ]}
                        >
                          {formatRupiah(netAmount)}
                        </Text>
                        <View
                          style={[
                            styles.pocketCountBadge,
                            { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.border },
                          ]}
                        >
                          <Text style={{ fontSize: 10, fontWeight: '700', color: isSelected ? '#FFFFFF' : colors.inkMuted }}>
                            {count}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Filter Kategori Card */}
            {categoriesInMonth.length > 0 && (
              <View
                style={[
                  styles.sideCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  isDark ? shadow.cardDark : shadow.card,
                ]}
              >
                <View style={styles.sideCardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="pricetags-outline" size={17} color={colors.primary} />
                    <Text style={[styles.sideCardTitle, { color: colors.ink }]}>Kategori Bulan Ini</Text>
                  </View>
                  {activeCategory && (
                    <TouchableOpacity onPress={() => setActiveCategory(null)} hitSlop={6}>
                      <Text style={[styles.resetCatText, { color: colors.primary }]}>Reset</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.categoryChipsWrap}>
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      activeCategory === null
                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                        : { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                    ]}
                    onPress={() => setActiveCategory(null)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        { color: activeCategory === null ? '#FFFFFF' : colors.ink },
                      ]}
                    >
                      Semua
                    </Text>
                  </TouchableOpacity>

                  {categoriesInMonth.map((c) => {
                    const isSelected = activeCategory === c;
                    return (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.categoryChip,
                          isSelected
                            ? { backgroundColor: colors.primary, borderColor: colors.primary }
                            : { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                        ]}
                        onPress={() => setActiveCategory(isSelected ? null : c)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={iconForCategory(c)}
                          size={12}
                          color={isSelected ? '#FFFFFF' : colors.inkMuted}
                        />
                        <Text
                          style={[
                            styles.categoryChipText,
                            { color: isSelected ? '#FFFFFF' : colors.ink },
                          ]}
                        >
                          {c}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Quick Navigation / Action Tile */}
            <View
              style={[
                styles.sideCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                isDark ? shadow.cardDark : shadow.card,
              ]}
            >
              <TouchableOpacity
                style={[styles.quickNavBtn, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.14)' : 'rgba(37, 99, 235, 0.08)' }]}
                onPress={() => router.push('/transaksi')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickNavIcon, { backgroundColor: colors.primary }]}>
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.quickNavTitle, { color: colors.ink }]}>Catat Transaksi Baru</Text>
                  <Text style={[styles.quickNavSub, { color: colors.inkMuted }]}>Tambah pemasukan / belanja</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickNavBtn, { marginTop: 8, backgroundColor: isDark ? 'rgba(16, 185, 129, 0.14)' : 'rgba(16, 185, 129, 0.08)' }]}
                onPress={() => router.push('/laporan')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickNavIcon, { backgroundColor: '#10B981' }]}>
                  <Ionicons name="document-text-outline" size={16} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.quickNavTitle, { color: colors.ink }]}>Laporan Keuangan</Text>
                  <Text style={[styles.quickNavSub, { color: colors.inkMuted }]}>Ekspor PDF & ringkasan</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#10B981" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Right Panel: Transaction Ledger & Search */}
          <View style={isDesktop ? styles.ledgerColDesktop : styles.ledgerColMobile}>
            <View
              style={[
                styles.ledgerCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                isDark ? shadow.cardDark : shadow.card,
              ]}
            >
              {/* Ledger Header & Search Input */}
              <View style={styles.ledgerHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="receipt-outline" size={19} color={colors.primary} />
                    <Text style={[styles.ledgerTitle, { color: colors.ink }]}>
                      Daftar Mutasi Kas
                    </Text>
                    <View style={[styles.countBadge, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)' }]}>
                      <Text style={[styles.countBadgeText, { color: colors.primary }]}>
                        {filtered.length} Transaksi
                      </Text>
                    </View>
                  </View>

                  {isFilterActive && (
                    <TouchableOpacity
                      style={styles.clearFilterBadge}
                      onPress={clearAllFilters}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle" size={14} color="#DC2626" />
                      <Text style={styles.clearFilterBadgeText}>Reset Filter</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Search Bar Input */}
                <View
                  style={[
                    styles.searchBar,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons name="search" size={16} color={colors.inkMuted} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.ink }]}
                    placeholder="Cari kategori, catatan mutasi, atau nominal..."
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

                {/* Banner Tanggal Aktif */}
                {selectedDate && (
                  <View
                    style={[
                      styles.activeDateBanner,
                      {
                        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.14)' : 'rgba(37, 99, 235, 0.08)',
                        borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(37, 99, 235, 0.2)',
                      },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                      <Text style={[styles.activeDateText, { color: colors.ink }]}>
                        Menampilkan tanggal: <Text style={{ fontWeight: '800' }}>{formatTanggalPanjang(selectedDate)}</Text>
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedDate(null)} hitSlop={6}>
                      <Ionicons name="close" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Transactions Items List */}
              {error ? (
                <ErrorState onRetry={fetchTransactions} />
              ) : loading ? (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <Text style={[styles.loadingText, { color: colors.inkMuted }]}>
                    Memuat data transaksi...
                  </Text>
                </View>
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon="receipt-outline"
                  title="Tidak ada transaksi ditemukan"
                  description={
                    isFilterActive
                      ? 'Tidak ada mutasi yang sesuai dengan filter atau kata kunci pencarian.'
                      : `Belum ada catatan transaksi pada bulan ${formatBulanTahun(month)}.`
                  }
                />
              ) : (
                <View style={styles.txListWrapper}>
                  {filtered.map((t, i) => {
                    const itemPocket = getPocket(t);
                    const pocketCfg = POCKET_CONFIG[itemPocket];
                    const cleanNote = cleanPocketNote(t.note);
                    const isIncome = t.type === 'income';

                    return (
                      <TouchableOpacity
                        key={t.id}
                        style={[
                          styles.txRow,
                          i < filtered.length - 1 && [styles.txRowBorder, { borderBottomColor: colors.border }],
                        ]}
                        onPress={() => router.push({ pathname: '/transaksi', params: { id: t.id } })}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.txIconWrap,
                            {
                              backgroundColor: isIncome ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
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
                            <Text style={[styles.txCategory, { color: colors.ink }]}>{t.category}</Text>
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
                          >
                            {isIncome ? '+' : '-'}
                            {formatRupiah(t.amount)}
                          </Text>
                          <Ionicons name="chevron-forward" size={14} color={colors.inkMuted} />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </View>

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
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  headerRowDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  // Month Control Card
  monthControlCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  monthNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  monthLabelText: {
    fontSize: 13,
    fontWeight: '800',
  },
  monthDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 6,
  },
  calendarQuickBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  calendarQuickBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Top KPI Cards Grid
  kpiGridDesktop: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  kpiGridMobile: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  kpiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kpiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  kpiBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 3,
  },

  // Main 2-Pane Section
  mainSplitDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  mainSplitMobile: {
    flexDirection: 'column',
    gap: 16,
  },
  sideColDesktop: {
    flex: 0.85,
    gap: 16,
  },
  sideColMobile: {
    width: '100%',
    gap: 14,
  },
  ledgerColDesktop: {
    flex: 1.15,
  },
  ledgerColMobile: {
    width: '100%',
  },

  // Side Cards (Filters & Actions)
  sideCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 16,
  },
  sideCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sideCardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  pocketFilterBtns: {
    gap: 8,
  },
  pocketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  pocketBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pocketNetSmall: {
    fontSize: 11,
    fontWeight: '600',
  },
  pocketCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  resetCatText: {
    fontSize: 11,
    fontWeight: '700',
  },
  categoryChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  quickNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radius.lg,
  },
  quickNavIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickNavTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  quickNavSub: {
    fontSize: 10,
    marginTop: 1,
  },

  // Ledger Card (Right)
  ledgerCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 18,
  },
  ledgerHeader: {
    marginBottom: 12,
  },
  ledgerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  clearFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  clearFilterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 12,
    fontWeight: '600',
  },
  activeDateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: 8,
  },
  activeDateText: {
    fontSize: 11,
  },

  // Transaction Row
  txListWrapper: {
    gap: 2,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  txRowBorder: {
    borderBottomWidth: 1,
  },
  txIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
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
    gap: 6,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  miniPocketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  miniPocketBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  loadingText: {
    fontSize: 13,
  },
});
