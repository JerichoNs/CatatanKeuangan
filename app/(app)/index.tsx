import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
  const { colors, isDark } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
              <View style={styles.activePill}>
                <View style={styles.activeDot} />
                <Text style={styles.activePillText}>Aktif</Text>
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
});
