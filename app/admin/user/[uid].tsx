import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../services/api';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, radius } from '../../../constants/theme';
import { Card, SectionLabel, EmptyState, ErrorState } from '../../../components/ui';
import { iconForCategory } from '../../../constants/categories';
import type { Transaction } from '../../../types';

function formatRupiah(value: number) {
  return 'Rp' + Math.round(Math.abs(value)).toLocaleString('id-ID');
}

type UserProfile = { id: string; name: string; email: string; isAdmin: boolean };

export default function AdminUserDetailScreen() {
  const { colors } = useTheme();
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    if (!uid) return;
    setError(false);
    setLoading(true);
    try {
      const res = await api.get<{ user: UserProfile; transactions: Transaction[] }>(
        `/admin/users/${uid}`
      );
      setProfile(res.user);
      setTransactions(res.transactions);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.flex1}>
          <Text style={[styles.title, { color: colors.ink }]}>{profile?.name || 'Detail Pengguna'}</Text>
          <Text style={[styles.email, { color: colors.inkMuted }]}>{profile?.email}</Text>
        </View>
        <Text style={[styles.link, { color: colors.primary }]} onPress={() => router.back()}>
          Kembali
        </Text>
      </View>

      {error ? (
        <Card>
          <ErrorState onRetry={fetchData} />
        </Card>
      ) : (
        <>
          <View style={[styles.summaryRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.income }]}>
                +{formatRupiah(totalIncome)}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.inkMuted }]}>Pemasukan</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.expense }]}>
                -{formatRupiah(totalExpense)}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.inkMuted }]}>Pengeluaran</Text>
            </View>
          </View>

          <View style={styles.block}>
            <SectionLabel>Transaksi (read-only)</SectionLabel>
            <Card>
              {loading ? (
                <Text style={[styles.loadingText, { color: colors.inkMuted }]}>Memuat...</Text>
              ) : transactions.length === 0 ? (
                <EmptyState
                  icon="receipt-outline"
                  title="Belum ada transaksi"
                  description="Pengguna ini belum nyatet transaksi apapun."
                />
              ) : (
                transactions.map((t, i) => (
                  <View
                    key={t.id}
                    style={[
                      styles.txRow,
                      i > 0 && [styles.txRowBorder, { borderTopColor: colors.border }],
                    ]}
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
                      <Text style={[styles.txMeta, { color: colors.inkMuted }]} numberOfLines={1}>
                        {t.date}
                        {t.note ? ` · ${t.note}` : ''}
                      </Text>
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
  flex: { flex: 1 },
  flex1: { flex: 1 },
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    width: '100%',
    maxWidth: 580,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: { fontSize: 20, fontWeight: '800' },
  email: { fontSize: 13, marginTop: 2 },
  link: { fontWeight: '700', fontSize: 13 },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 32 },
  summaryValue: { fontSize: 16, fontWeight: '800' },
  summaryLabel: { fontSize: 12, marginTop: 2 },
  block: { marginTop: spacing.sm },
  loadingText: { textAlign: 'center', paddingVertical: spacing.md },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: spacing.sm },
  txRowBorder: { borderTopWidth: 1 },
  txIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txCategory: { fontSize: 14, fontWeight: '700' },
  txMeta: { fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '800' },
});
