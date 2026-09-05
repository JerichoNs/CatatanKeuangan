import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle({ size = 'medium' }: { size?: 'small' | 'medium' }) {
  const { isDark, toggleTheme } = useTheme();
  const animatedValue = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isDark ? 1 : 0,
      useNativeDriver: true,
      friction: 7,
      tension: 50,
    }).start();
  }, [isDark]);

  const isSmall = size === 'small';
  const width = isSmall ? 52 : 62;
  const height = isSmall ? 28 : 32;
  const knobSize = isSmall ? 22 : 26;
  const translateXRange = width - knobSize - 6;

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [3, translateXRange],
  });

  const rotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={toggleTheme}
      style={[
        styles.container,
        {
          width,
          height,
          backgroundColor: isDark ? '#1E293B' : '#E2E8F0',
          borderColor: isDark ? '#334155' : '#CBD5E1',
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Ganti ke mode ${isDark ? 'terang' : 'gelap'}`}
    >
      <View style={styles.iconBackground}>
        <Ionicons name="sunny" size={isSmall ? 12 : 14} color="#F59E0B" />
        <Ionicons name="moon" size={isSmall ? 11 : 13} color="#94A3B8" />
      </View>

      <Animated.View
        style={[
          styles.knob,
          {
            width: knobSize,
            height: knobSize,
            backgroundColor: isDark ? '#38BDF8' : '#FFFFFF',
            transform: [{ translateX }, { rotate }],
          },
        ]}
      >
        <Ionicons
          name={isDark ? 'moon' : 'sunny'}
          size={isSmall ? 12 : 14}
          color={isDark ? '#0F172A' : '#F59E0B'}
        />
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
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});
