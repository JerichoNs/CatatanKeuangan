import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, translateApiError } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius } from '../../constants/theme';
import { Button, InputField } from '../../components/ui';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
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
            <Ionicons name="wallet" size={32} color={colors.primary} />
          </View>
          <ThemeToggle size="small" />
        </View>

        <Text style={[styles.title, { color: colors.ink }]}>Catatan Keuangan</Text>
        <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
          Masuk buat lanjut mantau keuanganmu
        </Text>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.expenseBg }]}>
            <Ionicons name="alert-circle" size={16} color={colors.expense} />
            <Text style={[styles.errorText, { color: colors.expense }]}>{error}</Text>
          </View>
        ) : null}

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
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Link href="/forgot-password" style={[styles.link, { color: colors.primary }]}>
          Lupa password?
        </Link>

        <View style={styles.buttonSpacing}>
          <Button label="Masuk" onPress={handleLogin} loading={loading} icon="log-in-outline" />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.inkMuted }]}>Belum punya akun? </Text>
          <Link href="/register" style={[styles.link, { color: colors.primary }]}>
            Daftar
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
