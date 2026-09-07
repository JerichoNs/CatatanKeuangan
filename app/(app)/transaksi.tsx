import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api, ApiError } from '../../services/api';
import { spacing, radius } from '../../constants/theme';
import { Card, SectionLabel, Chip, Button } from '../../components/ui';
import { CalendarModal } from '../../components/CalendarModal';
import { ScreenTransitionWrapper } from '../../components/ScreenTransitionWrapper';
import { expenseCategories, incomeCategories } from '../../constants/categories';
import { todayISO, yesterdayISO, formatTanggalPanjang, monthKey } from '../../utils/date';
import type { TransactionType } from '../../types';

function formatRupiah(value: number) {
  if (!value) return '0';
  return value.toLocaleString('id-ID');
}

export default function TransaksiScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [type, setType] = useState<TransactionType>('expense');
  const [amountText, setAmountText] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayISO());
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  // Kalau edit, load data transaksi dari API
  useEffect(() => {
    if (!isEditing || !id) return;
    (async () => {
      try {
        const data = await api.get<any>(`/transactions/${id}`);
        setType(data.type);
        setAmountText(String(data.amount ?? ''));
        setCategory(data.category ?? '');
        setNote(data.note ?? '');
        setDate(data.date ?? todayISO());
      } catch {
        setError('Gagal memuat transaksi.');
      } finally {
        setFetching(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (category && !categories.some((c) => c.label === category)) {
      setCategory('');
    }
  }, [type]);

  const resetForm = () => {
    setType('expense');
    setAmountText('');
    setCategory('');
    setNote('');
    setDate(todayISO());
  };

  const handleSave = async () => {
    setError('');
    const amount = Number(amountText);
    if (!amount || amount <= 0) {
      setError('Masukkan nominal yang valid.');
      return;
    }
    if (!category) {
      setError('Pilih kategori.');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/transactions/${id}`, {
          type,
          amount,
          category,
          note: note.trim() || null,
          date,
        });
        Alert.alert('Sukses', 'Transaksi berhasil diperbarui.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await api.post('/transactions', {
          type,
          amount,
          category,
          note: note.trim() || null,
          date,
        });
        resetForm();
        Alert.alert('Sukses', 'Transaksi berhasil dicatat.', [
          { text: 'Lihat Riwayat', onPress: () => router.push('/riwayat') },
          { text: 'Catat Lagi', style: 'cancel' },
        ]);
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal menyimpan transaksi. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Hapus Transaksi', 'Yakin mau menghapus catatan ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await api.delete(`/transactions/${id}`);
            router.back();
          } catch {
            setError('Gagal menghapus transaksi.');
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (fetching) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.inkMuted }}>Memuat...</Text>
      </View>
    );
  }

  return (
    <ScreenTransitionWrapper>
      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: 'transparent' }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { maxWidth: isDesktop ? 760 : 540, paddingBottom: isDesktop ? 110 : 85 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: colors.ink }]}>
          {isEditing ? 'Edit Transaksi' : 'Catat Transaksi'}
        </Text>

        {/* Tipe Transaksi */}
        <View style={styles.segment}>
          <Chip
            label="Pengeluaran"
            icon="arrow-up-circle-outline"
            selected={type === 'expense'}
            onPress={() => setType('expense')}
          />
          <Chip
            label="Pemasukan"
            icon="arrow-down-circle-outline"
            selected={type === 'income'}
            onPress={() => setType('income')}
          />
        </View>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.expenseBg }]}>
            <Ionicons name="alert-circle" size={16} color={colors.expense} />
            <Text style={[styles.errorText, { color: colors.expense }]}>{error}</Text>
          </View>
        ) : null}

        {/* Input Nominal */}
        <SectionLabel>Nominal</SectionLabel>
        <Card style={styles.amountCard}>
          <Text style={[styles.amountPrefix, { color: colors.inkMuted }]}>Rp</Text>
          <TextInput
            style={[styles.amountInput, { color: colors.ink }]}
            value={amountText}
            onChangeText={(t) => setAmountText(t.replace(/[^0-9]/g, ''))}
            placeholder="0"
            placeholderTextColor={colors.inkMuted}
            keyboardType="numeric"
          />
        </Card>
        {amountText ? (
          <Text style={[styles.amountPreview, { color: colors.primary }]}>
            Rp {formatRupiah(Number(amountText))}
          </Text>
        ) : null}

        {/* Kategori */}
        <View style={styles.block}>
          <SectionLabel>Kategori</SectionLabel>
          <View style={styles.chipWrap}>
            {categories.map((c) => (
              <Chip
                key={c.key}
                label={c.label}
                icon={c.icon}
                selected={category === c.label}
                onPress={() => setCategory(c.label)}
              />
            ))}
          </View>
        </View>

        {/* Tanggal dengan shortcut & kalender */}
        <View style={styles.block}>
          <SectionLabel>Tanggal</SectionLabel>
          <View style={styles.chipWrap}>
            <Chip
              label="Hari ini"
              selected={date === todayISO()}
              onPress={() => setDate(todayISO())}
            />
            <Chip
              label="Kemarin"
              selected={date === yesterdayISO()}
              onPress={() => setDate(yesterdayISO())}
            />
            <Chip
              label="Pilih Tanggal"
              icon="calendar-outline"
              selected={date !== todayISO() && date !== yesterdayISO()}
              onPress={() => setCalendarVisible(true)}
            />
          </View>

          <TouchableOpacity onPress={() => setCalendarVisible(true)} activeOpacity={0.8}>
            <Card style={styles.dateCard}>
              <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              <Text style={[styles.dateLabel, { color: colors.ink }]}>
                {formatTanggalPanjang(date)}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.inkMuted}
                style={{ marginLeft: 'auto' }}
              />
            </Card>
          </TouchableOpacity>
        </View>

        {/* Catatan */}
        <View style={[styles.block, styles.noteBlock]}>
          <SectionLabel>Catatan (opsional)</SectionLabel>
          <Card>
            <TextInput
              style={[styles.noteInput, { color: colors.ink }]}
              value={note}
              onChangeText={setNote}
              placeholder="Tambahin catatan..."
              placeholderTextColor={colors.inkMuted}
              multiline
            />
          </Card>
        </View>

        <Button
          label={isEditing ? 'Update Transaksi' : 'Simpan Transaksi'}
          onPress={handleSave}
          loading={loading}
          icon={isEditing ? 'checkmark-done-outline' : 'add-circle-outline'}
        />

        {isEditing && (
          <View style={styles.deleteWrap}>
            <Button
              label="Hapus Transaksi"
              onPress={handleDelete}
              variant="ghost"
              icon="trash-outline"
            />
          </View>
        )}
      </ScrollView>

      {/* Modal Kalender */}
      <CalendarModal
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        currentMonth={monthKey(date)}
        selectedDate={date}
        onSelectMonth={(m) => {}}
        onSelectDate={(newDate) => {
          if (newDate) setDate(newDate);
        }}
      />
    </KeyboardAvoidingView>
    </ScreenTransitionWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    width: '100%',
    maxWidth: 580,
    alignSelf: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', marginBottom: spacing.md },
  segment: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: { fontSize: 13, flex: 1, fontWeight: '600' },
  amountCard: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amountPrefix: { fontSize: 22, fontWeight: '800' },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    paddingVertical: 4,
  },
  amountPreview: { fontSize: 13, fontWeight: '700', marginTop: spacing.xs },
  block: { marginTop: spacing.md },
  noteBlock: { marginBottom: spacing.lg },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: spacing.sm,
    paddingVertical: 12,
  },
  dateLabel: { fontSize: 14, fontWeight: '600' },
  noteInput: { fontSize: 14, minHeight: 60, textAlignVertical: 'top' },
  deleteWrap: { marginTop: spacing.sm },
});
