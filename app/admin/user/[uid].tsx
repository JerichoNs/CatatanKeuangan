import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { colors, spacing, radius } from '../../../constants/theme';
import { Card, SectionLabel, EmptyState, ErrorState } from '../../../components/ui';
import { iconForCategory } from '../../../constants/categories';
import type { AppUser, Transaction } from '../../../types';

function formatRupiah(value: number) {
  return 'Rp' + Math.round(Math.abs(value)).toLocaleString('id-ID');
}

export default function AdminUserDetailScreen() {
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const [profile, setProfile] = useState<Omit<AppUser, 'uid'> | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, 'users', uid)).then((snap) => {
      if (snap.exists()) setProfile(snap.data() as Omit<AppUser, 'uid'>);
    });
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    setError(false);
    setLoading(true);
    const q = query(collection(db, 'transactions'), where('userId', '==', uid), orderBy('createdAt', 'desc'));
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
  }, [uid, retryKey]);

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.flex1}>
          <Text style={styles.title}>{profile?.name || 'Detail Pengguna'}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
        </View>
        <Text style={styles.link} onPress={() => router.back()}>
          Kembali
        </Text>
      </View>

      {error ? (
        <Card>
          <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
        </Card>
      ) : (
        <>
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

          <View style={styles.block}>
            <SectionLabel>Transaksi (read-only)</SectionLabel>
            <Card>
              {loading ? (
                <Text style={styles.loadingText}>Memuat...</Text>
              ) : transactions.length === 0 ? (
                <EmptyState icon="receipt-outline" title="Belum ada transaksi" description="Pengguna ini belum nyatet transaksi apapun." />
              ) : (
                transactions.map((t, i) => (
                  <View key={t.id} style={[styles.txRow, i > 0 && styles.txRowBorder]}>
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
                  </View>
                ))
              )}
            </Card>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  flex1: { flex: 1 },
  container: { padding: spacing.lg, paddingBottom: spacing.xl, width: '100%', maxWidth: 560, alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  title: { fontSize: 20, fontWeight: '800', color: colors.ink },
  email: { fontSize: 13, color: colors.inkMuted, marginTop: 2 },
  link: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 32, backgroundColor: colors.border },
  summaryValue: { fontSize: 16, fontWeight: '700' },
  summaryLabel: { fontSize: 12, color: colors.inkMuted, marginTop: 2 },
  block: { marginTop: spacing.sm },
  loadingText: { color: colors.inkMuted, textAlign: 'center', paddingVertical: spacing.md },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: spacing.sm },
  txRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  txIconWrap: { width: 34, height: 34, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  txCategory: { fontSize: 14, fontWeight: '600', color: colors.ink },
  txMeta: { fontSize: 12, color: colors.inkMuted, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700' },
});
