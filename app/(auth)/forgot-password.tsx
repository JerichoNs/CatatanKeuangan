import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, translateApiError } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius, shadow } from '../../constants/theme';
import { Button, InputField, LiquidSheenBeam } from '../../components/ui';
import { ThemeToggle } from '../../components/ThemeToggle';
import { AuthAmbientBubbles } from '../../components/AuthAmbientBubbles';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const { colors, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Animasi Masuk (Fade & Slide Up)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  // Animasi Melayang Ikon Kunci (Floating Key)
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animasi Sukses
  const successScale = useRef(new Animated.Value(0.8)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
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

    // Floating loop animation
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

    // Subtle pulsing glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
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

  const handleReset = async () => {
    if (!email) {
      setError('Masukkan email akunmu terlebih dahulu.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setMessage('Tautan reset password berhasil dikirim! Silakan periksa inbox emailmu.');
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
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
      {/* Latar Belakang Lingkaran Ambient Glowing */}
      <AuthAmbientBubbles />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Navigasi Atas */}
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

        {/* Kartu Reset Password Frosted Liquid Glass */}
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

          {/* Ikon Kunci Melayang Apple Glow Orb */}
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
                <Ionicons
                  name={message ? 'mail-unread-outline' : 'key-outline'}
                  size={32}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </Animated.View>
          </View>

          <Text style={[styles.title, { color: colors.ink }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
            Masukkan alamat email yang terdaftar untuk menerima petunjuk reset password akunmu.
          </Text>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.expenseBg }]}>
              <Ionicons name="alert-circle" size={18} color={colors.expense} />
              <Text style={[styles.errorText, { color: colors.expense }]}>{error}</Text>
            </View>
          ) : null}

          {message ? (
            <Animated.View
              style={[
                styles.successCard,
                {
                  backgroundColor: colors.incomeBg,
                  opacity: successOpacity,
                  transform: [{ scale: successScale }],
                },
              ]}
            >
              <View style={styles.successIconRow}>
                <Ionicons name="checkmark-circle" size={24} color={colors.income} />
                <Text style={[styles.successTitle, { color: colors.income }]}>Email Terkirim!</Text>
              </View>
              <Text style={[styles.successDesc, { color: colors.ink }]}>{message}</Text>
              <TouchableOpacity
                style={[styles.successBtn, { backgroundColor: colors.income }]}
                onPress={() => router.replace('/login')}
                activeOpacity={0.85}
              >
                <Text style={styles.successBtnText}>Lanjut ke Halaman Masuk</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
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

              <Button
                label="Kirim Link Pemulihan"
                onPress={handleReset}
                loading={loading}
                icon="paper-plane-outline"
              />
            </View>
          )}

          <TouchableOpacity
            onPress={() => router.replace('/login')}
            hitSlop={10}
            style={styles.returnWrap}
            activeOpacity={0.7}
          >
            <Ionicons name="log-in-outline" size={16} color={colors.primary} />
            <Text style={[styles.returnText, { color: colors.primary }]}>
              Sudah ingat password? Masuk di sini
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
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
    position: 'relative',
    overflow: 'hidden',
  },
  iconCenterWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconFloatingWrap: {
    borderRadius: 36,
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
    marginBottom: 18,
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
  successCard: {
    borderRadius: radius.cards,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  successIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  successDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  successBtn: {
    paddingVertical: 10,
    borderRadius: radius.buttons,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  returnWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.lg,
  },
  returnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
