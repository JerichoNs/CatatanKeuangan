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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, translateApiError } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius, shadow } from '../../constants/theme';
import { Button, InputField, LiquidSheenBeam } from '../../components/ui';
import { ThemeToggle } from '../../components/ThemeToggle';
import { AuthAmbientBubbles } from '../../components/AuthAmbientBubbles';

export default function RegisterScreen() {
  const { register } = useAuth();
  const { colors, isDark } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Animasi Masuk (Fade & Slide Up)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  // Animasi Melayang Ikon Daftar
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Semua field wajib diisi.');
      return;
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
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
      {/* Background Animated Floating Bubbles */}
      <AuthAmbientBubbles />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Navigasi Atas */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor: isDark ? 'rgba(97, 97, 255, 0.16)' : 'rgba(255, 255, 255, 0.82)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(208, 212, 228, 0.85)',
              },
            ]}
            onPress={() => router.back()}
            hitSlop={8}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
          >
            <Ionicons name="arrow-back" size={17} color={colors.ink} />
            <Text style={[styles.backButtonText, { color: colors.ink }]}>Kembali</Text>
          </TouchableOpacity>

          <ThemeToggle size="small" />
        </View>

        {/* Kartu Daftar Akun Frosted Liquid Glass */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              backgroundColor: isDark ? 'rgba(26, 29, 46, 0.65)' : 'rgba(255, 255, 255, 0.78)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.95)',
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
            Platform.OS === 'web'
              ? ({
                  backdropFilter: 'blur(36px) saturate(220%)',
                  WebkitBackdropFilter: 'blur(36px) saturate(220%)',
                  boxShadow: isDark
                    ? '0 24px 64px rgba(0, 0, 0, 0.65), 0 0 45px rgba(97, 97, 255, 0.22), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.2)'
                    : '0 24px 64px rgba(97, 97, 255, 0.18), 0 4px 16px rgba(0, 0, 0, 0.03), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.95)',
                } as any)
              : (isDark ? shadow.cardDark : shadow.card),
          ]}
        >
          {/* Kilau Specular Cair Beranimasi */}
          <LiquidSheenBeam />

          {/* Ikon Daftar Melayang Apple Glow Orb */}
          <View style={styles.iconCenterWrap}>
            <Animated.View
              style={[
                styles.iconFloatingWrap,
                {
                  transform: [{ translateY: floatAnim }, { scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={['#7C7CFF', '#6161FF', '#4E4EFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradientCircle}
              >
                <Ionicons name="person-add-outline" size={32} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>
          </View>

          <Text style={[styles.title, { color: colors.ink }]}>Buat Akun Baru</Text>
          <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
            Mulai kelola dan pantau arus keuanganmu sekarang
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
                icon="person-outline"
                placeholder="Nama Lengkap"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (error) setError('');
                }}
              />
            </View>

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
                placeholder="Password (min. 6 karakter)"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError('');
                }}
                secureTextEntry
              />
            </View>

            <View style={styles.field}>
              <InputField
                icon="shield-checkmark-outline"
                placeholder="Konfirmasi password"
                value={confirm}
                onChangeText={(text) => {
                  setConfirm(text);
                  if (error) setError('');
                }}
                secureTextEntry
              />
            </View>

            <View style={styles.buttonSpacing}>
              <Button
                label="Daftar Sekarang"
                onPress={handleRegister}
                loading={loading}
                icon="checkmark-circle-outline"
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.inkMuted }]}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => router.replace('/login')} hitSlop={6} activeOpacity={0.7}>
              <Text style={[styles.linkBold, { color: colors.primary }]}>Masuk di sini</Text>
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
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.buttons,
    borderWidth: 1,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any)
      : {}),
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 28,
    borderWidth: 1.5,
    padding: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  iconCenterWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconFloatingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGradientCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 10px 30px rgba(97, 97, 255, 0.55), inset 0 2px 2px rgba(255, 255, 255, 0.6)',
        } as any)
      : {
          elevation: 8,
          shadowColor: '#6161FF',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.45,
          shadowRadius: 16,
        }),
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.7,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  formWrap: {
    width: '100%',
  },
  field: {
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.25)',
  },
  errorText: {
    fontSize: 13,
    flex: 1,
    fontWeight: '600',
  },
  linkBold: {
    fontWeight: '800',
    fontSize: 13,
  },
  buttonSpacing: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
