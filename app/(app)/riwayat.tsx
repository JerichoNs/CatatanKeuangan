import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, radius } from '../../constants/theme';
import { Card, EmptyState, ErrorState, Chip } from '../../components/ui';
import { iconForCategory } from '../../constants/categories';
import { currentMonthKey, formatBulanTahun, monthKey, shiftMonth } from '../../utils/date';
import type { Transaction } from '../../types';

function formatRupiah(value: number) {
  return 'Rp' + Math.round(Math.abs(value)).toLocaleString('id-ID');
}

export default function RiwayatScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [month, setMonth] = useState(currentMonthKey());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  const categoriesInMonth = useMemo(() => {
    const set = new Set(monthTransactions.map((t) => t.category));
    return Array.from(set);
  }, [monthTransactions]);

  const filtered = activeCategory ? monthTransactions.filter((t) => t.category === activeCategory) : monthTransactions;

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const isCurrentOrFutureMonth = month >= currentMonthKey();

  const goMonth = (delta: number) => {
    setMonth((m) => shiftMonth(m, delta));
    setActiveCategory(null);
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Riwayat Transaksi</Text>

      <View style={styles.monthRow}>
        <TouchableOpacity onPress={() => goMonth(-1)} hitSlop={8} style={styles.monthArrow}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{formatBulanTahun(month)}</Text>
        <TouchableOpacity onPress={() => goMonth(1)} disabled={isCurrentOrFutureMonth} hitSlop={8} style={styles.monthArrow}>
          <Ionicons name="chevron-forward" size={20} color={isCurrentOrFutureMonth ? colors.border : colors.primary} />
        </TouchableOpacity>
      </View>

      {!error && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.income }]}>+{formatRupiah(totalIncome)}</Text>
            <Text style={styles.summaryLabel}>Pemasukan</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.expense }]}>-{formatRupiah(totalExpense)}</Text>
            <Text style={styles.summaryLabel}>Pengeluaran</Text>
          </View>
        </View>
      )}

      {categoriesInMonth.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
          <Chip label="Semua" selected={activeCategory === null} onPress={() => setActiveCategory(null)} />
          {categoriesInMonth.map((c) => (
            <Chip key={c} label={c} icon={iconForCategory(c)} selected={activeCategory === c} onPress={() => setActiveCategory(c)} />
          ))}
        </ScrollView>
      )}

      <Card style={styles.listCard}>
        {error ? (
          <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
        ) : loading ? (
          <Text style={styles.loadingText}>Memuat...</Text>
        ) : filtered.length === 0 ? (
          <EmptyState icon="receipt-outline" title="Nggak ada transaksi" description="Nggak ada transaksi buat bulan/kategori ini." />
        ) : (
          filtered.map((t, i) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.txRow, i > 0 && styles.txRowBorder]}
              onPress={() => router.push({ pathname: '/transaksi', params: { id: t.id } })}
              activeOpacity={0.7}
            >
              <View style={[styles.txIconWrap, { backgroundColor: t.type === 'income' ? '#E9F9EF' : '#FEECEC' }]}>
                <Ionicons name={iconForCategory(t.category)} size={16} color={t.type === 'income' ? colors.income : colors.expense} />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.txCategory}>{t.category}</Text>
                <Text style={styles.txMeta} numberOfLines={1}>
                  {t.date}
                  {t.note ? ` \u00b7 ${t.note}` : ''}
                </Text>
              </View>
              <Text style={[styles.txAmount, { color: t.type === 'income' ? colors.income : colors.expense }]}>
                {t.type === 'income' ? '+' : '-'}
                {formatRupiah(t.amount)}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.inkMuted} />
            </TouchableOpacity>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  flex1: { flex: 1 },
  container: { padding: spacing.lg, paddingBottom: spacing.xl, width: '100%', maxWidth: 560, alignSelf: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, marginBottom: spacing.md },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg, marginBottom: spacing.md },
  monthArrow: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  monthLabel: { fontSize: 16, fontWeight: '700', color: colors.ink, minWidth: 150, textAlign: 'center' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 32, backgroundColor: colors.border },
  summaryValue: { fontSize: 16, fontWeight: '700' },
  summaryLabel: { fontSize: 12, color: colors.inkMuted, marginTop: 2 },
  filterScroll: { marginBottom: spacing.sm },
  filterRow: { gap: spacing.sm, paddingRight: spacing.lg },
  listCard: { marginTop: spacing.xs },
  loadingText: { color: colors.inkMuted, textAlign: 'center', paddingVertical: spacing.md },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: spacing.sm },
  txRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  txIconWrap: { width: 34, height: 34, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  txCategory: { fontSize: 14, fontWeight: '600', color: colors.ink },
  txMeta: { fontSize: 12, color: colors.inkMuted, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700' },
});
