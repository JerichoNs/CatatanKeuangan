import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, Text, Platform, useWindowDimensions } from 'react-native';
import { spacing, radius } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeToggle } from '../../components/ThemeToggle';

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
  const isDesktop = width >= 768;
  const dockWidth = Math.min(width - 48, 540);

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
          shadowColor: 'transparent',
          elevation: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          height: isDesktop ? 68 : 58,
        },
        headerTitleStyle: {
          color: colors.ink,
          fontWeight: '800',
          fontSize: isDesktop ? 20 : 18,
          letterSpacing: -0.4,
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
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
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
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              borderTopWidth: 1,
              elevation: isDark ? 0 : 4,
              height: 60,
              paddingBottom: 8,
              paddingTop: 6,
            },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transaksi"
        options={{
          title: 'Catat',
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="laporan"
        options={{
          title: 'Laporan',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
