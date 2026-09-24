import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, Platform } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

function RootNavigation() {
  const { user, loading } = useAuth();
  const { colors, isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  // Transisi warna halus saat dark/light mode aktif di web browser
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'catatan-smooth-theme-transition';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

          body, #root, div, span, p, a, input, button, textarea, select {
            font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            transition: background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                        border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                        color 0.25s ease !important;
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

    if (!user && !inAuthGroup) {
      router.replace('/login');
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

  if (loading) {
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
