import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  TextInput,
  Alert,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import { spacing, radius, shadow } from '../../constants/theme';
import { Card, SectionLabel, EmptyState, ErrorState, LiquidSheenBeam } from '../../components/ui';
import { ServerConfigModal } from '../../components/ServerConfigModal';
import { MarketTicker } from '../../components/MarketTicker';
import { ScreenTransitionWrapper } from '../../components/ScreenTransitionWrapper';
import { iconForCategory } from '../../constants/categories';
import {
  POCKET_LIST,
  POCKET_CONFIG,
  getPocket,
  calculatePocketMetrics,
  cleanPocketNote,
  formatNoteWithPocket,
} from '../../constants/pockets';
import type { Transaction, PocketType } from '../../types';

function formatRupiah(value: number) {
  return 'Rp ' + Math.round(Math.abs(value)).toLocaleString('id-ID');
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

function getFormattedDate(): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const now = new Date();
  return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

export default function DashboardScreen() {
  const { user, isAdmin } = useAuth();
  const { colors, isDark, setTheme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [confirmResetVisible, setConfirmResetVisible] = useState(false);
  const [serverConfigVisible, setServerConfigVisible] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetting, setResetting] = useState(false);

  // Split Pocket State & Modal Transfer
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [transferSource, setTransferSource] = useState<PocketType>('simpanan_pertama');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [recentPocketFilter, setRecentPocketFilter] = useState<'all' | PocketType>('all');

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

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const saldo = totalIncome - totalExpense;
  const recent = transactions.slice(0, 8);
  const hasData = transactions.length > 0;

  // Split Pocket Metrics (Simpanan Pertama & Pocket Nabung)
  const pocketMetrics = calculatePocketMetrics(transactions);

  // Filter transaksi terkini berdasarkan pocket yang dipilih
  const filteredRecent = recent.filter(
    (t) => recentPocketFilter === 'all' || getPocket(t) === recentPocketFilter
  );

  // Rasio arus kas
  const totalVolume = totalIncome + totalExpense;
  const incomePercent = totalVolume > 0 ? Math.round((totalIncome / totalVolume) * 100) : (totalIncome > 0 ? 100 : 0);
  const expensePercent = totalVolume > 0 ? Math.round((totalExpense / totalVolume) * 100) : 0;
  const savingsRate = totalIncome > 0 ? Math.round((Math.max(0, saldo) / totalIncome) * 100) : 0;

  // monday.com + iOS Liquid Glass Surfaces
  const isWeb = Platform.OS === 'web';
  const glassCardStyle = {
    backgroundColor: isDark ? 'rgba(30, 34, 53, 0.74)' : 'rgba(255, 255, 255, 0.76)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.75)',
    borderRadius: radius.cards,
    ...(isWeb
      ? ({
          backdropFilter: 'blur(24px) saturate(190%)',
          WebkitBackdropFilter: 'blur(24px) saturate(190%)',
        } as any)
      : {}),
  };

  const simpananGlassStyle = {
    backgroundColor: isDark ? 'rgba(36, 42, 69, 0.75)' : 'rgba(231, 236, 255, 0.75)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.75)',
    borderRadius: radius.cards,
    ...(isWeb
      ? ({
          backdropFilter: 'blur(22px) saturate(190%)',
          WebkitBackdropFilter: 'blur(22px) saturate(190%)',
        } as any)
      : {}),
  };

  const nabungGlassStyle = {
    backgroundColor: isDark ? 'rgba(30, 58, 47, 0.75)' : 'rgba(188, 254, 144, 0.65)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.75)',
    borderRadius: radius.cards,
    ...(isWeb
      ? ({
          backdropFilter: 'blur(22px) saturate(190%)',
          WebkitBackdropFilter: 'blur(22px) saturate(190%)',
        } as any)
      : {}),
  };

  const incomeGlassStyle = {
    backgroundColor: isDark ? 'rgba(30, 34, 53, 0.74)' : 'rgba(255, 255, 255, 0.76)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.75)',
    borderRadius: radius.cards,
    ...(isWeb
      ? ({
          backdropFilter: 'blur(24px) saturate(190%)',
          WebkitBackdropFilter: 'blur(24px) saturate(190%)',
        } as any)
      : {}),
  };

  const expenseGlassStyle = {
    backgroundColor: isDark ? 'rgba(30, 34, 53, 0.74)' : 'rgba(255, 255, 255, 0.76)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.75)',
    borderRadius: radius.cards,
    ...(isWeb
      ? ({
          backdropFilter: 'blur(24px) saturate(190%)',
          WebkitBackdropFilter: 'blur(24px) saturate(190%)',
        } as any)
      : {}),
  };

  const handleOpenTransfer = (defaultSource: PocketType = 'simpanan_pertama') => {
    setTransferSource(defaultSource);
    setTransferAmount('');
    setTransferError('');
    setTransferModalVisible(true);
  };

  const handleExecuteTransfer = async () => {
    const amt = Number(transferAmount);
    if (!amt || amt <= 0) {
      setTransferError('Masukkan nominal pemindahan yang valid.');
      return;
    }
    const destPocket: PocketType = transferSource === 'simpanan_pertama' ? 'pocket_nabung' : 'simpanan_pertama';
    const sourceName = POCKET_CONFIG[transferSource].name;
    const destName = POCKET_CONFIG[destPocket].name;
    const sourceSaldo = transferSource === 'simpanan_pertama' ? pocketMetrics.simpanan.saldo : pocketMetrics.nabung.saldo;

    if (amt > sourceSaldo) {
      setTransferError(`Saldo ${sourceName} tidak mencukupi (${formatRupiah(sourceSaldo)}).`);
      return;
    }

    setTransferring(true);
    setTransferError('');
    const today = new Date().toISOString().split('T')[0];

    try {
      const outNote = formatNoteWithPocket(`Pindah dana ke ${destName}`, transferSource);
      const inNote = formatNoteWithPocket(`Pindahan dari ${sourceName}`, destPocket);

      // Mutasi pengeluaran dari kantong asal
      await api.post('/transactions', {
        type: 'expense',
        amount: amt,
        category: 'Investasi',
        note: outNote,
        pocket: transferSource,
        date: today,
      });

      // Mutasi pemasukan ke kantong tujuan
      await api.post('/transactions', {
        type: 'income',
        amount: amt,
        category: 'Investasi',
        note: inNote,
        pocket: destPocket,
        date: today,
      });

      setTransferModalVisible(false);
      setTransferAmount('');
      await fetchTransactions();
    } catch (e: any) {
      setTransferError(e.message || 'Gagal memproses pemindahan saldo antar pocket.');
    } finally {
      setTransferring(false);
    }
  };

  const handleRefresh = async () => {
    setOptionsModalVisible(false);
    await fetchTransactions();
  };

  const handleResetTheme = () => {
    setOptionsModalVisible(false);
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleOpenResetConfirm = () => {
    setResetError('');
    setResetSuccess(false);
    setConfirmResetVisible(true);
  };

  const handleExecuteResetTransactions = async () => {
    setResetting(true);
    setResetError('');
    try {
      await api.delete('/transactions/reset/all');
      setTransactions([]);
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        setConfirmResetVisible(false);
        setOptionsModalVisible(false);
      }, 1000);
    } catch (e: any) {
      setResetError(e.message || 'Gagal mereset transaksi. Pastikan koneksi server aktif.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <ScreenTransitionWrapper>
      <ScrollView
        style={[styles.flex, { backgroundColor: 'transparent' }]}
        contentContainerStyle={[
          styles.container,
          {
            maxWidth: isDesktop ? 1160 : 540,
            paddingHorizontal: isDesktop ? 28 : 16,
            paddingBottom: isDesktop ? 140 : 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
      {/* 1. Header Greeting & Date Badge */}
      <View style={[styles.welcomeRow, isDesktop ? styles.welcomeRowDesktop : null]}>
        <View style={{ flex: 1 }}>
          <View
            style={[
              styles.datePill,
              {
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.16)' : '#EFF6FF',
                borderColor: isDark ? 'rgba(59, 130, 246, 0.35)' : '#BFDBFE',
              },
            ]}
          >
            <View style={[styles.dateIconCircle, { backgroundColor: colors.primary }]}>
              <Ionicons name="sparkles" size={13} color="#FFFFFF" />
            </View>
            <Text style={[styles.datePillText, { color: colors.ink }]}>
              Financial Command • {getFormattedDate()}
            </Text>
          </View>
          <Text style={[styles.greetingTitle, { color: colors.ink }]}>
            Financial Command, <Text style={{ color: colors.primary }}>{user?.name || 'Alex'}</Text>
          </Text>
          <Text style={[styles.greetingSubtitle, { color: colors.inkMuted }]}>
            Welcome back! Pantau arus kas masuk, pengeluaran harian, dan kesehatan portofolio Anda secara real-time.
          </Text>
        </View>

        {/* Quick Toolbar */}
        <View style={styles.headerToolbar}>
          <TouchableOpacity
            style={[
              styles.toolBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={fetchTransactions}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={16} color={colors.ink} />
            {isDesktop && <Text style={[styles.toolBtnText, { color: colors.ink }]}>Segarkan</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setOptionsModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={16} color={colors.ink} />
            {isDesktop && <Text style={[styles.toolBtnText, { color: colors.ink }]}>Opsi</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Admin VIP Banner (jika admin) */}
      {isAdmin && (
        <TouchableOpacity
          style={[styles.adminBanner, { backgroundColor: isDark ? 'rgba(253, 169, 0, 0.14)' : '#FFF3E0', borderColor: isDark ? 'rgba(253, 169, 0, 0.3)' : '#FFE0B2' }]}
          onPress={() => router.push('/admin')}
          activeOpacity={0.85}
        >
          <View style={styles.adminBadgeIcon}>
            <Ionicons name="shield-checkmark" size={18} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.adminBannerTitle, { color: isDark ? '#FCD34D' : '#92400E' }]}>
              Hak Akses Administrator Aktif
            </Text>
            <Text style={[styles.adminBannerSub, { color: isDark ? '#E5E7EB' : '#78350F' }]}>
              Kelola daftar pengguna, monitoring server API, dan seluruh transaksi sistem.
            </Text>
          </View>
          <View style={styles.adminActionPill}>
            <Text style={styles.adminActionText}>Buka Panel</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      )}

      {error ? (
        <Card>
          <ErrorState onRetry={fetchTransactions} />
        </Card>
      ) : (
        <>
          {/* Informasi Kurs & Indeks Pasar Modal (IHSG, USD, EUR, SGD, JPY, Emas) */}
          <MarketTicker />

          {/* 3. Top Financial Metric Cards Grid */}
          <View style={isDesktop ? styles.metricGridDesktop : styles.metricGridMobile}>
            {/* Kartu Saldo Utama (Hero) - FintechX Brand Panel #3B82F6 */}
            <LinearGradient
              colors={
                isDark
                  ? ['#2563EB', '#1D4ED8']
                  : ['#3B82F6', '#2563EB']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.saldoHeroCard,
                isDesktop ? styles.saldoHeroCardDesktop : null,
                isDark ? shadow.cardDark : shadow.card,
              ]}
            >
              <LiquidSheenBeam />
              <View style={styles.saldoTopRow}>
                <View style={styles.saldoHeaderWrap}>
                  <View style={styles.saldoIconCircle}>
                    <Ionicons name="wallet" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.saldoLabel}>TOTAL SALDO BERSIH</Text>
                </View>
                <View style={styles.activePill}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activePillText}>Aktif</Text>
                </View>
              </View>

              <Text style={styles.saldoNominal}>
                {saldo < 0 ? '-' : ''}{formatRupiah(saldo)}
              </Text>

              <View style={styles.saldoFooterRow}>
                <Text style={styles.saldoSubtext}>
                  {saldo >= 0 ? 'Surplus kas keuangan stabil' : 'Defisit - pengeluaran melampaui pemasukan'}
                </Text>
                <TouchableOpacity
                  style={[styles.cardQuickBtn, { backgroundColor: '#FFFFFF' }]}
                  onPress={() => router.push('/transaksi')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add" size={15} color="#6161FF" />
                  <Text style={[styles.cardQuickBtnText, { color: '#6161FF' }]}>Catat Transaksi</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <View style={isDesktop ? styles.kpiPairDesktop : styles.kpiPairMobile}>
              {/* Kartu Pemasukan */}
              <View
                style={[
                  styles.summaryKpiCard,
                  incomeGlassStyle,
                  isDark ? shadow.cardDark : shadow.card,
                ]}
              >
                <View style={styles.kpiTopRow}>
                  <View style={[styles.kpiIconWrap, { backgroundColor: isDark ? 'rgba(188, 254, 144, 0.2)' : 'rgba(188, 254, 144, 0.45)' }]}>
                    <Ionicons name="arrow-down" size={isDesktop ? 18 : 16} color="#059669" />
                  </View>
                  <View style={[styles.kpiBadge, { backgroundColor: isDark ? 'rgba(188, 254, 144, 0.2)' : '#BCFE90' }]}>
                    <Text style={[styles.kpiBadgeText, { color: isDark ? '#BCFE90' : '#14532D' }]}>
                      {incomePercent}% Arus
                    </Text>
                  </View>
                </View>
                <Text style={[styles.kpiLabel, { color: colors.inkMuted }]}>PEMASUKAN</Text>
                <Text
                  style={[styles.kpiValue, { color: '#059669', fontSize: isDesktop ? 24 : 17 }]}
                  numberOfLines={1}
                >
                  {formatRupiah(totalIncome)}
                </Text>
                <Text style={[styles.kpiHint, { color: colors.inkMuted }]} numberOfLines={1}>
                  {totalIncome > 0 ? (isDesktop ? 'Sumber pendapatan tercatat' : 'Arus masuk') : 'Belum ada'}
                </Text>
              </View>

              {/* Kartu Pengeluaran */}
              <View
                style={[
                  styles.summaryKpiCard,
                  expenseGlassStyle,
                  isDark ? shadow.cardDark : shadow.card,
                ]}
              >
                <View style={styles.kpiTopRow}>
                  <View style={[styles.kpiIconWrap, { backgroundColor: isDark ? 'rgba(252, 208, 248, 0.2)' : '#FCE7F3' }]}>
                    <Ionicons name="arrow-up" size={isDesktop ? 18 : 16} color="#E11D48" />
                  </View>
                  <View style={[styles.kpiBadge, { backgroundColor: isDark ? 'rgba(252, 208, 248, 0.2)' : '#FCD0F8' }]}>
                    <Text style={[styles.kpiBadgeText, { color: isDark ? '#FCD0F8' : '#9F1239' }]}>
                      {expensePercent}% Arus
                    </Text>
                  </View>
                </View>
                <Text style={[styles.kpiLabel, { color: colors.inkMuted }]}>PENGELUARAN</Text>
                <Text
                  style={[styles.kpiValue, { color: '#E11D48', fontSize: isDesktop ? 24 : 17 }]}
                  numberOfLines={1}
                >
                  {formatRupiah(totalExpense)}
                </Text>
                <Text style={[styles.kpiHint, { color: colors.inkMuted }]} numberOfLines={1}>
                  {totalExpense > 0 ? (isDesktop ? 'Total pengeluaran tercatat' : 'Total keluar') : 'Nihil (aman)'}
                </Text>
              </View>
            </View>
          </View>

          {/* 3.5. Split Pocket Section (Simpanan Pertama & Pocket Nabung) */}
          <View style={styles.splitPocketSection}>
            <View style={styles.splitPocketHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                  style={[
                    styles.splitHeaderIcon,
                    { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)' },
                  ]}
                >
                  <Ionicons name="albums-outline" size={17} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.splitSectionTitle, { color: colors.ink }]}>
                    Split Pocket Kas
                  </Text>
                  <Text style={[styles.splitSectionSub, { color: colors.inkMuted }]}>
                    Alokasi Saldo: Kas Pokok & Simpanan Nabung
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.splitTransferBtn,
                  {
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.1)',
                    borderColor: isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.25)',
                  },
                ]}
                onPress={() => handleOpenTransfer('simpanan_pertama')}
                activeOpacity={0.7}
              >
                <Ionicons name="swap-horizontal" size={14} color="#10B981" />
                <Text style={styles.splitTransferBtnText}>Pindah Saldo</Text>
              </TouchableOpacity>
            </View>

            <View style={isDesktop ? styles.splitCardsGridDesktop : styles.splitCardsGridMobile}>
              {/* Pocket 1: Simpanan Pertama */}
              <View
                style={[
                  styles.splitCard,
                  simpananGlassStyle,
                  isDark ? shadow.cardDark : shadow.card,
                ]}
              >
                <View style={styles.splitCardTop}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.splitPocketIconCircle, { backgroundColor: 'rgba(37, 99, 235, 0.14)' }]}>
                      <Ionicons name="wallet" size={18} color="#2563EB" />
                    </View>
                    <View>
                      <Text style={[styles.splitPocketBadgeTitle, { color: colors.ink }]}>
                        SIMPANAN PERTAMA
                      </Text>
                      <Text style={[styles.splitPocketTagline, { color: colors.inkMuted }]}>
                        Kas Harian & Pokok
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.splitPillBadge,
                      { backgroundColor: 'rgba(37, 99, 235, 0.1)' },
                    ]}
                  >
                    <Text style={[styles.splitPillBadgeText, { color: '#2563EB' }]}>
                      {pocketMetrics.simpanan.share}% Porsi
                    </Text>
                  </View>
                </View>

                <Text style={[styles.splitPocketNominal, { color: colors.ink }]}>
                  {pocketMetrics.simpanan.saldo < 0 ? '-' : ''}{formatRupiah(pocketMetrics.simpanan.saldo)}
                </Text>

                <View style={styles.splitStatsRow}>
                  <View style={styles.splitStatItem}>
                    <Text style={[styles.splitStatLabel, { color: colors.inkMuted }]}>Pemasukan</Text>
                    <Text style={[styles.splitStatValue, { color: '#16A34A' }]}>
                      +{formatRupiah(pocketMetrics.simpanan.income)}
                    </Text>
                  </View>
                  <View style={[styles.splitStatDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.splitStatItem}>
                    <Text style={[styles.splitStatLabel, { color: colors.inkMuted }]}>Pengeluaran</Text>
                    <Text style={[styles.splitStatValue, { color: '#DC2626' }]}>
                      -{formatRupiah(pocketMetrics.simpanan.expense)}
                    </Text>
                  </View>
                </View>

                <View style={styles.splitCardFooter}>
                  <TouchableOpacity
                    style={[
                      styles.splitQuickActionBtn,
                      {
                        backgroundColor: isDark ? 'rgba(37, 99, 235, 0.14)' : 'rgba(37, 99, 235, 0.08)',
                        borderColor: isDark ? 'rgba(37, 99, 235, 0.35)' : 'rgba(37, 99, 235, 0.25)',
                      },
                    ]}
                    onPress={() => router.push('/transaksi')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={14} color={colors.primary} />
                    <Text style={[styles.splitQuickActionText, { color: colors.primary }]}>+ Isi Kas</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.splitQuickActionBtn,
                      {
                        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.14)' : 'rgba(16, 185, 129, 0.08)',
                        borderColor: isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.25)',
                      },
                    ]}
                    onPress={() => handleOpenTransfer('simpanan_pertama')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="arrow-forward" size={13} color="#10B981" />
                    <Text style={[styles.splitQuickActionText, { color: '#10B981' }]} numberOfLines={1}>
                      {isDesktop ? 'Nabung ke Pocket' : 'Nabung'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Pocket 2: Pocket Nabung */}
              <View
                style={[
                  styles.splitCard,
                  nabungGlassStyle,
                  isDark ? shadow.cardDark : shadow.card,
                ]}
              >
                <View style={styles.splitCardTop}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.splitPocketIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.14)' }]}>
                      <Ionicons name="leaf" size={18} color="#10B981" />
                    </View>
                    <View>
                      <Text style={[styles.splitPocketBadgeTitle, { color: colors.ink }]}>
                        POCKET NABUNG
                      </Text>
                      <Text style={[styles.splitPocketTagline, { color: colors.inkMuted }]}>
                        Tabungan & Impian Masa Depan
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.splitPillBadge,
                      { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
                    ]}
                  >
                    <Text style={[styles.splitPillBadgeText, { color: '#10B981' }]}>
                      {pocketMetrics.nabung.share}% Porsi
                    </Text>
                  </View>
                </View>

                <Text style={[styles.splitPocketNominal, { color: '#10B981' }]}>
                  {pocketMetrics.nabung.saldo < 0 ? '-' : ''}{formatRupiah(pocketMetrics.nabung.saldo)}
                </Text>

                <View style={styles.splitStatsRow}>
                  <View style={styles.splitStatItem}>
                    <Text style={[styles.splitStatLabel, { color: colors.inkMuted }]}>Total Ditabung</Text>
                    <Text style={[styles.splitStatValue, { color: '#16A34A' }]}>
                      +{formatRupiah(pocketMetrics.nabung.income)}
                    </Text>
                  </View>
                  <View style={[styles.splitStatDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.splitStatItem}>
                    <Text style={[styles.splitStatLabel, { color: colors.inkMuted }]}>Terpakai / Tarik</Text>
                    <Text style={[styles.splitStatValue, { color: '#DC2626' }]}>
                      -{formatRupiah(pocketMetrics.nabung.expense)}
                    </Text>
                  </View>
                </View>

                <View style={styles.splitCardFooter}>
                  <TouchableOpacity
                    style={[
                      styles.splitQuickActionBtn,
                      {
                        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.1)',
                        borderColor: isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.25)',
                      },
                    ]}
                    onPress={() => handleOpenTransfer('simpanan_pertama')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add-circle" size={14} color="#10B981" />
                    <Text style={[styles.splitQuickActionText, { color: '#10B981' }]} numberOfLines={1}>
                      {isDesktop ? '+ Tambah Tabungan' : '+ Tabungan'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.splitQuickActionBtn,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => handleOpenTransfer('pocket_nabung')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="arrow-back" size={13} color={colors.inkMuted} />
                    <Text style={[styles.splitQuickActionText, { color: colors.inkMuted }]}>Tarik Kas</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* 4. Desktop 2-Column Section / Mobile Stack */}
          <View style={isDesktop ? styles.mainRowDesktop : styles.mainRowMobile}>
            {/* Kolom Kiri: Analisis & Quick Actions */}
            <View style={isDesktop ? styles.leftColDesktop : styles.colMobile}>
              {/* Card Analisis Arus Kas */}
              <View
                style={[
                  styles.contentCard,
                  glassCardStyle,
                  isDark ? shadow.cardDark : shadow.card,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="pie-chart-outline" size={20} color={colors.primary} />
                    <Text style={[styles.cardTitle, { color: colors.ink }]}>Rasio Arus Kas</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor:
                          saldo >= 0
                            ? 'rgba(34, 197, 94, 0.12)'
                            : 'rgba(239, 68, 68, 0.12)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: saldo >= 0 ? '#16A34A' : '#DC2626' },
                      ]}
                    >
                      {saldo >= 0 ? 'Arus Sehat ✨' : 'Perlu Penghematan ⚠️'}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar Dual Tone */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFillIncome,
                      { width: `${incomePercent}%`, backgroundColor: '#10B981' },
                    ]}
                  />
                  <View
                    style={[
                      styles.progressFillExpense,
                      { width: `${expensePercent}%`, backgroundColor: '#EF4444' },
                    ]}
                  />
                </View>

                <View style={styles.ratioLabelsRow}>
                  <View style={styles.ratioItem}>
                    <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                    <Text style={[styles.ratioLabelText, { color: colors.inkMuted }]}>
                      Pemasukan: <Text style={{ color: colors.ink, fontWeight: '700' }}>{incomePercent}%</Text>
                    </Text>
                  </View>
                  <View style={styles.ratioItem}>
                    <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                    <Text style={[styles.ratioLabelText, { color: colors.inkMuted }]}>
                      Pengeluaran: <Text style={{ color: colors.ink, fontWeight: '700' }}>{expensePercent}%</Text>
                    </Text>
                  </View>
                  <View style={styles.ratioItem}>
                    <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.ratioLabelText, { color: colors.inkMuted }]}>
                      Simpanan: <Text style={{ color: colors.ink, fontWeight: '700' }}>{savingsRate}%</Text>
                    </Text>
                  </View>
                </View>

                {/* Insight Box */}
                <View
                  style={[
                    styles.insightBox,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons name="sparkles" size={18} color="#F59E0B" />
                  <Text style={[styles.insightText, { color: colors.inkMuted }]}>
                    {saldo > 0
                      ? `Kamu berhasil menyisihkan ${savingsRate}% pemasukan sebagai saldo aktif. Pertahankan konsistensi ini untuk mencapai target keuangan!`
                      : totalExpense > totalIncome
                      ? 'Pengeluaran melebihi pendapatan bulan ini. Buka menu Laporan untuk meninjau pos-pos pengeluaran terbesar.'
                      : 'Mulai mencatat transaksi pertamamu untuk melihat grafik dan analisis kesehatan finansial otomatis.'}
                  </Text>
                </View>
              </View>

              {/* Card Quick Actions */}
              <View
                style={[
                  styles.contentCard,
                  glassCardStyle,
                  isDark ? shadow.cardDark : shadow.card,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="flash-outline" size={19} color={colors.primary} />
                    <Text style={[styles.cardTitle, { color: colors.ink }]}>Aksi Cepat</Text>
                  </View>
                </View>

                <View style={styles.actionTilesGrid}>
                  <TouchableOpacity
                    style={[
                      styles.actionTile,
                      { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.06)', borderColor: 'rgba(34, 197, 94, 0.25)' },
                    ]}
                    onPress={() => router.push('/transaksi')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.actionTileTopRow}>
                      <View style={[styles.actionTileIcon, { backgroundColor: '#16A34A' }]}>
                        <Ionicons name="arrow-down" size={16} color="#FFFFFF" />
                      </View>
                      <Ionicons name="arrow-forward" size={13} color="#16A34A" />
                    </View>
                    <Text style={[styles.actionTileTitle, { color: colors.ink }]}>Tambah Kas</Text>
                    <Text style={[styles.actionTileSub, { color: colors.inkMuted }]}>Catat uang masuk</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionTile,
                      { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.06)', borderColor: 'rgba(239, 68, 68, 0.25)' },
                    ]}
                    onPress={() => router.push('/transaksi')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.actionTileTopRow}>
                      <View style={[styles.actionTileIcon, { backgroundColor: '#DC2626' }]}>
                        <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
                      </View>
                      <Ionicons name="arrow-forward" size={13} color="#DC2626" />
                    </View>
                    <Text style={[styles.actionTileTitle, { color: colors.ink }]}>Pengeluaran</Text>
                    <Text style={[styles.actionTileSub, { color: colors.inkMuted }]}>Catat belanja/biaya</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionTile,
                      { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.06)', borderColor: 'rgba(59, 130, 246, 0.25)' },
                    ]}
                    onPress={() => router.push('/laporan')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.actionTileTopRow}>
                      <View style={[styles.actionTileIcon, { backgroundColor: colors.primary }]}>
                        <Ionicons name="document-text" size={16} color="#FFFFFF" />
                      </View>
                      <Ionicons name="arrow-forward" size={13} color={colors.primary} />
                    </View>
                    <Text style={[styles.actionTileTitle, { color: colors.ink }]}>Laporan PDF</Text>
                    <Text style={[styles.actionTileSub, { color: colors.inkMuted }]}>Ekspor & analisa</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionTile,
                      { backgroundColor: isDark ? 'rgba(168, 85, 247, 0.08)' : 'rgba(168, 85, 247, 0.06)', borderColor: 'rgba(168, 85, 247, 0.25)' },
                    ]}
                    onPress={() => router.push('/riwayat')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.actionTileTopRow}>
                      <View style={[styles.actionTileIcon, { backgroundColor: '#9333EA' }]}>
                        <Ionicons name="time" size={16} color="#FFFFFF" />
                      </View>
                      <Ionicons name="arrow-forward" size={13} color="#9333EA" />
                    </View>
                    <Text style={[styles.actionTileTitle, { color: colors.ink }]}>Riwayat Kas</Text>
                    <Text style={[styles.actionTileSub, { color: colors.inkMuted }]}>Filter & kelola</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Kolom Kanan: Transaksi Terbaru & Financial Tips */}
            <View style={isDesktop ? styles.rightColDesktop : styles.colMobile}>
              {/* Card Transaksi Terbaru */}
              <View
                style={[
                  styles.contentCard,
                  glassCardStyle,
                  isDark ? shadow.cardDark : shadow.card,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="receipt-outline" size={19} color={colors.primary} />
                    <Text style={[styles.cardTitle, { color: colors.ink }]}>Transaksi Terbaru</Text>
                  </View>
                  {hasData && (
                    <TouchableOpacity
                      onPress={() => router.push('/riwayat')}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.viewAllText, { color: colors.primary }]}>Lihat semua</Text>
                      <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Pocket Filter Tabs */}
                {hasData && (
                  <View style={styles.recentPocketFilterRow}>
                    <TouchableOpacity
                      style={[
                        styles.recentFilterChip,
                        recentPocketFilter === 'all'
                          ? { backgroundColor: colors.primary, borderColor: colors.primary }
                          : { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderColor: colors.border },
                      ]}
                      onPress={() => setRecentPocketFilter('all')}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.recentFilterChipText,
                          { color: recentPocketFilter === 'all' ? '#FFFFFF' : colors.inkMuted },
                        ]}
                      >
                        Semua ({recent.length})
                      </Text>
                    </TouchableOpacity>

                    {POCKET_LIST.map((p) => {
                      const isSelected = recentPocketFilter === p.id;
                      const count = recent.filter((t) => getPocket(t) === p.id).length;
                      return (
                        <TouchableOpacity
                          key={p.id}
                          style={[
                            styles.recentFilterChip,
                            isSelected
                              ? { backgroundColor: p.color, borderColor: p.color }
                              : { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderColor: colors.border },
                          ]}
                          onPress={() => setRecentPocketFilter(p.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={p.icon}
                            size={12}
                            color={isSelected ? '#FFFFFF' : colors.inkMuted}
                          />
                          <Text
                            style={[
                              styles.recentFilterChipText,
                              { color: isSelected ? '#FFFFFF' : colors.inkMuted },
                            ]}
                          >
                            {p.shortName} ({count})
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {!hasData || filteredRecent.length === 0 ? (
                  <EmptyState
                    icon="file-tray-outline"
                    title={!hasData ? "Belum ada transaksi" : "Tidak ada transaksi di pocket ini"}
                    description={!hasData ? "Mulai catat transaksi pertamamu untuk melacak arus kas keuangan secara rapi." : "Ganti filter pocket di atas atau tambah transaksi baru."}
                  />
                ) : (
                  <View style={styles.txListWrap}>
                    {filteredRecent.map((item, index) => {
                      const isIncome = item.type === 'income';
                      const iconName = iconForCategory(item.category);
                      const itemPocket = getPocket(item);
                      const pocketCfg = POCKET_CONFIG[itemPocket];
                      const cleanNote = cleanPocketNote(item.note);

                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.txRow,
                            index < filteredRecent.length - 1 ? { borderBottomColor: colors.border, borderBottomWidth: 1 } : null,
                          ]}
                          onPress={() => router.push('/riwayat')}
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.txCategoryIcon,
                              {
                                backgroundColor: isIncome
                                  ? 'rgba(34, 197, 94, 0.12)'
                                  : 'rgba(239, 68, 68, 0.12)',
                              },
                            ]}
                          >
                            <Ionicons
                              name={iconName as any}
                              size={18}
                              color={isIncome ? '#16A34A' : '#DC2626'}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={[styles.txTitle, { color: colors.ink }]} numberOfLines={1}>
                                {item.category}
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
                            <Text style={[styles.txMeta, { color: colors.inkMuted }]}>
                              {item.date} {cleanNote ? `• ${cleanNote}` : ''}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.txAmount,
                              { color: isIncome ? '#16A34A' : '#DC2626' },
                            ]}
                          >
                            {isIncome ? '+' : '-'}{formatRupiah(item.amount)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Card Panduan Finansial Cerdas 50 / 30 / 20 */}
              <View
                style={[
                  styles.contentCard,
                  glassCardStyle,
                  isDark ? shadow.cardDark : shadow.card,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="bulb-outline" size={19} color="#F59E0B" />
                    <Text style={[styles.cardTitle, { color: colors.ink }]}>
                      Formula Cerdas 50 / 30 / 20
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.14)' : 'rgba(245, 158, 11, 0.1)' },
                    ]}
                  >
                    <Text style={[styles.statusPillText, { color: '#F59E0B' }]}>Panduan Ideal</Text>
                  </View>
                </View>

                {/* Progress Bar 3 Porsi Finansial */}
                <View style={styles.formulaTrack}>
                  <View style={[styles.formulaFill, { width: '50%', backgroundColor: '#3B82F6' }]} />
                  <View style={[styles.formulaFill, { width: '30%', backgroundColor: '#8B5CF6' }]} />
                  <View style={[styles.formulaFill, { width: '20%', backgroundColor: '#10B981' }]} />
                </View>

                {/* 3 Kotak Alokasi Ideal */}
                <View style={styles.formulaGrid}>
                  <View style={[styles.formulaItem, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }]}>
                    <View style={styles.formulaItemHeader}>
                      <View style={[styles.formulaDot, { backgroundColor: '#3B82F6' }]} />
                      <Text style={[styles.formulaPct, { color: '#3B82F6' }]}>50%</Text>
                    </View>
                    <Text style={[styles.formulaItemTitle, { color: colors.ink }]}>Pokok</Text>
                    <Text style={[styles.formulaItemSub, { color: colors.inkMuted }]}>Sewa & tagihan</Text>
                  </View>

                  <View style={[styles.formulaItem, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.05)', borderColor: 'rgba(139, 92, 246, 0.2)' }]}>
                    <View style={styles.formulaItemHeader}>
                      <View style={[styles.formulaDot, { backgroundColor: '#8B5CF6' }]} />
                      <Text style={[styles.formulaPct, { color: '#8B5CF6' }]}>30%</Text>
                    </View>
                    <Text style={[styles.formulaItemTitle, { color: colors.ink }]}>Keinginan</Text>
                    <Text style={[styles.formulaItemSub, { color: colors.inkMuted }]}>Hobi & santai</Text>
                  </View>

                  <View style={[styles.formulaItem, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
                    <View style={styles.formulaItemHeader}>
                      <View style={[styles.formulaDot, { backgroundColor: '#10B981' }]} />
                      <Text style={[styles.formulaPct, { color: '#10B981' }]}>20%</Text>
                    </View>
                    <Text style={[styles.formulaItemTitle, { color: colors.ink }]}>Tabungan</Text>
                    <Text style={[styles.formulaItemSub, { color: colors.inkMuted }]}>Pocket Nabung</Text>
                  </View>
                </View>

                {/* Insight Panduan */}
                <View
                  style={[
                    styles.formulaInsight,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons name="sparkles" size={16} color="#F59E0B" />
                  <Text style={[styles.formulaInsightText, { color: colors.inkMuted }]}>
                    {savingsRate >= 20
                      ? `Luar biasa! Rasio simpanan kasmu (${savingsRate}%) telah mencapai target minimal 20%. Pertahankan kedisiplinan ini!`
                      : `Target tabungan ideal adalah minimal 20% dari pemasukan. Sisihkan langsung ke Pocket Nabung setiap awal bulan.`}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </>
      )}

      {/* Modal Opsi Tambahan */}
      <Modal
        visible={optionsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setOptionsModalVisible(false)}
        >
          <Pressable
            style={[
              styles.optionsSheet,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              isDark ? shadow.cardDark : shadow.card,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.ink }]}>Pengaturan & Tindakan</Text>
              <TouchableOpacity
                onPress={() => setOptionsModalVisible(false)}
                hitSlop={8}
              >
                <Ionicons name="close" size={20} color={colors.inkMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetOptionsList}>
              <TouchableOpacity
                style={styles.sheetOptionItem}
                onPress={handleRefresh}
                activeOpacity={0.7}
              >
                <View style={[styles.sheetIconWrap, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="refresh-outline" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionTitle, { color: colors.ink }]}>Muat Ulang Data</Text>
                  <Text style={[styles.optionSub, { color: colors.inkMuted }]}>
                    Ambil data transaksi terbaru dari server
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetOptionItem}
                onPress={handleResetTheme}
                activeOpacity={0.7}
              >
                <View style={[styles.sheetIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionTitle, { color: colors.ink }]}>
                    Ganti ke Mode {isDark ? 'Terang (Light)' : 'Gelap (Dark)'}
                  </Text>
                  <Text style={[styles.optionSub, { color: colors.inkMuted }]}>
                    Ubah tema tampilan aplikasi saat ini
                  </Text>
                </View>
              </TouchableOpacity>

              {isAdmin && (
                <TouchableOpacity
                  style={styles.sheetOptionItem}
                  onPress={() => {
                    setOptionsModalVisible(false);
                    setServerConfigVisible(true);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.sheetIconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                    <Ionicons name="server-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionTitle, { color: colors.ink }]}>Konfigurasi Server API</Text>
                    <Text style={[styles.optionSub, { color: colors.inkMuted }]}>
                      Atur alamat backend publik & endpoint admin
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.sheetOptionItem}
                onPress={handleOpenResetConfirm}
                activeOpacity={0.7}
              >
                <View style={[styles.sheetIconWrap, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Ionicons name="trash-outline" size={18} color={colors.expense} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionTitle, { color: colors.expense }]}>Reset Seluruh Transaksi</Text>
                  <Text style={[styles.optionSub, { color: colors.inkMuted }]}>
                    Kosongkan seluruh saldo & riwayat akun
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal Konfirmasi Reset Saldo */}
      <Modal
        visible={confirmResetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !resetting && setConfirmResetVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => !resetting && setConfirmResetVisible(false)}
        >
          <Pressable
            style={[
              styles.confirmCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isDark ? shadow.cardDark : shadow.card,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {resetSuccess ? (
              <View style={styles.confirmCenter}>
                <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
                <Text style={[styles.confirmTitle, { color: colors.ink, marginTop: 12 }]}>
                  Reset Berhasil!
                </Text>
                <Text style={[styles.confirmDesc, { color: colors.inkMuted }]}>
                  Seluruh riwayat transaksi kamu telah dikosongkan.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.confirmCenter}>
                  <View style={styles.warningIconCircle}>
                    <Ionicons name="warning" size={28} color="#DC2626" />
                  </View>
                  <Text style={[styles.confirmTitle, { color: colors.ink }]}>
                    Reset Semua Transaksi?
                  </Text>
                  <Text style={[styles.confirmDesc, { color: colors.inkMuted }]}>
                    Tindakan ini akan menghapus permanen seluruh riwayat pemasukan dan pengeluaran kamu. Saldo akan kembali ke Rp 0.
                  </Text>
                </View>

                {resetError ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={16} color="#DC2626" />
                    <Text style={styles.errorBoxText}>{resetError}</Text>
                  </View>
                ) : null}

                <View style={styles.confirmButtonsRow}>
                  <TouchableOpacity
                    style={[styles.btnCancel, { borderColor: colors.border }]}
                    onPress={() => setConfirmResetVisible(false)}
                    disabled={resetting}
                  >
                    <Text style={[styles.btnCancelText, { color: colors.ink }]}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnDanger}
                    onPress={handleExecuteResetTransactions}
                    disabled={resetting}
                  >
                    {resetting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.btnDangerText}>Ya, Hapus Semua</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal Pindah Saldo Antar Pocket */}
      <Modal
        visible={transferModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !transferring && setTransferModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => !transferring && setTransferModalVisible(false)}
        >
          <Pressable
            style={[
              styles.transferSheet,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              isDark ? shadow.cardDark : shadow.card,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                  style={[
                    styles.splitHeaderIcon,
                    { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)' },
                  ]}
                >
                  <Ionicons name="swap-horizontal" size={18} color="#10B981" />
                </View>
                <View>
                  <Text style={[styles.sheetTitle, { color: colors.ink }]}>
                    Pindah Saldo Antar Pocket
                  </Text>
                  <Text style={[styles.transferSheetSub, { color: colors.inkMuted }]}>
                    Alokasikan dana kas utama ke tabungan atau sebaliknya
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => !transferring && setTransferModalVisible(false)}
                hitSlop={8}
                disabled={transferring}
              >
                <Ionicons name="close" size={20} color={colors.inkMuted} />
              </TouchableOpacity>
            </View>

            {/* Arah Transfer */}
            <View style={[styles.transferDirectionBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.transferBoxLabel, { color: colors.inkMuted }]}>DARI KANTONG</Text>
                <View style={styles.transferPocketRow}>
                  <Ionicons
                    name={POCKET_CONFIG[transferSource].icon}
                    size={16}
                    color={transferSource === 'simpanan_pertama' ? '#2563EB' : '#10B981'}
                  />
                  <Text style={[styles.transferPocketName, { color: colors.ink }]}>
                    {POCKET_CONFIG[transferSource].name}
                  </Text>
                </View>
                <Text style={[styles.transferPocketSaldo, { color: colors.inkMuted }]}>
                  Saldo: {formatRupiah(transferSource === 'simpanan_pertama' ? pocketMetrics.simpanan.saldo : pocketMetrics.nabung.saldo)}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.transferSwitchBtn,
                  {
                    backgroundColor: isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.12)',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => {
                  setTransferSource((prev) =>
                    prev === 'simpanan_pertama' ? 'pocket_nabung' : 'simpanan_pertama'
                  );
                  setTransferError('');
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="swap-horizontal" size={18} color={colors.primary} />
              </TouchableOpacity>

              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={[styles.transferBoxLabel, { color: colors.inkMuted }]}>KE KANTONG</Text>
                <View style={styles.transferPocketRow}>
                  <Ionicons
                    name={POCKET_CONFIG[transferSource === 'simpanan_pertama' ? 'pocket_nabung' : 'simpanan_pertama'].icon}
                    size={16}
                    color={transferSource === 'simpanan_pertama' ? '#10B981' : '#2563EB'}
                  />
                  <Text style={[styles.transferPocketName, { color: colors.ink }]}>
                    {POCKET_CONFIG[transferSource === 'simpanan_pertama' ? 'pocket_nabung' : 'simpanan_pertama'].name}
                  </Text>
                </View>
                <Text style={[styles.transferPocketSaldo, { color: colors.inkMuted }]}>
                  Saldo: {formatRupiah(transferSource === 'simpanan_pertama' ? pocketMetrics.nabung.saldo : pocketMetrics.simpanan.saldo)}
                </Text>
              </View>
            </View>

            {/* Input Nominal */}
            <Text style={[styles.transferInputLabel, { color: colors.ink }]}>Nominal Pindahan</Text>
            <View
              style={[
                styles.transferInputWrap,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.transferPrefix, { color: colors.inkMuted }]}>Rp</Text>
              <TextInput
                style={[styles.transferInput, { color: colors.ink }]}
                value={transferAmount}
                onChangeText={(t) => {
                  setTransferAmount(t.replace(/[^0-9]/g, ''));
                  setTransferError('');
                }}
                placeholder="0"
                placeholderTextColor={colors.inkMuted}
                keyboardType="numeric"
                editable={!transferring}
              />
            </View>

            {/* Quick Percentage Chips */}
            <View style={styles.transferQuickPctRow}>
              {[0.25, 0.5, 1].map((pct) => {
                const sourceSaldo = transferSource === 'simpanan_pertama' ? pocketMetrics.simpanan.saldo : pocketMetrics.nabung.saldo;
                const calcAmt = Math.max(0, Math.floor(sourceSaldo * pct));
                const label = pct === 1 ? '100% (Semua)' : `${pct * 100}%`;
                return (
                  <TouchableOpacity
                    key={pct}
                    style={[
                      styles.transferQuickPctBtn,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      if (calcAmt > 0) {
                        setTransferAmount(String(calcAmt));
                        setTransferError('');
                      }
                    }}
                    disabled={sourceSaldo <= 0}
                  >
                    <Text style={[styles.transferQuickPctText, { color: colors.ink }]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {transferError ? (
              <View style={[styles.transferErrorBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={[styles.transferErrorText, { color: '#DC2626' }]}>
                  {transferError}
                </Text>
              </View>
            ) : null}

            {/* Tombol Aksi */}
            <View style={styles.transferActionRow}>
              <TouchableOpacity
                style={[
                  styles.transferCancelBtn,
                  { borderColor: colors.border },
                ]}
                onPress={() => setTransferModalVisible(false)}
                disabled={transferring}
              >
                <Text style={[styles.transferCancelText, { color: colors.inkMuted }]}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.transferSubmitBtn,
                  { backgroundColor: '#10B981' },
                ]}
                onPress={handleExecuteTransfer}
                disabled={transferring || !transferAmount || Number(transferAmount) <= 0}
              >
                {transferring ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.transferSubmitText}>Konfirmasi Pindah Saldo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal Konfigurasi Server */}
      <ServerConfigModal
        visible={serverConfigVisible}
        onClose={() => setServerConfigVisible(false)}
      />
    </ScrollView>
    </ScreenTransitionWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    paddingTop: 20,
    width: '100%',
    alignSelf: 'center',
  },

  // 1. Welcome & Toolbar
  welcomeRow: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  welcomeRowDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.buttons,
    borderWidth: 1,
    marginBottom: 10,
  },
  dateIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePillText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  greetingSubtitle: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  headerToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.buttons,
    borderWidth: 1,
  },
  toolBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // 2. Admin Banner
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.cards,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
  },
  adminBadgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  adminBannerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  adminActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.buttons,
  },
  adminActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // 3. Financial Metrics Grid
  metricGridDesktop: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  metricGridMobile: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16,
  },
  saldoHeroCard: {
    borderRadius: radius.cards,
    padding: 24,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.32)',
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 16px 44px rgba(97, 97, 255, 0.42), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.65)',
        } as any)
      : {}),
  },
  saldoHeroCardDesktop: {
    flex: 1.3,
    minHeight: 180,
  },
  saldoTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  saldoHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saldoIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saldoLabel: {
    color: '#E0E7FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.badges,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  saldoNominal: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
    marginVertical: 14,
  },
  saldoFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 12,
  },
  saldoSubtext: {
    color: '#C7D2FE',
    fontSize: 12,
    fontWeight: '500',
  },
  cardQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.buttons,
  },
  cardQuickBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  kpiPairDesktop: {
    flex: 2,
    flexDirection: 'row',
    gap: 16,
  },
  kpiPairMobile: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryKpiCard: {
    flex: 1,
    borderRadius: radius.cards,
    padding: 20,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  kpiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.badges,
  },
  kpiBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  kpiHint: {
    fontSize: 12,
  },

  // 4. Desktop 2-Column Section
  mainRowDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  mainRowMobile: {
    flexDirection: 'column',
    gap: 16,
  },
  leftColDesktop: {
    flex: 1,
    gap: 20,
  },
  rightColDesktop: {
    flex: 1,
    gap: 20,
  },
  colMobile: {
    width: '100%',
    gap: 16,
  },

  // Content Cards
  contentCard: {
    borderRadius: radius.cards,
    borderWidth: 1,
    padding: 22,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.badges,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Progress Bar
  progressTrack: {
    height: 12,
    borderRadius: radius.buttons,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFillIncome: {
    height: '100%',
  },
  progressFillExpense: {
    height: '100%',
  },
  ratioLabelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  ratioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ratioLabelText: {
    fontSize: 12,
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  insightText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },

  // Action Tiles Grid
  actionTilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionTile: {
    flex: 1,
    minWidth: '46%',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 16,
  },
  actionTileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionTileIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTileTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  actionTileSub: {
    fontSize: 11,
    marginTop: 2,
  },

  // Formula Cerdas 50 / 30 / 20 Styles
  formulaTrack: {
    height: 10,
    borderRadius: radius.buttons,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 14,
  },
  formulaFill: {
    height: '100%',
  },
  formulaGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  formulaItem: {
    flex: 1,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  formulaItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  formulaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  formulaPct: {
    fontSize: 12,
    fontWeight: '800',
  },
  formulaItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  formulaItemSub: {
    fontSize: 10,
  },
  formulaInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  formulaInsightText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },

  // Recent Transactions List
  txListWrap: {
    gap: 2,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  txCategoryIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  txMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '800',
  },

  // Tips Text
  tipsText: {
    fontSize: 13,
    lineHeight: 20,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  optionsSheet: {
    width: '100%',
    maxWidth: 440,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sheetOptionsList: {
    gap: 12,
  },
  sheetOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  sheetIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  optionSub: {
    fontSize: 12,
    marginTop: 2,
  },

  // Confirm Reset Card
  confirmCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: radius.cards,
    borderWidth: 1,
    padding: 24,
  },
  confirmCenter: {
    alignItems: 'center',
    textAlign: 'center',
  },
  warningIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  confirmDesc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 10,
    borderRadius: radius.inputs,
    marginBottom: 16,
  },
  errorBoxText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 12,
  },
  confirmButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.buttons,
    borderWidth: 1,
    alignItems: 'center',
  },
  btnCancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  btnDanger: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: radius.buttons,
    alignItems: 'center',
  },
  btnDangerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // 3.5. Split Pocket Section Styles
  splitPocketSection: {
    marginBottom: 24,
  },
  splitPocketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  splitHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.badges,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  splitSectionSub: {
    fontSize: 11,
    marginTop: 1,
  },
  splitTransferBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.buttons,
    borderWidth: 1,
  },
  splitTransferBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  splitCardsGridDesktop: {
    flexDirection: 'row',
    gap: 16,
  },
  splitCardsGridMobile: {
    flexDirection: 'column',
    gap: 12,
  },
  splitCard: {
    flex: 1,
    padding: 20,
    borderRadius: radius.cards,
    borderWidth: 1,
  },
  splitCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  splitPocketIconCircle: {
    width: 34,
    height: 34,
    borderRadius: radius.badges,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitPocketBadgeTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  splitPocketTagline: {
    fontSize: 10,
    marginTop: 1,
  },
  splitPillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.badges,
  },
  splitPillBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  splitPocketNominal: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  splitStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.12)',
    marginBottom: 12,
  },
  splitStatItem: {
    flex: 1,
  },
  splitStatLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  splitStatValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  splitStatDivider: {
    width: 1,
    height: 22,
    marginHorizontal: 8,
  },
  splitCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  splitQuickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: radius.buttons,
    borderWidth: 1,
  },
  splitQuickActionText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Recent Pocket Filter Chips & Badges
  recentPocketFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  recentFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.buttons,
    borderWidth: 1,
  },
  recentFilterChipText: {
    fontSize: 11,
    fontWeight: '700',
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

  // Modal Transfer
  transferSheet: {
    width: '100%',
    maxWidth: 480,
    borderRadius: radius.cards,
    borderWidth: 1,
    padding: 24,
  },
  transferSheetSub: {
    fontSize: 11,
    marginTop: 2,
  },
  transferDirectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    marginVertical: 14,
  },
  transferBoxLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  transferPocketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  transferPocketName: {
    fontSize: 12,
    fontWeight: '700',
  },
  transferPocketSaldo: {
    fontSize: 10,
    marginTop: 2,
  },
  transferSwitchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  transferInputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  transferInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.inputs,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  transferPrefix: {
    fontSize: 18,
    fontWeight: '800',
    marginRight: 6,
  },
  transferInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    paddingVertical: 2,
  },
  transferQuickPctRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  transferQuickPctBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: radius.buttons,
    borderWidth: 1,
    alignItems: 'center',
  },
  transferQuickPctText: {
    fontSize: 11,
    fontWeight: '600',
  },
  transferErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: radius.inputs,
    marginBottom: 14,
  },
  transferErrorText: {
    fontSize: 12,
    flex: 1,
  },
  transferActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  transferCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.buttons,
    borderWidth: 1,
    alignItems: 'center',
  },
  transferCancelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  transferSubmitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.buttons,
  },
  transferSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
