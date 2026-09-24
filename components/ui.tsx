import { useState, useRef, useEffect, type ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  KeyboardTypeOptions,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, radius, shadow } from '../constants/theme';

export function Card({
  children,
  style,
  liquidGlass = true,
}: {
  children: ReactNode;
  style?: ViewStyle;
  liquidGlass?: boolean;
}) {
  const { colors, isDark } = useTheme();
  const isWeb = Platform.OS === 'web';
  const glassBg = isDark
    ? (colors.surfaceGlass || 'rgba(30, 34, 53, 0.72)')
    : (colors.surfaceGlass || 'rgba(255, 255, 255, 0.76)');
  const glassBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.75)';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: liquidGlass ? glassBg : colors.surface,
          borderColor: liquidGlass ? glassBorder : colors.border,
          borderWidth: 1,
        },
        liquidGlass
          ? (isDark ? shadow.liquidGlassDark : shadow.liquidGlass)
          : (isDark ? shadow.cardDark : shadow.card),
        isWeb && liquidGlass
          ? ({
              backdropFilter: 'blur(24px) saturate(190%)',
              WebkitBackdropFilter: 'blur(24px) saturate(190%)',
            } as any)
          : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export type PastelTone = 'mint' | 'sky' | 'apricot' | 'lavender' | 'periwinkle' | 'aqua' | 'peony' | 'cottonCandy';

export function PastelCard({
  children,
  tone = 'sky',
  style,
  liquidGlass = true,
}: {
  children: ReactNode;
  tone?: PastelTone;
  style?: ViewStyle;
  liquidGlass?: boolean;
}) {
  const { colors, isDark } = useTheme();
  const isWeb = Platform.OS === 'web';

  const getToneBg = () => {
    if (liquidGlass) {
      switch (tone) {
        case 'mint':
          return isDark ? 'rgba(30, 58, 47, 0.72)' : 'rgba(188, 254, 144, 0.65)';
        case 'sky':
          return isDark ? 'rgba(30, 50, 68, 0.72)' : 'rgba(171, 240, 255, 0.68)';
        case 'apricot':
          return isDark ? 'rgba(58, 39, 28, 0.72)' : 'rgba(255, 232, 214, 0.72)';
        case 'lavender':
          return isDark ? 'rgba(47, 35, 60, 0.72)' : 'rgba(237, 223, 247, 0.72)';
        case 'periwinkle':
          return isDark ? 'rgba(36, 42, 69, 0.72)' : 'rgba(231, 236, 255, 0.75)';
        case 'aqua':
          return isDark ? 'rgba(26, 53, 58, 0.72)' : 'rgba(209, 250, 255, 0.72)';
        case 'peony':
          return isDark ? 'rgba(58, 30, 53, 0.72)' : 'rgba(252, 208, 248, 0.72)';
        case 'cottonCandy':
          return isDark ? 'rgba(61, 32, 64, 0.72)' : 'rgba(252, 231, 254, 0.72)';
        default:
          return isDark ? 'rgba(36, 42, 69, 0.72)' : 'rgba(231, 236, 255, 0.75)';
      }
    }
    switch (tone) {
      case 'mint':
        return colors.mint;
      case 'sky':
        return colors.sky;
      case 'apricot':
        return isDark ? colors.apricot : '#FFE8D6';
      case 'lavender':
        return colors.lavender;
      case 'periwinkle':
        return colors.periwinkle;
      case 'aqua':
        return colors.aqua;
      case 'peony':
        return colors.peony;
      case 'cottonCandy':
        return isDark ? colors.cottonCandy : '#FCE7FE';
      default:
        return colors.periwinkle;
    }
  };

  const glassBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.75)';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: getToneBg(),
          borderColor: liquidGlass ? glassBorder : (isDark ? colors.border : 'rgba(0, 0, 0, 0.05)'),
          borderWidth: 1,
        },
        liquidGlass
          ? (isDark ? shadow.liquidGlassDark : shadow.liquidGlass)
          : (isDark ? shadow.cardDark : shadow.card),
        isWeb && liquidGlass
          ? ({
              backdropFilter: 'blur(22px) saturate(190%)',
              WebkitBackdropFilter: 'blur(22px) saturate(190%)',
            } as any)
          : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function LiquidSheenBeam({ style }: { style?: ViewStyle }) {
  const sheenAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sheenAnim, {
          toValue: 2,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.delay(1600),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateX = sheenAnim.interpolate({
    inputRange: [-1, 2],
    outputRange: [-200, 600],
  });

  return (
    <View style={[styles.sheenContainer, style]} pointerEvents="none">
      <Animated.View
        style={[
          styles.sheenBeam,
          {
            transform: [{ translateX }, { rotate: '25deg' }],
          },
        ]}
      />
    </View>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.sectionLabel, { color: colors.inkMuted }]} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function StatusPill({
  label,
  tone = 'mint',
  icon,
}: {
  label: string;
  tone?: 'mint' | 'sky' | 'apricot' | 'lavender' | 'periwinkle' | 'peony' | 'violet' | 'forest';
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const { colors, isDark } = useTheme();

  let bg = colors.mint;
  let textColor = isDark ? '#E5E7EB' : '#14532D';

  if (tone === 'violet') {
    bg = isDark ? 'rgba(97, 97, 255, 0.25)' : '#DBDBFF';
    textColor = isDark ? '#C7D2FE' : '#4338CA';
  } else if (tone === 'sky') {
    bg = colors.sky;
    textColor = isDark ? '#E0F2FE' : '#0369A1';
  } else if (tone === 'apricot') {
    bg = isDark ? colors.apricot : '#FFE4D6';
    textColor = isDark ? '#FED7AA' : '#C2410C';
  } else if (tone === 'peony') {
    bg = colors.peony;
    textColor = isDark ? '#FCE7F3' : '#BE185D';
  } else if (tone === 'lavender') {
    bg = colors.lavender;
    textColor = isDark ? '#EDE9FE' : '#6D28D9';
  } else if (tone === 'periwinkle') {
    bg = colors.periwinkle;
    textColor = isDark ? '#E0E7FF' : '#3730A3';
  } else if (tone === 'forest') {
    bg = isDark ? 'rgba(42, 92, 78, 0.35)' : '#D1FAE5';
    textColor = isDark ? '#6EE7B7' : '#065F46';
  }

  return (
    <View style={[styles.statusPill, { backgroundColor: bg }]}>
      {icon ? <Ionicons name={icon} size={11} color={textColor} style={{ marginRight: 3 }} /> : null}
      <Text style={[styles.statusPillText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  icon = 'file-tray-outline',
  title,
  description,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty} accessible accessibilityRole="text" accessibilityLabel={`${title}. ${description}`}>
      <View style={[styles.emptyIconWrap, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={26} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.ink }]}>{title}</Text>
      <Text style={[styles.emptyDescription, { color: colors.inkMuted }]}>{description}</Text>
    </View>
  );
}

export function ErrorState({
  title = 'Gagal memuat data',
  description = 'Cek koneksi internet kamu, terus coba lagi.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty} accessible accessibilityRole="alert" accessibilityLabel={`${title}. ${description}`}>
      <View style={[styles.emptyIconWrap, { backgroundColor: colors.expenseBg }]}>
        <Ionicons name="cloud-offline-outline" size={26} color={colors.expense} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.ink }]}>{title}</Text>
      <Text style={[styles.emptyDescription, { color: colors.inkMuted }]}>{description}</Text>
      <TouchableOpacity
        onPress={onRetry}
        style={[styles.retryButton, { borderColor: colors.primary, backgroundColor: colors.surface }]}
        accessibilityRole="button"
        accessibilityLabel="Coba lagi"
      >
        <Ionicons name="refresh" size={14} color={colors.primary} />
        <Text style={[styles.retryText, { color: colors.primary }]}>Coba lagi</Text>
      </TouchableOpacity>
    </View>
  );
}

