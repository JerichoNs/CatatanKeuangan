import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle({ size = 'medium' }: { size?: 'small' | 'medium' }) {
  const { isDark, toggleTheme } = useTheme();
  const animatedValue = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isDark ? 1 : 0,
      useNativeDriver: false, // Dibutuhkan untuk interpolasi warna
      friction: 7,
      tension: 45,
    }).start();
  }, [isDark]);

  const isSmall = size === 'small';
  const width = isSmall ? 54 : 64;
  const height = isSmall ? 30 : 34;
  const knobSize = isSmall ? 22 : 26;
  const translateXRange = width - knobSize - 6;

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [3, translateXRange],
  });

  const scaleX = animatedValue.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [1, 1.16, 1.16, 1],
  });

  const containerBg = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#1E293B'],
  });

  const containerBorder = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#CBD5E1', '#334155'],
  });

  const knobBg = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', '#38BDF8'],
  });

  // Cross-fade dan rotasi halus untuk ikon matahari
  const sunOpacity = animatedValue.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [1, 0, 0],
  });
  const sunRotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  // Cross-fade dan rotasi halus untuk ikon bulan
  const moonOpacity = animatedValue.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [0, 0, 1],
  });
  const moonRotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['-90deg', '0deg'],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel={`Ganti ke mode ${isDark ? 'terang' : 'gelap'}`}
    >
      <Animated.View
        style={[
          styles.container,
          {
            width,
            height,
            backgroundColor: containerBg,
            borderColor: containerBorder,
          },
        ]}
      >
        {/* Ikon Statis Latar Belakang */}
        <View style={styles.iconBackground}>
          <Ionicons name="sunny" size={isSmall ? 13 : 15} color="#F59E0B" />
          <Ionicons name="moon" size={isSmall ? 11 : 13} color="#94A3B8" />
        </View>

        {/* Knob Geser Elastis & Beranimasi Penuh */}
        <Animated.View
          style={[
            styles.knob,
            {
              width: knobSize,
              height: knobSize,
              backgroundColor: knobBg,
              transform: [{ translateX }, { scaleX }],
            },
          ]}
        >
          {/* Ikon Matahari (Aktif saat Light Mode) */}
          <Animated.View
            style={[
              styles.iconWrapper,
              {
                opacity: sunOpacity,
                transform: [{ rotate: sunRotate }],
              },
            ]}
          >
            <Ionicons name="sunny" size={isSmall ? 13 : 15} color="#F59E0B" />
          </Animated.View>

          {/* Ikon Bulan (Aktif saat Dark Mode) */}
          <Animated.View
            style={[
              styles.iconWrapper,
              {
                opacity: moonOpacity,
                transform: [{ rotate: moonRotate }],
              },
            ]}
          >
            <Ionicons name="moon" size={isSmall ? 12 : 14} color="#0F172A" />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    borderWidth: 1.5,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  iconBackground: {
    position: 'absolute',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 7,
    alignItems: 'center',
  },
  knob: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  iconWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
