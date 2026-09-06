import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, translateApiError } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius, shadow } from '../../constants/theme';
import { Button, InputField } from '../../components/ui';
import { ThemeToggle } from '../../components/ThemeToggle';
import { AuthAmbientBubbles } from '../../components/AuthAmbientBubbles';

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Animasi Masuk (Fade & Slide Up)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  // Animasi Melayang Ikon Dompet (Floating Wallet)
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animasi masuk halus
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Animasi dompet melayang naik-turun
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Efek denyut lembut
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
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
      {/* Background Animated Floating Bubbles */}
      <AuthAmbientBubbles />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Navigation Bar */}
        <View style={styles.topBar}>
          <View style={styles.brandBadge}>
            <Ionicons name="sparkles" size={14} color={colors.primary} />
            <Text style={[styles.brandBadgeText, { color: colors.primary }]}>Catatan Keuangan</Text>
          </View>
          <ThemeToggle size="small" />
        </View>

        {/* Kartu Login dengan Animasi */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
            isDark ? shadow.cardDark : shadow.card,
          ]}
        >
          {/* Ikon Dompet Melayang Beranimasi */}
          <View style={styles.iconCenterWrap}>
            <Animated.View
              style={[
                styles.iconFloatingWrap,
                {
                  backgroundColor: colors.primaryLight,
                  transform: [{ translateY: floatAnim }, { scale: pulseAnim }],
                },
              ]}
            >
              <Ionicons name="wallet" size={34} color={colors.primary} />
            </Animated.View>
          </View>

          <Text style={[styles.title, { color: colors.ink }]}>Selamat Datang</Text>
          <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
            Masuk untuk lanjut memantau keuanganmu
          </Text>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.expenseBg }]}>
              <Ionicons name="alert-circle" size={18} color={colors.expense} />
              <Text style={[styles.errorText, { color: colors.expense }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.formWrap}>
            <View style={styles.field}>
              <InputField
                icon="mail-outline"
                placeholder="nama@email.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.field}>
              <InputField
                icon="lock-closed-outline"
                placeholder="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError('');
                }}
                secureTextEntry
              />
            </View>

            <View style={styles.forgotRow}>
              <Link href="/forgot-password" style={[styles.link, { color: colors.primary }]}>
                Lupa password?
              </Link>
            </View>

            <View style={styles.buttonSpacing}>
              <Button
                label="Masuk"
                onPress={handleLogin}
                loading={loading}
                icon="log-in-outline"
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.inkMuted }]}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => router.push('/register')} hitSlop={6} activeOpacity={0.7}>
              <Text style={[styles.linkBold, { color: colors.primary }]}>Daftar Sekarang</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    paddingVertical: spacing.xl,
  },
  topBar: {
    width: '100%',
    maxWidth: 460,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(79, 125, 249, 0.08)',
  },
  brandBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 460,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
  },
  iconCenterWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconFloatingWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F7DF9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: spacing.lg,
  },
  formWrap: {
    width: '100%',
  },
  field: {
    marginBottom: spacing.md,
  },
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.md,
    marginTop: -2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
    fontWeight: '600',
  },
  link: {
    fontWeight: '700',
    fontSize: 13,
  },
  linkBold: {
    fontWeight: '800',
    fontSize: 13,
  },
  buttonSpacing: {
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: 13,
  },
});
