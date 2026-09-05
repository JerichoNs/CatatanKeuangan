import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { radius, spacing } from '../constants/theme';
import {
  MONTH_NAMES_SHORT,
  DAY_NAMES_SHORT,
  getDaysInMonth,
  getFirstDayOfMonth,
  formatBulanTahun,
  todayISO,
} from '../utils/date';

interface TransactionDayInfo {
  incomeCount: number;
  expenseCount: number;
}

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  currentMonth: string; // "YYYY-MM"
  selectedDate: string | null; // "YYYY-MM-DD" or null
  onSelectMonth: (monthKey: string) => void;
  onSelectDate: (dateISO: string | null) => void;
  transactionDates?: Record<string, TransactionDayInfo>;
}

export function CalendarModal({
  visible,
  onClose,
  currentMonth,
  selectedDate,
  onSelectMonth,
  onSelectDate,
  transactionDates = {},
}: CalendarModalProps) {
  const { colors, isDark } = useTheme();

  // Parsing month and year from currentMonth ("YYYY-MM")
  const [initialYear, initialMonth] = useMemo(() => {
    const parts = currentMonth.split('-').map(Number);
    return [parts[0] || new Date().getFullYear(), (parts[1] || 1) - 1];
  }, [currentMonth]);

  const [displayYear, setDisplayYear] = useState(initialYear);
  const [displayMonth, setDisplayMonth] = useState(initialMonth);
  const [viewMode, setViewMode] = useState<'calendar' | 'month-grid'>('calendar');

  // Reset to currentMonth when modal opens
  React.useEffect(() => {
    if (visible) {
      const parts = currentMonth.split('-').map(Number);
      setDisplayYear(parts[0] || new Date().getFullYear());
      setDisplayMonth((parts[1] || 1) - 1);
      setViewMode('calendar');
    }
  }, [visible, currentMonth]);

  const currentMonthKeyStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}`;

  const daysInMonth = getDaysInMonth(displayYear, displayMonth);
  const firstDay = getFirstDayOfMonth(displayYear, displayMonth);
  const today = todayISO();

  const handlePrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear((y) => y - 1);
    } else {
      setDisplayMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear((y) => y + 1);
    } else {
      setDisplayMonth((m) => m + 1);
    }
  };

  const handleSelectMonthGrid = (monthIndex: number) => {
    setDisplayMonth(monthIndex);
    const newMonthKey = `${displayYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    onSelectMonth(newMonthKey);
    setViewMode('calendar');
  };

  const handlePickDate = (day: number) => {
    const dateStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const newMonthKey = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}`;
    onSelectMonth(newMonthKey);
    onSelectDate(dateStr);
    onClose();
  };

  const handleSelectEntireMonth = () => {
    const newMonthKey = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}`;
    onSelectMonth(newMonthKey);
    onSelectDate(null);
    onClose();
  };

  const handleGoToday = () => {
    const d = new Date();
    const todayMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    onSelectMonth(todayMonthKey);
    onSelectDate(today);
    onClose();
  };

  // Generate calendar grid items
  const calendarDays = useMemo(() => {
    const items: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      items.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      items.push(d);
    }
    return items;
  }, [firstDay, daysInMonth]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.modeBadge}
                onPress={() => setViewMode((v) => (v === 'calendar' ? 'month-grid' : 'calendar'))}
                activeOpacity={0.7}
              >
                <Text style={[styles.headerTitle, { color: colors.ink }]}>
                  {formatBulanTahun(currentMonthKeyStr)}
                </Text>
                <Ionicons
                  name={viewMode === 'calendar' ? 'calendar-outline' : 'grid-outline'}
                  size={18}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <Text style={[styles.headerSub, { color: colors.inkMuted }]}>
                {viewMode === 'calendar' ? 'Pilih tanggal / klik bulan untuk lompat' : 'Pilih bulan langsung'}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.inkMuted} />
            </TouchableOpacity>
          </View>

          {/* Month / Year Navigator */}
          <View style={styles.navRow}>
            {viewMode === 'calendar' ? (
              <>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.navArrow} hitSlop={8}>
                  <Ionicons name="chevron-back" size={20} color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setViewMode('month-grid')}
                  style={[styles.jumpButton, { backgroundColor: colors.surfaceAlt }]}
                >
                  <Ionicons name="swap-vertical" size={14} color={colors.primary} />
                  <Text style={[styles.jumpButtonText, { color: colors.primary }]}>
                    Lompat Cepat Bulan/Tahun
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleNextMonth} style={styles.navArrow} hitSlop={8}>
                  <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.yearRow}>
                <TouchableOpacity
                  onPress={() => setDisplayYear((y) => y - 1)}
                  style={styles.navArrow}
                  hitSlop={8}
                >
                  <Ionicons name="chevron-back" size={20} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.yearLabel, { color: colors.ink }]}>{displayYear}</Text>
                <TouchableOpacity
                  onPress={() => setDisplayYear((y) => y + 1)}
                  style={styles.navArrow}
                  hitSlop={8}
                >
                  <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Body: Month Grid or Calendar Day Grid */}
          {viewMode === 'month-grid' ? (
            <View style={styles.monthGrid}>
              {MONTH_NAMES_SHORT.map((name, idx) => {
                const isSelectedMonth = idx === displayMonth;
                return (
                  <TouchableOpacity
                    key={name}
                    style={[
                      styles.monthGridItem,
                      {
                        backgroundColor: isSelectedMonth ? colors.primary : colors.surfaceAlt,
                        borderColor: isSelectedMonth ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => handleSelectMonthGrid(idx)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.monthGridText,
                        { color: isSelectedMonth ? '#FFFFFF' : colors.ink },
                      ]}
                    >
                      {name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.calendarContainer}>
              {/* Day of week headers */}
              <View style={styles.dayNamesRow}>
                {DAY_NAMES_SHORT.map((dayName, idx) => (
                  <Text
                    key={dayName}
                    style={[
                      styles.dayNameText,
                      { color: idx === 0 ? colors.expense : colors.inkMuted },
                    ]}
                  >
                    {dayName}
                  </Text>
                ))}
              </View>

              {/* Day cells */}
              <View style={styles.daysGrid}>
                {calendarDays.map((day, idx) => {
                  if (day === null) {
                    return <View key={`empty-${idx}`} style={styles.dayCell} />;
                  }

                  const dateStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isToday = dateStr === today;
                  const isSelected = selectedDate === dateStr;
                  const dayTx = transactionDates[dateStr];
                  const hasIncome = dayTx && dayTx.incomeCount > 0;
                  const hasExpense = dayTx && dayTx.expenseCount > 0;

                  return (
                    <TouchableOpacity
                      key={`day-${day}`}
                      style={[
                        styles.dayCell,
                        isSelected && {
                          backgroundColor: colors.primary,
                          borderRadius: radius.md,
                        },
                        isToday && !isSelected && {
                          borderWidth: 1.5,
                          borderColor: colors.primary,
                          borderRadius: radius.md,
                        },
                      ]}
                      onPress={() => handlePickDate(day)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          {
                            color: isSelected ? '#FFFFFF' : isToday ? colors.primary : colors.ink,
                            fontWeight: isSelected || isToday ? '700' : '500',
                          },
                        ]}
                      >
                        {day}
                      </Text>

                      {/* Transaction Dots */}
                      <View style={styles.dotsRow}>
                        {hasIncome ? (
                          <View
                            style={[
                              styles.dot,
                              { backgroundColor: isSelected ? '#FFFFFF' : colors.income },
                            ]}
                          />
                        ) : null}
                        {hasExpense ? (
                          <View
                            style={[
                              styles.dot,
                              { backgroundColor: isSelected ? '#FFFFFF' : colors.expense },
                            ]}
                          />
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Footer Quick Actions */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.footerBtn, { backgroundColor: colors.surfaceAlt }]}
              onPress={handleGoToday}
              activeOpacity={0.7}
            >
              <Ionicons name="today-outline" size={15} color={colors.primary} />
              <Text style={[styles.footerBtnText, { color: colors.primary }]}>Hari Ini</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.footerBtn, { backgroundColor: colors.primary }]}
              onPress={handleSelectEntireMonth}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar" size={15} color="#FFFFFF" />
              <Text style={[styles.footerBtnText, { color: '#FFFFFF' }]}>Semua Bulan Ini</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
  },
  navArrow: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jumpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  jumpButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: spacing.md,
  },
  yearLabel: {
    fontSize: 18,
    fontWeight: '800',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  monthGridItem: {
    width: '30%',
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthGridText: {
    fontSize: 14,
    fontWeight: '700',
  },
  calendarContainer: {
    paddingVertical: spacing.xs,
  },
  dayNamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
  },
  dayNameText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: '14.28%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 2,
  },
  dayText: {
    fontSize: 14,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    position: 'absolute',
    bottom: 3,
    height: 4,
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
    borderTopWidth: 1,
  },
  footerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  footerBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
