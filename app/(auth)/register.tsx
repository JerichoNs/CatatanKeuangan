import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, translateAuthError } from '../../contexts/AuthContext';
import { colors, spacing, radius } from '../../constants/theme';
import { Button, InputField } from '../../components/ui';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Semua field wajib diisi.');
      return;
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      router.replace('/');
    } catch (e: any) {
      setError(translateAuthError(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <Ionicons name="person-add" size={28} color={colors.primary} />
        </View>
        <Text style={styles.title}>Buat Akun</Text>
        <Text style={styles.subtitle}>Mulai catat pemasukan & pengeluaranmu</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.expense} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.field}>
          <InputField icon="person-outline" placeholder="Nama" value={name} onChangeText={setName} />
        </View>
        <View style={styles.field}>
          <InputField icon="mail-outline" placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        </View>
        <View style={styles.field}>
          <InputField icon="lock-closed-outline" placeholder="Password (min. 6 karakter)" value={password} onChangeText={setPassword} secureTextEntry />
        </View>
        <View style={styles.field}>
          <InputField icon="lock-closed-outline" placeholder="Konfirmasi password" value={confirm} onChangeText={setConfirm} secureTextEntry />
        </View>

        <View style={styles.buttonSpacing}>
          <Button label="Daftar" onPress={handleRegister} loading={loading} icon="checkmark-circle-outline" />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Sudah punya akun? </Text>
          <Link href="/login" style={styles.link}>
            Masuk
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, width: '100%', maxWidth: 480, alignSelf: 'center' },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.primaryDark, marginBottom: spacing.xs },
  subtitle: { fontSize: 15, color: colors.inkMuted, marginBottom: spacing.lg },
  field: { marginBottom: spacing.md },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEECEC',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: { color: colors.expense, fontSize: 13, flex: 1 },
  link: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  buttonSpacing: { marginTop: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { color: colors.inkMuted, fontSize: 14 },
});
