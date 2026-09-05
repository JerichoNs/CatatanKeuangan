import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, radius, shadow } from '../../constants/theme';
import { Card, SectionLabel, EmptyState, ErrorState, Button } from '../../components/ui';
import { iconForCategory } from '../../constants/categories';
import type { Transaction } from '../../types';

function formatRupiah(value: number) {
  return 'Rp' + Math.round(Math.abs(value)).toLocaleString('id-ID');
}

export default function DashboardScreen() {
  const { user, isAdmin } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    setError(false);
    setLoading(true);
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
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

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const saldo = totalIncome - totalExpense;
  const recent = transactions.slice(0, 5);
  const hasData = transactions.length > 0;

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      {isAdmin && (
        <TouchableOpacity style={styles.adminBanner} onPress={() => router.push('/admin')} activeOpacity={0.85}>
          <Ionicons name="shield-checkmark" size={16} color={colors.primaryDark} />
          <Text style={styles.adminBannerText}>Kamu login sebagai admin - buka Panel Admin</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primaryDark} />
        </TouchableOpacity>
      )}

      {error ? (
        <Card>
          <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
        </Card>
      ) : (
        <>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.saldoCard, shadow.card]}
          >
            <View style={styles.saldoTopRow}>
              <Text style={styles.saldoLabel}>Saldo Kamu</Text>
              <View style={styles.saldoIconWrap}>
                <Ionicons name="wallet-outline" size={16} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.saldoValue}>{formatRupiah(saldo)}</Text>
            <View style={styles.saldoRow}>
              <View style={styles.saldoItem}>
                <View style={styles.saldoItemHeader}>
                  <Ionicons name="arrow-down-circle" size={14} color="#8FE3B0" />
                  <Text style={styles.saldoItemLabel}>Pemasukan</Text>
                </View>
                <Text style={[styles.saldoItemValue, { color: '#8FE3B0' }]}>{formatRupiah(totalIncome)}</Text>
              </View>
              <View style={styles.saldoDivider} />
              <View style={styles.saldoItem}>
                <View style={styles.saldoItemHeader}>
                  <Ionicons name="arrow-up-circle" size={14} color="#FFB4B0" />
                  <Text style={styles.saldoItemLabel}>Pengeluaran</Text>
                </View>
                <Text style={[styles.saldoItemValue, { color: '#FFB4B0' }]}>{formatRupiah(totalExpense)}</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.section}>
            <SectionLabel>Grafik Pengeluaran</SectionLabel>
            <Card>
              {!hasData ? (
                <EmptyState icon="bar-chart-outline" title="Belum ada data" description="Grafik bakal muncul begitu kamu mulai catat transaksi." />
              ) : (
                <View style={styles.barTrack}>
                  <View style={[styles.barFillIncome, { flex: totalIncome || 0.001 }]} />
                  <View style={[styles.barFillExpense, { flex: totalExpense || 0.001 }]} />
                </View>
              )}
            </Card>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SectionLabel>Transaksi Terbaru</SectionLabel>
              <TouchableOpacity onPress={() => router.push('/riwayat')}>
                <Text style={styles.seeAll}>Lihat semua</Text>
              </TouchableOpacity>
            </View>
            <Card>
              {loading ? (
                <Text style={styles.loadingText}>Memuat...</Text>
              ) : recent.length === 0 ? (
                <EmptyState icon="receipt-outline" title="Belum ada transaksi" description="Yuk catat pemasukan atau pengeluaran pertamamu." />
              ) : (
                recent.map((t, i) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.txRow, i > 0 && styles.txRowBorder]}
                    onPress={() => router.push({ pathname: '/transaksi', params: { id: t.id } })}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.txIconWrap, { backgroundColor: t.type === 'income' ? '#E9F9EF' : '#FEECEC' }]}>
                      <Ionicons
                        name={iconForCategory(t.category)}
                        size={16}
                        color={t.type === 'income' ? colors.income : colors.expense}
                      />
                    </View>
                    <View style={styles.flex1}>
                      <Text style={styles.txCategory}>{t.category}</Text>
                      {t.note ? <Text style={styles.txNote}>{t.note}</Text> : null}
                    </View>
                    <Text style={[styles.txAmount, { color: t.type === 'income' ? colors.income : colors.expense }]}>
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
              <Button label="Catat Transaksi Pertama" onPress={() => router.push('/transaksi')} variant="accent" icon="add-circle-outline" />
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  flex1: { flex: 1 },
  container: { padding: spacing.lg, paddingBottom: spacing.xl, width: '100%', maxWidth: 560, alignSelf: 'center' },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  adminBannerText: { flex: 1, color: colors.primaryDark, fontWeight: '700', fontSize: 13 },
  saldoCard: { borderRadius: radius.lg, padding: spacing.md },
  saldoTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saldoLabel: { color: '#C9D6F5', fontSize: 13, fontWeight: '600' },
  saldoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saldoValue: { color: '#FFFFFF', fontSize: 34, fontWeight: '800', marginTop: spacing.xs, marginBottom: spacing.md },
  saldoRow: { flexDirection: 'row', alignItems: 'center' },
  saldoItem: { flex: 1 },
  saldoItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  saldoItemValue: { fontSize: 15, fontWeight: '700' },
  saldoItemLabel: { color: '#C9D6F5', fontSize: 12 },
  saldoDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: spacing.md },
  section: { marginTop: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { color: colors.primary, fontSize: 13, fontWeight: '600', marginBottom: spacing.sm },
  barTrack: { flexDirection: 'row', height: 12, borderRadius: radius.pill, overflow: 'hidden', backgroundColor: colors.border },
  barFillIncome: { backgroundColor: colors.income },
  barFillExpense: { backgroundColor: colors.expense },
  loadingText: { color: colors.inkMuted, textAlign: 'center', paddingVertical: spacing.md },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: spacing.sm },
  txRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  txIconWrap: { width: 34, height: 34, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  txCategory: { fontSize: 14, fontWeight: '600', color: colors.ink },
  txNote: { fontSize: 12, color: colors.inkMuted, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700' },
  ctaWrap: { marginTop: spacing.lg },
});
