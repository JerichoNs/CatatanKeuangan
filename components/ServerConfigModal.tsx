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
} from '../services/api';

interface ServerConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ServerConfigModal({ visible, onClose }: ServerConfigModalProps) {
  const { colors, isDark } = useTheme();

  const [publicUrl, setPublicUrl] = useState('');
  const [adminUrl, setAdminUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [publicStatus, setPublicStatus] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [adminStatus, setAdminStatus] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (visible) {
      (async () => {
        const urls = await getApiUrls();
        setPublicUrl(urls.publicUrl);
        setAdminUrl(urls.adminUrl);
        setPublicStatus('idle');
        setAdminStatus('idle');
        setSavedSuccess(false);
      })();
    }
  }, [visible]);

  const applyPreset = (host: string) => {
    setPublicUrl(`http://${host}:8000/api`);
    setAdminUrl(`http://${host}:8001/api`);
    setPublicStatus('idle');
    setAdminStatus('idle');
  };

  const handleTest = async () => {
    setTesting(true);
    setPublicStatus('idle');
    setAdminStatus('idle');

    const [isPublicOk, isAdminOk] = await Promise.all([
      testConnection(publicUrl),
      testConnection(adminUrl),
    ]);

    setPublicStatus(isPublicOk ? 'ok' : 'fail');
    setAdminStatus(isAdminOk ? 'ok' : 'fail');
    setTesting(false);
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
              <View style={[styles.headerIconWrap, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="server-outline" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.ink }]}>Konfigurasi Server & IP</Text>
                <Text style={[styles.headerSub, { color: colors.inkMuted }]}>
                  Atur IP Publik & IP Admin
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.inkMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Quick Presets */}
            <Text style={[styles.sectionLabel, { color: colors.inkMuted }]}>PRESET CEPAT:</Text>
            <View style={styles.presetRow}>
              <TouchableOpacity
                style={[styles.presetBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                onPress={() => applyPreset(DEFAULT_LAN_IP)}
              >
                <Ionicons name="phone-portrait-outline" size={14} color={colors.primary} />
                <Text style={[styles.presetText, { color: colors.ink }]}>HP / LAN ({DEFAULT_LAN_IP})</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                onPress={() => applyPreset('localhost')}
              >
                <Ionicons name="laptop-outline" size={14} color={colors.primary} />
                <Text style={[styles.presetText, { color: colors.ink }]}>PC / Web (localhost)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                onPress={() => applyPreset('10.0.2.2')}
              >
                <Ionicons name="logo-android" size={14} color={colors.primary} />
                <Text style={[styles.presetText, { color: colors.ink }]}>Emulator (10.0.2.2)</Text>
              </TouchableOpacity>
            </View>

            {/* Input IP Publik */}
            <View style={styles.fieldBlock}>
              <View style={styles.fieldHeader}>
                <Text style={[styles.fieldLabel, { color: colors.ink }]}>1. IP / URL API Publik</Text>
                {publicStatus === 'ok' && (
                  <View style={[styles.badgeOk, { backgroundColor: colors.incomeBg }]}>
                    <Ionicons name="checkmark-circle" size={12} color={colors.income} />
                    <Text style={[styles.badgeText, { color: colors.income }]}>Terhubung</Text>
                  </View>
                )}
                {publicStatus === 'fail' && (
                  <View style={[styles.badgeFail, { backgroundColor: colors.expenseBg }]}>
                    <Ionicons name="alert-circle" size={12} color={colors.expense} />
                    <Text style={[styles.badgeText, { color: colors.expense }]}>Gagal</Text>
                  </View>
                )}
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                    color: colors.ink,
                  },
                ]}
                value={publicUrl}
                onChangeText={(text) => {
                  setPublicUrl(text);
                  setPublicStatus('idle');
                }}
                placeholder="http://192.168.1.6:8000/api"
                placeholderTextColor={colors.inkMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={[styles.fieldHint, { color: colors.inkMuted }]}>
                Digunakan untuk login, transaksi, laporan & akun user umum.
              </Text>
            </View>

            {/* Input IP Admin */}
            <View style={styles.fieldBlock}>
              <View style={styles.fieldHeader}>
                <Text style={[styles.fieldLabel, { color: colors.ink }]}>2. IP / URL API Admin</Text>
                {adminStatus === 'ok' && (
                  <View style={[styles.badgeOk, { backgroundColor: colors.incomeBg }]}>
                    <Ionicons name="checkmark-circle" size={12} color={colors.income} />
                    <Text style={[styles.badgeText, { color: colors.income }]}>Terhubung</Text>
                  </View>
                )}
                {adminStatus === 'fail' && (
                  <View style={[styles.badgeFail, { backgroundColor: colors.expenseBg }]}>
                    <Ionicons name="alert-circle" size={12} color={colors.expense} />
                    <Text style={[styles.badgeText, { color: colors.expense }]}>Gagal</Text>
                  </View>
                )}
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                    color: colors.ink,
                  },
                ]}
                value={adminUrl}
                onChangeText={(text) => {
                  setAdminUrl(text);
                  setAdminStatus('idle');
                }}
                placeholder="http://192.168.1.6:8001/api"
                placeholderTextColor={colors.inkMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={[styles.fieldHint, { color: colors.inkMuted }]}>
                Digunakan saat membuka Panel Admin (`/admin`).
              </Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.testBtn, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
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
                { backgroundColor: savedSuccess ? colors.income : colors.primary },
              ]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Ionicons
                name={savedSuccess ? 'checkmark' : 'save-outline'}
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '90%',
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingVertical: spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  presetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
  },
  fieldBlock: {
    marginBottom: spacing.md,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  badgeOk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeFail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  input: {
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 13,
    fontWeight: '600',
  },
  fieldHint: {
    fontSize: 11,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  testBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
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
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
