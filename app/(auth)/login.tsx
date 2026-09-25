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

export default function LoginScreen() {
  const { login, loginAsDemo } = useAuth();
  const { colors, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [isWide, setIsWide] = useState(
    Platform.OS === 'web' && typeof window !== 'undefined' && window.innerWidth >= 900
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;
  const leftPaneFade = useRef(new Animated.Value(0)).current;
  const leftPaneSlide = useRef(new Animated.Value(-20)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleResize = () => setIsWide(window.innerWidth >= 900);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 560, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 7, tension: 45, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(leftPaneFade, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(leftPaneSlide, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      ]).start();
    }, 180);

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 1800, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.07, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(1200),
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

  const handleDemo = async () => {
    setDemoLoading(true);
    try {
      await loginAsDemo();
      router.replace('/');
    } catch {
      // silent
    } finally {
      setDemoLoading(false);
    }
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 300],
  });

  const cardBg = isDark ? 'rgba(18,20,36,0.80)' : 'rgba(255,255,255,0.88)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.95)';
  const cardShadow =
    Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          boxShadow: isDark
            ? '0 32px 80px rgba(0,0,0,0.70),0 0 60px rgba(97,97,255,0.25),inset 0 1px 1px rgba(255,255,255,0.18)'
            : '0 24px 72px rgba(97,97,255,0.16),0 4px 16px rgba(0,0,0,0.04),inset 0 1px 1px rgba(255,255,255,0.95)',
        } as any)
      : isDark
      ? shadow.cardDark
      : shadow.card;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AuthAmbientBubbles />

      {Platform.OS === 'web' && (
        <View style={styles.ambientContainer} pointerEvents="none">
          <View style={[styles.glowBlob, styles.glowBlobLeft, { backgroundColor: isDark ? 'rgba(97,97,255,0.28)' : 'rgba(97,97,255,0.12)' }]} />
          <View style={[styles.glowBlob, styles.glowBlobRight, { backgroundColor: isDark ? 'rgba(120,200,255,0.14)' : 'rgba(120,200,255,0.07)' }]} />
          <View style={[styles.glowBlob, styles.glowBlobBottom, { backgroundColor: isDark ? 'rgba(255,97,200,0.10)' : 'rgba(255,97,200,0.05)' }]} />
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topBar, { maxWidth: isWide ? 900 : 440 }]}>
          <TouchableOpacity
            onPress={() => router.replace('/landing')}
            activeOpacity={0.75}
            style={[
              styles.brandBadge,
              {
                backgroundColor: isDark ? 'rgba(97,97,255,0.18)' : 'rgba(255,255,255,0.82)',
                borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(208,212,228,0.85)',
              },
            ]}
          >
            <LinearGradient colors={['#7C7CFF', '#6161FF']} style={styles.brandIconDot}>
              <Ionicons name="wallet" size={13} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.brandBadgeText, { color: colors.ink }]}>Rekap.id</Text>
          </TouchableOpacity>
          <ThemeToggle size="small" />
        </View>

        <Animated.View
          style={[
            styles.outerCard,
            {
              backgroundColor: cardBg,
              borderColor: cardBorder,
              maxWidth: isWide ? 900 : 440,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
            cardShadow,
          ]}
        >
          <LiquidSheenBeam />

          {isWide ? (
            <View style={styles.twoColLayout}>
              <Animated.View style={[styles.leftPanel, { opacity: leftPaneFade, transform: [{ translateX: leftPaneSlide }] }]}>
                <LinearGradient
                  colors={isDark ? ['#1e2140', '#0d0f1e'] : ['#6161FF', '#4444d4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.leftPanelGradient}
                >
                  <View style={styles.dotGrid} pointerEvents="none">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <View key={i} style={[styles.dot, { opacity: 0.18 + (i % 4) * 0.07 }]} />
                    ))}
                  </View>
                  <Animated.View style={[styles.leftIconArea, { transform: [{ translateY: floatAnim }, { scale: pulseAnim }] }]}>
                    <View style={styles.leftIconCircle}>
                      <Ionicons name="wallet" size={38} color="#FFFFFF" />
                    </View>
                    <View style={styles.orbitRing} />
                  </Animated.View>
                  <Text style={styles.leftTitle}>Rekap.id</Text>
                  <Text style={styles.leftSubtitle}>{'Pantau keuangan harian\ndengan mudah & cerdas.'}</Text>
                  <View style={styles.chipRow}>
                    {['Kantong & Dompet', 'Laporan PDF A4', 'Kurs & Emas'].map((f) => (
                      <View key={f} style={styles.chip}>
                        <Ionicons name="checkmark-circle" size={12} color="rgba(255,255,255,0.85)" />
                        <Text style={styles.chipText}>{f}</Text>
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              </Animated.View>

              <View style={styles.rightPanel}>
                <FormContent
                  colors={colors} isDark={isDark} email={email} password={password}
                  error={error} loading={loading} demoLoading={demoLoading}
                  shimmerTranslate={shimmerTranslate}
                  setEmail={(t: string) => { setEmail(t); if (error) setError(''); }}
                  setPassword={(t: string) => { setPassword(t); if (error) setError(''); }}
                  handleLogin={handleLogin} handleDemo={handleDemo}
                />
              </View>
            </View>
          ) : (
            <View style={styles.singleColLayout}>
              <View style={styles.iconCenterWrap}>
                <Animated.View style={{ transform: [{ translateY: floatAnim }, { scale: pulseAnim }] }}>
                  <LinearGradient
                    colors={['#7C7CFF', '#6161FF', '#4E4EFF']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.iconGradientCircle}
                  >
                    <Ionicons name="wallet" size={34} color="#FFFFFF" />
                  </LinearGradient>
                </Animated.View>
              </View>
              <FormContent
                colors={colors} isDark={isDark} email={email} password={password}
                error={error} loading={loading} demoLoading={demoLoading}
                shimmerTranslate={shimmerTranslate}
                setEmail={(t: string) => { setEmail(t); if (error) setError(''); }}
                setPassword={(t: string) => { setPassword(t); if (error) setError(''); }}
                handleLogin={handleLogin} handleDemo={handleDemo}
              />
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type FormProps = {
  colors: any; isDark: boolean; email: string; password: string;
  error: string; loading: boolean; demoLoading: boolean;
  shimmerTranslate: Animated.AnimatedInterpolation<number>;
  setEmail: (t: string) => void; setPassword: (t: string) => void;
  handleLogin: () => void; handleDemo: () => void;
};

function FormContent({
  colors, isDark, email, password, error, loading, demoLoading,
  shimmerTranslate, setEmail, setPassword, handleLogin, handleDemo,
}: FormProps) {
  return (
    <View>
      <Text style={[styles.title, { color: colors.ink }]}>Selamat Datang</Text>
      <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
        Masuk untuk memantau keuanganmu
      </Text>

      {error ? (
        <View style={[styles.errorBox, { backgroundColor: colors.expenseBg }]}>
          <Ionicons name="alert-circle" size={16} color={colors.expense} />
          <Text style={[styles.errorText, { color: colors.expense }]}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.field}>
        <InputField icon="mail-outline" placeholder="nama@email.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      </View>
      <View style={styles.field}>
        <InputField icon="lock-closed-outline" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      </View>

      <View style={styles.forgotRow}>
        <Link href="/forgot-password" style={[styles.link, { color: colors.primary }]}>Lupa password?</Link>
      </View>

      <View style={styles.buttonSpacing}>
        <Button label="Masuk" onPress={handleLogin} loading={loading} icon="log-in-outline" />
      </View>

      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)' }]} />
        <Text style={[styles.dividerText, { color: colors.inkMuted }]}>atau</Text>
        <View style={[styles.dividerLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)' }]} />
      </View>

      <TouchableOpacity
        onPress={handleDemo}
        activeOpacity={0.8}
        disabled={demoLoading}
        style={[
          styles.demoButton,
          {
            backgroundColor: isDark ? 'rgba(97,97,255,0.13)' : 'rgba(97,97,255,0.07)',
            borderColor: isDark ? 'rgba(97,97,255,0.45)' : 'rgba(97,97,255,0.28)',
          },
          Platform.OS === 'web' ? ({ overflow: 'hidden', position: 'relative' } as any) : {},
        ]}
      >
        {Platform.OS === 'web' && (
          <Animated.View style={[styles.shimmerBar, { transform: [{ translateX: shimmerTranslate }] }]} pointerEvents="none" />
        )}
        {demoLoading ? (
          <Text style={[styles.demoText, { color: colors.primary }]}>Memuat demo\u2026</Text>
        ) : (
          <View style={styles.demoInner}>
            <LinearGradient colors={['#7C7CFF', '#6161FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.demoIconBubble}>
              <Ionicons name="play-circle-outline" size={16} color="#FFF" />
            </LinearGradient>
            <Text style={[styles.demoText, { color: colors.primary }]}>Coba Demo \u2014 Tanpa Akun</Text>
            <View style={[styles.demoBadge, { backgroundColor: isDark ? 'rgba(97,97,255,0.25)' : 'rgba(97,97,255,0.12)' }]}>
              <Text style={[styles.demoBadgeText, { color: colors.primary }]}>GRATIS</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.inkMuted }]}>Belum punya akun? </Text>
        <TouchableOpacity onPress={() => router.push('/register')} hitSlop={6} activeOpacity={0.7}>
          <Text style={[styles.linkBold, { color: colors.primary }]}>Daftar Sekarang</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.md, paddingVertical: spacing.xl },
  ambientContainer: { ...StyleSheet.absoluteFill } as any,
  glowBlob: { position: 'absolute', borderRadius: 999, ...(Platform.OS === 'web' ? ({ filter: 'blur(90px)' } as any) : {}) },
  glowBlobLeft:   { width: 500, height: 500, top: -120, left: -180 },
  glowBlobRight:  { width: 380, height: 380, top: 60, right: -120 },
  glowBlobBottom: { width: 320, height: 320, bottom: -60, left: '30%' },
  topBar: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  brandBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: radius.buttons, borderWidth: 1,
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } as any) : {}),
  },
  brandIconDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  brandBadgeText: { fontSize: 14, fontWeight: '700', letterSpacing: -0.3 },
  outerCard: { width: '100%', borderRadius: 28, borderWidth: 1.5, overflow: 'hidden', position: 'relative' },
  twoColLayout: { flexDirection: 'row', minHeight: 560 },
  leftPanel: { width: 320, overflow: 'hidden' },
  leftPanelGradient: { flex: 1, padding: 36, justifyContent: 'flex-end', overflow: 'hidden' },
  dotGrid: { position: 'absolute', top: 20, left: 20, flexDirection: 'row', flexWrap: 'wrap', width: 120, gap: 12 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFFFFF' },
  leftIconArea: { alignItems: 'center', marginBottom: 28 },
  leftIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ boxShadow: '0 16px 40px rgba(0,0,0,0.30)', backdropFilter: 'blur(8px)' } as any) : {}),
  },
  orbitRing: { position: 'absolute', width: 110, height: 110, borderRadius: 55, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderStyle: 'dashed' },
  leftTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.8, marginBottom: 8 },
  leftSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 22, marginBottom: 24 },
  chipRow: { gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, alignSelf: 'flex-start' },
  chipText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  rightPanel: { flex: 1, padding: 40, justifyContent: 'center' },
  singleColLayout: { padding: 28 },
  iconCenterWrap: { alignItems: 'center', marginBottom: spacing.lg },
  iconGradientCircle: {
    width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    ...(Platform.OS === 'web' ? ({ boxShadow: '0 10px 30px rgba(97,97,255,0.55)' } as any) : { elevation: 8, shadowColor: '#6161FF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 16 }),
  },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.7, marginBottom: 6 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: spacing.xl },
  field: { marginBottom: 16 },
  forgotRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20, marginTop: -4 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(225,29,72,0.25)' },
  errorText: { fontSize: 13, flex: 1, fontWeight: '600' },
  link: { fontWeight: '700', fontSize: 13 },
  linkBold: { fontWeight: '800', fontSize: 13 },
  buttonSpacing: { marginTop: spacing.xs },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  demoButton: { borderRadius: 14, borderWidth: 1.5, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  demoInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  demoIconBubble: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  demoText: { fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
  demoBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  demoBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  shimmerBar: {
    position: 'absolute', top: 0, bottom: 0, width: 80,
    ...(Platform.OS === 'web' ? ({ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)' } as any) : { backgroundColor: 'rgba(255,255,255,0.15)' }),
    zIndex: 1,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.xl },
  footerText: { fontSize: 13, fontWeight: '500' },
});
