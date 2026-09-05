import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, translateApiError } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius } from '../../constants/theme';
import { Button, InputField } from '../../components/ui';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function RegisterScreen() {
  const { register } = useAuth();
  const { colors } = useTheme();
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
      setError(translateApiError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <View style={[styles.logoWrap, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="person-add" size={28} color={colors.primary} />
          </View>
          <ThemeToggle size="small" />
        </View>

        <Text style={[styles.title, { color: colors.ink }]}>Buat Akun</Text>
        <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
          Mulai catat pemasukan & pengeluaranmu
        </Text>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.expenseBg }]}>
            <Ionicons name="alert-circle" size={16} color={colors.expense} />
            <Text style={[styles.errorText, { color: colors.expense }]}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.field}>
          <InputField icon="person-outline" placeholder="Nama" value={name} onChangeText={setName} />
        </View>
        <View style={styles.field}>
          <InputField
            icon="mail-outline"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.field}>
          <InputField
            icon="lock-closed-outline"
            placeholder="Password (min. 6 karakter)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <View style={styles.field}>
          <InputField
            icon="lock-closed-outline"
            placeholder="Konfirmasi password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />
        </View>

        <View style={styles.buttonSpacing}>
          <Button
            label="Daftar"
            onPress={handleRegister}
            loading={loading}
            icon="checkmark-circle-outline"
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.inkMuted }]}>Sudah punya akun? </Text>
          <Link href="/login" style={[styles.link, { color: colors.primary }]}>
            Masuk
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 26, fontWeight: '800', marginBottom: spacing.xs, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, marginBottom: spacing.lg },
  field: { marginBottom: spacing.md },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: { fontSize: 13, flex: 1, fontWeight: '600' },
  link: { fontWeight: '700', fontSize: 14 },
  buttonSpacing: { marginTop: spacing.md },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { fontSize: 14 },
});
