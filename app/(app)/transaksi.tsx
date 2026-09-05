import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, radius } from '../../constants/theme';
import { Card, SectionLabel, Chip, Button } from '../../components/ui';
import { expenseCategories, incomeCategories } from '../../constants/categories';
import { todayISO, yesterdayISO, formatTanggalPanjang } from '../../utils/date';
import type { TransactionType } from '../../types';

function formatRupiah(value: number) {
  if (!value) return '0';
  return value.toLocaleString('id-ID');
}

export default function TransaksiScreen() {
  const { user } = useAuth();
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

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  useEffect(() => {
    if (!isEditing || !id) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'transactions', id));
        if (snap.exists()) {
          const data = snap.data() as any;
          setType(data.type);
          setAmountText(String(data.amount ?? ''));
          setCategory(data.category ?? '');
          setNote(data.note ?? '');
          setDate(data.date ?? todayISO());
        }
      } finally {
        setFetching(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (category && !categories.some((c) => c.label === category)) {
      setCategory('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const resetForm = () => {
    setType('expense');
    setAmountText('');
    setCategory('');
    setNote('');
    setDate(todayISO());
  };

  const handleSave = async () => {
    const amount = Number(amountText.replace(/[^0-9]/g, ''));
    if (!amount || amount <= 0) {
      setError('Nominal wajib diisi.');
      return;
    }
    if (!category) {
      setError('Pilih kategori dulu.');
      return;
    }
    if (!user) return;
    setError('');
    setLoading(true);
    try {
      if (isEditing && id) {
        await updateDoc(doc(db, 'transactions', id), {
          type,
          amount,
          category,
          note: note.trim(),
          date,
        });
      } else {
        await addDoc(collection(db, 'transactions'), {
          userId: user.uid,
          type,
          amount,
          category,
          note: note.trim(),
          date,
          createdAt: Date.now(),
        });
        resetForm();
      }
      router.push('/riwayat');
    } catch (e) {
      setError('Gagal menyimpan, coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert('Hapus transaksi?', 'Transaksi yang dihapus nggak bisa dikembalikan.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await deleteDoc(doc(db, 'transactions', id));
            router.push('/riwayat');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (fetching) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Memuat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{isEditing ? 'Edit Transaksi' : 'Catat Transaksi'}</Text>

        <View style={styles.segment}>
          <Chip label="Pengeluaran" icon="arrow-up-circle-outline" selected={type === 'expense'} onPress={() => setType('expense')} />
          <Chip label="Pemasukan" icon="arrow-down-circle-outline" selected={type === 'income'} onPress={() => setType('income')} />
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.expense} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <SectionLabel>Nominal</SectionLabel>
        <Card style={styles.amountCard}>
          <Text style={styles.amountPrefix}>Rp</Text>
          <TextInput
            style={styles.amountInput}
            value={amountText}
            onChangeText={(t) => setAmountText(t.replace(/[^0-9]/g, ''))}
            placeholder="0"
            placeholderTextColor={colors.inkMuted}
            keyboardType="numeric"
          />
        </Card>
        {amountText ? <Text style={styles.amountPreview}>Rp {formatRupiah(Number(amountText))}</Text> : null}

        <View style={styles.block}>
          <SectionLabel>Kategori</SectionLabel>
          <View style={styles.chipWrap}>
            {categories.map((c) => (
              <Chip key={c.key} label={c.label} icon={c.icon} selected={category === c.label} onPress={() => setCategory(c.label)} />
            ))}
          </View>
        </View>

        <View style={styles.block}>
          <SectionLabel>Tanggal</SectionLabel>
          <View style={styles.chipWrap}>
            <Chip label="Hari ini" selected={date === todayISO()} onPress={() => setDate(todayISO())} />
            <Chip label="Kemarin" selected={date === yesterdayISO()} onPress={() => setDate(yesterdayISO())} />
          </View>
          <Card style={styles.dateCard}>
            <Ionicons name="calendar-outline" size={16} color={colors.inkMuted} />
            <Text style={styles.dateLabel}>{formatTanggalPanjang(date)}</Text>
          </Card>
        </View>

        <View style={[styles.block, styles.noteBlock]}>
          <SectionLabel>Catatan (opsional)</SectionLabel>
          <Card>
            <TextInput
              style={styles.noteInput}
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
            <Button label="Hapus Transaksi" onPress={handleDelete} variant="ghost" icon="trash-outline" />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { color: colors.inkMuted },
  container: { padding: spacing.lg, paddingBottom: spacing.xl, width: '100%', maxWidth: 560, alignSelf: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, marginBottom: spacing.md },
  segment: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEECEC', borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md },
  errorText: { color: colors.expense, fontSize: 13, flex: 1 },
  amountCard: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amountPrefix: { fontSize: 20, fontWeight: '700', color: colors.inkMuted },
  amountInput: { flex: 1, fontSize: 22, fontWeight: '700', color: colors.ink, paddingVertical: 4 },
  amountPreview: { fontSize: 13, color: colors.primary, fontWeight: '600', marginTop: spacing.xs },
  block: { marginTop: spacing.md },
  noteBlock: { marginBottom: spacing.lg },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  dateCard: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.sm },
  dateLabel: { fontSize: 14, color: colors.ink, fontWeight: '600' },
  noteInput: { fontSize: 14, color: colors.ink, minHeight: 60, textAlignVertical: 'top' },
  deleteWrap: { marginTop: spacing.sm },
});