export function PhaseBadge({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: colors.accent }]}>
      <Text style={[styles.badgeText, { color: colors.primaryDark }]}>{label}</Text>
    </View>
  );
}

export function Chip({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      {icon ? <Ionicons name={icon} size={14} color={selected ? '#FFFFFF' : colors.inkMuted} /> : null}
      <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : colors.ink }]}>{label}</Text>
    </TouchableOpacity>
  );
}

type ButtonVariant = 'primary' | 'accent' | 'outlined' | 'ghost';

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;
  const textColor =
    variant === 'ghost'
      ? colors.primary
      : variant === 'outlined'
      ? colors.ink
      : variant === 'accent'
      ? colors.primaryDark
      : '#FFFFFF';

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 24,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.88}
        style={[
          styles.button,
          variant === 'primary' && {
            backgroundColor: colors.primary,
            ...shadow.button,
            ...(Platform.OS === 'web'
              ? ({
                  boxShadow: '0 8px 24px rgba(97, 97, 255, 0.38), inset 0 1px 1px rgba(255, 255, 255, 0.55)',
                } as any)
              : {}),
          },
          variant === 'accent' && { backgroundColor: colors.accent, ...shadow.button },
          variant === 'outlined' && {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.border,
          },
          variant === 'ghost' && styles.buttonGhost,
          isDisabled && styles.buttonDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
      >
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <View style={styles.buttonContent}>
            {icon ? <Ionicons name={icon} size={18} color={textColor} /> : null}
            <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export function InputField({
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'sentences',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  const { colors, isDark } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View
      style={[
        styles.inputWrapper,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.92)',
          borderColor: focused
            ? colors.primary
            : isDark
            ? 'rgba(255, 255, 255, 0.14)'
            : 'rgba(208, 212, 228, 0.85)',
        },
        focused && Platform.OS === 'web'
          ? ({
              boxShadow: '0 0 0 3.5px rgba(97, 97, 255, 0.25)',
            } as any)
          : null,
      ]}
    >
      <Ionicons name={icon} size={19} color={focused ? colors.primary : colors.inkMuted} />
      <TextInput
        style={[styles.inputField, { color: colors.ink }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMuted}
        secureTextEntry={hidden}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={placeholder}
      />
      {secureTextEntry ? (
        <TouchableOpacity
          onPress={() => setHidden((h) => !h)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Tampilkan password' : 'Sembunyikan password'}
        >
          <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={19} color={colors.inkMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.cards,
    padding: spacing.md,
  },
  sheenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderRadius: radius.cards,
    zIndex: 1,
  },
  sheenBeam: {
    position: 'absolute',
    top: -100,
    width: 140,
    height: 480,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    ...(Platform.OS === 'web'
      ? ({
          filter: 'blur(18px)',
          WebkitFilter: 'blur(18px)',
        } as any)
      : {}),
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.badges,
    alignSelf: 'flex-start',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.xs },
  emptyDescription: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.buttons,
    borderWidth: 1,
  },
  retryText: { fontWeight: '700', fontSize: 13 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.badges,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.buttons,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  button: {
    borderRadius: radius.buttons,
    paddingVertical: 13,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonGhost: { backgroundColor: 'transparent' },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { fontWeight: '600', fontSize: 15 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    height: 52,
    borderWidth: 1.5,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    height: '100%',
    ...(Platform.OS === 'web'
      ? ({
          outline: 'none',
          outlineStyle: 'none',
          outlineWidth: 0,
        } as any)
      : {}),
  },
});
