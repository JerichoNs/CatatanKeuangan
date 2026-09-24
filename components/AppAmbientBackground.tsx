import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export function AppAmbientBackground() {
  const { isDark } = useTheme();

  // Animasi Melayang Cair (Fluid Organic Motion) untuk 5 Orbs
  const orb1Y = useRef(new Animated.Value(0)).current;
  const orb1X = useRef(new Animated.Value(0)).current;
  const orb1Scale = useRef(new Animated.Value(1)).current;

  const orb2Y = useRef(new Animated.Value(0)).current;
  const orb2X = useRef(new Animated.Value(0)).current;
  const orb2Scale = useRef(new Animated.Value(1)).current;

  const orb3Y = useRef(new Animated.Value(0)).current;
  const orb3X = useRef(new Animated.Value(0)).current;
  const orb3Scale = useRef(new Animated.Value(1)).current;

  const orb4Y = useRef(new Animated.Value(0)).current;
  const orb4X = useRef(new Animated.Value(0)).current;
  const orb4Scale = useRef(new Animated.Value(1)).current;

  const orb5Scale = useRef(new Animated.Value(0.95)).current;
  const orb5Y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Orb 1: Monday Violet - fluid drift diagonal kiri atas
    const anim1 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb1Y, {
            toValue: -32,
            duration: 5200,
            useNativeDriver: true,
          }),
          Animated.timing(orb1X, {
            toValue: 28,
            duration: 5200,
            useNativeDriver: true,
          }),
          Animated.timing(orb1Scale, {
            toValue: 1.18,
            duration: 5200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orb1Y, {
            toValue: 0,
            duration: 5200,
            useNativeDriver: true,
          }),
          Animated.timing(orb1X, {
            toValue: 0,
            duration: 5200,
            useNativeDriver: true,
          }),
          Animated.timing(orb1Scale, {
            toValue: 1,
            duration: 5200,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Orb 2: Sky Cyan - float melingkar kanan atas
    const anim2 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb2Y, {
            toValue: 36,
            duration: 6400,
            useNativeDriver: true,
          }),
          Animated.timing(orb2X, {
            toValue: -32,
            duration: 6400,
            useNativeDriver: true,
          }),
          Animated.timing(orb2Scale, {
            toValue: 1.15,
            duration: 6400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orb2Y, {
            toValue: 0,
            duration: 6400,
            useNativeDriver: true,
          }),
          Animated.timing(orb2X, {
            toValue: 0,
            duration: 6400,
            useNativeDriver: true,
          }),
          Animated.timing(orb2Scale, {
            toValue: 1,
            duration: 6400,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Orb 3: Mint Wash - denyut cair kiri bawah
    const anim3 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb3Y, {
            toValue: -24,
            duration: 4800,
            useNativeDriver: true,
          }),
          Animated.timing(orb3X, {
            toValue: 20,
            duration: 4800,
            useNativeDriver: true,
          }),
          Animated.timing(orb3Scale, {
            toValue: 1.2,
            duration: 4800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orb3Y, {
            toValue: 0,
            duration: 4800,
            useNativeDriver: true,
          }),
          Animated.timing(orb3X, {
            toValue: 0,
            duration: 4800,
            useNativeDriver: true,
          }),
          Animated.timing(orb3Scale, {
            toValue: 1,
            duration: 4800,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Orb 4: Peony Cotton Candy - kanan bawah
    const anim4 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb4Y, {
            toValue: -28,
            duration: 5600,
            useNativeDriver: true,
          }),
          Animated.timing(orb4X, {
            toValue: -22,
            duration: 5600,
            useNativeDriver: true,
          }),
          Animated.timing(orb4Scale, {
            toValue: 1.16,
            duration: 5600,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orb4Y, {
            toValue: 0,
            duration: 5600,
            useNativeDriver: true,
          }),
          Animated.timing(orb4X, {
            toValue: 0,
            duration: 5600,
            useNativeDriver: true,
          }),
          Animated.timing(orb4Scale, {
            toValue: 1,
            duration: 5600,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Orb 5: Center Warm Lavender - subtle breathing
    const anim5 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb5Scale, {
            toValue: 1.14,
            duration: 7000,
            useNativeDriver: true,
          }),
          Animated.timing(orb5Y, {
            toValue: 18,
            duration: 7000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orb5Scale, {
            toValue: 0.95,
            duration: 7000,
            useNativeDriver: true,
          }),
          Animated.timing(orb5Y, {
            toValue: 0,
            duration: 7000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    anim1.start();
    anim2.start();
    anim3.start();
    anim4.start();
    anim5.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
      anim4.stop();
      anim5.stop();
    };
  }, []);

  return (
    <View style={styles.absoluteContainer} pointerEvents="none">
      {/* Orb 1: Monday Violet Glow (Kiri Atas) */}
      <Animated.View
        style={[
          styles.orbBase,
          styles.orb1,
          {
            backgroundColor: isDark
              ? 'rgba(97, 97, 255, 0.16)'
              : 'rgba(97, 97, 255, 0.11)',
            transform: [
              { translateY: orb1Y },
              { translateX: orb1X },
              { scale: orb1Scale },
            ],
          },
        ]}
      />

      {/* Orb 2: Sky Cyan wash (Kanan Atas) */}
      <Animated.View
        style={[
          styles.orbBase,
          styles.orb2,
          {
            backgroundColor: isDark
              ? 'rgba(58, 201, 255, 0.14)'
              : 'rgba(171, 240, 255, 0.22)',
            transform: [
              { translateY: orb2Y },
              { translateX: orb2X },
              { scale: orb2Scale },
            ],
          },
        ]}
      />

      {/* Orb 3: Mint wash (Kiri Bawah) */}
      <Animated.View
        style={[
          styles.orbBase,
          styles.orb3,
          {
            backgroundColor: isDark
              ? 'rgba(42, 92, 78, 0.20)'
              : 'rgba(188, 254, 144, 0.22)',
            transform: [
              { translateY: orb3Y },
              { translateX: orb3X },
              { scale: orb3Scale },
            ],
          },
        ]}
      />

      {/* Orb 4: Peony / Cotton Candy soft wash (Kanan Bawah) */}
      <Animated.View
        style={[
          styles.orbBase,
          styles.orb4,
          {
            backgroundColor: isDark
              ? 'rgba(233, 141, 254, 0.12)'
              : 'rgba(252, 208, 248, 0.24)',
            transform: [
              { translateY: orb4Y },
              { translateX: orb4X },
              { scale: orb4Scale },
            ],
          },
        ]}
      />

      {/* Orb 5: Lavender / Apricot center glow */}
      <Animated.View
        style={[
          styles.orbBase,
          styles.orb5,
          {
            backgroundColor: isDark
              ? 'rgba(148, 80, 253, 0.10)'
              : 'rgba(237, 223, 247, 0.25)',
            transform: [
              { translateY: orb5Y },
              { scale: orb5Scale },
            ],
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
          filter: 'blur(80px)',
          WebkitFilter: 'blur(80px)',
          willChange: 'transform',
        } as any)
      : {}),
  },
  orb1: {
    top: -70,
    left: -70,
    width: 340,
    height: 340,
  },
  orb2: {
    top: 30,
    right: -90,
    width: 380,
    height: 380,
  },
  orb3: {
    bottom: 70,
    left: -80,
    width: 360,
    height: 360,
  },
  orb4: {
    bottom: -50,
    right: -50,
    width: 340,
    height: 340,
  },
  orb5: {
    top: '35%',
    left: '25%',
    width: 280,
    height: 280,
  },
});
