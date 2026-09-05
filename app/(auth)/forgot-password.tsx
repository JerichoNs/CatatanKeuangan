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
import { Ionicons } from '@expo/vector-icons';
import { useAuth, translateApiError } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius, shadow } from '../../constants/theme';
import { Button, InputField } from '../../components/ui';
import { ThemeToggle } from '../../components/ThemeToggle';

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
      <View style={styles.ambientContainer} pointerEvents="none">
        <View
          style={[
            styles.glowOrb1,
            { backgroundColor: isDark ? 'rgba(79, 125, 249, 0.12)' : 'rgba(43, 92, 230, 0.08)' },
          ]}
        />
        <View
          style={[
            styles.glowOrb2,
            { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.08)' : 'rgba(255, 193, 69, 0.08)' },
          ]}
        />
      </View>

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
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.back()}
            hitSlop={8}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
          >
            <Ionicons name="arrow-back" size={18} color={colors.ink} />
            <Text style={[styles.backButtonText, { color: colors.ink }]}>Kembali</Text>
          </TouchableOpacity>

          <ThemeToggle size="small" />
        </View>

        {/* Kartu Reset Password dengan Animasi */}
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
          {/* Ikon Kunci Melayang Beranimasi */}
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
              <Ionicons
                name={message ? 'mail-unread-outline' : 'key-outline'}
                size={34}
                color={colors.primary}
              />
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
  ambientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  glowOrb1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  glowOrb2: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
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
  successCard: {
    borderRadius: radius.lg,
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
    borderRadius: radius.pill,
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
