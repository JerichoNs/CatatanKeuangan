import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius } from '../../constants/theme';
import { Card, SectionLabel, EmptyState, ErrorState } from '../../components/ui';
import { ServerConfigModal } from '../../components/ServerConfigModal';
import { currentMonthKey, monthKey } from '../../utils/date';
import type { Transaction } from '../../types';

function formatRupiah(value: number) {
  return 'Rp' + Math.round(Math.abs(value)).toLocaleString('id-ID');
}

type AdminUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  transactionCount: number;
  createdAt: number;
};

type AdminTransaction = Transaction & { userName?: string };

export default function AdminScreen() {
  const { colors } = useTheme();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [serverModalVisible, setServerModalVisible] = useState(false);

  const fetchData = useCallback(async () => {
    setError(false);
    setLoading(true);
    try {
      const [usersData, txData] = await Promise.all([
        api.get<AdminUser[]>('/admin/users'),
        api.get<AdminTransaction[]>('/admin/transactions'),
      ]);
      setUsers(usersData);
      setTransactions(txData);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const totalVolume = transactions.reduce((s, t) => s + t.amount, 0);
  const txThisMonth = transactions.filter((t) => monthKey(t.date) === currentMonthKey()).length;

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.ink }]}>Panel Admin</Text>
          <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
            Monitoring sistem & manajemen pengguna
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.serverBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setServerModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="server-outline" size={15} color={colors.primary} />
            <Text style={[styles.serverBtnText, { color: colors.primary }]}>Atur IP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace('/')}
            activeOpacity={0.8}
          >
            <Text style={styles.backBtnText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        <Card>
          <ErrorState onRetry={fetchData} />
        </Card>
      ) : (
        <>
          <SectionLabel>Statistik Umum</SectionLabel>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Ionicons name="people-outline" size={18} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.ink }]}>
                {loading ? '-' : users.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.inkMuted }]}>Total Pengguna</Text>
            </Card>
            <Card style={styles.statCard}>
              <Ionicons name="receipt-outline" size={18} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.ink }]}>
                {loading ? '-' : transactions.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.inkMuted }]}>Total Transaksi</Text>
            </Card>
            <Card style={styles.statCard}>
              <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.ink }]}>
                {loading ? '-' : txThisMonth}
              </Text>
              <Text style={[styles.statLabel, { color: colors.inkMuted }]}>Transaksi Bulan Ini</Text>
            </Card>
          </View>

          <Card style={styles.volumeCard}>
            <Text style={[styles.volumeLabel, { color: colors.inkMuted }]}>
              Total Volume Transaksi (semua pengguna)
            </Text>
            <Text style={[styles.volumeValue, { color: colors.primary }]}>
              {loading ? '-' : formatRupiah(totalVolume)}
            </Text>
          </Card>

          <View style={styles.block}>
            <SectionLabel>Daftar Pengguna</SectionLabel>
            <Card>
              {loading ? (
                <Text style={[styles.loadingText, { color: colors.inkMuted }]}>Memuat...</Text>
              ) : users.length === 0 ? (
                <EmptyState
                  icon="people-outline"
                  title="Belum ada pengguna"
                  description="Daftar pengguna bakal muncul di sini."
                />
              ) : (
                users.map((u, i) => (
                  <View
                    key={u.id}
                    style={[
                      styles.userRow,
                      i > 0 && [styles.userRowBorder, { borderTopColor: colors.border }],
                    ]}
                  >
                    <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
                      <Text style={[styles.avatarText, { color: colors.primary }]}>
                        {(u.name || u.email || '?').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.flex1}>
                      <Text style={[styles.userName, { color: colors.ink }]}>
                        {u.name || '(tanpa nama)'}
                      </Text>
                      <Text style={[styles.userEmail, { color: colors.inkMuted }]} numberOfLines={1}>
                        {u.email}
                      </Text>
                    </View>
                    <View style={styles.userMeta}>
                      <Text style={[styles.userTxCount, { color: colors.inkMuted }]}>
                        {u.transactionCount} transaksi
                      </Text>
                      {u.isAdmin ? (
                        <Text style={[styles.adminTag, { color: colors.accentDark }]}>Admin</Text>
                      ) : null}
                    </View>
                  </View>
                ))
              )}
            </Card>
          </View>
        </>
      )}

      <ServerConfigModal
        visible={serverModalVisible}
        onClose={() => {
          setServerModalVisible(false);
          fetchData();
        }}
      />
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
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 12, marginTop: 1 },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  serverBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, alignItems: 'flex-start', gap: 6 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600' },
  volumeCard: { marginTop: spacing.sm },
  volumeLabel: { fontSize: 12, fontWeight: '600' },
  volumeValue: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  block: { marginTop: spacing.lg, marginBottom: spacing.md },
  loadingText: { textAlign: 'center', paddingVertical: spacing.md },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: spacing.sm },
  userRowBorder: { borderTopWidth: 1 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700' },
  userName: { fontSize: 14, fontWeight: '700' },
  userEmail: { fontSize: 12, marginTop: 2 },
  userMeta: { alignItems: 'flex-end', marginRight: 4 },
  userTxCount: { fontSize: 12, fontWeight: '600' },
  adminTag: { fontSize: 10, fontWeight: '700', marginTop: 2 },
});
