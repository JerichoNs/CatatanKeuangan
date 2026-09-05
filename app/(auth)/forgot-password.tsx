import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, translateApiError } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius } from '../../constants/theme';
import { Button, InputField } from '../../components/ui';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setError('Masukkan email dulu.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setMessage('Link reset password sudah dikirim, cek emailmu.');
    } catch (e: any) {
      setError(translateApiError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <View style={[styles.logoWrap, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="key" size={28} color={colors.primary} />
        </View>
        <ThemeToggle size="small" />
      </View>

      <Text style={[styles.title, { color: colors.ink }]}>Reset Password</Text>
      <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
        Masukkan email akunmu, nanti dikirimin link buat bikin password baru.
      </Text>

      {error ? (
        <View style={[styles.errorBox, { backgroundColor: colors.expenseBg }]}>
          <Ionicons name="alert-circle" size={16} color={colors.expense} />
          <Text style={[styles.errorText, { color: colors.expense }]}>{error}</Text>
        </View>
      ) : null}
      {message ? (
        <View style={[styles.successBox, { backgroundColor: colors.incomeBg }]}>
          <Ionicons name="checkmark-circle" size={16} color={colors.income} />
          <Text style={[styles.successText, { color: colors.income }]}>{message}</Text>
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

      <Button
        label="Kirim Link Reset"
        onPress={handleReset}
        loading={loading}
        icon="send-outline"
      />

      <Text style={[styles.link, { color: colors.primary }]} onPress={() => router.back()}>
        Kembali ke Masuk
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
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
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', marginBottom: spacing.xs, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginBottom: spacing.lg, lineHeight: 20 },
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
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  successText: { fontSize: 13, flex: 1, fontWeight: '600' },
  link: { fontWeight: '700', fontSize: 14, textAlign: 'center', marginTop: spacing.lg },
});
