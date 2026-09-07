import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
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
}

export function MarketTicker() {
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [marketData, setMarketData] = useState<MarketItem[]>([
    {
      id: 'ihsg',
      code: 'IHSG',
      name: 'Indeks Saham BEI',
      value: '7.694,53',
      change: '+0.48%',
      isUp: true,
      icon: 'trending-up',
    },
    {
      id: 'usd',
      code: 'USD / IDR',
      name: 'Dolar AS',
      value: 'Rp 16.320',
      change: '+0.15%',
      isUp: true,
      icon: 'logo-usd',
    },
    {
      id: 'eur',
      code: 'EUR / IDR',
      name: 'Euro Eropa',
      value: 'Rp 17.650',
      change: '-0.18%',
      isUp: false,
      icon: 'globe-outline',
    },
    {
      id: 'sgd',
      code: 'SGD / IDR',
      name: 'Dolar Singapura',
      value: 'Rp 12.510',
      change: '+0.08%',
      isUp: true,
      icon: 'cash-outline',
    },
    {
      id: 'jpy',
      code: 'JPY (100¥)',
      name: 'Yen Jepang',
      value: 'Rp 10.840',
      change: '+0.22%',
      isUp: true,
      icon: 'wallet-outline',
    },
    {
      id: 'gold',
      code: 'EMAS (Antam)',
      name: 'Harga per gram',
      value: 'Rp 1.415.000',
      change: '+0.35%',
      isUp: true,
      icon: 'cube-outline',
    },
  ]);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (res.ok) {
        const data = await res.json();
        const idrRate = data?.rates?.IDR;
        const eurRate = data?.rates?.EUR;
        const sgdRate = data?.rates?.SGD;
        const jpyRate = data?.rates?.JPY;

        if (idrRate) {
          const usdValue = Math.round(idrRate);
          const eurValue = eurRate ? Math.round(idrRate / eurRate) : 17650;
          const sgdValue = sgdRate ? Math.round(idrRate / sgdRate) : 12510;
          const jpyValue = jpyRate ? Math.round((idrRate / jpyRate) * 100) : 10840;

          setMarketData([
            {
              id: 'ihsg',
              code: 'IHSG',
              name: 'Indeks Saham BEI',
              value: '7.694,53',
              change: '+0.48%',
              isUp: true,
              icon: 'trending-up',
            },
            {
              id: 'usd',
              code: 'USD / IDR',
              name: 'Dolar AS',
              value: `Rp ${usdValue.toLocaleString('id-ID')}`,
              change: '+0.15%',
              isUp: true,
              icon: 'logo-usd',
            },
            {
              id: 'eur',
              code: 'EUR / IDR',
              name: 'Euro Eropa',
              value: `Rp ${eurValue.toLocaleString('id-ID')}`,
              change: '-0.18%',
              isUp: false,
              icon: 'globe-outline',
            },
            {
              id: 'sgd',
              code: 'SGD / IDR',
              name: 'Dolar Singapura',
              value: `Rp ${sgdValue.toLocaleString('id-ID')}`,
              change: '+0.08%',
              isUp: true,
              icon: 'cash-outline',
            },
            {
              id: 'jpy',
              code: 'JPY (100¥)',
              name: 'Yen Jepang',
              value: `Rp ${jpyValue.toLocaleString('id-ID')}`,
              change: '+0.22%',
              isUp: true,
              icon: 'wallet-outline',
            },
            {
              id: 'gold',
              code: 'EMAS (Antam)',
              name: 'Harga per gram',
              value: 'Rp 1.415.000',
              change: '+0.35%',
              isUp: true,
              icon: 'cube-outline',
            },
          ]);
        }
      }
    } catch {
      // Jika fetch gagal atau offline, data default tetap ditampilkan
    } finally {
      const now = new Date();
      setLastUpdated(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header Bar Kurs & Pasar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.pulseDotWrap, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
            <View style={styles.pulseDot} />
          </View>
          <Text style={[styles.title, { color: colors.ink }]}>
            Informasi Pasar & Kurs Hari Ini
          </Text>
        </View>

        <TouchableOpacity
          onPress={fetchRates}
          style={styles.refreshBtn}
          activeOpacity={0.7}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="sync-outline" size={13} color={colors.inkMuted} />
              <Text style={[styles.updateText, { color: colors.inkMuted }]}>
                {lastUpdated ? `Pukul ${lastUpdated}` : 'Perbarui'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Horizontal Carousel of Market Items */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {marketData.map((item) => (
          <View
            key={item.id}
            style={[
              styles.tickerCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              isDark ? shadow.cardDark : shadow.card,
            ]}
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
            <Text style={[styles.itemName, { color: colors.inkMuted }]}>{item.name}</Text>
          </View>
        ))}
      </ScrollView>
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
    width: 20,
    height: 20,
    borderRadius: 10,
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
  refreshBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  updateText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scrollList: {
    gap: 12,
    paddingVertical: 4,
    paddingRight: 16,
  },
  tickerCard: {
    width: 155,
    borderRadius: radius.lg,
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
    borderRadius: radius.pill,
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
  },
});
