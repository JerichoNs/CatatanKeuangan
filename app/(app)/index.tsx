import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import { spacing, radius, shadow } from '../../constants/theme';
import { Card, SectionLabel, EmptyState, ErrorState, Button } from '../../components/ui';
import { iconForCategory } from '../../constants/categories';
import type { Transaction } from '../../types';

function formatRupiah(value: number) {
  return 'Rp' + Math.round(Math.abs(value)).toLocaleString('id-ID');
}

export default function DashboardScreen() {
  const { user, isAdmin } = useAuth();
  const { colors, isDark, setTheme } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [confirmResetVisible, setConfirmResetVisible] = useState(false);
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

  const handleRefresh = async () => {
    setOptionsModalVisible(false);
    await fetchTransactions();
  };

  const handleResetTheme = () => {
    setOptionsModalVisible(false);
    setTheme('light');
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
      contentContainerStyle={styles.container}
    >
      {isAdmin && (
        <TouchableOpacity
          style={[styles.adminBanner, { backgroundColor: colors.accent }]}
          onPress={() => router.push('/admin')}
          activeOpacity={0.85}
        >
          <Ionicons name="shield-checkmark" size={16} color={colors.primaryDark} />
          <Text style={[styles.adminBannerText, { color: colors.primaryDark }]}>
            Kamu login sebagai admin - buka Panel Admin
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primaryDark} />
        </TouchableOpacity>
      )}

      {error ? (
        <Card>
          <ErrorState onRetry={fetchTransactions} />
        </Card>
      ) : (
        <>
          {/* Kartu Saldo Utama */}
          <LinearGradient
            colors={
              isDark
                ? ['#1E3A8A', '#0F172A']
                : [colors.primary, colors.primaryDark]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.saldoCard, isDark ? shadow.cardDark : shadow.card]}
          >
            <View style={styles.saldoTopRow}>
              <View style={styles.saldoHeaderWrap}>
                <Ionicons name="wallet-outline" size={18} color="#C9D6F5" />
                <Text style={styles.saldoLabel}>Total Saldo</Text>
              </View>
              <View style={styles.saldoActionsRow}>
                <TouchableOpacity
                  style={styles.resetTriggerBtn}
                  onPress={() => {
                    setConfirmResetVisible(false);
                    setResetError('');
                    setResetSuccess(false);
                    setOptionsModalVisible(true);
                  }}
                  hitSlop={8}
                  activeOpacity={0.8}
                  accessibilityLabel="Opsi Dashboard & Reset"
                >
                  <Ionicons name="refresh-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.resetTriggerText}>Opsi & Reset</Text>
                </TouchableOpacity>

                <View style={styles.activePill}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activePillText}>Aktif</Text>
                </View>
              </View>
            </View>

            <Text style={styles.saldoValue}>{formatRupiah(saldo)}</Text>

            <View style={styles.saldoRow}>
              <View style={styles.saldoItem}>
                <View style={styles.saldoItemHeader}>
                  <Ionicons name="arrow-down-circle" size={15} color="#8FE3B0" />
                  <Text style={styles.saldoItemLabel}>Pemasukan</Text>
                </View>
                <Text style={[styles.saldoItemValue, { color: '#8FE3B0' }]}>
                  {formatRupiah(totalIncome)}
                </Text>
              </View>

              <View style={styles.saldoDivider} />

              <View style={styles.saldoItem}>
                <View style={styles.saldoItemHeader}>
                  <Ionicons name="arrow-up-circle" size={15} color="#FFB4B0" />
                  <Text style={styles.saldoItemLabel}>Pengeluaran</Text>
                </View>
                <Text style={[styles.saldoItemValue, { color: '#FFB4B0' }]}>
                  {formatRupiah(totalExpense)}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Rasio Pengeluaran */}
          <View style={styles.section}>
            <SectionLabel>Rasio Pemasukan vs Pengeluaran</SectionLabel>
            <Card>
              {!hasData ? (
                <EmptyState
                  icon="bar-chart-outline"
                  title="Belum ada data"
                  description="Grafik bakal muncul begitu kamu mulai catat transaksi."
                />
              ) : (
                <View style={styles.chartBox}>
                  <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                    <View style={[styles.barFillIncome, { flex: totalIncome || 0.001, backgroundColor: colors.income }]} />
                    <View style={[styles.barFillExpense, { flex: totalExpense || 0.001, backgroundColor: colors.expense }]} />
                  </View>
                  <View style={styles.chartLegend}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
                      <Text style={[styles.legendText, { color: colors.inkMuted }]}>
                        Masuk: {totalIncome + totalExpense > 0 ? Math.round((totalIncome / (totalIncome + totalExpense)) * 100) : 0}%
                      </Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
                      <Text style={[styles.legendText, { color: colors.inkMuted }]}>
                        Keluar: {totalIncome + totalExpense > 0 ? Math.round((totalExpense / (totalIncome + totalExpense)) * 100) : 0}%
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </Card>
          </View>

          {/* Transaksi Terbaru */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SectionLabel>Transaksi Terbaru</SectionLabel>
              <TouchableOpacity onPress={() => router.push('/riwayat')} hitSlop={8}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>Lihat semua</Text>
              </TouchableOpacity>
            </View>

            <Card>
              {loading ? (
                <Text style={[styles.loadingText, { color: colors.inkMuted }]}>Memuat...</Text>
              ) : recent.length === 0 ? (
                <EmptyState
                  icon="receipt-outline"
                  title="Belum ada transaksi"
                  description="Yuk catat pemasukan atau pengeluaran pertamamu."
                />
              ) : (
                recent.map((t, i) => (
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
                        { backgroundColor: t.type === 'income' ? colors.incomeBg : colors.expenseBg },
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
                      {t.note ? (
                        <Text style={[styles.txNote, { color: colors.inkMuted }]} numberOfLines={1}>
                          {t.note}
                        </Text>
                      ) : (
                        <Text style={[styles.txNote, { color: colors.inkMuted }]}>{t.date}</Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.txAmount,
                        { color: t.type === 'income' ? colors.income : colors.expense },
                      ]}
                    >
                      {t.type === 'income' ? '+' : '-'}
                      {formatRupiah(t.amount)}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </Card>
          </View>

          {!loading && !hasData && (
            <View style={styles.ctaWrap}>
              <Button
                label="Catat Transaksi Pertama"
                onPress={() => router.push('/transaksi')}
                variant="accent"
                icon="add-circle-outline"
              />
            </View>
          )}
        </>
      )}

      {/* Modal Opsi & Reset Dashboard */}
      <Modal
        visible={optionsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setOptionsModalVisible(false)}
        >
          <Pressable
            style={[
              styles.modalCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {confirmResetVisible ? (
              <View style={styles.confirmResetWrap}>
                <View style={styles.confirmIconBadge}>
                  <Ionicons name="warning-outline" size={32} color={colors.expense} />
                </View>

                <Text style={[styles.confirmTitle, { color: colors.ink }]}>
                  Reset Semua Transaksi?
                </Text>
                <Text style={[styles.confirmDesc, { color: colors.inkMuted }]}>
                  Seluruh catatan riwayat transaksi akunmu akan dihapus secara permanen dan saldo kembali ke Rp0. Tindakan ini tidak dapat dibatalkan.
                </Text>

                {resetError ? (
                  <View style={[styles.resetAlertBox, { backgroundColor: colors.expenseBg }]}>
                    <Ionicons name="alert-circle" size={16} color={colors.expense} />
                    <Text style={[styles.resetAlertText, { color: colors.expense }]}>{resetError}</Text>
                  </View>
                ) : null}

                {resetSuccess ? (
                  <View style={[styles.resetAlertBox, { backgroundColor: colors.incomeBg }]}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.income} />
                    <Text style={[styles.resetAlertText, { color: colors.income }]}>
                      Semua transaksi berhasil dibersihkan!
                    </Text>
                  </View>
                ) : null}

                <View style={styles.confirmActionRow}>
                  <TouchableOpacity
                    style={[styles.confirmBtnCancel, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
                    onPress={() => {
                      setConfirmResetVisible(false);
                      setResetError('');
                    }}
                    disabled={resetting}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.confirmBtnCancelText, { color: colors.ink }]}>Batal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.confirmBtnDanger, { backgroundColor: colors.expense }]}
                    onPress={handleExecuteResetTransactions}
                    disabled={resetting || resetSuccess}
                    activeOpacity={0.8}
                  >
                    {resetting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <View style={styles.btnRow}>
                        <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.confirmBtnDangerText}>Ya, Reset Semua</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                  <View style={styles.modalHeaderTitleRow}>
                    <Ionicons name="settings-outline" size={20} color={colors.primary} />
                    <Text style={[styles.modalTitle, { color: colors.ink }]}>
                      Opsi & Reset Dashboard
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setOptionsModalVisible(false)}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={20} color={colors.inkMuted} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  {/* Opsi 1: Refresh Data */}
                  <TouchableOpacity
                    style={[styles.optionItem, { backgroundColor: colors.surfaceAlt }]}
                    onPress={handleRefresh}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.optionIcon, { backgroundColor: colors.primaryLight }]}>
                      <Ionicons name="refresh" size={18} color={colors.primary} />
                    </View>
                    <View style={styles.optionContent}>
                      <Text style={[styles.optionTitle, { color: colors.ink }]}>
                        Segarkan Data
                      </Text>
                      <Text style={[styles.optionSub, { color: colors.inkMuted }]}>
                        Muat ulang saldo dan catatan transaksi terbaru
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Opsi 2: Reset Preferensi Tema */}
                  <TouchableOpacity
                    style={[styles.optionItem, { backgroundColor: colors.surfaceAlt }]}
                    onPress={handleResetTheme}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.optionIcon, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="sunny" size={18} color="#D97706" />
                    </View>
                    <View style={styles.optionContent}>
                      <Text style={[styles.optionTitle, { color: colors.ink }]}>
                        Reset ke Mode Terang
                      </Text>
                      <Text style={[styles.optionSub, { color: colors.inkMuted }]}>
                        Kembalikan tema ke tampilan standar
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Opsi 3: Reset Semua Catatan Transaksi */}
                  <TouchableOpacity
                    style={[styles.optionItem, { backgroundColor: colors.expenseBg }]}
                    onPress={handleOpenResetConfirm}
                    disabled={resetting}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.optionIcon, { backgroundColor: '#FEE2E2' }]}>
                      <Ionicons name="trash-outline" size={18} color={colors.expense} />
                    </View>
                    <View style={styles.optionContent}>
                      <Text style={[styles.optionTitle, { color: colors.expense }]}>
                        Reset Semua Catatan Transaksi
                      </Text>
                      <Text style={[styles.optionSub, { color: colors.inkMuted }]}>
                        Kosongkan seluruh riwayat dan mulai saldo dari Rp0
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flex1: { flex: 1 },
  container: { padding: spacing.md, paddingBottom: spacing.xl, width: '100%', maxWidth: 580, alignSelf: 'center' },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  adminBannerText: { flex: 1, fontWeight: '700', fontSize: 13 },
  saldoCard: { borderRadius: radius.xl, padding: spacing.lg },
  saldoTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saldoHeaderWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  saldoLabel: { color: '#C9D6F5', fontSize: 13, fontWeight: '600' },
  saldoActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resetTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  resetTriggerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
  activePillText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  saldoValue: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', marginTop: spacing.xs, marginBottom: spacing.md, letterSpacing: -0.5 },
  saldoRow: { flexDirection: 'row', alignItems: 'center' },
  saldoItem: { flex: 1 },
  saldoItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  saldoItemValue: { fontSize: 16, fontWeight: '800' },
  saldoItemLabel: { color: '#C9D6F5', fontSize: 12 },
  saldoDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: spacing.md },
  section: { marginTop: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { fontSize: 13, fontWeight: '700', marginBottom: spacing.sm },
  chartBox: { paddingVertical: spacing.xs },
  barTrack: { flexDirection: 'row', height: 12, borderRadius: radius.pill, overflow: 'hidden' },
  barFillIncome: { height: '100%' },
  barFillExpense: { height: '100%' },
  chartLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, fontWeight: '600' },
  loadingText: { textAlign: 'center', paddingVertical: spacing.md },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  txRowBorder: { borderTopWidth: 1 },
  txIconWrap: { width: 38, height: 38, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  txCategory: { fontSize: 14, fontWeight: '700' },
  txNote: { fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '800' },
  ctaWrap: { marginTop: spacing.lg },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    marginBottom: spacing.md,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalBody: {
    gap: spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  optionSub: {
    fontSize: 11,
    marginTop: 2,
  },
  confirmResetWrap: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  confirmIconBadge: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  confirmDesc: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  resetAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    width: '100%',
  },
  resetAlertText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  confirmActionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: spacing.xs,
  },
  confirmBtnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnCancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmBtnDanger: {
    flex: 1.3,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDangerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
