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
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const shortTitle = title.split(' ')[0] || title;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: isDesktop ? 10 : 7, paddingVertical: 2 }}>
      <View
        style={{
          width: isDesktop ? 36 : 30,
          height: isDesktop ? 36 : 30,
          borderRadius: isDesktop ? 11 : 9,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
        }}
      >
        <Ionicons name={icon} size={isDesktop ? 18 : 16} color={iconColor} />
      </View>
      <View style={{ justifyContent: 'center' }}>
        <Text
          style={{
            color: colors.ink,
            fontWeight: '900',
            fontSize: isDesktop ? 16 : 14,
            letterSpacing: -0.3,
            lineHeight: isDesktop ? 20 : 17,
          }}
          numberOfLines={1}
        >
          {isDesktop ? title : shortTitle}
        </Text>
        {isDesktop && (
          <Text
            style={{
              color: colors.inkMuted,
              fontSize: 11,
              fontWeight: '600',
              lineHeight: 14,
            }}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

function HeaderRightActions({ isDesktop }: { isDesktop: boolean }) {
  const { logout, user, isAdmin } = useAuth();
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: isDesktop ? 10 : 6,
        marginRight: isDesktop ? spacing.md : 10,
      }}
    >
      {/* User profile badge */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
          paddingHorizontal: isDesktop ? 10 : 7,
          paddingVertical: isDesktop ? 5 : 4,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View
          style={{
            width: isDesktop ? 24 : 22,
            height: isDesktop ? 24 : 22,
            borderRadius: 12,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: isDesktop ? 11 : 10, fontWeight: '700' }}>
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
          padding: isDesktop ? 7 : 6,
          borderRadius: radius.pill,
        }}
      >
        <Ionicons name="log-out-outline" size={isDesktop ? 19 : 17} color={colors.expense} />
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
            backgroundColor: isDark ? 'rgba(26, 27, 41, 0.78)' : 'rgba(255, 255, 255, 0.78)',
            shadowColor: 'transparent',
            elevation: 0,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.7)',
            height: isDesktop ? 70 : 64,
            ...(Platform.OS === 'web'
              ? ({
                  backdropFilter: 'blur(24px) saturate(190%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(190%)',
                } as any)
              : {}),
          },
          headerShadowVisible: false,
          headerRight: () => <HeaderRightActions isDesktop={isDesktop} />,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.inkMuted,
          tabBarStyle: isDesktop
            ? ({
                position: 'absolute',
                bottom: 18,
                left: '50%',
                marginLeft: -dockWidth / 2,
                width: dockWidth,
                height: 66,
                borderRadius: 160,
                backgroundColor: isDark ? 'rgba(26, 27, 41, 0.78)' : 'rgba(255, 255, 255, 0.78)',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.85)',
                ...(Platform.OS === 'web'
                  ? ({
                      backdropFilter: 'blur(28px) saturate(200%)',
                      WebkitBackdropFilter: 'blur(28px) saturate(200%)',
                      boxShadow: isDark
                        ? '0px 14px 44px rgba(0, 0, 0, 0.5), inset 0px 1px 1px rgba(255, 255, 255, 0.16)'
                        : '0px 14px 44px rgba(97, 97, 255, 0.14), inset 0px 1.5px 1.5px rgba(255, 255, 255, 0.95)',
                    } as any)
                  : {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: isDark ? 0.35 : 0.08,
                      shadowRadius: 18,
                      elevation: 10,
                    }),
                paddingBottom: 8,
                paddingTop: 8,
              } as any)
            : {
                backgroundColor: isDark ? 'rgba(26, 27, 41, 0.84)' : 'rgba(255, 255, 255, 0.84)',
                borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)',
                borderTopWidth: 1,
                ...(Platform.OS === 'web'
                  ? ({
                      backdropFilter: 'blur(24px) saturate(190%)',
                      WebkitBackdropFilter: 'blur(24px) saturate(190%)',
                      boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.7)',
                    } as any)
                  : {
                      elevation: isDark ? 0 : 4,
                    }),
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
                iconBg={isDark ? 'rgba(97, 97, 255, 0.2)' : '#E7ECFF'}
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
                iconBg={isDark ? 'rgba(16, 185, 129, 0.2)' : '#E8FCED'}
                iconColor={colors.income}
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
                iconBg={isDark ? 'rgba(148, 80, 253, 0.2)' : '#EDDFF7'}
                iconColor="#9450FD"
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
                iconBg={isDark ? 'rgba(58, 201, 255, 0.2)' : '#D1FAFF'}
                iconColor="#0284C7"
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
