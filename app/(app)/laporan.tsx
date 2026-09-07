import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import { spacing, radius, shadow } from '../../constants/theme';
import { Card, SectionLabel, EmptyState, ErrorState } from '../../components/ui';
import { CalendarModal } from '../../components/CalendarModal';
import { ScreenTransitionWrapper } from '../../components/ScreenTransitionWrapper';
import { currentMonthKey, formatBulanTahun, monthKey, shiftMonth } from '../../utils/date';
import { iconForCategory } from '../../constants/categories';
import type { Transaction } from '../../types';
import { useFocusEffect } from 'expo-router';

function formatRupiah(value: number) {
  return 'Rp' + Math.round(Math.abs(value)).toLocaleString('id-ID');
}

export default function LaporanScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [month, setMonth] = useState(currentMonthKey());
  const [exporting, setExporting] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setError(false);
    setLoading(true);
    try {
      const data = await api.get<Transaction[]>('/transactions');
      setTransactions(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [fetchTransactions])
  );

  const monthTransactions = useMemo(
    () => transactions.filter((t) => monthKey(t.date) === month),
    [transactions, month]
  );
  const totalIncome = monthTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = monthTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net = totalIncome - totalExpense;

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
    return Array.from(map.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthTransactions]);

  const maxCategoryAmount = byCategory[0]?.amount ?? 0;
  const isCurrentOrFutureMonth = month >= currentMonthKey();

  const handleExportPdf = async () => {
    if (monthTransactions.length === 0) {
      Alert.alert('Belum ada data', 'Tidak ada transaksi pada bulan ini untuk diekspor.');
      return;
    }
    setExporting(true);
    try {
      const rows = monthTransactions
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((t, index) => {
          const isIncome = t.type === 'income';
          const color = isIncome ? '#16A34A' : '#DC2626';
          const sign = isIncome ? '+' : '-';
          const bg = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
          return `<tr style="background-color: ${bg};">
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-size: 12px; color: #475569;">${t.date}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-weight: 600; font-size: 12px; color: #1E293B;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; background: ${isIncome ? '#DCFCE7' : '#FEE2E2'}; color: ${isIncome ? '#15803D' : '#991B1B'}; font-weight: 700;">
                ${t.category}
              </span>
            </td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-size: 12px; color: #64748B;">${t.note || '-'}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; text-align: right; font-weight: 800; font-size: 12px; color: ${color};">
              ${sign}Rp ${t.amount.toLocaleString('id-ID')}
            </td>
          </tr>`;
        })
        .join('');

      const categoryRows = byCategory
        .map((c) => {
          const pct = totalExpense > 0 ? Math.round((c.amount / totalExpense) * 100) : 0;
          return `<tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0; font-weight: 600; font-size: 12px;">${c.category}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #64748B;">${pct}%</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #E2E8F0; text-align: right; font-weight: 700; font-size: 12px; color: #DC2626;">Rp ${c.amount.toLocaleString('id-ID')}</td>
          </tr>`;
        })
        .join('');

      const printDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const html = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="utf-8" />
          <title>Laporan Keuangan - ${formatBulanTahun(month)}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 14mm 16mm;
            }
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #0F172A;
              background: #FFFFFF;
              margin: 0;
              padding: 24px;
              font-size: 12px;
              line-height: 1.5;
            }
            .report-box {
              max-width: 820px;
              margin: 0 auto;
            }
            /* Header */
            .header-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #2563EB;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            .brand-title {
              font-size: 20px;
              font-weight: 900;
              color: #1E3A8A;
              margin: 0 0 2px 0;
              letter-spacing: -0.4px;
            }
            .brand-sub {
              font-size: 12px;
              color: #64748B;
              font-weight: 500;
            }
            .report-meta {
              text-align: right;
            }
            .meta-pill {
              display: inline-block;
              background: #EFF6FF;
              color: #1E40AF;
              border: 1px solid #BFDBFE;
              font-size: 11px;
              font-weight: 800;
              padding: 4px 10px;
              border-radius: 999px;
              margin-bottom: 4px;
            }
            .meta-info {
              font-size: 11px;
              color: #64748B;
            }

            /* KPI Cards */
            .kpi-grid {
              display: flex;
              gap: 12px;
              margin-bottom: 24px;
            }
            .kpi-card {
              flex: 1;
              border: 1px solid #E2E8F0;
              border-radius: 10px;
              padding: 12px 14px;
              background: #F8FAFC;
            }
            .kpi-income { border-left: 4px solid #16A34A; }
            .kpi-expense { border-left: 4px solid #DC2626; }
            .kpi-net { border-left: 4px solid #2563EB; background: #F0F7FF; }
            .kpi-label {
              font-size: 10px;
              font-weight: 800;
              color: #64748B;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .kpi-value {
              font-size: 18px;
              font-weight: 800;
              letter-spacing: -0.4px;
            }
            .text-income { color: #16A34A; }
            .text-expense { color: #DC2626; }
            .text-net { color: #1E40AF; }

            /* Section */
            .section-header {
              font-size: 13px;
              font-weight: 800;
              color: #1E293B;
              margin: 20px 0 8px 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background: #F1F5F9;
              color: #475569;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              padding: 8px 12px;
              border-top: 1px solid #E2E8F0;
              border-bottom: 1px solid #CBD5E1;
              text-align: left;
            }
            .footer-wrap {
              margin-top: 32px;
              border-top: 1px solid #E2E8F0;
              padding-top: 14px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              color: #94A3B8;
            }
          </style>
        </head>
        <body>
          <div class="report-box">
            <div class="header-row">
              <div>
                <div class="brand-title">Catatan Keuangan</div>
                <div class="brand-sub">Laporan Arus Kas Bulanan Resmi</div>
              </div>
              <div class="report-meta">
                <div class="meta-pill">PERIODE: ${formatBulanTahun(month).toUpperCase()}</div>
                <div class="meta-info">Pemilik Akun: <b>${user?.name || '-'}</b></div>
                <div class="meta-info">Dicetak pada: ${printDate}</div>
              </div>
            </div>

            <div class="kpi-grid">
              <div class="kpi-card kpi-income">
                <div class="kpi-label">Total Pemasukan</div>
                <div class="kpi-value text-income">Rp ${totalIncome.toLocaleString('id-ID')}</div>
              </div>
              <div class="kpi-card kpi-expense">
                <div class="kpi-label">Total Pengeluaran</div>
                <div class="kpi-value text-expense">Rp ${totalExpense.toLocaleString('id-ID')}</div>
              </div>
              <div class="kpi-card kpi-net">
                <div class="kpi-label">Saldo Bersih (Net)</div>
                <div class="kpi-value text-net">${net >= 0 ? '+' : '-'}Rp ${Math.abs(net).toLocaleString('id-ID')}</div>
              </div>
            </div>

            ${byCategory.length > 0 ? `
              <div class="section-header">Distribusi Pengeluaran per Kategori</div>
              <table>
                <thead>
                  <tr>
                    <th>Kategori Belanja</th>
                    <th style="text-align: center;">Porsi (%)</th>
                    <th style="text-align: right;">Total Pengeluaran</th>
                  </tr>
                </thead>
                <tbody>
                  ${categoryRows}
                </tbody>
              </table>
            ` : ''}

            <div class="section-header">Rincian Riwayat Transaksi</div>
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Kategori</th>
                  <th>Catatan / Keterangan</th>
                  <th style="text-align: right;">Jumlah Nominal</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>

            <div class="footer-wrap">
              <div>Sistem Informasi Catatan Keuangan • Dokumen Digital Sah</div>
              <div>Status: ${net >= 0 ? 'Surplus Finansial' : 'Defisit Kas'}</div>
            </div>
          </div>
        </body>
        </html>
      `;

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // Pada web: Buka jendela popup cetak bersih yang hanya memuat dokumen A4 di atas
        const printWindow = window.open('', '_blank', 'width=850,height=900');
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 350);
          return;
        }
      }

      // Native fallback (iOS / Android)
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Laporan Keuangan ${month}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        await Print.printAsync({ html });
      }
    } catch (err: any) {
      console.error('Export PDF error:', err);
      Alert.alert('Gagal export', err?.message || 'Coba lagi beberapa saat lagi.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScreenTransitionWrapper>
      <ScrollView
        style={[styles.flex, { backgroundColor: 'transparent' }]}
        contentContainerStyle={[
          styles.container,
          {
            maxWidth: isDesktop ? 1160 : 540,
            paddingHorizontal: isDesktop ? 28 : 16,
            paddingBottom: isDesktop ? 110 : 85,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
      {/* 1. Header Bar */}
      <View style={[styles.headerRow, isDesktop ? styles.headerRowDesktop : null]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.ink }]}>Laporan Keuangan</Text>
          <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
            Analisis arus kas bulanan, pos belanja, dan ekspor dokumen PDF resmi.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.calendarIconButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => setCalendarVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar" size={17} color={colors.primary} />
          <Text style={[styles.calendarBtnText, { color: colors.primary }]}>Pilih Bulan</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Month Navigator Card */}
      <View style={[styles.monthCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => setMonth((m) => shiftMonth(m, -1))}
          hitSlop={8}
          style={[styles.monthArrow, { backgroundColor: colors.surfaceAlt }]}
        >
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.monthCenter}
          onPress={() => setCalendarVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.monthLabel, { color: colors.ink }]}>{formatBulanTahun(month)}</Text>
          <View style={styles.monthTag}>
            <Ionicons name="calendar-outline" size={12} color={colors.primary} />
            <Text style={[styles.monthTagText, { color: colors.primary }]}>Lompat Periode</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMonth((m) => shiftMonth(m, 1))}
          disabled={isCurrentOrFutureMonth}
          hitSlop={8}
          style={[
            styles.monthArrow,
            { backgroundColor: isCurrentOrFutureMonth ? 'transparent' : colors.surfaceAlt },
          ]}
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color={isCurrentOrFutureMonth ? colors.border : colors.primary}
          />
        </TouchableOpacity>
      </View>

      {error ? (
        <Card>
          <ErrorState onRetry={fetchTransactions} />
        </Card>
      ) : (
        <>
          {/* 3. Rekap Arus Kas (3 KPI Cards) */}
          <SectionLabel>Ringkasan Arus Kas</SectionLabel>
          <View style={isDesktop ? styles.kpiRowDesktop : styles.kpiRowMobile}>
            {/* Pemasukan */}
            <View
              style={[
                styles.kpiCard,
                { backgroundColor: colors.surface, borderColor: 'rgba(34, 197, 94, 0.25)' },
                isDark ? shadow.cardDark : shadow.card,
              ]}
            >
              <View style={styles.kpiHeader}>
                <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.12)' }]}>
                  <Ionicons name="arrow-down" size={18} color="#16A34A" />
                </View>
                <Text style={[styles.kpiCardLabel, { color: colors.inkMuted }]}>PEMASUKAN</Text>
              </View>
              <Text style={[styles.kpiCardValue, { color: '#16A34A' }]}>
                {formatRupiah(totalIncome)}
              </Text>
              <Text style={[styles.kpiCardHint, { color: colors.inkMuted }]}>
                Total kas masuk bulan ini
              </Text>
            </View>

            {/* Pengeluaran */}
            <View
              style={[
                styles.kpiCard,
                { backgroundColor: colors.surface, borderColor: 'rgba(239, 68, 68, 0.25)' },
                isDark ? shadow.cardDark : shadow.card,
              ]}
            >
              <View style={styles.kpiHeader}>
                <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                  <Ionicons name="arrow-up" size={18} color="#DC2626" />
                </View>
                <Text style={[styles.kpiCardLabel, { color: colors.inkMuted }]}>PENGELUARAN</Text>
              </View>
              <Text style={[styles.kpiCardValue, { color: '#DC2626' }]}>
                {formatRupiah(totalExpense)}
              </Text>
              <Text style={[styles.kpiCardHint, { color: colors.inkMuted }]}>
                Total biaya & belanja keluar
              </Text>
            </View>

            {/* Saldo Bersih */}
            <View
              style={[
                styles.kpiCard,
                { backgroundColor: colors.surface, borderColor: 'rgba(59, 130, 246, 0.25)' },
                isDark ? shadow.cardDark : shadow.card,
              ]}
            >
              <View style={styles.kpiHeader}>
                <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                  <Ionicons name="wallet-outline" size={18} color={colors.primary} />
                </View>
                <View
                  style={[
                    styles.statusChip,
                    { backgroundColor: net >= 0 ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)' },
                  ]}
                >
                  <Text style={[styles.statusChipText, { color: net >= 0 ? '#16A34A' : '#DC2626' }]}>
                    {net >= 0 ? 'Surplus' : 'Defisit'}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.kpiCardValue,
                  { color: net >= 0 ? '#16A34A' : '#DC2626' },
                ]}
              >
                {net < 0 ? '-' : '+'}{formatRupiah(net)}
              </Text>
              <Text style={[styles.kpiCardHint, { color: colors.inkMuted }]}>
                Saldo bersih periode ini
              </Text>
            </View>
          </View>

          {/* 4. Desktop 2-Column Section: Kategori Belanja & Alat Ekspor PDF */}
          <View style={isDesktop ? styles.twoColDesktop : styles.twoColMobile}>
            {/* Kolom Kiri: Breakdown Pengeluaran */}
            <View style={isDesktop ? styles.colFlex1 : styles.colFull}>
              <SectionLabel>Pengeluaran per Kategori</SectionLabel>
              <View
                style={[
                  styles.sectionBox,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  isDark ? shadow.cardDark : shadow.card,
                ]}
              >
                {byCategory.length === 0 ? (
                  <View style={styles.emptyCatWrap}>
                    <Ionicons name="pie-chart-outline" size={36} color={colors.inkMuted} />
                    <Text style={[styles.emptyCatTitle, { color: colors.ink }]}>
                      Belum ada pengeluaran
                    </Text>
                    <Text style={[styles.emptyCatDesc, { color: colors.inkMuted }]}>
                      Grafik pos belanja akan tampil otomatis setelah ada transaksi pengeluaran bulan ini.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.categoryList}>
                    {byCategory.map((c) => {
                      const pct = totalExpense > 0 ? Math.round((c.amount / totalExpense) * 100) : 0;
                      const barWidth = maxCategoryAmount > 0 ? (c.amount / maxCategoryAmount) * 100 : 0;
                      const iconName = iconForCategory(c.category);
                      return (
                        <View key={c.category} style={styles.categoryRow}>
                          <View style={styles.catTopLine}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <View style={[styles.catIconWrap, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                                <Ionicons name={iconName as any} size={15} color="#DC2626" />
                              </View>
                              <Text style={[styles.catName, { color: colors.ink }]}>{c.category}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                              <Text style={[styles.catAmount, { color: colors.ink }]}>{formatRupiah(c.amount)}</Text>
                              <Text style={[styles.catPct, { color: colors.inkMuted }]}>{pct}% dari total</Text>
                            </View>
                          </View>
                          <View style={styles.catTrack}>
                            <View
                              style={[
                                styles.catBar,
                                { width: `${barWidth}%`, backgroundColor: '#DC2626' },
                              ]}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>

            {/* Kolom Kanan: Alat Ekspor PDF */}
            <View style={isDesktop ? styles.colFlex1 : styles.colFull}>
              <SectionLabel>Ekspor Dokumen Laporan</SectionLabel>
              <View
                style={[
                  styles.sectionBox,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  isDark ? shadow.cardDark : shadow.card,
                ]}
              >
                <View style={styles.exportHeaderWrap}>
                  <View style={[styles.exportIconCircle, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name="document-text" size={24} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.exportCardTitle, { color: colors.ink }]}>
                      Dokumen Cetak & PDF Resmi
                    </Text>
                    <Text style={[styles.exportCardSub, { color: colors.inkMuted }]}>
                      Format A4 siap cetak dengan ringkasan eksekutif, tabel transaksi, dan stamp digital.
                    </Text>
                  </View>
                </View>

                {/* Metadata Box */}
                <View
                  style={[
                    styles.docMetaBox,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.docMetaRow}>
                    <Text style={[styles.docMetaLabel, { color: colors.inkMuted }]}>Periode Terpilih</Text>
                    <Text style={[styles.docMetaVal, { color: colors.ink }]}>{formatBulanTahun(month)}</Text>
                  </View>
                  <View style={styles.docMetaRow}>
                    <Text style={[styles.docMetaLabel, { color: colors.inkMuted }]}>Total Transaksi</Text>
                    <Text style={[styles.docMetaVal, { color: colors.ink }]}>{monthTransactions.length} Transaksi</Text>
                  </View>
                  <View style={styles.docMetaRow}>
                    <Text style={[styles.docMetaLabel, { color: colors.inkMuted }]}>Status Kas</Text>
                    <Text
                      style={[
                        styles.docMetaVal,
                        { color: net >= 0 ? '#16A34A' : '#DC2626', fontWeight: '800' },
                      ]}
                    >
                      {net >= 0 ? 'Surplus Finansial' : 'Defisit'}
                    </Text>
                  </View>
                </View>

                {/* Tombol Ekspor PDF */}
                <TouchableOpacity
                  style={[
                    styles.btnExportPdf,
                    { backgroundColor: colors.primary },
                    exporting ? { opacity: 0.7 } : null,
                  ]}
                  onPress={handleExportPdf}
                  disabled={exporting}
                  activeOpacity={0.8}
                >
                  {exporting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="print-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.btnExportPdfText}>Cetak / Unduh Laporan PDF</Text>
                    </>
                  )}
                </TouchableOpacity>
                <Text style={[styles.exportHintNote, { color: colors.inkMuted }]}>
                  *Pada browser, pilih tujuan <b>"Save as PDF"</b> untuk menyimpan dokumen secara digital.
                </Text>
              </View>
            </View>
          </View>

          {/* 5. Detail Tabel Transaksi Bulan Terpilih */}
          <SectionLabel>Daftar Transaksi Bulan Ini ({monthTransactions.length})</SectionLabel>
          <View
            style={[
              styles.sectionBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isDark ? shadow.cardDark : shadow.card,
            ]}
          >
            {monthTransactions.length === 0 ? (
              <EmptyState
                icon="receipt-outline"
                title="Tidak ada transaksi"
                description={`Belum ada data pemasukan atau pengeluaran yang dicatat pada periode ${formatBulanTahun(month)}.`}
              />
            ) : (
              <View style={styles.txTableWrap}>
                {monthTransactions
                  .slice()
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((t, idx) => {
                    const isIncome = t.type === 'income';
                    const iconName = iconForCategory(t.category);
                    return (
                      <View
                        key={t.id}
                        style={[
                          styles.txTableRow,
                          idx < monthTransactions.length - 1 ? { borderBottomColor: colors.border, borderBottomWidth: 1 } : null,
                        ]}
                      >
                        <View
                          style={[
                            styles.txTableIcon,
                            {
                              backgroundColor: isIncome
                                ? 'rgba(34, 197, 94, 0.12)'
                                : 'rgba(239, 68, 68, 0.12)',
                            },
                          ]}
                        >
                          <Ionicons
                            name={iconName as any}
                            size={18}
                            color={isIncome ? '#16A34A' : '#DC2626'}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.txTableTitle, { color: colors.ink }]}>{t.category}</Text>
                            <View
                              style={[
                                styles.typeBadge,
                                { backgroundColor: isIncome ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)' },
                              ]}
                            >
                              <Text style={[styles.typeBadgeText, { color: isIncome ? '#16A34A' : '#DC2626' }]}>
                                {isIncome ? 'Masuk' : 'Keluar'}
                              </Text>
                            </View>
                          </View>
                          <Text style={[styles.txTableSub, { color: colors.inkMuted }]}>
                            {t.date} {t.note ? `• ${t.note}` : ''}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.txTableAmount,
                            { color: isIncome ? '#16A34A' : '#DC2626' },
                          ]}
                        >
                          {isIncome ? '+' : '-'}{formatRupiah(t.amount)}
                        </Text>
                      </View>
                    );
                  })}
              </View>
            )}
          </View>
        </>
      )}

      {/* Calendar Modal */}
      <CalendarModal
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        currentMonth={month}
        selectedDate={null}
        onSelectMonth={(m) => setMonth(m)}
        onSelectDate={() => {}}
      />
    </ScrollView>
    </ScreenTransitionWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    paddingTop: 20,
    width: '100%',
    alignSelf: 'center',
  },

  // Header
  headerRow: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16,
  },
  headerRowDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  calendarIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  calendarBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Month Card
  monthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: 20,
  },
  monthArrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCenter: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  monthTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  monthTagText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // KPI Row
  kpiRowDesktop: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  kpiRowMobile: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  kpiIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  kpiCardValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  kpiCardHint: {
    fontSize: 12,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '800',
  },

  // 2-Col Layout
  twoColDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
    marginBottom: 20,
  },
  twoColMobile: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 16,
  },
  colFlex1: {
    flex: 1,
  },
  colFull: {
    width: '100%',
  },

  sectionBox: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 20,
  },

  // Empty Cat
  emptyCatWrap: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyCatTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
  },
  emptyCatDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 320,
  },

  // Category List
  categoryList: {
    gap: 16,
  },
  categoryRow: {
    gap: 6,
  },
  catTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: {
    fontSize: 14,
    fontWeight: '700',
  },
  catAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  catPct: {
    fontSize: 11,
  },
  catTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(148, 163, 184, 0.18)',
    overflow: 'hidden',
  },
  catBar: {
    height: '100%',
    borderRadius: 4,
  },

  // Export Box
  exportHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  exportIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportCardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  exportCardSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 18,
  },
  docMetaBox: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    marginBottom: 16,
  },
  docMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docMetaLabel: {
    fontSize: 12,
  },
  docMetaVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  btnExportPdf: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.lg,
  },
  btnExportPdfText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  exportHintNote: {
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
  },

  // Transaction Table
  txTableWrap: {
    gap: 2,
  },
  txTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  txTableIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTableTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  txTableSub: {
    fontSize: 12,
    marginTop: 2,
  },
  txTableAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
});
