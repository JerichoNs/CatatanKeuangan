import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, translateAuthError } from '../../contexts/AuthContext';
import { colors, spacing, radius } from '../../constants/theme';
import { Button, InputField } from '../../components/ui';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
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
      setError(translateAuthError(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Ionicons name="key" size={28} color={colors.primary} />
      </View>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Masukkan email akunmu, nanti dikirimin link buat bikin password baru.</Text>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={16} color={colors.expense} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      {message ? (
        <View style={styles.successBox}>
          <Ionicons name="checkmark-circle" size={16} color={colors.income} />
          <Text style={styles.successText}>{message}</Text>
        </View>
      ) : null}

      <View style={styles.field}>
        <InputField icon="mail-outline" placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      </View>

      <Button label="Kirim Link Reset" onPress={handleReset} loading={loading} icon="send-outline" />

      <Text style={styles.link} onPress={() => router.back()}>
        Kembali ke Masuk
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center', width: '100%', maxWidth: 480, alignSelf: 'center' },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.primaryDark, marginBottom: spacing.xs },
  subtitle: { fontSize: 14, color: colors.inkMuted, marginBottom: spacing.lg, lineHeight: 20 },
  field: { marginBottom: spacing.md },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEECEC', borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md },
  errorText: { color: colors.expense, fontSize: 13, flex: 1 },
  successBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E9F9EF', borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md },
  successText: { color: colors.income, fontSize: 13, flex: 1 },
  link: { color: colors.primary, fontWeight: '700', fontSize: 14, textAlign: 'center', marginTop: spacing.lg },
});
