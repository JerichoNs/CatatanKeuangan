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

  useEffect(() => {
    // Bubble 1: Utama kanan atas
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bubble1Float, {
            toValue: -18,
            duration: 3200,
            useNativeDriver: true,
          }),
          Animated.timing(bubble1Scale, {
            toValue: 1.08,
            duration: 3200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bubble1Float, {
            toValue: 0,
            duration: 3200,
            useNativeDriver: true,
          }),
          Animated.timing(bubble1Scale, {
            toValue: 1,
            duration: 3200,
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
            toValue: 16,
            duration: 3800,
            useNativeDriver: true,
          }),
          Animated.timing(bubble2Scale, {
            toValue: 1.06,
            duration: 3800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bubble2Float, {
            toValue: 0,
            duration: 3800,
            useNativeDriver: true,
          }),
          Animated.timing(bubble2Scale, {
            toValue: 1,
            duration: 3800,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Bubble 3: Tengah kanan / aksen
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bubble3Float, {
            toValue: -12,
            duration: 2600,
            useNativeDriver: true,
          }),
          Animated.timing(bubble3Scale, {
            toValue: 1.1,
            duration: 2600,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bubble3Float, {
            toValue: 0,
            duration: 2600,
            useNativeDriver: true,
          }),
          Animated.timing(bubble3Scale, {
            toValue: 1,
            duration: 2600,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Bubble 4: Kiri atas kecil
    Animated.loop(
      Animated.sequence([
        Animated.timing(bubble4Float, {
          toValue: 10,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(bubble4Float, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.ambientContainer} pointerEvents="none">
      {/* Bubble 1: Large Monday Violet Glow Orb */}
      <Animated.View
        style={[
          styles.glowOrb1,
          {
            backgroundColor: isDark ? 'rgba(97, 97, 255, 0.16)' : 'rgba(97, 97, 255, 0.08)',
            transform: [{ translateY: bubble1Float }, { scale: bubble1Scale }],
          },
        ]}
      />

      {/* Bubble 2: Soft Mint Pastel Glow Orb */}
      <Animated.View
        style={[
          styles.glowOrb2,
          {
            backgroundColor: isDark ? 'rgba(42, 92, 78, 0.16)' : 'rgba(188, 254, 144, 0.15)',
            transform: [{ translateY: bubble2Float }, { scale: bubble2Scale }],
          },
        ]}
      />

      {/* Bubble 3: Soft Sky / Lavender Mid Orb */}
      <Animated.View
        style={[
          styles.glowOrb3,
          {
            backgroundColor: isDark ? 'rgba(148, 80, 253, 0.12)' : 'rgba(171, 240, 255, 0.15)',
            transform: [{ translateY: bubble3Float }, { scale: bubble3Scale }],
          },
        ]}
      />

      {/* Bubble 4: Small Peony / Apricot Accent Orb */}
      <Animated.View
        style={[
          styles.glowOrb4,
          {
            backgroundColor: isDark ? 'rgba(233, 141, 254, 0.10)' : 'rgba(252, 208, 248, 0.16)',
            transform: [{ translateY: bubble4Float }],
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
    top: -70,
    right: -70,
    width: 340,
    height: 340,
    borderRadius: 9999,
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(75px)',
          WebkitFilter: 'blur(75px)',
          willChange: 'transform',
        } as any)
      : {}),
  },
  glowOrb2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
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
  glowOrb3: {
    position: 'absolute',
    top: '38%',
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 9999,
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(65px)',
          WebkitFilter: 'blur(65px)',
          willChange: 'transform',
        } as any)
      : {}),
  },
  glowOrb4: {
    position: 'absolute',
    top: '18%',
    left: -30,
    width: 180,
    height: 180,
    borderRadius: 9999,
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(55px)',
          WebkitFilter: 'blur(55px)',
          willChange: 'transform',
        } as any)
      : {}),
  },
});
