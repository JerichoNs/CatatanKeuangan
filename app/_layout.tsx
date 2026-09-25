import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

function RootNavigation() {
  const { user, loading } = useAuth();
  const { colors, isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  // Pastikan font Ionicons terload secara sempurna agar ikon tidak menjadi kotak [F2 F9]
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  // Transisi warna halus saat dark/light mode aktif di web browser
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'catatan-smooth-theme-transition';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Inter:wght@300;400;500;600;700;800&display=swap');

          body, input, textarea, select {
            font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            transition: background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                        border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                        color 0.25s ease;
          }

          h1, h2, h3, .fintechx-display {
            font-family: 'Bricolage Grotesque', 'Inter', system-ui, sans-serif !important;
          }

          /* Hilangkan outline kotak biru bawaan browser Chrome/Edge */
          input, textarea, select, button,
          input:focus, textarea:focus, select:focus, button:focus,
          input:focus-visible, textarea:focus-visible, select:focus-visible, button:focus-visible {
            outline: none !important;
            box-shadow: none;
          }

          /* Proteksi mutlak agar font ikon Ionicons tidak tertimpa oleh font teks */
          [style*="font-family: ionicons"],
          [style*="font-family: 'ionicons'"],
          [style*="font-family: Ionicons"],
          [style*="font-family: 'Ionicons'"] {
            font-family: ionicons, Ionicons !important;
          }
          /* Liquid Glass Animations & Sheen (iOS Liquid Glass Effect) */
          @keyframes liquidShimmer {
            0% {
              transform: translateX(-120%) rotate(25deg);
              opacity: 0;
            }
            20% {
              opacity: 0.7;
            }
            80% {
              opacity: 0.7;
            }
            100% {
              transform: translateX(240%) rotate(25deg);
              opacity: 0;
            }
          }

          @keyframes liquidFloatSoft {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-5px);
            }
          }

          @keyframes liquidPulseGlow {
            0%, 100% {
              opacity: 0.65;
              transform: scale(1);
            }
            50% {
              opacity: 0.95;
              transform: scale(1.04);
            }
          }

          /* Fluid smooth glass card hover */
          .liquid-glass-interactive {
            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                        box-shadow 0.25s ease,
                        backdrop-filter 0.25s ease !important;
          }
          .liquid-glass-interactive:hover {
            transform: translateY(-2px);
          }
          .liquid-glass-interactive:active {
            transform: scale(0.985);
          }

          /* Hilangkan latar kuning/biru autofill bawaan Chrome & Edge */
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus,
          input:-webkit-autofill:active {
            transition: background-color 99999s ease-in-out 0s !important;
            -webkit-text-fill-color: inherit !important;
          }
          /* Custom subtle scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(208, 212, 228, 0.6);
            border-radius: 9999px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(97, 97, 255, 0.4);
          }
          /* Aturan khusus cetak (Print/PDF) */
          @media print {
            header, nav, [role="tablist"], [data-testid="tab-bar"], .no-print {
              display: none !important;
            }
            body, #root {
              background: #ffffff !important;
              color: #333333 !important;
            }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const isLanding = segments[0] === 'landing';

    if (!user && !inAuthGroup && !isLanding) {
      router.replace('/landing');
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, loading, segments]);

  // Sinkronkan latar belakang dokumen web dan elemen #root dengan tema yang aktif
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.body.style.backgroundColor = colors.background;
      if (document.documentElement) {
        document.documentElement.style.backgroundColor = colors.background;
      }
      const rootEl = document.getElementById('root');
      if (rootEl) {
        rootEl.style.backgroundColor = colors.background;
      }
    }
  }, [colors.background]);

  if (loading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Slot />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigation />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
