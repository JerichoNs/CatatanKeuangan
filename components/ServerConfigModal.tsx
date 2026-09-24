import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { radius, spacing } from '../constants/theme';
import {
  getApiUrls,
  setApiUrls,
  testConnection,
  DEFAULT_LAN_IP,
  RAILWAY_API_URL,
} from '../services/api';

interface ServerConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

type PresetKey = 'railway' | 'localhost' | 'lan' | 'emulator';

interface PresetItem {
  key: PresetKey;
  title: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
  publicUrl: string;
  adminUrl: string;
  badge: string;
}

const PRESETS: PresetItem[] = [
  {
    key: 'railway',
    title: 'Cloud Railway',
    sub: 'Production API',
    icon: 'cloud-done-outline',
    publicUrl: RAILWAY_API_URL,
    adminUrl: RAILWAY_API_URL,
    badge: 'Rekomendasi',
  },
  {
    key: 'localhost',
    title: 'PC / Web',
    sub: 'localhost:8000',
    icon: 'laptop-outline',
    publicUrl: 'http://localhost:8000/api',
    adminUrl: 'http://localhost:8001/api',
    badge: 'Dev Lokal',
  },
  {
    key: 'lan',
    title: 'HP / Wi-Fi LAN',
    sub: `${DEFAULT_LAN_IP}:8000`,
    icon: 'phone-portrait-outline',
    publicUrl: `http://${DEFAULT_LAN_IP}:8000/api`,
    adminUrl: `http://${DEFAULT_LAN_IP}:8001/api`,
    badge: 'Jaringan Wi-Fi',
  },
  {
    key: 'emulator',
    title: 'Android Emulator',
    sub: '10.0.2.2:8000',
    icon: 'logo-android',
    publicUrl: 'http://10.0.2.2:8000/api',
    adminUrl: 'http://10.0.2.2:8001/api',
    badge: 'Virtual Device',
  },
];

