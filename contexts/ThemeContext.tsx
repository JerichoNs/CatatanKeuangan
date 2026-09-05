import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useColorScheme, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, type ThemeColors } from '../constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STORAGE_KEY = '@catatan_theme_preference';

interface ThemeContextType {
  theme: 'light' | 'dark';
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  animValue: Animated.Value;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
  setTheme: () => {},
  animValue: new Animated.Value(0),
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const animValue = useRef(new Animated.Value(0)).current;

  // Muat preferensi tema dari AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') {
          setCurrentTheme(saved);
          animValue.setValue(saved === 'dark' ? 1 : 0);
        } else if (systemScheme === 'dark') {
          setCurrentTheme('dark');
          animValue.setValue(1);
        }
      } catch {
        // Fallback default light
      }
    })();
  }, []);

  const setThemeWithAnimation = (newTheme: 'light' | 'dark') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentTheme(newTheme);
    Animated.spring(animValue, {
      toValue: newTheme === 'dark' ? 1 : 0,
      useNativeDriver: false,
      friction: 8,
      tension: 60,
    }).start();

    AsyncStorage.setItem(STORAGE_KEY, newTheme).catch(() => {});
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeWithAnimation(nextTheme);
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        colors,
        toggleTheme,
        setTheme: setThemeWithAnimation,
        animValue,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
