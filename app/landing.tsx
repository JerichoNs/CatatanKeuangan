import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { MarketTicker } from '../components/MarketTicker';
import { MotionView } from '../components/MotionView';

export default function FintechXLandingScreen() {
  const { width } = useWindowDimensions();
  const { colors, isDark } = useTheme();
  const { loginAsDemo, user } = useAuth();
  const isDesktop = width >= 960;
  const isTablet = width >= 640 && width < 960;
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToY = (y: number) => {
    scrollViewRef.current?.scrollTo({ y, animated: true });
  };

  const [activeTab, setActiveTab] = useState<'harian' | 'mingguan' | 'bulanan'>('bulanan');
  const [comparisonState, setComparisonState] = useState<'after' | 'before'>('after');
  const [pricingCycle, setPricingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleStartDemo = async () => {
    setIsDemoLoading(true);
    try {
      await loginAsDemo();
      router.replace('/');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleGoToApp = () => {
    if (user) {
      router.replace('/');
    } else {
      router.push('/login');
    }
  };

  const isWeb = Platform.OS === 'web';

  return (
    <View style={[styles.rootContainer, { backgroundColor: isDark ? '#080B11' : '#F4F7FC' }]}>
      {/* Ambient background glow for FintechX style */}
      <View
        pointerEvents="none"
        style={[
          styles.ambientBackdrop,
          {
            backgroundColor: isDark ? '#080B11' : '#EDF4FF',
          },
        ]}
      >
        <View
          style={[
            styles.glowOrbTop,
            {
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(191, 219, 254, 0.65)',
            },
          ]}
        />
        <View
          style={[
            styles.glowOrbRight,
            {
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(209, 250, 229, 0.55)',
            },
          ]}
        />
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HERO SECTION ================= */}
        <View style={styles.heroSection}>
          {/* Top AI Badge */}
          <View
            style={[
              styles.heroTopBadge,
              {
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.14)' : 'rgba(239, 246, 255, 0.95)',
                borderColor: isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(191, 219, 254, 0.95)',
              },
            ]}
          >
            <View style={styles.heroBadgeIcon}>
              <Ionicons name="flash" size={13} color="#3B82F6" />
            </View>
            <Text style={[styles.heroBadgeText, { color: isDark ? '#93C5FD' : '#1D4ED8' }]}>
              Generasi Baru Financial Intelligence
            </Text>
          </View>

          {/* Large Hero Title */}
          <View style={styles.heroTitleContainer}>
            <Text style={[styles.heroTitleMain, { color: colors.ink }]}>
              Finance{' '}
              <View
                style={[
                  styles.hero3DIconBox,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#0F172A',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                  },
                ]}
              >
                <Text style={styles.hero3DIconText}>AI</Text>
              </View>{' '}
              Platform
            </Text>
          </View>

          {/* Subtitle */}
          <Text style={[styles.heroSubtitle, { color: colors.inkMuted }]}>
            Optimize your investments with AI-driven analysis, real-time tracking,
            and intelligent recommendations.
          </Text>

          {/* Dual Action Buttons */}
          <View style={styles.heroActionsRow}>
            <TouchableOpacity
              onPress={handleGoToApp}
              style={styles.heroPrimaryButton}
              activeOpacity={0.88}
            >
              <Text style={styles.heroPrimaryButtonText}>
                {user ? 'Buka Dashboard' : 'Get started now'}
              </Text>
              <View style={styles.heroPrimaryArrow}>
                <Ionicons name="arrow-forward" size={14} color="#3B82F6" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleStartDemo}
              style={[
                styles.heroSecondaryButton,
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(226, 232, 240, 0.9)',
                },
              ]}
              activeOpacity={0.85}
            >
              <Text style={[styles.heroSecondaryButtonText, { color: colors.ink }]}>
                {isDemoLoading ? 'Memuat Demo...' : 'View demo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Trust Highlights */}
          <View style={styles.heroTrustBadges}>
            <View style={styles.trustItem}>
              <Text style={styles.trustEmoji}>⭐</Text>
              <Text style={[styles.trustText, { color: colors.ink }]}>4.9/5 Rating</Text>
            </View>
            <View style={[styles.trustDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : '#CBD5E1' }]} />
            <View style={styles.trustItem}>
              <Text style={styles.trustEmoji}>🛡️</Text>
              <Text style={[styles.trustText, { color: colors.ink }]}>Bank-level security</Text>
            </View>
            <View style={[styles.trustDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : '#CBD5E1' }]} />
            <View style={styles.trustItem}>
              <Text style={styles.trustEmoji}>⚡</Text>
              <Text style={[styles.trustText, { color: colors.ink }]}>Real-time AI insights</Text>
            </View>
          </View>

          {/* ================= FINANCIAL COMMAND DASHBOARD MOCKUP ================= */}
          <View
            style={[
              styles.mockupShell,
              {
                backgroundColor: isDark ? '#0D131F' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(226, 232, 240, 0.95)',
                ...(isWeb
                  ? ({
                      boxShadow: isDark
                        ? '0 25px 65px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)'
                        : '0 25px 65px -12px rgba(37, 99, 235, 0.18), 0 0 0 1px rgba(226, 232, 240, 0.8)',
                    } as any)
                  : {}),
              },
            ]}
          >
            {/* Split layout: Sidebar + Main Stage */}
            <View style={[styles.mockupLayout, { flexDirection: isDesktop ? 'row' : 'column' }]}>
              {/* Left Dark Sidebar */}
              {isDesktop && (
                <View style={styles.mockupSidebar}>
                  <View style={styles.sidebarHeader}>
                    <View style={styles.sidebarLogoIcon}>
                      <Ionicons name="sparkles" size={15} color="#FFFFFF" />
                    </View>
                    <Text style={styles.sidebarBrandTitle}>
                      Rekap<Text style={{ color: '#3B82F6' }}>.id</Text>
                    </Text>
                  </View>

                  <View style={styles.sidebarMenu}>
                    <View style={styles.sidebarMenuItemActive}>
                      <Ionicons name="grid" size={16} color="#0B0F19" />
                      <Text style={styles.sidebarMenuTextActive}>Dashboard</Text>
                    </View>
                    <View style={styles.sidebarMenuItem}>
                      <Ionicons name="add-circle-outline" size={16} color="#94A3B8" />
                      <Text style={styles.sidebarMenuText}>Catat Transaksi</Text>
                    </View>
                    <View style={styles.sidebarMenuItem}>
                      <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
                      <Text style={styles.sidebarMenuText}>Riwayat & Kalender</Text>
                    </View>
                    <View style={styles.sidebarMenuItem}>
                      <Ionicons name="bar-chart-outline" size={16} color="#94A3B8" />
                      <Text style={styles.sidebarMenuText}>Laporan & PDF</Text>
                    </View>
                    <View style={styles.sidebarMenuItem}>
                      <Ionicons name="wallet-outline" size={16} color="#94A3B8" />
                      <Text style={styles.sidebarMenuText}>Kantong Dompet</Text>
                    </View>
                    <View style={styles.sidebarMenuItem}>
                      <Ionicons name="trending-up-outline" size={16} color="#94A3B8" />
                      <Text style={styles.sidebarMenuText}>Kurs & Emas</Text>
                    </View>
                  </View>

                  {/* Free Forever Banner in Sidebar */}
                  <View style={styles.sidebarProCard}>
                    <View style={[styles.proCoinWrap, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    </View>
                    <Text style={styles.proCardTitle}>100% Gratis</Text>
                    <Text style={styles.proCardSub}>Semua fitur & ekspor PDF terbuka selamanya</Text>
                    <TouchableOpacity
                      onPress={handleStartDemo}
                      style={[styles.proCardButton, { backgroundColor: '#10B981' }]}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.proCardButtonText}>Coba Demo</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Main Content Area */}
              <View style={[styles.mockupMainArea, { backgroundColor: isDark ? '#0D131F' : '#F8FAFC' }]}>
                {/* Mockup Header */}
                <View
                  style={[
                    styles.mockupTopBar,
                    {
                      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                    },
                  ]}
                >
                  <Text style={[styles.mockupPageTitle, { color: colors.ink }]}>Dashboard</Text>

                  <View style={styles.mockupTopRight}>
                    <View
                      style={[
                        styles.mockupSearchBar,
                        {
                          backgroundColor: isDark ? '#172033' : '#FFFFFF',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                        },
                      ]}
                    >
                      <Ionicons name="search" size={14} color="#94A3B8" />
                      <TextInput
                        placeholder="Search anything..."
                        placeholderTextColor="#94A3B8"
                        style={[styles.mockupSearchInput, { color: colors.ink }]}
                        editable={false}
                      />
                    </View>

                    <View
                      style={[
                        styles.mockupNotifBadge,
                        {
                          backgroundColor: isDark ? '#172033' : '#FFFFFF',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                        },
                      ]}
                    >
                      <Ionicons name="notifications-outline" size={16} color={colors.ink} />
                      <View style={styles.notifDot}>
                        <Text style={styles.notifDotText}>2</Text>
                      </View>
                    </View>

                    <View style={styles.mockupUserAvatar}>
                      <Text style={styles.mockupAvatarText}>A</Text>
                    </View>
                  </View>
                </View>

                {/* Subheader: Financial Overview */}
                <View style={styles.commandBanner}>
                  <View>
                    <Text style={[styles.commandTitle, { color: colors.ink }]}>
                      Ringkasan Finansial
                    </Text>
                    <Text style={[styles.commandSubtitle, { color: colors.inkMuted }]}>
                      Selamat datang kembali. Arus kas bulan ini dalam status{' '}
                      <Text style={{ color: '#10B981', fontWeight: '700' }}>Surplus Sehat (+Rp 7,75jt)</Text>.
                    </Text>
                  </View>

                  <View style={styles.commandActions}>
                    <TouchableOpacity
                      onPress={handleGoToApp}
                      style={[
                        styles.commandButton,
                        {
                          backgroundColor: isDark ? '#172033' : '#FFFFFF',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                        },
                      ]}
                    >
                      <Text style={[styles.commandButtonText, { color: colors.ink }]}>+ Catat Kas</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleGoToApp}
                      style={[
                        styles.commandButton,
                        {
                          backgroundColor: isDark ? '#172033' : '#FFFFFF',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                        },
                      ]}
                    >
                      <Text style={[styles.commandButtonText, { color: colors.ink }]}>Cetak PDF A4</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 4 Stat KPI Cards */}
                <View style={styles.kpiCardsGrid}>
                  {/* Card 1: Saldo Kas */}
                  <View
                    style={[
                      styles.kpiCard,
                      {
                        backgroundColor: isDark ? '#141D2E' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                      },
                    ]}
                  >
                    <View style={styles.kpiCardTop}>
                      <View style={[styles.kpiIconWrap, { backgroundColor: '#8B5CF6' }]}>
                        <Ionicons name="wallet" size={13} color="#FFFFFF" />
                      </View>
                      <View style={[styles.kpiBadge, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                        <Text style={[styles.kpiBadgeText, { color: '#8B5CF6' }]}>Sehat ↗</Text>
                      </View>
                    </View>
                    <Text style={[styles.kpiLabel, { color: colors.inkMuted }]}>
                      Total Saldo Kas
                    </Text>
                    <Text style={[styles.kpiValue, { color: colors.ink }]}>Rp 24.850.000</Text>
                  </View>

                  {/* Card 2: Pemasukan */}
                  <View
                    style={[
                      styles.kpiCard,
                      {
                        backgroundColor: isDark ? '#141D2E' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                      },
                    ]}
                  >
                    <View style={styles.kpiCardTop}>
                      <View style={[styles.kpiIconWrap, { backgroundColor: '#10B981' }]}>
                        <Ionicons name="arrow-down-circle" size={13} color="#FFFFFF" />
                      </View>
                      <View style={[styles.kpiBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                        <Text style={[styles.kpiBadgeText, { color: '#10B981' }]}>+15% ↗</Text>
                      </View>
                    </View>
                    <Text style={[styles.kpiLabel, { color: colors.inkMuted }]}>
                      Pemasukan Bulan Ini
                    </Text>
                    <Text style={[styles.kpiValue, { color: colors.ink }]}>+Rp 12.500.000</Text>
                  </View>

                  {/* Card 3: Pengeluaran */}
                  <View
                    style={[
                      styles.kpiCard,
                      {
                        backgroundColor: isDark ? '#141D2E' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                      },
                    ]}
                  >
                    <View style={styles.kpiCardTop}>
                      <View style={[styles.kpiIconWrap, { backgroundColor: '#EF4444' }]}>
                        <Ionicons name="arrow-up-circle" size={13} color="#FFFFFF" />
                      </View>
                      <View style={[styles.kpiBadge, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                        <Text style={[styles.kpiBadgeText, { color: '#EF4444' }]}>Terkendali ↘</Text>
                      </View>
                    </View>
                    <Text style={[styles.kpiLabel, { color: colors.inkMuted }]}>
                      Pengeluaran Bulan Ini
                    </Text>
                    <Text style={[styles.kpiValue, { color: colors.ink }]}>-Rp 4.750.000</Text>
                  </View>

                  {/* Card 4: Surplus */}
                  <View
                    style={[
                      styles.kpiCard,
                      {
                        backgroundColor: isDark ? '#141D2E' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                      },
                    ]}
                  >
                    <View style={styles.kpiCardTop}>
                      <View style={[styles.kpiIconWrap, { backgroundColor: '#06B6D4' }]}>
                        <Ionicons name="trending-up" size={13} color="#FFFFFF" />
                      </View>
                      <View style={[styles.kpiBadge, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                        <Text style={[styles.kpiBadgeText, { color: '#06B6D4' }]}>62% Rasio ↗</Text>
                      </View>
                    </View>
                    <Text style={[styles.kpiLabel, { color: colors.inkMuted }]}>Surplus Tabungan</Text>
                    <Text style={[styles.kpiValue, { color: colors.ink }]}>+Rp 7.750.000</Text>
                  </View>
                </View>

                {/* Cash Flow Chart & Donut Allocation Row */}
                <View style={[styles.chartsRow, { flexDirection: isDesktop ? 'row' : 'column' }]}>
                  {/* Cash Flow Chart Card */}
                  <View
                    style={[
                      styles.chartCard,
                      {
                        flex: 1.6,
                        backgroundColor: isDark ? '#141D2E' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                      },
                    ]}
                  >
                    <View style={styles.chartHeader}>
                      <View>
                        <Text style={[styles.chartCardTitle, { color: colors.ink }]}>
                          Tren Arus Kas
                        </Text>
                        <Text style={[styles.chartCardSub, { color: colors.inkMuted }]}>
                          Pemasukan & pengeluaran 12 bulan terakhir
                        </Text>
                      </View>

                      {/* Time Tab Switcher */}
                      <View
                        style={[
                          styles.chartTabsWrap,
                          {
                            backgroundColor: isDark ? '#1B263B' : '#F1F5F9',
                          },
                        ]}
                      >
                        {(['harian', 'mingguan', 'bulanan'] as const).map((tab) => (
                          <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            style={[
                              styles.chartTabBtn,
                              activeTab === tab && {
                                backgroundColor: isDark ? '#3B82F6' : '#FFFFFF',
                                shadowColor: '#000',
                                shadowOpacity: 0.1,
                                shadowRadius: 3,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.chartTabText,
                                {
                                  color:
                                    activeTab === tab
                                      ? (isDark ? '#FFFFFF' : '#1D4ED8')
                                      : colors.inkMuted,
                                  fontWeight: activeTab === tab ? '700' : '500',
                                },
                              ]}
                            >
                              {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Chart Visual Simulation */}
                    <View style={styles.splineGraphArea}>
                      {/* Grid Lines */}
                      <View style={styles.graphGridLine} />
                      <View style={styles.graphGridLine} />
                      <View style={styles.graphGridLine} />

                      {/* Dynamic Bar/Wave Simulation */}
                      <View style={styles.waveBarContainer}>
                        {[40, 65, 50, 85, 70, 95, 80, 110, 95, 125, 110, 140].map((h, i) => (
                          <View key={i} style={styles.waveColumn}>
                            <View
                              style={[
                                styles.waveBar,
                                {
                                  height: h,
                                  backgroundColor:
                                    i % 2 === 0
                                      ? '#10B981'
                                      : '#3B82F6',
                                  opacity: 0.85,
                                },
                              ]}
                            />
                            <Text style={[styles.waveMonthLabel, { color: colors.inkMuted }]}>
                              {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][i]}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>

                  {/* Asset Allocation Donut Card */}
                  <View
                    style={[
                      styles.chartCard,
                      {
                        flex: 1,
                        backgroundColor: isDark ? '#141D2E' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                      },
                    ]}
                  >
                    <View style={styles.chartHeader}>
                      <Text style={[styles.chartCardTitle, { color: colors.ink }]}>
                        Alokasi Pengeluaran
                      </Text>
                      <Text style={[styles.donutBadge, { color: '#3B82F6' }]}>Semua ▾</Text>
                    </View>

                    {/* Donut Simulation */}
                    <View style={styles.donutCenterWrap}>
                      <View style={styles.donutRing}>
                        <View style={[styles.donutInnerCircle, { backgroundColor: isDark ? '#141D2E' : '#FFFFFF' }]}>
                          <Text style={[styles.donutInnerValue, { color: colors.ink }]}>Rp 4.75jt</Text>
                          <Text style={[styles.donutInnerLabel, { color: colors.inkMuted }]}>Total Keluar</Text>
                        </View>
                      </View>
                    </View>

                    {/* Donut Legend */}
                    <View style={styles.donutLegendRow}>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                        <Text style={[styles.legendText, { color: colors.ink }]}>50% Kebutuhan</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                        <Text style={[styles.legendText, { color: colors.ink }]}>30% Gaya Hidup</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                        <Text style={[styles.legendText, { color: colors.ink }]}>20% Tabungan</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Integrated Live Market Ticker */}
                <View style={styles.marketTickerSection}>
                  <MarketTicker />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ================= COMPARISON SECTION ================= */}
        <MotionView preset="fade-up" style={styles.sectionContainer}>
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>
            Smarter decisions start with clear data
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.inkMuted }]}>
            Bandingkan bagaimana alur pengelolaan kas manual vs sistem cerdas Rekap.id
          </Text>

          {/* Toggle Switch */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              onPress={() => setComparisonState('before')}
              style={[
                styles.comparisonTogglePill,
                comparisonState === 'before' && styles.comparisonTogglePillActive,
                {
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                  backgroundColor: comparisonState === 'before'
                    ? (isDark ? '#1E293B' : '#0F172A')
                    : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  styles.togglePillText,
                  { color: comparisonState === 'before' ? '#FFFFFF' : colors.inkMuted },
                ]}
              >
                Before Rekap.id
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setComparisonState('after')}
              style={[
                styles.comparisonTogglePill,
                comparisonState === 'after' && styles.comparisonTogglePillActive,
                {
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                  backgroundColor: comparisonState === 'after'
                    ? '#3B82F6'
                    : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  styles.togglePillText,
                  { color: comparisonState === 'after' ? '#FFFFFF' : colors.inkMuted },
                ]}
              >
                After Rekap.id
              </Text>
            </TouchableOpacity>
          </View>

          {/* Comparison Bento Card */}
          <View
            style={[
              styles.comparisonCard,
              {
                backgroundColor: isDark ? '#0B111D' : '#0F172A',
                borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.15)',
              },
            ]}
          >
            {/* Center Logo Badge */}
            <View style={styles.comparisonBadgeCenter}>
              <View style={styles.comparisonLogoInner}>
                <Ionicons name="sparkles" size={24} color="#10B981" />
              </View>
            </View>

            <View style={[styles.comparisonInnerRow, { flexDirection: isDesktop ? 'row' : 'column' }]}>
              {/* Left Column: Points */}
              <View style={{ flex: 1.5, paddingRight: isDesktop ? 32 : 0 }}>
                <Text style={styles.comparisonTitle}>
                  {comparisonState === 'after'
                    ? 'Manajemen Finansial Modern & Otomatis'
                    : 'Pencatatan Manual Konvensional'}
                </Text>

                {comparisonState === 'after' ? (
                  <View style={styles.pointList}>
                    <View style={styles.pointItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                      <Text style={styles.pointText}>
                        Pencatatan arus kas masuk & keluar instan dalam hitungan detik
                      </Text>
                    </View>
                    <View style={styles.pointItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                      <Text style={styles.pointText}>
                        Pisahkan tabungan & pos operasional lewat Kantong Dompet
                      </Text>
                    </View>
                    <View style={styles.pointItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                      <Text style={styles.pointText}>
                        Pantau fluktuasi kurs mata uang & harga emas harian secara real-time
                      </Text>
                    </View>
                    <View style={styles.pointItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                      <Text style={styles.pointText}>
                        Ekspor rekap pembukuan format A4 resmi langsung siap cetak
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.pointList}>
                    <View style={styles.pointItem}>
                      <Ionicons name="close-circle" size={18} color="#EF4444" />
                      <Text style={styles.pointText}>
                        Catatan spreadsheet tercecer dan sering terlambat diperbarui
                      </Text>
                    </View>
                    <View style={styles.pointItem}>
                      <Ionicons name="close-circle" size={18} color="#EF4444" />
                      <Text style={styles.pointText}>
                        Tidak tahu pos mana yang mengalami pemborosan atau bocor halus
                      </Text>
                    </View>
                    <View style={styles.pointItem}>
                      <Ionicons name="close-circle" size={18} color="#EF4444" />
                      <Text style={styles.pointText}>
                        Saldo tabungan dan biaya hidup bercampur aduk tanpa pos jelas
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Right Column: Key Stats Boxes */}
              <View style={styles.comparisonStatsCol}>
                <View style={styles.statBoxGreen}>
                  <Text style={styles.statBoxNumber}>3X Cepat</Text>
                  <Text style={styles.statBoxDesc}>Pencatatan kas instan</Text>
                </View>

                <View style={styles.statBoxGreen}>
                  <Text style={styles.statBoxNumber}>100%</Text>
                  <Text style={styles.statBoxDesc}>Gratis & bebas iklan</Text>
                </View>
              </View>
            </View>
          </View>
        </MotionView>

        {/* ================= CORE FEATURES BENTO GRID ================= */}
        <MotionView preset="fade-up" delay={0.1} style={styles.sectionContainer}>
          <Text style={[styles.sectionTag, { color: '#3B82F6' }]}>Fitur Lengkap Rekap.id</Text>
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>
            Kelola Keuangan dengan Tenang & Rapi
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.inkMuted }]}>
            Satu aplikasi komprehensif untuk mencatat kas, membagi pos anggaran, dan memantau aset harian.
          </Text>

          <View style={[styles.bentoGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
            {/* Bento 1: Kantong Dompet & Pockets */}
            <View
              style={[
                styles.bentoCard,
                {
                  flex: 1.4,
                  backgroundColor: isDark ? '#111827' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                },
              ]}
            >
              <View style={styles.bentoCardIconWrap}>
                <Ionicons name="wallet" size={20} color="#3B82F6" />
              </View>
              <Text style={[styles.bentoTitle, { color: colors.ink }]}>Multi-Kantong Dompet</Text>
              <Text style={[styles.bentoDesc, { color: colors.inkMuted }]}>
                Bagi saldo ke pos terpisah seperti Dana Darurat, Tabungan Menikah, dan Biaya Hidup tanpa risiko tercampur.
              </Text>

              {/* Mini visual mockup inside bento */}
              <View style={styles.miniMockupPillsRow}>
                <View style={[styles.miniPillCard, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                  <Text style={[styles.miniPillLabel, { color: colors.inkMuted }]}>Kantong Utama</Text>
                  <Text style={[styles.miniPillVal, { color: colors.ink }]}>Rp 18.500.000</Text>
                  <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '700' }}>Operasional</Text>
                </View>
                <View style={[styles.miniPillCard, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                  <Text style={[styles.miniPillLabel, { color: colors.inkMuted }]}>Dana Darurat</Text>
                  <Text style={[styles.miniPillVal, { color: colors.ink }]}>Rp 6.350.000</Text>
                  <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '700' }}>Tersimpan Aman</Text>
                </View>
              </View>
            </View>

            {/* Bento 2: Laporan & Ekspor PDF */}
            <View
              style={[
                styles.bentoCard,
                {
                  flex: 1,
                  backgroundColor: isDark ? '#111827' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                },
              ]}
            >
              <View style={styles.bentoCardIconWrap}>
                <Ionicons name="document-text" size={20} color="#F59E0B" />
              </View>
              <Text style={[styles.bentoTitle, { color: colors.ink }]}>Ekspor Laporan PDF A4</Text>
              <Text style={[styles.bentoDesc, { color: colors.inkMuted }]}>
                Cetak laporan arus kas formal format dokumen standar A4 lengkap dengan rincian kategori dan persentase surplus.
              </Text>

              {/* Alert notification preview */}
              <View
                style={[
                  styles.alertNotificationCard,
                  {
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#D1FAE5',
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                  },
                ]}
              >
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={{ color: '#047857', fontWeight: '700', fontSize: 12 }}>
                    Status Arus Kas Sehat
                  </Text>
                  <Text style={{ color: '#065F46', fontSize: 11 }}>
                    Bulan ini surplus Rp 7.750.000 (Rasio 62%)
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </MotionView>

        {/* ================= SUPPORT CREATOR SECTION ================= */}
        <MotionView preset="fade-up" delay={0.05} style={styles.sectionContainer}>
          <Text style={[styles.sectionTag, { color: '#10B981' }]}>100% Gratis Selamanya</Text>
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>
            Suka Aplikasinya?{'\n'}Boleh Traktir Kopi ☕
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.inkMuted }]}>
            Semua fitur Rekap.id bebas digunakan siapa saja tanpa biaya apapun. Kalau mau apresiasi developer, traktir seikhlasnya ya!
          </Text>

          {/* Donation Cards — Simple */}
          <View style={[styles.supportSimpleRow, { flexDirection: isDesktop ? 'row' : 'column' }]}>

            {/* Kopi */}
            <TouchableOpacity
              onPress={handleGoToApp}
              style={[
                styles.supportSimpleCard,
                {
                  backgroundColor: isDark ? '#111827' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                },
              ]}
              activeOpacity={0.85}
            >
              <Text style={styles.supportSimpleEmoji}>☕</Text>
              <Text style={[styles.supportSimpleName, { color: colors.ink }]}>Kopi</Text>
              <Text style={[styles.supportSimpleAmount, { color: colors.ink }]}>Rp 10.000</Text>
              <Text style={[styles.supportSimpleLabel, { color: colors.inkMuted }]}>Traktir sekarang</Text>
            </TouchableOpacity>

            {/* Makan Siang — Featured */}
            <TouchableOpacity
              onPress={handleGoToApp}
              style={[
                styles.supportSimpleCard,
                styles.supportSimpleCardFeatured,
                {
                  backgroundColor: isDark ? '#141E33' : '#0F172A',
                  borderColor: '#10B981',
                },
              ]}
              activeOpacity={0.85}
            >
              <Text style={styles.supportSimpleEmoji}>🍱</Text>
              <Text style={[styles.supportSimpleName, { color: '#FFFFFF' }]}>Makan Siang</Text>
              <Text style={[styles.supportSimpleAmount, { color: '#FFFFFF' }]}>Rp 25.000</Text>
              <Text style={[styles.supportSimpleLabel, { color: '#94A3B8' }]}>Paling sering dipilih</Text>
            </TouchableOpacity>

            {/* Dinner */}
            <TouchableOpacity
              onPress={handleGoToApp}
              style={[
                styles.supportSimpleCard,
                {
                  backgroundColor: isDark ? '#111827' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                },
              ]}
              activeOpacity={0.85}
            >
              <Text style={styles.supportSimpleEmoji}>🍣</Text>
              <Text style={[styles.supportSimpleName, { color: colors.ink }]}>Dinner</Text>
              <Text style={[styles.supportSimpleAmount, { color: colors.ink }]}>Rp 50.000</Text>
              <Text style={[styles.supportSimpleLabel, { color: colors.inkMuted }]}>Makasih bro! ❤️</Text>
            </TouchableOpacity>

          </View>
        </MotionView>

        {/* ================= FAQ ACCORDION ================= */}
        <MotionView preset="fade-up" style={styles.sectionContainer}>
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>
            Frequently Asked Questions
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.inkMuted }]}>
            Pertanyaan yang sering diajukan mengenai Rekap.id.
          </Text>

          <View style={styles.faqList}>
            {[
              {
                q: 'Apakah saya bisa mencoba aplikasi ini tanpa registrasi?',
                a: 'Tentu saja! Anda cukup menekan tombol "View Demo" di bagian atas untuk langsung mencoba semua dashboard dengan data simulasi real-time tanpa perlu mendaftar.',
              },
              {
                q: 'Bagaimana keamanan data keuangan saya terjamin?',
                a: 'Kami mengadopsi standar otentikasi Sanctum berbasis Bearer Token dan enkripsi tingkat bank, memastikan seluruh riwayat kas dan akun Anda terlindungi secara penuh.',
              },
              {
                q: 'Apakah bisa digunakan di berbagai perangkat (Web & Mobile)?',
                a: 'Ya, Rekap.id dibangun secara universal sehingga Anda dapat membukanya dengan mulus di browser laptop (Chrome, Edge, Safari) maupun aplikasi mobile Android dan iOS.',
              },
              {
                q: 'Apakah tersedia fitur cetak / unduh laporan PDF?',
                a: 'Tersedia! Anda dapat membuka tab Laporan dan langsung mencetak atau mengunduh ringkasan eksekutif berformat kertas standar A4 untuk kebutuhan laporan bulanan.',
              },
            ].map((faq, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setActiveFaq(activeFaq === idx ? null : idx)}
                style={[
                  styles.faqItem,
                  {
                    backgroundColor: isDark ? '#111827' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                  },
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQuestion, { color: colors.ink }]}>{faq.q}</Text>
                  <Ionicons
                    name={activeFaq === idx ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.inkMuted}
                  />
                </View>
                {activeFaq === idx && (
                  <Text style={[styles.faqAnswer, { color: colors.inkMuted }]}>{faq.a}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </MotionView>

        {/* ================= FOOTER ================= */}
        <View
          style={[
            styles.footerSection,
            {
              borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
              backgroundColor: isDark ? '#080B11' : '#FFFFFF',
            },
          ]}
        >
          <View style={styles.footerBrand}>
            <View style={styles.brandIconWrap}>
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.brandText, { color: colors.ink }]}>
              Rekap<Text style={{ color: '#3B82F6' }}>.id</Text>
            </Text>
          </View>
          <Text style={[styles.footerCopyright, { color: colors.inkMuted }]}>
            © 2026 Rekap.id — 100% Gratis untuk Semua Orang ❤️
          </Text>
        </View>
      </ScrollView>

      {/* Floating Top Pill Navbar (Rendered AFTER ScrollView for top z-index & clean clicks) */}
      <View style={styles.navbarWrapper} pointerEvents="box-none">
        <View
          style={[
            styles.navbarPill,
            {
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.88)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.95)',
              ...(isWeb
                ? ({
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    boxShadow: isDark
                      ? '0 10px 30px rgba(0, 0, 0, 0.5)'
                      : '0 10px 30px rgba(37, 99, 235, 0.08)',
                  } as any)
                : {}),
            },
          ]}
          pointerEvents="auto"
        >
          {/* Brand Logo */}
          <TouchableOpacity
            onPress={() => scrollToY(0)}
            style={styles.navBrand}
            activeOpacity={0.8}
          >
            <View style={styles.brandIconWrap}>
              <Ionicons name="sparkles" size={21} color="#FFFFFF" />
            </View>
            <Text style={[styles.brandText, { color: colors.ink }]}>
              Rekap<Text style={{ color: '#3B82F6' }}>.id</Text>
            </Text>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>FREE</Text>
            </View>
          </TouchableOpacity>

          {/* Desktop Nav Links */}
          {isDesktop && (
            <View style={styles.navLinksCenter}>
              <TouchableOpacity
                onPress={() => scrollToY(720)}
                style={styles.navLinkItem}
                activeOpacity={0.7}
              >
                <Text style={[styles.navLinkText, { color: colors.ink }]}>Bandingkan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => scrollToY(1180)}
                style={styles.navLinkItem}
                activeOpacity={0.7}
              >
                <Text style={[styles.navLinkText, { color: colors.ink }]}>Fitur</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => scrollToY(1700)}
                style={styles.navLinkItem}
                activeOpacity={0.7}
              >
                <Text style={[styles.navLinkText, { color: colors.ink }]}>Traktir Dev</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => scrollToY(2150)}
                style={styles.navLinkItem}
                activeOpacity={0.7}
              >
                <Text style={[styles.navLinkText, { color: colors.ink }]}>FAQ</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Right Action Buttons */}
          <View style={styles.navRightActions}>
            <ThemeToggle size="small" />

            <TouchableOpacity
              onPress={handleStartDemo}
              style={[
                styles.navDemoButton,
                {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.1)',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                },
                isWeb && ({ cursor: 'pointer' } as any),
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.navDemoText, { color: colors.ink }]}>Demo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleGoToApp}
              style={[styles.navCtaButton, isWeb && ({ cursor: 'pointer' } as any)]}
              activeOpacity={0.85}
            >
              <Text style={styles.navCtaText}>{user ? 'Buka App' : 'Coba Gratis'}</Text>
              <View style={styles.navCtaArrow}>
                <Ionicons name="arrow-forward" size={12} color="#0B0F19" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    position: 'relative',
  },
  ambientBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  glowOrbTop: {
    position: 'absolute',
    top: -160,
    left: '25%',
    width: 600,
    height: 480,
    borderRadius: 300,
    filter: 'blur(90px)',
  },
  glowOrbRight: {
    position: 'absolute',
    top: 300,
    right: -100,
    width: 500,
    height: 500,
    borderRadius: 250,
    filter: 'blur(100px)',
  },
  navbarWrapper: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    zIndex: 99999,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  navbarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 1120,
    height: 64,
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 22,
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
  },
  brandIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 14px rgba(59, 130, 246, 0.45)',
        } as any)
      : {}),
  },
  brandText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  brandBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  brandBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3B82F6',
  },
  navLinksCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  navLinkItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    cursor: 'pointer',
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  navRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navDemoButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1,
    cursor: 'pointer',
  },
  navDemoText: {
    fontSize: 13,
    fontWeight: '600',
  },
  navCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 7,
    borderRadius: 9999,
    cursor: 'pointer',
  },
  navCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  navCtaArrow: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 110,
    paddingBottom: 60,
    alignItems: 'center',
  },
  heroSection: {
    width: '100%',
    maxWidth: 1160,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroTopBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    marginBottom: 20,
  },
  heroBadgeIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  heroTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitleMain: {
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -1.2,
  },
  hero3DIconBox: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-4deg' }],
  },
  hero3DIconText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 22,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 17,
    textAlign: 'center',
    maxWidth: 620,
    lineHeight: 26,
    marginBottom: 28,
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 32,
  },
  heroPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingLeft: 22,
    paddingRight: 10,
    borderRadius: 9999,
    boxShadow: '0 10px 24px -4px rgba(59, 130, 246, 0.45)',
  },
  heroPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  heroPrimaryArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSecondaryButton: {
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 9999,
    borderWidth: 1,
  },
  heroSecondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  heroTrustBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 44,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustEmoji: {
    fontSize: 14,
  },
  trustText: {
    fontSize: 13,
    fontWeight: '600',
  },
  trustDivider: {
    width: 1,
    height: 16,
  },
  mockupShell: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  mockupLayout: {
    width: '100%',
  },
  mockupSidebar: {
    width: 210,
    backgroundColor: '#0A0F1D',
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'space-between',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  sidebarLogoIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarBrandTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  sidebarMenu: {
    marginTop: 16,
    gap: 6,
  },
  sidebarMenuItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  sidebarMenuTextActive: {
    color: '#0B0F19',
    fontWeight: '700',
    fontSize: 13,
  },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  sidebarMenuText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 13,
  },
  sidebarProCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  proCoinWrap: {
    marginBottom: 6,
  },
  proCardTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  proCardSub: {
    color: '#94A3B8',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  proCardButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  proCardButtonText: {
    color: '#0B0F19',
    fontSize: 11,
    fontWeight: '700',
  },
  mockupMainArea: {
    flex: 1,
    padding: 24,
  },
  mockupTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  mockupPageTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  mockupTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mockupSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    width: 170,
  },
  mockupSearchInput: {
    fontSize: 12,
    flex: 1,
  },
  mockupNotifBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDotText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  mockupUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockupAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  commandBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  commandTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  commandSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  commandActions: {
    flexDirection: 'row',
    gap: 8,
  },
  commandButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  commandButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  kpiCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    minWidth: 160,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  kpiCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  kpiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kpiBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  chartsRow: {
    gap: 16,
    marginBottom: 16,
  },
  chartCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  chartCardSub: {
    fontSize: 12,
    marginTop: 2,
  },
  chartTabsWrap: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 8,
  },
  chartTabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chartTabText: {
    fontSize: 11,
  },
  splineGraphArea: {
    height: 180,
    justifyContent: 'flex-end',
    position: 'relative',
    paddingBottom: 22,
  },
  graphGridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    top: 30,
  },
  waveBarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingHorizontal: 4,
  },
  waveColumn: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  waveBar: {
    width: 8,
    borderRadius: 4,
  },
  waveMonthLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  donutBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
  donutCenterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  donutRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 16,
    borderColor: '#3B82F6',
    borderTopColor: '#10B981',
    borderRightColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutInnerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutInnerValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  donutInnerLabel: {
    fontSize: 10,
  },
  donutLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  marketTickerSection: {
    marginTop: 8,
  },
  sectionContainer: {
    width: '100%',
    maxWidth: 1160,
    paddingHorizontal: 20,
    marginTop: 80,
    alignItems: 'center',
    flexDirection: 'column',
  },
  sectionTag: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    textAlign: 'center',
    width: '100%',
  },
  sectionHeading: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.8,
    marginBottom: 10,
    width: '100%',
  },
  sectionSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: 22,
    marginBottom: 32,
    width: '100%',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  comparisonTogglePill: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 9999,
    borderWidth: 1,
  },
  comparisonTogglePillActive: {
    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
  },
  togglePillText: {
    fontSize: 14,
    fontWeight: '700',
  },
  comparisonCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 36,
    position: 'relative',
    overflow: 'hidden',
  },
  comparisonBadgeCenter: {
    position: 'absolute',
    top: -24,
    left: '50%',
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0F172A',
    borderWidth: 3,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
  },
  comparisonLogoInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparisonInnerRow: {
    width: '100%',
    justifyContent: 'space-between',
    gap: 24,
    marginTop: 10,
  },
  comparisonTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  pointList: {
    gap: 14,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointText: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
  },
  comparisonStatsCol: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
  statBoxGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 16,
    padding: 20,
  },
  statBoxNumber: {
    color: '#10B981',
    fontSize: 28,
    fontWeight: '800',
  },
  statBoxDesc: {
    color: '#E2E8F0',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
  },
  bentoGrid: {
    width: '100%',
    gap: 20,
  },
  bentoCard: {
    padding: 28,
    borderRadius: 22,
    borderWidth: 1,
  },
  bentoCardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  bentoTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  bentoDesc: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  miniMockupPillsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  miniPillCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    gap: 2,
  },
  miniPillLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  miniPillVal: {
    fontSize: 15,
    fontWeight: '800',
  },
  alertNotificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  pricingToggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    padding: 4,
    borderRadius: 9999,
    marginBottom: 32,
  },
  pricingCycleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 9999,
  },
  pricingCycleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  supportSimpleRow: {
    width: '100%',
    maxWidth: 860,
    gap: 16,
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 10,
  },
  supportSimpleCard: {
    flex: 1,
    minWidth: 200,
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
    ...(Platform.OS === 'web'
      ? ({
          transition: 'all 0.2s ease',
        } as any)
      : {}),
  },
  supportSimpleCardFeatured: {
    borderWidth: 2,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 12px 30px -8px rgba(16, 185, 129, 0.4)',
        } as any)
      : {}),
  },
  supportSimpleEmoji: {
    fontSize: 42,
    marginBottom: 6,
  },
  supportSimpleName: {
    fontSize: 18,
    fontWeight: '700',
  },
  supportSimpleAmount: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  supportSimpleLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  faqList: {
    width: '100%',
    maxWidth: 780,
    gap: 12,
  },
  faqItem: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    paddingRight: 10,
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  footerSection: {
    width: '100%',
    marginTop: 80,
    paddingVertical: 36,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerCopyright: {
    fontSize: 13,
  },
  supportFreeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 32,
    width: '100%',
    maxWidth: 700,
  },
  supportFreeBannerText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
});
