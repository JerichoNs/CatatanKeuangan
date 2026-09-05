import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { colors, spacing, radius } from '../../constants/theme';
import { Card, SectionLabel, EmptyState, ErrorState } from '../../components/ui';
import { currentMonthKey, monthKey } from '../../utils/date';
import type { AppUser, Transaction } from '../../types';

function formatRupiah(value: number) {
  return 'Rp' + Math.round(Math.abs(value)).toLocaleString('id-ID');
}

type UserRow = AppUser & { uid: string; transactionCount: number };

export default function AdminScreen() {
  const [users, setUsers] = useState<(AppUser & { uid: string })[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setError(false);
    setLoadingUsers(true);
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setUsers(snapshot.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<AppUser, 'uid'>) })));
        setLoadingUsers(false);
      },
      () => {
        setError(true);
        setLoadingUsers(false);
      }
    );
    return unsubscribe;
  }, [retryKey]);

  useEffect(() => {
    setLoadingTx(true);
    const unsubscribe = onSnapshot(
      collection(db, 'transactions'),
      (snapshot) => {
        setTransactions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Transaction));
        setLoadingTx(false);
      },
      () => {
        setError(true);
        setLoadingTx(false);
      }
    );
    return unsubscribe;
  }, [retryKey]);

  const loading = loadingUsers || loadingTx;
  const totalVolume = transactions.reduce((s, t) => s + t.amount, 0);
  const txThisMonth = transactions.filter((t) => monthKey(t.date) === currentMonthKey()).length;

  const usersWithCount: UserRow[] = useMemo(() => {
    return users
      .map((u) => ({ ...u, transactionCount: transactions.filter((t) => t.userId === u.uid).length }))
      .sort((a, b) => b.transactionCount - a.transactionCount);
  }, [users, transactions]);

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel Admin</Text>
        <Text style={styles.link} onPress={() => router.replace('/')}>
          Kembali ke App
        </Text>
      </View>

      {error ? (
        <Card>
          <ErrorState onRetry={() => setRetryKey((k) => k + 1)} />
        </Card>
      ) : (
        <>
          <SectionLabel>Statistik Umum</SectionLabel>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Ionicons name="people-outline" size={18} color={colors.primary} />
              <Text style={styles.statValue}>{loading ? '-' : users.length}</Text>
              <Text style={styles.statLabel}>Total Pengguna</Text>
            </Card>
            <Card style={styles.statCard}>
              <Ionicons name="receipt-outline" size={18} color={colors.primary} />
              <Text style={styles.statValue}>{loading ? '-' : transactions.length}</Text>
              <Text style={styles.statLabel}>Total Transaksi</Text>
            </Card>
            <Card style={styles.statCard}>
              <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              <Text style={styles.statValue}>{loading ? '-' : txThisMonth}</Text>
              <Text style={styles.statLabel}>Transaksi Bulan Ini</Text>
            </Card>
          </View>
          <Card style={styles.volumeCard}>
            <Text style={styles.volumeLabel}>Total Volume Transaksi (semua pengguna)</Text>
            <Text style={styles.volumeValue}>{loading ? '-' : formatRupiah(totalVolume)}</Text>
          </Card>

          <View style={styles.block}>
            <SectionLabel>Daftar Pengguna</SectionLabel>
            <Card>
              {loading ? (
                <Text style={styles.loadingText}>Memuat...</Text>
              ) : usersWithCount.length === 0 ? (
                <EmptyState icon="people-outline" title="Belum ada pengguna" description="Daftar pengguna bakal muncul di sini." />
              ) : (
                usersWithCount.map((u, i) => (
                  <TouchableOpacity
                    key={u.uid}
                    style={[styles.userRow, i > 0 && styles.userRowBorder]}
                    onPress={() => router.push(`/admin/user/${u.uid}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{(u.name || u.email || '?').charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.flex1}>
                      <Text style={styles.userName}>{u.name || '(tanpa nama)'}</Text>
                      <Text style={styles.userEmail} numberOfLines={1}>
                        {u.email}
                      </Text>
                    </View>
                    <View style={styles.userMeta}>
                      <Text style={styles.userTxCount}>{u.transactionCount} transaksi</Text>
                      {u.isAdmin ? <Text style={styles.adminTag}>Admin</Text> : null}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.inkMuted} />
                  </TouchableOpacity>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink },
  link: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  statsGrid: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, alignItems: 'flex-start', gap: 6 },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.ink },
  statLabel: { fontSize: 11, color: colors.inkMuted, fontWeight: '600' },
  volumeCard: { marginTop: spacing.sm },
  volumeLabel: { fontSize: 12, color: colors.inkMuted, fontWeight: '600' },
  volumeValue: { fontSize: 20, fontWeight: '800', color: colors.primaryDark, marginTop: 4 },
  block: { marginTop: spacing.lg, marginBottom: spacing.md },
  loadingText: { color: colors.inkMuted, textAlign: 'center', paddingVertical: spacing.md },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: spacing.sm },
  userRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  userName: { fontSize: 14, fontWeight: '700', color: colors.ink },
  userEmail: { fontSize: 12, color: colors.inkMuted, marginTop: 2 },
  userMeta: { alignItems: 'flex-end', marginRight: 4 },
  userTxCount: { fontSize: 12, color: colors.inkMuted, fontWeight: '600' },
  adminTag: { fontSize: 10, fontWeight: '700', color: colors.accentDark, marginTop: 2 },
});
