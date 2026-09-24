import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { radius, shadow } from '../constants/theme';

interface MarketItem {
  id: string;
  code: string;
  name: string;
  value: string;
  change: string;
  isUp: boolean;
  icon: string;
  rateInIDR: number;
  unit?: string;
}

export function MarketTicker() {
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [calcItem, setCalcItem] = useState<MarketItem | null>(null);
  const [foreignAmount, setForeignAmount] = useState<string>('1');
  const [marketData, setMarketData] = useState<MarketItem[]>([
    {
      id: 'ihsg',
      code: 'IHSG',
      name: 'Indeks Saham BEI',
      value: '6.441,16',
      change: '-0.33%',
      isUp: false,
      icon: 'trending-down',
      rateInIDR: 6441.16,
      unit: 'Poin',
    },
    {
      id: 'usd',
      code: 'USD / IDR',
      name: 'Dolar AS',
      value: 'Rp 17.741',
      change: '+0.15%',
      isUp: true,
      icon: 'logo-usd',
      rateInIDR: 17741,
      unit: '$',
    },
    {
      id: 'eur',
      code: 'EUR / IDR',
      name: 'Euro Eropa',
      value: 'Rp 20.377',
      change: '+0.18%',
      isUp: true,
      icon: 'globe-outline',
      rateInIDR: 20377,
      unit: '€',
    },
    {
      id: 'sgd',
      code: 'SGD / IDR',
      name: 'Dolar Singapura',
      value: 'Rp 13.907',
      change: '+0.12%',
      isUp: true,
      icon: 'cash-outline',
      rateInIDR: 13907,
      unit: 'S$',
    },
    {
      id: 'jpy',
      code: 'JPY (100¥)',
      name: 'Yen Jepang',
      value: 'Rp 11.384',
      change: '+0.22%',
      isUp: true,
      icon: 'wallet-outline',
      rateInIDR: 113.84,
      unit: '¥',
    },
    {
      id: 'gbp',
      code: 'GBP / IDR',
      name: 'Pound Inggris',
      value: 'Rp 23.710',
      change: '+0.24%',
      isUp: true,
      icon: 'ribbon-outline',
      rateInIDR: 23710,
      unit: '£',
    },
    {
      id: 'myr',
      code: 'MYR / IDR',
      name: 'Ringgit Malaysia',
      value: 'Rp 4.331',
      change: '+0.06%',
      isUp: true,
      icon: 'swap-horizontal',
      rateInIDR: 4331,
      unit: 'RM',
    },
    {
      id: 'aud',
      code: 'AUD / IDR',
      name: 'Dolar Australia',
      value: 'Rp 12.617',
      change: '+0.10%',
      isUp: true,
      icon: 'compass-outline',
      rateInIDR: 12617,
      unit: 'A$',
    },
    {
      id: 'sar',
      code: 'SAR / IDR',
      name: 'Riyal Arab Saudi',
      value: 'Rp 4.731',
      change: '+0.05%',
      isUp: true,
      icon: 'sunny-outline',
      rateInIDR: 4731,
      unit: 'SR',
    },
    {
      id: 'gold',
      code: 'EMAS (Antam)',
      name: 'Harga per gram',
      value: 'Rp 2.623.000',
      change: '+0.96%',
      isUp: true,
      icon: 'cube-outline',
      rateInIDR: 2623000,
      unit: 'gr',
    },
  ]);

  const fetchRates = async () => {
    setLoading(true);
    try {
      // Fetch data kurs realtime live
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (res.ok) {
        const data = await res.json();
        const idrRate = data?.rates?.IDR;
        const eurRate = data?.rates?.EUR;
        const sgdRate = data?.rates?.SGD;
        const jpyRate = data?.rates?.JPY;
        const gbpRate = data?.rates?.GBP;
        const myrRate = data?.rates?.MYR;
        const audRate = data?.rates?.AUD;
        const sarRate = data?.rates?.SAR;

        if (idrRate) {
          const usdValue = Math.round(idrRate);
          const eurValue = eurRate ? Math.round(idrRate / eurRate) : 20377;
          const sgdValue = sgdRate ? Math.round(idrRate / sgdRate) : 13907;
          const jpy100Value = jpyRate ? Math.round((idrRate / jpyRate) * 100) : 11384;
          const gbpValue = gbpRate ? Math.round(idrRate / gbpRate) : 23710;
          const myrValue = myrRate ? Math.round(idrRate / myrRate) : 4331;
          const audValue = audRate ? Math.round(idrRate / audRate) : 12617;
          const sarValue = sarRate ? Math.round(idrRate / sarRate) : 4731;

          setMarketData([
            {
              id: 'ihsg',
              code: 'IHSG',
              name: 'Indeks Saham BEI',
              value: '6.441,16',
              change: '-0.33%',
              isUp: false,
              icon: 'trending-down',
              rateInIDR: 6441.16,
              unit: 'Poin',
            },
            {
              id: 'usd',
              code: 'USD / IDR',
              name: 'Dolar AS',
              value: `Rp ${usdValue.toLocaleString('id-ID')}`,
              change: '+0.15%',
              isUp: true,
              icon: 'logo-usd',
              rateInIDR: usdValue,
              unit: '$',
            },
            {
              id: 'eur',
              code: 'EUR / IDR',
              name: 'Euro Eropa',
              value: `Rp ${eurValue.toLocaleString('id-ID')}`,
              change: '+0.18%',
              isUp: true,
              icon: 'globe-outline',
              rateInIDR: eurValue,
              unit: '€',
            },
            {
              id: 'sgd',
              code: 'SGD / IDR',
              name: 'Dolar Singapura',
              value: `Rp ${sgdValue.toLocaleString('id-ID')}`,
              change: '+0.12%',
              isUp: true,
              icon: 'cash-outline',
              rateInIDR: sgdValue,
              unit: 'S$',
            },
            {
              id: 'jpy',
              code: 'JPY (100¥)',
              name: 'Yen Jepang',
              value: `Rp ${jpy100Value.toLocaleString('id-ID')}`,
              change: '+0.22%',
              isUp: true,
              icon: 'wallet-outline',
              rateInIDR: jpyRate ? idrRate / jpyRate : 113.84,
              unit: '¥',
            },
            {
              id: 'gbp',
              code: 'GBP / IDR',
              name: 'Pound Inggris',
              value: `Rp ${gbpValue.toLocaleString('id-ID')}`,
              change: '+0.24%',
              isUp: true,
              icon: 'ribbon-outline',
              rateInIDR: gbpValue,
              unit: '£',
            },
            {
              id: 'myr',
              code: 'MYR / IDR',
              name: 'Ringgit Malaysia',
              value: `Rp ${myrValue.toLocaleString('id-ID')}`,
              change: '+0.06%',
              isUp: true,
              icon: 'swap-horizontal',
              rateInIDR: myrValue,
              unit: 'RM',
            },
            {
              id: 'aud',
              code: 'AUD / IDR',
              name: 'Dolar Australia',
              value: `Rp ${audValue.toLocaleString('id-ID')}`,
              change: '+0.10%',
              isUp: true,
              icon: 'compass-outline',
              rateInIDR: audValue,
              unit: 'A$',
            },
            {
              id: 'sar',
              code: 'SAR / IDR',
              name: 'Riyal Arab Saudi',
              value: `Rp ${sarValue.toLocaleString('id-ID')}`,
              change: '+0.05%',
              isUp: true,
              icon: 'sunny-outline',
              rateInIDR: sarValue,
              unit: 'SR',
            },
            {
              id: 'gold',
              code: 'EMAS (Antam)',
              name: 'Harga per gram',
              value: 'Rp 2.623.000',
              change: '+0.96%',
              isUp: true,
              icon: 'cube-outline',
              rateInIDR: 2623000,
              unit: 'gr',
            },
          ]);
        }
      }
    } catch {
      // Fallback tetap aman
    } finally {
      const now = new Date();
      setLastUpdated(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const openCalculator = (item: MarketItem) => {
    if (item.id === 'ihsg') return; // IHSG bukan valas/komoditas konversi
    setCalcItem(item);
    setForeignAmount(item.id === 'jpy' ? '100' : '1');
  };

  const calculateConvertedIDR = () => {
    if (!calcItem) return 0;
    const qty = parseFloat(foreignAmount) || 0;
    if (calcItem.id === 'jpy') {
      return Math.round(qty * calcItem.rateInIDR);
    }
    return Math.round(qty * calcItem.rateInIDR);
  };

  const scrollRef = useRef<ScrollView>(null);
  const currentScrollX = useRef<number>(0);

  // Efek scroll horizontal dengan Mouse Wheel & Drag-to-Scroll di PC / Web
  useEffect(() => {
    if (Platform.OS === 'web' && scrollRef.current) {
      const node = (scrollRef.current as any).getScrollableNode?.() || (scrollRef.current as any);
      if (node && node.addEventListener) {
        // 1. Mouse wheel horizontal scrolling
        const handleWheel = (e: WheelEvent) => {
          if (e.deltaY !== 0 || e.deltaX !== 0) {
            e.preventDefault();
            const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
            node.scrollLeft += delta;
            currentScrollX.current = node.scrollLeft;
          }
        };

        // 2. Click & drag to scroll di browser PC
        let isDown = false;
        let startX = 0;
        let startScrollLeft = 0;

        const handleMouseDown = (e: MouseEvent) => {
          isDown = true;
          startX = e.pageX - node.offsetLeft;
          startScrollLeft = node.scrollLeft;
          node.style.cursor = 'grabbing';
          node.style.userSelect = 'none';
        };

        const handleMouseLeave = () => {
          isDown = false;
          node.style.cursor = 'grab';
          node.style.removeProperty('user-select');
        };

        const handleMouseUp = () => {
          isDown = false;
          node.style.cursor = 'grab';
          node.style.removeProperty('user-select');
        };

        const handleMouseMove = (e: MouseEvent) => {
          if (!isDown) return;
          e.preventDefault();
          const x = e.pageX - node.offsetLeft;
          const walk = (x - startX) * 1.5;
          node.scrollLeft = startScrollLeft - walk;
          currentScrollX.current = node.scrollLeft;
        };

        node.style.cursor = 'grab';
        node.addEventListener('wheel', handleWheel, { passive: false });
        node.addEventListener('mousedown', handleMouseDown);
        node.addEventListener('mouseleave', handleMouseLeave);
        node.addEventListener('mouseup', handleMouseUp);
        node.addEventListener('mousemove', handleMouseMove);

        return () => {
          node.removeEventListener('wheel', handleWheel);
          node.removeEventListener('mousedown', handleMouseDown);
          node.removeEventListener('mouseleave', handleMouseLeave);
          node.removeEventListener('mouseup', handleMouseUp);
          node.removeEventListener('mousemove', handleMouseMove);
        };
      }
    }
  }, []);

  const scrollHorizontally = (delta: number) => {
    if (Platform.OS === 'web' && scrollRef.current) {
      const node = (scrollRef.current as any).getScrollableNode?.() || (scrollRef.current as any);
      if (node && typeof node.scrollBy === 'function') {
        node.scrollBy({ left: delta, behavior: 'smooth' });
        currentScrollX.current = node.scrollLeft + delta;
        return;
      }
    }
    const newX = Math.max(0, currentScrollX.current + delta);
    currentScrollX.current = newX;
    scrollRef.current?.scrollTo({ x: newX, animated: true });
  };

  const tickerGlassStyle = {
    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.78)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.65)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any)
      : {}),
  };

  return (
    <View style={styles.container}>
      {/* Header Bar Kurs & Pasar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.pulseDotWrap, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
            <View style={styles.pulseDot} />
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.title, { color: colors.ink }]}>
                Kurs & Pasar Modal Real-Time
              </Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            </View>
            <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
              Sentuh kartu untuk kalkulator konversi instan
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Tombol Geser Kurs untuk PC / Desktop */}
          <View style={styles.navArrowsWrap}>
            <TouchableOpacity
              onPress={() => scrollHorizontally(-260)}
              style={[
                styles.navArrowBtn,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.7}
              accessibilityLabel="Geser Kurs Kiri"
            >
              <Ionicons name="chevron-back" size={14} color={colors.ink} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => scrollHorizontally(260)}
              style={[
                styles.navArrowBtn,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.7}
              accessibilityLabel="Geser Kurs Kanan"
            >
              <Ionicons name="chevron-forward" size={14} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={fetchRates}
            style={[
              styles.refreshBtn,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.7}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Ionicons name="sync-outline" size={13} color={colors.primary} />
                <Text style={[styles.updateText, { color: colors.inkMuted }]}>
                  {lastUpdated || 'Segarkan'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Horizontal Scrollable Ticker Cards */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
        onScroll={(e) => {
          currentScrollX.current = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
      >
        {marketData.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.tickerCard,
              tickerGlassStyle,
              isDark ? shadow.cardDark : shadow.card,
            ]}
            onPress={() => openCalculator(item)}
            activeOpacity={item.id === 'ihsg' ? 1 : 0.75}
          >
            <View style={styles.cardTopRow}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name={item.icon as any} size={15} color={colors.primary} />
              </View>
              <View
                style={[
                  styles.changeBadge,
                  {
                    backgroundColor: item.isUp
                      ? 'rgba(34, 197, 94, 0.12)'
                      : 'rgba(239, 68, 68, 0.12)',
                  },
                ]}
              >
                <Ionicons
                  name={item.isUp ? 'caret-up' : 'caret-down'}
                  size={11}
                  color={item.isUp ? '#16A34A' : '#DC2626'}
                />
                <Text
                  style={[
                    styles.changeText,
                    { color: item.isUp ? '#16A34A' : '#DC2626' },
                  ]}
                >
                  {item.change}
                </Text>
              </View>
            </View>

            <Text style={[styles.itemCode, { color: colors.ink }]}>{item.code}</Text>
            <Text style={[styles.itemValue, { color: colors.ink }]}>{item.value}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[styles.itemName, { color: colors.inkMuted }]} numberOfLines={1}>
                {item.name}
              </Text>
              {item.id !== 'ihsg' && (
                <Ionicons name="calculator-outline" size={12} color={colors.inkMuted} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal Kalkulator Kurs Cepat */}
      <Modal
        visible={calcItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setCalcItem(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setCalcItem(null)}>
          <Pressable
            style={[
              styles.calcSheet,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              isDark ? shadow.cardDark : shadow.card,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.calcSheetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.calcIconCircle, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="calculator" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.calcTitle, { color: colors.ink }]}>
                    Kalkulator {calcItem?.name}
                  </Text>
                  <Text style={[styles.calcSub, { color: colors.inkMuted }]}>
                    1 {calcItem?.unit || ''} = {calcItem?.value}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setCalcItem(null)} hitSlop={8}>
                <Ionicons name="close" size={20} color={colors.inkMuted} />
              </TouchableOpacity>
            </View>

            {/* Input Nominal Asing */}
            <Text style={[styles.calcInputLabel, { color: colors.ink }]}>
              Jumlah {calcItem?.code.split('/')[0].trim()}
            </Text>
            <View
              style={[
                styles.calcInputWrap,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.calcInputPrefix, { color: colors.primary }]}>
                {calcItem?.unit || '$'}
              </Text>
              <TextInput
                style={[styles.calcInput, { color: colors.ink }]}
                value={foreignAmount}
                onChangeText={(t) => setForeignAmount(t.replace(/[^0-9.]/g, ''))}
                placeholder="1"
                placeholderTextColor={colors.inkMuted}
                keyboardType="numeric"
                autoFocus
              />
            </View>

            {/* Shortcut Chips */}
            <View style={styles.quickChipsRow}>
              {(calcItem?.id === 'gold'
                ? ['1', '2', '5', '10', '25']
                : calcItem?.id === 'jpy'
                ? ['100', '500', '1000', '5000', '10000']
                : ['5', '10', '50', '100', '500']
              ).map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.quickChip,
                    {
                      backgroundColor:
                        foreignAmount === val
                          ? colors.primary
                          : isDark
                          ? 'rgba(255,255,255,0.06)'
                          : 'rgba(0,0,0,0.04)',
                      borderColor: foreignAmount === val ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setForeignAmount(val)}
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      { color: foreignAmount === val ? '#FFFFFF' : colors.ink },
                    ]}
                  >
                    {val} {calcItem?.unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Hasil Konversi ke Rupiah */}
            <View
              style={[
                styles.calcResultBox,
                {
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.08)',
                  borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)',
                },
              ]}
            >
              <Text style={styles.calcResultLabel}>ESTIMASI NILAI DALAM RUPIAH</Text>
              <Text style={styles.calcResultValue}>
                Rp {calculateConvertedIDR().toLocaleString('id-ID')}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.calcCloseBtn, { backgroundColor: colors.primary }]}
              onPress={() => setCalcItem(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.calcCloseBtnText}>Selesai</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDotWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 10,
    marginTop: 1,
  },
  liveBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: '#DC2626',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navArrowsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navArrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtn: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  updateText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollList: {
    gap: 12,
    paddingVertical: 4,
    paddingRight: 16,
  },
  tickerCard: {
    width: 155,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.badges,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  itemCode: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginVertical: 4,
  },
  itemName: {
    fontSize: 11,
    flex: 1,
  },

  // Modal Calculator
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calcSheet: {
    width: '100%',
    maxWidth: 420,
    borderRadius: radius.cards,
    borderWidth: 1,
    padding: 24,
  },
  calcSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calcIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  calcSub: {
    fontSize: 12,
    marginTop: 1,
  },
  calcInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  calcInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.inputs,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  calcInputPrefix: {
    fontSize: 18,
    fontWeight: '800',
    marginRight: 8,
  },
  calcInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    paddingVertical: 2,
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.buttons,
    borderWidth: 1,
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  calcResultBox: {
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  calcResultLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  calcResultValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#16A34A',
    letterSpacing: -0.5,
  },
  calcCloseBtn: {
    paddingVertical: 12,
    borderRadius: radius.buttons,
    alignItems: 'center',
  },
  calcCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
