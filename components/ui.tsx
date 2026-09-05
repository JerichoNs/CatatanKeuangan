import { useState, type ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  KeyboardTypeOptions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, radius, shadow } from '../constants/theme';

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? colors.border : '#EAEFF8',
          borderWidth: 1,
        },
        style,
      ]}
    >
      {children}
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
        style={[styles.retryButton, { borderColor: colors.primary }]}
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

type ButtonVariant = 'primary' | 'accent' | 'ghost';

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
  const isDisabled = disabled || loading;
  const textColor = variant === 'ghost' ? colors.primary : variant === 'accent' ? colors.primaryDark : '#FFFFFF';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.button,
        variant === 'primary' && { backgroundColor: colors.primary, ...shadow.button },
        variant === 'accent' && { backgroundColor: colors.accent, ...shadow.button },
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
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View
      style={[
        styles.inputWrapper,
        {
          backgroundColor: colors.surface,
          borderColor: focused ? colors.primary : colors.border,
        },
      ]}
    >
      <Ionicons name={icon} size={18} color={focused ? colors.primary : colors.inkMuted} />
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
          <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.inkMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
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
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  retryText: { fontWeight: '700', fontSize: 13 },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  button: {
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonGhost: { backgroundColor: 'transparent' },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { fontWeight: '700', fontSize: 16 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
    borderWidth: 1.5,
    ...shadow.card,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
});
