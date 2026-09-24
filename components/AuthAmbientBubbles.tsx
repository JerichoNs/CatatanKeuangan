import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export function AuthAmbientBubbles() {
  const { isDark } = useTheme();

  // Animasi Melayang untuk masing-masing bubble
  const bubble1Float = useRef(new Animated.Value(0)).current;
  const bubble1Scale = useRef(new Animated.Value(1)).current;

  const bubble2Float = useRef(new Animated.Value(0)).current;
  const bubble2Scale = useRef(new Animated.Value(1)).current;

  const bubble3Float = useRef(new Animated.Value(0)).current;
  const bubble3Scale = useRef(new Animated.Value(1)).current;

  const bubble4Float = useRef(new Animated.Value(0)).current;
  const bubble4Scale = useRef(new Animated.Value(1)).current;

  const bubble5Scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Bubble 1: Utama kanan atas
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bubble1Float, {
            toValue: -24,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(bubble1Scale, {
            toValue: 1.15,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bubble1Float, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(bubble1Scale, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Bubble 2: Bawah kiri
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bubble2Float, {
            toValue: 22,
            duration: 4800,
            useNativeDriver: true,
          }),
          Animated.timing(bubble2Scale, {
            toValue: 1.12,
            duration: 4800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bubble2Float, {
            toValue: 0,
            duration: 4800,
            useNativeDriver: true,
          }),
          Animated.timing(bubble2Scale, {
            toValue: 1,
            duration: 4800,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Bubble 3: Tengah kanan / aksen Cyan
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bubble3Float, {
            toValue: -18,
            duration: 3600,
            useNativeDriver: true,
          }),
          Animated.timing(bubble3Scale, {
            toValue: 1.16,
            duration: 3600,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bubble3Float, {
            toValue: 0,
            duration: 3600,
            useNativeDriver: true,
          }),
          Animated.timing(bubble3Scale, {
            toValue: 1,
            duration: 3600,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Bubble 4: Kiri atas Peony
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bubble4Float, {
            toValue: 16,
            duration: 3200,
            useNativeDriver: true,
          }),
          Animated.timing(bubble4Scale, {
            toValue: 1.14,
            duration: 3200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bubble4Float, {
            toValue: 0,
            duration: 3200,
            useNativeDriver: true,
          }),
          Animated.timing(bubble4Scale, {
            toValue: 1,
            duration: 3200,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Bubble 5: Center card ambient halo
    Animated.loop(
      Animated.sequence([
        Animated.timing(bubble5Scale, {
          toValue: 1.18,
          duration: 5500,
          useNativeDriver: true,
        }),
        Animated.timing(bubble5Scale, {
          toValue: 0.95,
          duration: 5500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.ambientContainer} pointerEvents="none">
      {/* Bubble 1: Large Monday Violet Glow Orb (Kanan Atas) */}
      <Animated.View
        style={[
          styles.glowOrb1,
          {
            backgroundColor: isDark ? 'rgba(97, 97, 255, 0.40)' : 'rgba(97, 97, 255, 0.22)',
            transform: [{ translateY: bubble1Float }, { scale: bubble1Scale }],
          },
        ]}
      />

      {/* Bubble 2: Radiant Mint / Emerald Glow Orb (Kiri Bawah) */}
      <Animated.View
        style={[
          styles.glowOrb2,
          {
            backgroundColor: isDark ? 'rgba(74, 222, 128, 0.32)' : 'rgba(188, 254, 144, 0.35)',
            transform: [{ translateY: bubble2Float }, { scale: bubble2Scale }],
          },
        ]}
      />

      {/* Bubble 3: Electric Cyan Glow Orb (Kanan Tengah) */}
      <Animated.View
        style={[
          styles.glowOrb3,
          {
            backgroundColor: isDark ? 'rgba(58, 201, 255, 0.38)' : 'rgba(171, 240, 255, 0.38)',
            transform: [{ translateY: bubble3Float }, { scale: bubble3Scale }],
          },
        ]}
      />

      {/* Bubble 4: Neon Peony / Cotton Candy Orb (Kiri Atas) */}
      <Animated.View
        style={[
          styles.glowOrb4,
          {
            backgroundColor: isDark ? 'rgba(244, 114, 182, 0.34)' : 'rgba(252, 208, 248, 0.38)',
            transform: [{ translateY: bubble4Float }, { scale: bubble4Scale }],
          },
        ]}
      />

      {/* Bubble 5: Center Card Aurora Halo */}
      <Animated.View
        style={[
          styles.glowOrb5,
          {
            backgroundColor: isDark ? 'rgba(124, 124, 255, 0.28)' : 'rgba(219, 219, 255, 0.35)',
            transform: [{ scale: bubble5Scale }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ambientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  glowOrb1: {
    position: 'absolute',
    top: -90,
    right: -90,
    width: 420,
    height: 420,
    borderRadius: 9999,
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(85px)',
          WebkitFilter: 'blur(85px)',
          willChange: 'transform',
        } as any)
      : {}),
  },
  glowOrb2: {
    position: 'absolute',
    bottom: -90,
    left: -90,
    width: 380,
    height: 380,
    borderRadius: 9999,
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(85px)',
          WebkitFilter: 'blur(85px)',
          willChange: 'transform',
        } as any)
      : {}),
  },
  glowOrb3: {
    position: 'absolute',
    top: '32%',
    right: -60,
    width: 320,
    height: 320,
    borderRadius: 9999,
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(75px)',
          WebkitFilter: 'blur(75px)',
          willChange: 'transform',
        } as any)
      : {}),
  },
  glowOrb4: {
    position: 'absolute',
    top: '12%',
    left: -50,
    width: 280,
    height: 280,
    borderRadius: 9999,
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(70px)',
          WebkitFilter: 'blur(70px)',
          willChange: 'transform',
        } as any)
      : {}),
  },
  glowOrb5: {
    position: 'absolute',
    top: '25%',
    left: '20%',
    width: 360,
    height: 360,
    borderRadius: 9999,
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(95px)',
          WebkitFilter: 'blur(95px)',
          willChange: 'transform',
        } as any)
      : {}),
  },
});
