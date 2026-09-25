import React, { useState } from 'react';
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

  const [activeTab, setActiveTab] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
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

      {/* Floating Top Pill Navbar */}
      <View style={styles.navbarWrapper}>
        <View
          style={[
            styles.navbarPill,
            {
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.82)' : 'rgba(255, 255, 255, 0.85)',
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
        >
          {/* Brand Logo */}
          <TouchableOpacity
            onPress={() => router.replace('/landing')}
            style={styles.navBrand}
            activeOpacity={0.8}
          >
            <View style={styles.brandIconWrap}>
              <Ionicons name="sparkles" size={17} color="#FFFFFF" />
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
              <TouchableOpacity style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, { color: colors.ink }]}>Products</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, { color: colors.ink }]}>Features</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, { color: colors.ink }]}>Use Cases</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, { color: colors.ink }]}>Support</Text>
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
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.navDemoText, { color: colors.ink }]}>Demo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleGoToApp}
              style={styles.navCtaButton}
              activeOpacity={0.85}
            >
              <Text style={styles.navCtaText}>{user ? 'Buka App' : 'Try it free'}</Text>
              <View style={styles.navCtaArrow}>
                <Ionicons name="arrow-forward" size={12} color="#0B0F19" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Scroll Content */}
      <ScrollView
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
                    <Text style={styles.sidebarBrandTitle}>FintechX</Text>
                  </View>

                  <View style={styles.sidebarMenu}>
                    <View style={styles.sidebarMenuItemActive}>
                      <Ionicons name="grid" size={16} color="#0B0F19" />
                      <Text style={styles.sidebarMenuTextActive}>Dashboard</Text>
                    </View>
                    <View style={styles.sidebarMenuItem}>
                      <Ionicons name="briefcase-outline" size={16} color="#94A3B8" />
                      <Text style={styles.sidebarMenuText}>Portfolio</Text>
                    </View>
                    <View style={styles.sidebarMenuItem}>
                      <Ionicons name="trending-up-outline" size={16} color="#94A3B8" />
                      <Text style={styles.sidebarMenuText}>Investments</Text>
                    </View>
                    <View style={styles.sidebarMenuItem}>
                      <Ionicons name="analytics-outline" size={16} color="#94A3B8" />
                      <Text style={styles.sidebarMenuText}>Market Insights</Text>
                    </View>
                    <View style={styles.sidebarMenuItem}>
                      <Ionicons name="hardware-chip-outline" size={16} color="#94A3B8" />
                      <Text style={styles.sidebarMenuText}>AI Advisor</Text>
                    </View>
                    <View style={styles.sidebarMenuItem}>
                      <Ionicons name="wallet-outline" size={16} color="#94A3B8" />
                      <Text style={styles.sidebarMenuText}>Kantong Dompet</Text>
                    </View>
                    <View style={styles.sidebarMenuItem}>
                      <Ionicons name="person-outline" size={16} color="#94A3B8" />
                      <Text style={styles.sidebarMenuText}>Users</Text>
                    </View>
                  </View>

                  {/* Pro Banner in Sidebar */}
                  <View style={styles.sidebarProCard}>
                    <View style={styles.proCoinWrap}>
                      <Text style={{ fontSize: 20 }}>🪙</Text>
                    </View>
                    <Text style={styles.proCardTitle}>Upgrade to PRO</Text>
                    <Text style={styles.proCardSub}>Unlock all AI signals & A4 reports</Text>
                    <TouchableOpacity
                      onPress={handleStartDemo}
                      style={styles.proCardButton}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.proCardButtonText}>Get Pro Now</Text>
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

                {/* Subheader: Financial Command */}
                <View style={styles.commandBanner}>
                  <View>
                    <Text style={[styles.commandTitle, { color: colors.ink }]}>
                      Financial Command
                    </Text>
                    <Text style={[styles.commandSubtitle, { color: colors.inkMuted }]}>
                      Welcome back, Alex. Your portfolio is up{' '}
                      <Text style={{ color: '#10B981', fontWeight: '700' }}>12.4%</Text> this quarter.
                    </Text>
                  </View>

                  <View style={styles.commandActions}>
                    <TouchableOpacity
                      onPress={handleStartDemo}
                      style={[
                        styles.commandButton,
                        {
                          backgroundColor: isDark ? '#172033' : '#FFFFFF',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                        },
                      ]}
                    >
                      <Text style={[styles.commandButtonText, { color: colors.ink }]}>Export CSV</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleStartDemo}
                      style={[
                        styles.commandButton,
                        {
                          backgroundColor: isDark ? '#172033' : '#FFFFFF',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                        },
                      ]}
                    >
                      <Text style={[styles.commandButtonText, { color: colors.ink }]}>Share Insights</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 4 Stat KPI Cards */}
                <View style={styles.kpiCardsGrid}>
                  {/* Card 1 */}
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
                        <Ionicons name="star" size={13} color="#FFFFFF" />
                      </View>
                      <View style={[styles.kpiBadge, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                        <Text style={[styles.kpiBadgeText, { color: '#8B5CF6' }]}>12.4% ↗</Text>
                      </View>
                    </View>
                    <Text style={[styles.kpiLabel, { color: colors.inkMuted }]}>
                      Total Portfolio Value
                    </Text>
                    <Text style={[styles.kpiValue, { color: colors.ink }]}>$58,420.00</Text>
                  </View>

                  {/* Card 2 */}
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
                      <View style={[styles.kpiIconWrap, { backgroundColor: '#F97316' }]}>
                        <Ionicons name="stats-chart" size={13} color="#FFFFFF" />
                      </View>
                      <View style={[styles.kpiBadge, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
                        <Text style={[styles.kpiBadgeText, { color: '#F97316' }]}>2.1% ↗</Text>
                      </View>
                    </View>
                    <Text style={[styles.kpiLabel, { color: colors.inkMuted }]}>
                      Today's Gain/Loss
                    </Text>
                    <Text style={[styles.kpiValue, { color: colors.ink }]}>+$1,240.50</Text>
                  </View>

                  {/* Card 3 */}
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
                        <Ionicons name="briefcase" size={13} color="#FFFFFF" />
                      </View>
                      <View style={[styles.kpiBadge, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                        <Text style={[styles.kpiBadgeText, { color: '#06B6D4' }]}>6 ↗</Text>
                      </View>
                    </View>
                    <Text style={[styles.kpiLabel, { color: colors.inkMuted }]}>
                      Active Investments
                    </Text>
                    <Text style={[styles.kpiValue, { color: colors.ink }]}>24 Assets</Text>
                  </View>

                  {/* Card 4 */}
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
                        <Ionicons name="time" size={13} color="#FFFFFF" />
                      </View>
                      <View style={[styles.kpiBadge, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                        <Text style={[styles.kpiBadgeText, { color: '#EF4444' }]}>low ↘</Text>
                      </View>
                    </View>
                    <Text style={[styles.kpiLabel, { color: colors.inkMuted }]}>Risk Score</Text>
                    <Text style={[styles.kpiValue, { color: colors.ink }]}>18 / 100</Text>
                  </View>
                </View>

                {/* Performance Chart & Donut Allocation Row */}
                <View style={[styles.chartsRow, { flexDirection: isDesktop ? 'row' : 'column' }]}>
                  {/* Performance Spline Chart Card */}
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
                          Investment Performance
                        </Text>
                        <Text style={[styles.chartCardSub, { color: colors.inkMuted }]}>
                          Portfolio value over the last 6 months
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
                        {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
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
                              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
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
                        Asset Allocation
                      </Text>
                      <Text style={[styles.donutBadge, { color: '#3B82F6' }]}>All ▾</Text>
                    </View>

                    {/* Donut Simulation */}
                    <View style={styles.donutCenterWrap}>
                      <View style={styles.donutRing}>
                        <View style={[styles.donutInnerCircle, { backgroundColor: isDark ? '#141D2E' : '#FFFFFF' }]}>
                          <Text style={[styles.donutInnerValue, { color: colors.ink }]}>$58.4k</Text>
                          <Text style={[styles.donutInnerLabel, { color: colors.inkMuted }]}>Total Assets</Text>
                        </View>
                      </View>
                    </View>

                    {/* Donut Legend */}
                    <View style={styles.donutLegendRow}>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                        <Text style={[styles.legendText, { color: colors.ink }]}>55% Stocks</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                        <Text style={[styles.legendText, { color: colors.ink }]}>30% Crypto</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                        <Text style={[styles.legendText, { color: colors.ink }]}>15% Cash</Text>
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
            Bandingkan bagaimana alur pengelolaan kas manual vs sistem cerdas FintechX
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
                    ? 'Smarter way to manage your investments'
                    : 'Pencatatan Manual Konvensional'}
                </Text>

                {comparisonState === 'after' ? (
                  <View style={styles.pointList}>
                    <View style={styles.pointItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                      <Text style={styles.pointText}>
                        Get clear recommendations based on real-time data
                      </Text>
                    </View>
                    <View style={styles.pointItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                      <Text style={styles.pointText}>
                        Understand risks before making investment decisions
                      </Text>
                    </View>
                    <View style={styles.pointItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                      <Text style={styles.pointText}>
                        Monitor your portfolio in real time no manual effort required
                      </Text>
                    </View>
                    <View style={styles.pointItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                      <Text style={styles.pointText}>
                        Make consistent and informed investment choices
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
                        Sulit memantau fluktuasi kurs mata uang dan harga emas harian
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Right Column: Key Stats Boxes */}
              <View style={styles.comparisonStatsCol}>
                <View style={styles.statBoxGreen}>
                  <Text style={styles.statBoxNumber}>3X Faster</Text>
                  <Text style={styles.statBoxDesc}>Smart decisions</Text>
                </View>

                <View style={styles.statBoxGreen}>
                  <Text style={styles.statBoxNumber}>24/7</Text>
                  <Text style={styles.statBoxDesc}>Real-time tracking</Text>
                </View>
              </View>
            </View>
          </View>
        </MotionView>

        {/* ================= CORE FEATURES BENTO GRID ================= */}
        <MotionView preset="fade-up" delay={0.1} style={styles.sectionContainer}>
          <Text style={[styles.sectionTag, { color: '#3B82F6' }]}>Platform Overview</Text>
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>
            See your financial intelligence in action
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.inkMuted }]}>
            Satu ekosistem lengkap untuk memonitor, mengalokasikan, dan menumbuhkan aset finansial.
          </Text>

          <View style={[styles.bentoGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
            {/* Bento 1: Portfolio Tracking */}
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
                <Ionicons name="pie-chart" size={20} color="#3B82F6" />
              </View>
              <Text style={[styles.bentoTitle, { color: colors.ink }]}>Portfolio tracking</Text>
              <Text style={[styles.bentoDesc, { color: colors.inkMuted }]}>
                See your entire financial picture in one place with performance attribution and gain/loss analysis.
              </Text>

              {/* Mini visual mockup inside bento */}
              <View style={styles.miniMockupPillsRow}>
                <View style={[styles.miniPillCard, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                  <Text style={[styles.miniPillLabel, { color: colors.inkMuted }]}>Stocks</Text>
                  <Text style={[styles.miniPillVal, { color: colors.ink }]}>$78,258</Text>
                  <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '700' }}>+8.2%</Text>
                </View>
                <View style={[styles.miniPillCard, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                  <Text style={[styles.miniPillLabel, { color: colors.inkMuted }]}>Gold Antam</Text>
                  <Text style={[styles.miniPillVal, { color: colors.ink }]}>Rp 1.480.000</Text>
                  <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '700' }}>+1.5%</Text>
                </View>
              </View>
            </View>

            {/* Bento 2: Smart Alerts */}
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
                <Ionicons name="notifications" size={20} color="#F59E0B" />
              </View>
              <Text style={[styles.bentoTitle, { color: colors.ink }]}>Smart alerts</Text>
              <Text style={[styles.bentoDesc, { color: colors.inkMuted }]}>
                Deteksi otomatis anomali pengeluaran dan lonjakan rasio risiko secara instan.
              </Text>

              {/* Alert notification preview */}
              <View
                style={[
                  styles.alertNotificationCard,
                  {
                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FEF3C7',
                    borderColor: 'rgba(245, 158, 11, 0.3)',
                  },
                ]}
              >
                <Ionicons name="warning" size={18} color="#D97706" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={{ color: '#B45309', fontWeight: '700', fontSize: 12 }}>
                    Risk exposure alert
                  </Text>
                  <Text style={{ color: '#D97706', fontSize: 11 }}>
                    Pemasukan bulan ini surplus +18%
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </MotionView>

        {/* ================= SUPPORT CREATOR SECTION ================= */}
        <MotionView preset="fade-up" delay={0.05} style={styles.sectionContainer}>
          <Text style={[styles.sectionTag, { color: '#10B981' }]}>100% Gratis Forever</Text>
          <Text style={[styles.sectionHeading, { color: colors.ink }]}>
            Dukung Developer,{' \n'}Tetap Nikmati Semua Fitur
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.inkMuted }]}>
            Rekap.id sepenuhnya gratis. Kalau aplikasi ini membantu keuanganmu,{' '}
            traktir developer kopi ☕ — bukan kewajiban, tapi sangat berarti.
          </Text>

          {/* Free badge banner */}
          <View
            style={[
              styles.supportFreeBanner,
              {
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={[styles.supportFreeBannerText, { color: isDark ? '#6EE7B7' : '#065F46' }]}>
              Semua fitur — Catat Transaksi, Market Ticker, AI Command, Ekspor PDF — <Text style={{ fontWeight: '800' }}>GRATIS selamanya</Text>
            </Text>
          </View>

          {/* Donation Cards Grid */}
          <View style={[styles.pricingCardsGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>

            {/* Tier 1: Kopi */}
            <View
              style={[
                styles.pricingCard,
                {
                  backgroundColor: isDark ? '#111827' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                },
              ]}
            >
              <Text style={{ fontSize: 36, marginBottom: 8 }}>☕</Text>
              <Text style={[styles.pricingPlanName, { color: colors.ink }]}>Traktir Kopi</Text>
              <Text style={[styles.pricingPlanDesc, { color: colors.inkMuted }]}>
                Donasi kecil yang berarti besar. Bantu developer tetap semangat ngoding.
              </Text>
              <Text style={[styles.pricingPrice, { color: colors.ink }]}>Rp 10.000</Text>
              <Text style={[styles.pricingPerMonth, { color: colors.inkMuted }]}>sekali, sukarela</Text>

              <View style={styles.pricingFeatureList}>
                <View style={styles.pricingFeatureItem}>
                  <Ionicons name="heart" size={16} color="#EF4444" />
                  <Text style={[styles.pricingFeatureText, { color: colors.ink }]}>Nama kamu di halaman Thanks</Text>
                </View>
                <View style={styles.pricingFeatureItem}>
                  <Ionicons name="heart" size={16} color="#EF4444" />
                  <Text style={[styles.pricingFeatureText, { color: colors.ink }]}>Badge "Supporter" di profil</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleGoToApp}
                style={[
                  styles.pricingCardButtonOutlined,
                  { borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1' },
                ]}
              >
                <Text style={[styles.pricingCardButtonTextOutlined, { color: colors.ink }]}>
                  Traktir Sekarang ☕
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tier 2: Supporter (Featured) */}
            <View
              style={[
                styles.pricingCard,
                styles.pricingCardFeatured,
                {
                  backgroundColor: isDark ? '#141E33' : '#0F172A',
                  borderColor: '#10B981',
                },
              ]}
            >
              <View style={[styles.popularBadge, { backgroundColor: '#10B981' }]}>
                <Text style={styles.popularBadgeText}>PALING BANYAK DIPILIH</Text>
              </View>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>🚀</Text>
              <Text style={[styles.pricingPlanName, { color: '#FFFFFF' }]}>Super Supporter</Text>
              <Text style={[styles.pricingPlanDesc, { color: '#94A3B8' }]}>
                Kontribusi yang bikin server tetap nyala dan fitur baru terus hadir.
              </Text>
              <Text style={[styles.pricingPrice, { color: '#FFFFFF' }]}>Rp 25.000</Text>
              <Text style={[styles.pricingPerMonth, { color: '#94A3B8' }]}>sekali, sukarela</Text>

              <View style={styles.pricingFeatureList}>
                <View style={styles.pricingFeatureItem}>
                  <Ionicons name="heart" size={16} color="#10B981" />
                  <Text style={[styles.pricingFeatureText, { color: '#FFFFFF' }]}>Semua dari Tier Kopi</Text>
                </View>
                <View style={styles.pricingFeatureItem}>
                  <Ionicons name="heart" size={16} color="#10B981" />
                  <Text style={[styles.pricingFeatureText, { color: '#FFFFFF' }]}>Badge eksklusif "Super Supporter" 🚀</Text>
                </View>
                <View style={styles.pricingFeatureItem}>
                  <Ionicons name="heart" size={16} color="#10B981" />
                  <Text style={[styles.pricingFeatureText, { color: '#FFFFFF' }]}>Vote fitur yang mau dikembangkan</Text>
                </View>
                <View style={styles.pricingFeatureItem}>
                  <Ionicons name="heart" size={16} color="#10B981" />
                  <Text style={[styles.pricingFeatureText, { color: '#FFFFFF' }]}>Early access fitur baru</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleGoToApp}
                style={[styles.pricingCardButtonSolid, { backgroundColor: '#10B981' }]}
              >
                <Text style={styles.pricingCardButtonTextSolid}>Dukung Sekarang 🚀</Text>
              </TouchableOpacity>
            </View>

            {/* Tier 3: Patron */}
            <View
              style={[
                styles.pricingCard,
                {
                  backgroundColor: isDark ? '#111827' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                },
              ]}
            >
              <Text style={{ fontSize: 36, marginBottom: 8 }}>👑</Text>
              <Text style={[styles.pricingPlanName, { color: colors.ink }]}>Patron</Text>
              <Text style={[styles.pricingPlanDesc, { color: colors.inkMuted }]}>
                Kamu serius mendukung open source Indonesia. Terima kasih dari hati!
              </Text>
              <Text style={[styles.pricingPrice, { color: colors.ink }]}>Rp 50.000</Text>
              <Text style={[styles.pricingPerMonth, { color: colors.inkMuted }]}>sekali, sukarela</Text>

              <View style={styles.pricingFeatureList}>
                <View style={styles.pricingFeatureItem}>
                  <Ionicons name="heart" size={16} color="#F59E0B" />
                  <Text style={[styles.pricingFeatureText, { color: colors.ink }]}>Semua dari Tier Sebelumnya</Text>
                </View>
                <View style={styles.pricingFeatureItem}>
                  <Ionicons name="heart" size={16} color="#F59E0B" />
                  <Text style={[styles.pricingFeatureText, { color: colors.ink }]}>Nama + link di README GitHub</Text>
                </View>
                <View style={styles.pricingFeatureItem}>
                  <Ionicons name="heart" size={16} color="#F59E0B" />
                  <Text style={[styles.pricingFeatureText, { color: colors.ink }]}>Badge "Patron" eksklusif 👑</Text>
                </View>
                <View style={styles.pricingFeatureItem}>
                  <Ionicons name="heart" size={16} color="#F59E0B" />
                  <Text style={[styles.pricingFeatureText, { color: colors.ink }]}>Satu permintaan fitur langsung ke developer</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleGoToApp}
                style={[
                  styles.pricingCardButtonOutlined,
                  { borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1' },
                ]}
              >
                <Text style={[styles.pricingCardButtonTextOutlined, { color: colors.ink }]}>
                  Jadi Patron 👑
                </Text>
              </TouchableOpacity>
            </View>

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
              <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            </View>
            <Text style={[styles.brandText, { color: colors.ink }]}>
              Rekap<Text style={{ color: '#3B82F6' }}>.id</Text>
            </Text>
          </View>
          <Text style={[styles.footerCopyright, { color: colors.inkMuted }]}>
            © 2026 Rekap.id — Open Source, Gratis Selamanya ❤️
          </Text>
        </View>
      </ScrollView>
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
    zIndex: 100,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  navbarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 1120,
    height: 58,
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  brandBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3B82F6',
  },
  navLinksCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 26,
  },
  navLinkItem: {
    paddingVertical: 4,
    paddingHorizontal: 2,
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
  },
  sectionTag: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: 22,
    marginBottom: 32,
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
  pricingCardsGrid: {
    width: '100%',
    maxWidth: 1100,
    gap: 24,
  },
  pricingCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    position: 'relative',
  },
  pricingCardFeatured: {
    borderWidth: 2,
    boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.3)',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 24,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  pricingPlanName: {
    fontSize: 22,
    fontWeight: '800',
  },
  pricingPlanDesc: {
    fontSize: 13,
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  pricingPrice: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  pricingPerMonth: {
    fontSize: 12,
    marginBottom: 24,
  },
  pricingFeatureList: {
    gap: 12,
    marginBottom: 28,
  },
  pricingFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pricingFeatureText: {
    fontSize: 13,
    fontWeight: '500',
  },
  pricingCardButtonOutlined: {
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
  },
  pricingCardButtonTextOutlined: {
    fontSize: 14,
    fontWeight: '700',
  },
  pricingCardButtonSolid: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: 'center',
  },
  pricingCardButtonTextSolid: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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
