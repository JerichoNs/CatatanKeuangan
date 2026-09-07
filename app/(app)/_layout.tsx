import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, Text, Platform, useWindowDimensions, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, radius } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeToggle } from '../../components/ThemeToggle';
import { AppAmbientBackground } from '../../components/AppAmbientBackground';

function AnimatedTabIcon({ name, color, focused }: { name: any; color: any; focused: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.24, duration: 140, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 4, tension: 55, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(1);
    }
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale }], alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={name} size={22} color={color} />
    </Animated.View>
  );
}

function CustomHeaderTitle({
  title,
  subtitle,
  icon,
  iconBg,
  iconColor,
}: {
  title: string;
  subtitle: string;
  icon: any;
  iconBg: string;
  iconColor: string;
}) {
  const { colors, isDark } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 2 }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 11,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
        }}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={{ justifyContent: 'center' }}>
        <Text
          style={{
            color: colors.ink,
            fontWeight: '900',
            fontSize: 16,
            letterSpacing: -0.3,
            lineHeight: 20,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: colors.inkMuted,
            fontSize: 11,
            fontWeight: '600',
            lineHeight: 14,
          }}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function HeaderRightActions({ isDesktop }: { isDesktop: boolean }) {
  const { logout, user, isAdmin } = useAuth();
  const { colors, isDark } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginRight: spacing.md }}>
      {/* User profile badge */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        {isDesktop && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: colors.ink, fontWeight: '600', fontSize: 13 }} numberOfLines={1}>
              {user?.name || 'User'}
            </Text>
            {isAdmin && (
              <View
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.18)',
                  paddingHorizontal: 6,
                  paddingVertical: 1,
                  borderRadius: 4,
                }}
              >
                <Text style={{ color: '#F59E0B', fontSize: 10, fontWeight: '800' }}>ADMIN</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <ThemeToggle size="small" />

      <TouchableOpacity
        onPress={logout}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Keluar"
        style={{
          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
          padding: 7,
          borderRadius: radius.pill,
        }}
      >
        <Ionicons name="log-out-outline" size={19} color={colors.expense} />
      </TouchableOpacity>
    </View>
  );
}

export default function AppTabsLayout() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDesktop = width >= 768;
  const dockWidth = Math.min(width - 48, 540);

  // Perhitungan tinggi tab bar mobile agar teks tidak terpotong di Android / iOS
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'web' ? 10 : 6);
  const mobileTabHeight = 64 + bottomInset;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Background Animasi Nebula / Floating Glow Orbs */}
      <AppAmbientBackground />

      <Tabs
        screenOptions={{
          sceneStyle: { backgroundColor: 'transparent' },
          headerStyle: {
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            shadowColor: 'transparent',
            elevation: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            height: isDesktop ? 70 : 64,
          },
          headerShadowVisible: false,
          headerRight: () => <HeaderRightActions isDesktop={isDesktop} />,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.inkMuted,
          tabBarStyle: isDesktop
            ? ({
                position: 'absolute',
                bottom: 16,
                left: '50%',
                marginLeft: -dockWidth / 2,
                width: dockWidth,
                height: 64,
                borderRadius: 24,
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isDark ? 0.35 : 0.08,
                shadowRadius: 18,
                elevation: 10,
                paddingBottom: 8,
                paddingTop: 8,
              } as any)
            : {
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.96)',
                borderTopColor: colors.border,
                borderTopWidth: 1,
                elevation: isDark ? 0 : 4,
                height: mobileTabHeight,
                paddingBottom: bottomInset + 2,
                paddingTop: 8,
              },
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            headerTitle: () => (
              <CustomHeaderTitle
                title="Dashboard Keuangan"
                subtitle="Ringkasan & Kesehatan Kas"
                icon="grid"
                iconBg={isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.12)'}
                iconColor={colors.primary}
              />
            ),
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon name="grid-outline" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="transaksi"
          options={{
            title: 'Catat',
            headerTitle: () => (
              <CustomHeaderTitle
                title="Catat Transaksi"
                subtitle="Input Arus Masuk & Keluar"
                icon="add-circle"
                iconBg={isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.12)'}
                iconColor="#16A34A"
              />
            ),
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon name="add-circle-outline" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="riwayat"
          options={{
            title: 'Riwayat',
            headerTitle: () => (
              <CustomHeaderTitle
                title="Riwayat Transaksi"
                subtitle="Histori & Manajemen Kas"
                icon="time"
                iconBg={isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.12)'}
                iconColor="#9333EA"
              />
            ),
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon name="time-outline" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="laporan"
          options={{
            title: 'Laporan',
            headerTitle: () => (
              <CustomHeaderTitle
                title="Laporan Keuangan"
                subtitle="Analisis & Rekap Eksekutif"
                icon="bar-chart"
                iconBg={isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.12)'}
                iconColor={colors.primary}
              />
            ),
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon name="bar-chart-outline" color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
