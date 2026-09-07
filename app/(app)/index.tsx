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
import { Card, SectionLabel, EmptyState, ErrorState } from '../../components/ui';
import { ServerConfigModal } from '../../components/ServerConfigModal';
import { iconForCategory } from '../../constants/categories';
import type { Transaction } from '../../types';

function formatRupiah(value: number) {
  return 'Rp' + Math.round(Math.abs(value)).toLocaleString('id-ID');
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
  const recent = transactions.slice(0, 5);
  const hasData = transactions.length > 0;

  // Rasio arus kas
  const totalVolume = totalIncome + totalExpense;
  const incomePercent = totalVolume > 0 ? Math.round((totalIncome / totalVolume) * 100) : (totalIncome > 0 ? 100 : 0);
  const expensePercent = totalVolume > 0 ? Math.round((totalExpense / totalVolume) * 100) : 0;
  const savingsRate = totalIncome > 0 ? Math.round((Math.max(0, saldo) / totalIncome) * 100) : 0;

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
    <ScrollView
      style={[styles.flex, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.container,
        {
          maxWidth: isDesktop ? 1160 : 540,
          paddingHorizontal: isDesktop ? 28 : 16,
          paddingBottom: isDesktop ? 110 : 85,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Greeting & Date Badge */}
      <View style={[styles.welcomeRow, isDesktop ? styles.welcomeRowDesktop : null]}>
        <View style={{ flex: 1 }}>
          <View style={styles.datePill}>
            <Ionicons name="calendar-outline" size={13} color={colors.primary} />
            <Text style={[styles.datePillText, { color: colors.primary }]}>{getFormattedDate()}</Text>
          </View>
          <Text style={[styles.greetingTitle, { color: colors.ink }]}>
            {getGreeting()}, <Text style={{ color: colors.primary }}>{user?.name || 'Kawan'}</Text> 👋
          </Text>
          <Text style={[styles.greetingSubtitle, { color: colors.inkMuted }]}>
            Pantau arus kas masuk, pengeluaran harian, dan kesehatan finansialmu hari ini.
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
          style={[styles.adminBanner, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.14)' : 'rgba(245, 158, 11, 0.12)' }]}
          onPress={() => router.push('/admin')}
          activeOpacity={0.85}
        >
          <View style={styles.adminBadgeIcon}>
            <Ionicons name="shield-checkmark" size={18} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.adminBannerTitle, { color: isDark ? '#FCD34D' : '#B45309' }]}>
              Hak Akses Administrator Aktif
            </Text>
            <Text style={[styles.adminBannerSub, { color: isDark ? '#E5E7EB' : '#92400E' }]}>
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
          {/* 3. Top Financial Metric Cards Grid */}
          <View style={isDesktop ? styles.metricGridDesktop : styles.metricGridMobile}>
            {/* Kartu Saldo Utama (Hero) */}
            <LinearGradient
              colors={
                isDark
                  ? ['#1E3A8A', '#0F172A']
                  : ['#2563EB', '#1E40AF']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.saldoHeroCard,
                isDesktop ? styles.saldoHeroCardDesktop : null,
                isDark ? shadow.cardDark : shadow.card,
              ]}
            >
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
                  style={styles.cardQuickBtn}
                  onPress={() => router.push('/transaksi')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={14} color="#FFFFFF" />
                  <Text style={styles.cardQuickBtnText}>Catat Transaksi</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Kartu Pemasukan */}
            <View
              style={[
                styles.summaryKpiCard,
                isDesktop ? styles.kpiCardDesktop : styles.kpiCardMobile,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDark ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.2)',
                },
                isDark ? shadow.cardDark : shadow.card,
              ]}
            >
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(34, 197, 94, 0.12)' }]}>
                  <Ionicons name="arrow-down" size={18} color="#16A34A" />
                </View>
                <View style={[styles.kpiBadge, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                  <Text style={[styles.kpiBadgeText, { color: '#16A34A' }]}>
                    {incomePercent}% Arus
                  </Text>
                </View>
              </View>
              <Text style={[styles.kpiLabel, { color: colors.inkMuted }]}>TOTAL PEMASUKAN</Text>
              <Text style={[styles.kpiValue, { color: '#16A34A' }]}>
                {formatRupiah(totalIncome)}
              </Text>
              <Text style={[styles.kpiHint, { color: colors.inkMuted }]}>
                {totalIncome > 0 ? 'Sumber pendapatan tercatat' : 'Belum ada pemasukan'}
              </Text>
            </View>

            {/* Kartu Pengeluaran */}
            <View
              style={[
                styles.summaryKpiCard,
                isDesktop ? styles.kpiCardDesktop : styles.kpiCardMobile,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDark ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.2)',
                },
                isDark ? shadow.cardDark : shadow.card,
              ]}
            >
              <View style={styles.kpiTopRow}>
                <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                  <Ionicons name="arrow-up" size={18} color="#DC2626" />
                </View>
                <View style={[styles.kpiBadge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <Text style={[styles.kpiBadgeText, { color: '#DC2626' }]}>
                    {expensePercent}% Arus
                  </Text>
                </View>
              </View>
              <Text style={[styles.kpiLabel, { color: colors.inkMuted }]}>TOTAL PENGELUARAN</Text>
              <Text style={[styles.kpiValue, { color: '#DC2626' }]}>
                {formatRupiah(totalExpense)}
              </Text>
              <Text style={[styles.kpiHint, { color: colors.inkMuted }]}>
                {totalExpense > 0 ? 'Total pengeluaran tercatat' : 'Pengeluaran nihil (aman)'}
              </Text>
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
                  { backgroundColor: colors.surface, borderColor: colors.border },
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
                  { backgroundColor: colors.surface, borderColor: colors.border },
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
                      { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.06)', borderColor: 'rgba(34, 197, 94, 0.2)' },
                    ]}
                    onPress={() => router.push('/transaksi')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.actionTileIcon, { backgroundColor: '#16A34A' }]}>
                      <Ionicons name="arrow-down" size={18} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.actionTileTitle, { color: colors.ink }]}>Tambah Kas</Text>
                    <Text style={[styles.actionTileSub, { color: colors.inkMuted }]}>Catat uang masuk</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionTile,
                      { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.06)', borderColor: 'rgba(239, 68, 68, 0.2)' },
                    ]}
                    onPress={() => router.push('/transaksi')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.actionTileIcon, { backgroundColor: '#DC2626' }]}>
                      <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.actionTileTitle, { color: colors.ink }]}>Pengeluaran</Text>
                    <Text style={[styles.actionTileSub, { color: colors.inkMuted }]}>Catat belanja/biaya</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionTile,
                      { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.06)', borderColor: 'rgba(59, 130, 246, 0.2)' },
                    ]}
                    onPress={() => router.push('/laporan')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.actionTileIcon, { backgroundColor: colors.primary }]}>
                      <Ionicons name="document-text" size={18} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.actionTileTitle, { color: colors.ink }]}>Laporan PDF</Text>
                    <Text style={[styles.actionTileSub, { color: colors.inkMuted }]}>Ekspor & analisa</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionTile,
                      { backgroundColor: isDark ? 'rgba(168, 85, 247, 0.08)' : 'rgba(168, 85, 247, 0.06)', borderColor: 'rgba(168, 85, 247, 0.2)' },
                    ]}
                    onPress={() => router.push('/riwayat')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.actionTileIcon, { backgroundColor: '#9333EA' }]}>
                      <Ionicons name="time" size={18} color="#FFFFFF" />
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
                  { backgroundColor: colors.surface, borderColor: colors.border },
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

                {!hasData ? (
                  <EmptyState
                    icon="file-tray-outline"
                    title="Belum ada transaksi"
                    description="Mulai catat transaksi pertamamu untuk melacak arus kas keuangan secara rapi."
                  />
                ) : (
                  <View style={styles.txListWrap}>
                    {recent.map((item, index) => {
                      const isIncome = item.type === 'income';
                      const iconName = iconForCategory(item.category);
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.txRow,
                            index < recent.length - 1 ? { borderBottomColor: colors.border, borderBottomWidth: 1 } : null,
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
                            <Text style={[styles.txTitle, { color: colors.ink }]} numberOfLines={1}>
                              {item.category}
                            </Text>
                            <Text style={[styles.txMeta, { color: colors.inkMuted }]}>
                              {item.date} {item.note ? `• ${item.note}` : ''}
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

              {/* Card Tips Finansial */}
              <View
                style={[
                  styles.contentCard,
                  {
                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#F8FAFC',
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Ionicons name="bulb" size={18} color="#F59E0B" />
                  <Text style={[styles.cardTitle, { color: colors.ink, fontSize: 14 }]}>
                    Formula Cerdas 50 / 30 / 20
                  </Text>
                </View>
                <Text style={[styles.tipsText, { color: colors.inkMuted }]}>
                  Alokasikan <Text style={{ fontWeight: '700', color: colors.ink }}>50%</Text> pemasukan untuk kebutuhan pokok,{' '}
                  <Text style={{ fontWeight: '700', color: colors.ink }}>30%</Text> untuk keinginan, dan minimal{' '}
                  <Text style={{ fontWeight: '700', color: colors.ink }}>20%</Text> disisihkan langsung sebagai tabungan & dana darurat.
                </Text>
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

      {/* Modal Konfigurasi Server */}
      <ServerConfigModal
        visible={serverConfigVisible}
        onClose={() => setServerConfigVisible(false)}
      />
    </ScrollView>
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
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: 8,
  },
  datePillText: {
    fontSize: 12,
    fontWeight: '700',
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
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
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
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
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
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
    gap: 14,
    marginBottom: 20,
  },
  saldoHeroCard: {
    borderRadius: radius.xl,
    padding: 22,
    justifyContent: 'space-between',
  },
  saldoHeroCardDesktop: {
    flex: 1.4,
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
    borderRadius: radius.pill,
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
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  cardQuickBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  summaryKpiCard: {
    borderRadius: radius.xl,
    padding: 20,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  kpiCardDesktop: {
    flex: 1,
    minHeight: 180,
  },
  kpiCardMobile: {
    width: '100%',
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
    borderRadius: radius.pill,
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
    flex: 1.15,
    gap: 20,
  },
  rightColDesktop: {
    flex: 0.85,
    gap: 20,
  },
  colMobile: {
    width: '100%',
    gap: 16,
  },

  // Content Cards
  contentCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 20,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
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
    borderRadius: 6,
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
    borderRadius: radius.lg,
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
    minWidth: '45%',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 14,
  },
  actionTileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionTileTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionTileSub: {
    fontSize: 11,
    marginTop: 2,
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
    borderRadius: radius.xl,
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
    borderRadius: radius.md,
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
    borderRadius: radius.md,
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
    borderRadius: radius.md,
    alignItems: 'center',
  },
  btnDangerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
