import React, { useCallback, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { useFocusEffect, useIsFocused } from 'expo-router';

interface ScreenTransitionWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ScreenTransitionWrapper({ children, style }: ScreenTransitionWrapperProps) {
  const isFocused = useIsFocused();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;
  const scaleAnim = useRef(new Animated.Value(0.988)).current;

  useFocusEffect(
    useCallback(() => {
      // Reset animasi awal saat tab dibuka
      fadeAnim.setValue(0);
      slideAnim.setValue(14);
      scaleAnim.setValue(0.988);

      // Jalankan animasi transisi masuk yang mulus
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start();
    }, [fadeAnim, slideAnim, scaleAnim])
  );

  return (
    <Animated.View
      pointerEvents={isFocused ? 'auto' : 'none'}
      style={[
        styles.flex,
        style,
        {
          opacity: isFocused ? fadeAnim : 0,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          display: isFocused ? 'flex' : 'none',
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
