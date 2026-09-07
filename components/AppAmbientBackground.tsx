import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export function AppAmbientBackground() {
  const { isDark } = useTheme();

  // Animasi Melayang untuk 4 Orbs Cahaya
  const orb1Y = useRef(new Animated.Value(0)).current;
  const orb1X = useRef(new Animated.Value(0)).current;
  const orb1Scale = useRef(new Animated.Value(1)).current;

  const orb2Y = useRef(new Animated.Value(0)).current;
  const orb2X = useRef(new Animated.Value(0)).current;
  const orb2Scale = useRef(new Animated.Value(1)).current;

  const orb3Y = useRef(new Animated.Value(0)).current;
  const orb3Scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Orb 1: Bergerak diagonal melayang di kiri atas
    const anim1 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb1Y, {
            toValue: -28,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(orb1X, {
            toValue: 24,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(orb1Scale, {
            toValue: 1.15,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orb1Y, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(orb1X, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(orb1Scale, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Orb 2: Bergerak mengambang di kanan atas / tengah
    const anim2 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb2Y, {
            toValue: 32,
            duration: 6200,
            useNativeDriver: true,
          }),
          Animated.timing(orb2X, {
            toValue: -26,
            duration: 6200,
            useNativeDriver: true,
          }),
          Animated.timing(orb2Scale, {
            toValue: 1.12,
            duration: 6200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orb2Y, {
            toValue: 0,
            duration: 6200,
            useNativeDriver: true,
          }),
          Animated.timing(orb2X, {
            toValue: 0,
            duration: 6200,
            useNativeDriver: true,
          }),
          Animated.timing(orb2Scale, {
            toValue: 1,
            duration: 6200,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Orb 3: Efek denyut lembut di bagian bawah
    const anim3 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb3Y, {
            toValue: -20,
            duration: 4400,
            useNativeDriver: true,
          }),
          Animated.timing(orb3Scale, {
            toValue: 1.18,
            duration: 4400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orb3Y, {
            toValue: 0,
            duration: 4400,
            useNativeDriver: true,
          }),
          Animated.timing(orb3Scale, {
            toValue: 1,
            duration: 4400,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  return (
    <View style={styles.absoluteContainer} pointerEvents="none">
      {/* Orb 1: Royal Blue / Sapphire Glow (Kiri Atas) */}
      <Animated.View
        style={[
          styles.orbBase,
          styles.orb1,
          {
            backgroundColor: isDark
              ? 'rgba(37, 99, 235, 0.18)'
              : 'rgba(59, 130, 246, 0.14)',
            transform: [
              { translateY: orb1Y },
              { translateX: orb1X },
              { scale: orb1Scale },
            ],
          },
        ]}
      />

      {/* Orb 2: Purple / Violet Nebula (Kanan Atas) */}
      <Animated.View
        style={[
          styles.orbBase,
          styles.orb2,
          {
            backgroundColor: isDark
              ? 'rgba(139, 92, 246, 0.16)'
              : 'rgba(168, 85, 247, 0.12)',
            transform: [
              { translateY: orb2Y },
              { translateX: orb2X },
              { scale: orb2Scale },
            ],
          },
        ]}
      />

      {/* Orb 3: Emerald / Cyan Glow (Kiri Bawah) */}
      <Animated.View
        style={[
          styles.orbBase,
          styles.orb3,
          {
            backgroundColor: isDark
              ? 'rgba(16, 185, 129, 0.14)'
              : 'rgba(20, 184, 166, 0.12)',
            transform: [{ translateY: orb3Y }, { scale: orb3Scale }],
          },
        ]}
      />

      {/* Orb 4: Amber / Warm Gold subtle aura (Kanan Bawah) */}
      <View
        style={[
          styles.orbBase,
          styles.orb4,
          {
            backgroundColor: isDark
              ? 'rgba(245, 158, 11, 0.08)'
              : 'rgba(251, 191, 36, 0.1)',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 0,
  },
  orbBase: {
    position: 'absolute',
    borderRadius: 9999,
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(75px)',
          WebkitFilter: 'blur(75px)',
          willChange: 'transform',
        } as any)
      : {}),
  },
  orb1: {
    top: -60,
    left: -60,
    width: 320,
    height: 320,
  },
  orb2: {
    top: 40,
    right: -80,
    width: 360,
    height: 360,
  },
  orb3: {
    bottom: 80,
    left: -70,
    width: 340,
    height: 340,
  },
  orb4: {
    bottom: -40,
    right: -40,
    width: 300,
    height: 300,
  },
});