export function ServerConfigModal({ visible, onClose }: ServerConfigModalProps) {
  const { colors, isDark } = useTheme();

  const [publicUrl, setPublicUrl] = useState('');
  const [adminUrl, setAdminUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [publicStatus, setPublicStatus] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [adminStatus, setAdminStatus] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      (async () => {
        const urls = await getApiUrls();
        setPublicUrl(urls.publicUrl);
        setAdminUrl(urls.adminUrl);
        setPublicStatus('idle');
        setAdminStatus('idle');
        setSavedSuccess(false);
        setTestMessage(null);
      })();
    }
  }, [visible]);

  const activePreset = PRESETS.find(
    (p) => p.publicUrl.toLowerCase() === publicUrl.trim().toLowerCase()
  )?.key;

  const applyPreset = (preset: PresetItem) => {
    setPublicUrl(preset.publicUrl);
    setAdminUrl(preset.adminUrl);
    setPublicStatus('idle');
    setAdminStatus('idle');
    setTestMessage(null);
  };

  const handleSyncAdminToPublic = () => {
    setAdminUrl(publicUrl);
    setAdminStatus('idle');
  };

  const handleTest = async () => {
    if (!publicUrl.trim() && !adminUrl.trim()) return;
    setTesting(true);
    setPublicStatus('idle');
    setAdminStatus('idle');
    setTestMessage(null);

    const [isPublicOk, isAdminOk] = await Promise.all([
      testConnection(publicUrl),
      testConnection(adminUrl),
    ]);

    setPublicStatus(isPublicOk ? 'ok' : 'fail');
    setAdminStatus(isAdminOk ? 'ok' : 'fail');
    setTesting(false);

    if (isPublicOk && isAdminOk) {
      setTestMessage('Sukses! Semua endpoint server berhasil terhubung.');
    } else if (isPublicOk || isAdminOk) {
      setTestMessage('Sebagian endpoint berhasil, namun ada port yang belum merespons.');
    } else {
      setTestMessage('Koneksi gagal. Pastikan alamat IP, port, atau backend server aktif.');
    }
  };

  const handleSave = async () => {
    await setApiUrls(publicUrl, adminUrl);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.modalContent,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleRow}>
              <View
                style={[
                  styles.headerIconWrap,
                  { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)' },
                ]}
              >
                <Ionicons name="server-outline" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.ink }]}>
                  Konfigurasi Server & IP
                </Text>
                <Text style={[styles.headerSub, { color: colors.inkMuted }]}>
                  Atur Endpoint API Publik & Admin
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.inkMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Quick Presets Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionLabel, { color: colors.inkMuted }]}>PRESET CEPAT</Text>
              <Text style={[styles.sectionHint, { color: colors.inkMuted }]}>
                Pilih lingkungan server
              </Text>
            </View>

            <View style={styles.presetGrid}>
              {PRESETS.map((preset) => {
                const isSelected = activePreset === preset.key;
                return (
                  <TouchableOpacity
                    key={preset.key}
                    style={[
                      styles.presetCard,
                      {
                        backgroundColor: isSelected
                          ? (isDark ? 'rgba(59, 130, 246, 0.16)' : 'rgba(37, 99, 235, 0.08)')
                          : (isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)'),
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                    onPress={() => applyPreset(preset)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.presetCardTop}>
                      <View
                        style={[
                          styles.presetIconWrap,
                          {
                            backgroundColor: isSelected
                              ? colors.primary
                              : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'),
                          },
                        ]}
                      >
                        <Ionicons
                          name={preset.icon}
                          size={15}
                          color={isSelected ? '#FFFFFF' : colors.ink}
                        />
                      </View>
                      {isSelected ? (
                        <View style={[styles.activeCheckBadge, { backgroundColor: colors.primary }]}>
                          <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                        </View>
                      ) : (
                        <Text style={[styles.presetBadgeText, { color: colors.inkMuted }]}>
                          {preset.badge}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.presetTitle,
                        { color: isSelected ? colors.primary : colors.ink },
                      ]}
                      numberOfLines={1}
                    >
                      {preset.title}
                    </Text>
                    <Text style={[styles.presetSub, { color: colors.inkMuted }]} numberOfLines={1}>
                      {preset.sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Input 1: IP Publik */}
            <View style={styles.fieldBlock}>
              <View style={styles.fieldHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="globe-outline" size={15} color={colors.primary} />
                  <Text style={[styles.fieldLabel, { color: colors.ink }]}>1. IP / URL API Publik</Text>
                </View>
                {publicStatus === 'ok' && (
                  <View style={[styles.badgeOk, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                    <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                    <Text style={[styles.badgeText, { color: '#16A34A' }]}>Terhubung</Text>
                  </View>
                )}
                {publicStatus === 'fail' && (
                  <View style={[styles.badgeFail, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                    <Ionicons name="alert-circle" size={12} color="#DC2626" />
                    <Text style={[styles.badgeText, { color: '#DC2626' }]}>Gagal</Text>
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="link-outline" size={16} color={colors.inkMuted} style={styles.inputLeadingIcon} />
                <TextInput
                  style={[styles.input, { color: colors.ink }]}
                  value={publicUrl}
                  onChangeText={(text) => {
                    setPublicUrl(text);
                    setPublicStatus('idle');
                    setTestMessage(null);
                  }}
                  placeholder="https://catatan-keuangan-api-production.up.railway.app/api"
                  placeholderTextColor={colors.inkMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {publicUrl.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setPublicUrl('');
                      setPublicStatus('idle');
                    }}
                    hitSlop={8}
                    style={styles.inputClearBtn}
                  >
                    <Ionicons name="close-circle" size={16} color={colors.inkMuted} />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={[styles.fieldHint, { color: colors.inkMuted }]}>
                Digunakan untuk login, transaksi, laporan kas & akun umum.
              </Text>
            </View>

            {/* Input 2: IP Admin */}
            <View style={styles.fieldBlock}>
              <View style={styles.fieldHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="shield-checkmark-outline" size={15} color="#F59E0B" />
                  <Text style={[styles.fieldLabel, { color: colors.ink }]}>2. IP / URL API Admin</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {adminUrl !== publicUrl && publicUrl.trim().length > 0 && (
                    <TouchableOpacity
                      style={[
                        styles.syncBtn,
                        {
                          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.14)' : 'rgba(37, 99, 235, 0.08)',
                          borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(37, 99, 235, 0.2)',
                        },
                      ]}
                      onPress={handleSyncAdminToPublic}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="copy-outline" size={11} color={colors.primary} />
                      <Text style={[styles.syncBtnText, { color: colors.primary }]}>Samakan</Text>
                    </TouchableOpacity>
                  )}

                  {adminStatus === 'ok' && (
                    <View style={[styles.badgeOk, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                      <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                      <Text style={[styles.badgeText, { color: '#16A34A' }]}>Terhubung</Text>
                    </View>
                  )}
                  {adminStatus === 'fail' && (
                    <View style={[styles.badgeFail, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                      <Ionicons name="alert-circle" size={12} color="#DC2626" />
                      <Text style={[styles.badgeText, { color: '#DC2626' }]}>Gagal</Text>
                    </View>
                  )}
                </View>
              </View>

              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="shield-outline" size={16} color={colors.inkMuted} style={styles.inputLeadingIcon} />
                <TextInput
                  style={[styles.input, { color: colors.ink }]}
                  value={adminUrl}
                  onChangeText={(text) => {
                    setAdminUrl(text);
                    setAdminStatus('idle');
                    setTestMessage(null);
                  }}
                  placeholder="https://catatan-keuangan-api-production.up.railway.app/api"
                  placeholderTextColor={colors.inkMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {adminUrl.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setAdminUrl('');
                      setAdminStatus('idle');
                    }}
                    hitSlop={8}
                    style={styles.inputClearBtn}
                  >
                    <Ionicons name="close-circle" size={16} color={colors.inkMuted} />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={[styles.fieldHint, { color: colors.inkMuted }]}>
                Digunakan saat membuka Panel Administrator (/admin).
              </Text>
            </View>

            {/* Test Result Message Banner */}
            {testMessage && (
              <View
                style={[
                  styles.testMessageBanner,
                  {
                    backgroundColor:
                      publicStatus === 'ok' && adminStatus === 'ok'
                        ? 'rgba(34, 197, 94, 0.1)'
                        : 'rgba(239, 68, 68, 0.1)',
                    borderColor:
                      publicStatus === 'ok' && adminStatus === 'ok'
                        ? 'rgba(34, 197, 94, 0.3)'
                        : 'rgba(239, 68, 68, 0.3)',
                  },
                ]}
              >
                <Ionicons
                  name={publicStatus === 'ok' && adminStatus === 'ok' ? 'checkmark-circle' : 'alert-circle'}
                  size={16}
                  color={publicStatus === 'ok' && adminStatus === 'ok' ? '#16A34A' : '#DC2626'}
                />
                <Text
                  style={[
                    styles.testMessageText,
                    { color: publicStatus === 'ok' && adminStatus === 'ok' ? '#16A34A' : '#DC2626' },
                  ]}
                >
                  {testMessage}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.testBtn,
                {
                  borderColor: colors.border,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                },
              ]}
              onPress={handleTest}
              disabled={testing}
              activeOpacity={0.7}
            >
              {testing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Ionicons name="pulse" size={16} color={colors.primary} />
                  <Text style={[styles.testBtnText, { color: colors.primary }]}>Tes Koneksi</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: savedSuccess ? '#10B981' : colors.primary },
              ]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Ionicons
                name={savedSuccess ? 'checkmark-circle' : 'save-outline'}
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.saveBtnText}>
                {savedSuccess ? 'Tersimpan!' : 'Simpan'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 490,
    maxHeight: '92%',
    borderRadius: radius.cards,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    paddingVertical: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  sectionHint: {
    fontSize: 11,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  presetCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: radius.md,
    borderWidth: 1.5,
    padding: 10,
  },
  presetCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  presetIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCheckBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetBadgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  presetTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  presetSub: {
    fontSize: 10,
    marginTop: 1,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.badges,
    borderWidth: 1,
  },
  syncBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeOk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.badges,
  },
  badgeFail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.badges,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.inputs,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  inputLeadingIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 0,
  },
  inputClearBtn: {
    padding: 4,
    marginLeft: 4,
  },
  fieldHint: {
    fontSize: 11,
    marginTop: 4,
  },
  testMessageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: radius.inputs,
    borderWidth: 1,
    marginBottom: 10,
  },
  testMessageText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  testBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.buttons,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: radius.buttons,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
