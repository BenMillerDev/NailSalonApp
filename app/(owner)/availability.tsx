import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../../src/constants/colors";
import theme from "../../src/constants/theme";
import { useAvailability } from "../../src/hooks/useAvailability";
import {
  DaySchedule,
  OwnerAvailability,
} from "../../src/services/availability";
import { getDayKey, getNextDays } from "../../src/utils/dateHelpers";
import { containerWidth, rs } from "../../src/utils/responsive";
import { DayKey } from "../../src/utils/timeSlots";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const DAYS: { key: DayKey; label: string }[] = [
  { key: "sunday", label: "Sunday" },
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
];

const TIME_OPTIONS = [
  "6:00",
  "6:30",
  "7:00",
  "7:30",
  "8:00",
  "8:30",
  "9:00",
  "9:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
];

const BUFFER_OPTIONS = [0, 10, 15, 20, 30];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatTimeLabel(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function AvailabilityScreen() {
  const { availability, isLoading, isSaving, saveAll, blockDate, unblockDate } =
    useAvailability();
  const [localAvailability, setLocalAvailability] =
    useState<OwnerAvailability | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedDay, setExpandedDay] = useState<DayKey | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Populate local state when availability loads
  useEffect(() => {
    if (availability) {
      setLocalAvailability(availability);
    }
  }, [availability]);

  const updateDay = (day: DayKey, updates: Partial<DaySchedule>) => {
    if (!localAvailability) return;
    setLocalAvailability((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [day]: { ...prev[day], ...updates },
      };
    });
    setHasChanges(true);
  };

  const updateBuffer = (bufferTime: number) => {
    if (!localAvailability) return;
    setLocalAvailability((prev) => (prev ? { ...prev, bufferTime } : prev));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!localAvailability) return;
    const { ownerId, ...rest } = localAvailability;
    const result = await saveAll(rest);
    if (result.success) {
      setHasChanges(false);
      Alert.alert("Saved", "Your availability has been updated.");
    } else {
      Alert.alert("Error", result.error || "Something went wrong.");
    }
  };

  const handleBlockDate = async (date: Date) => {
    const isoDate = date.toISOString().split("T")[0];
    await blockDate(isoDate);
  };

  const handleUnblockDate = async (date: string) => {
    Alert.alert("Remove Block", "Allow bookings on this date again?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        onPress: async () => await unblockDate(date),
      },
    ]);
  };

  if (isLoading || !localAvailability) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your schedule...</Text>
      </View>
    );
  }

  // Get next 30 days for the date blocker
  const nextDays = getNextDays(30);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Availability</Text>
        {hasChanges && (
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Weekly Schedule */}
        <Text style={styles.sectionTitle}>Weekly Schedule</Text>
        {DAYS.map(({ key, label }) => {
          const day = localAvailability[key];
          const isExpanded = expandedDay === key;

          return (
            <View key={key} style={styles.dayCard}>
              {/* Day Row */}
              <View style={styles.dayRow}>
                <TouchableOpacity
                  style={styles.dayLabelRow}
                  onPress={() =>
                    day.isOpen && setExpandedDay(isExpanded ? null : key)
                  }
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayLabel,
                      !day.isOpen && styles.dayLabelInactive,
                    ]}
                  >
                    {label}
                  </Text>
                  {day.isOpen && (
                    <Text style={styles.dayHours}>
                      {formatTimeLabel(day.startTime)} —{" "}
                      {formatTimeLabel(day.endTime)}
                    </Text>
                  )}
                </TouchableOpacity>
                <Switch
                  value={day.isOpen}
                  onValueChange={(value) => {
                    updateDay(key, { isOpen: value });
                    if (!value) setExpandedDay(null);
                  }}
                  trackColor={{
                    false: colors.midGray,
                    true: colors.primaryLight,
                  }}
                  thumbColor={day.isOpen ? colors.primary : colors.white}
                />
              </View>

              {/* Expanded Time Picker */}
              {isExpanded && day.isOpen && (
                <View style={styles.timePicker}>
                  <View style={styles.timePickerRow}>
                    {/* Start Time */}
                    <View style={styles.timePickerColumn}>
                      <Text style={styles.timePickerLabel}>Opens</Text>
                      <ScrollView
                        style={styles.timeScroll}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
                      >
                        {TIME_OPTIONS.map((time) => (
                          <TouchableOpacity
                            key={time}
                            style={[
                              styles.timeOption,
                              day.startTime === time && styles.timeOptionActive,
                            ]}
                            onPress={() => updateDay(key, { startTime: time })}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.timeOptionText,
                                day.startTime === time &&
                                  styles.timeOptionTextActive,
                              ]}
                            >
                              {formatTimeLabel(time)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    {/* Divider */}
                    <View style={styles.timePickerDivider} />

                    {/* End Time */}
                    <View style={styles.timePickerColumn}>
                      <Text style={styles.timePickerLabel}>Closes</Text>
                      <ScrollView
                        style={styles.timeScroll}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
                      >
                        {TIME_OPTIONS.map((time) => (
                          <TouchableOpacity
                            key={time}
                            style={[
                              styles.timeOption,
                              day.endTime === time && styles.timeOptionActive,
                            ]}
                            onPress={() => updateDay(key, { endTime: time })}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.timeOptionText,
                                day.endTime === time &&
                                  styles.timeOptionTextActive,
                              ]}
                            >
                              {formatTimeLabel(time)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* Buffer Time */}
        <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
          Buffer Between Appointments
        </Text>
        <Text style={styles.sectionSubtitle}>
          Time reserved between bookings for cleanup and prep
        </Text>
        <View style={styles.bufferRow}>
          {BUFFER_OPTIONS.map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.bufferChip,
                localAvailability.bufferTime === minutes &&
                  styles.bufferChipActive,
              ]}
              onPress={() => updateBuffer(minutes)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.bufferChipText,
                  localAvailability.bufferTime === minutes &&
                    styles.bufferChipTextActive,
                ]}
              >
                {minutes === 0 ? "None" : `${minutes} min`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Blocked Dates */}
        <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
          Blocked Dates
        </Text>
        <Text style={styles.sectionSubtitle}>
          Tap a date to block it — no bookings will be accepted on blocked days
        </Text>

        {/* Date Grid */}
        <View style={styles.dateGrid}>
          {nextDays.map((date) => {
            const isoDate = date.toISOString().split("T")[0];
            const isBlocked = localAvailability.blockedDates.includes(isoDate);
            const dayKey = getDayKey(date);
            const isDayOff = !localAvailability[dayKey as DayKey]?.isOpen;

            return (
              <TouchableOpacity
                key={isoDate}
                style={[
                  styles.dateChip,
                  isBlocked && styles.dateChipBlocked,
                  isDayOff && styles.dateChipDayOff,
                ]}
                onPress={() => {
                  if (isBlocked) {
                    handleUnblockDate(isoDate);
                  } else if (!isDayOff) {
                    handleBlockDate(date);
                  }
                }}
                activeOpacity={isDayOff ? 1 : 0.8}
                disabled={isDayOff}
              >
                <Text
                  style={[
                    styles.dateChipDay,
                    isBlocked && styles.dateChipTextBlocked,
                    isDayOff && styles.dateChipTextDayOff,
                  ]}
                >
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </Text>
                <Text
                  style={[
                    styles.dateChipNumber,
                    isBlocked && styles.dateChipTextBlocked,
                    isDayOff && styles.dateChipTextDayOff,
                  ]}
                >
                  {date.getDate()}
                </Text>
                {isBlocked && (
                  <Text style={styles.dateChipBlockedLabel}>Blocked</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    ...theme.components.screen,
    paddingTop: rs(60, 80),
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: rs(15, 17),
    color: colors.darkGray,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: rs(28, 34),
    fontWeight: "700",
    color: colors.charcoal,
    letterSpacing: -0.5,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.round,
    minWidth: 60,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: rs(14, 16),
    fontWeight: "700",
    color: colors.white,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },

  // Section titles
  sectionTitle: {
    fontSize: rs(13, 15),
    fontWeight: "700",
    color: colors.charcoal,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },
  sectionTitleSpaced: {
    marginTop: theme.spacing.xl,
  },
  sectionSubtitle: {
    fontSize: rs(12, 14),
    color: colors.darkGray,
    marginBottom: theme.spacing.md,
    marginTop: -theme.spacing.xs,
  },

  // Day cards
  dayCard: {
    backgroundColor: colors.white,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.sm,
    overflow: "hidden",
    ...theme.shadows.sm,
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  dayLabelRow: {
    flex: 1,
  },
  dayLabel: {
    fontSize: rs(15, 17),
    fontWeight: "700",
    color: colors.charcoal,
  },
  dayLabelInactive: {
    color: colors.midGray,
  },
  dayHours: {
    fontSize: rs(12, 14),
    color: colors.darkGray,
    marginTop: 2,
  },

  // Time picker
  timePicker: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    padding: theme.spacing.md,
  },
  timePickerRow: {
    flexDirection: "row",
    height: 180,
  },
  timePickerColumn: {
    flex: 1,
  },
  timePickerDivider: {
    width: 1,
    backgroundColor: colors.lightGray,
    marginHorizontal: theme.spacing.sm,
  },
  timePickerLabel: {
    fontSize: rs(12, 14),
    fontWeight: "700",
    color: colors.darkGray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  timeScroll: {
    flex: 1,
  },
  timeOption: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    marginBottom: 2,
  },
  timeOptionActive: {
    backgroundColor: colors.primary,
  },
  timeOptionText: {
    fontSize: rs(13, 15),
    color: colors.darkGray,
    fontWeight: "500",
  },
  timeOptionTextActive: {
    color: colors.white,
    fontWeight: "700",
  },

  // Buffer
  bufferRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    flexWrap: "wrap",
  },
  bufferChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.round,
    borderWidth: 1.5,
    borderColor: colors.midGray,
  },
  bufferChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bufferChipText: {
    fontSize: rs(13, 15),
    fontWeight: "600",
    color: colors.darkGray,
  },
  bufferChipTextActive: {
    color: colors.white,
  },

  // Date grid
  dateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  dateChip: {
    width: (containerWidth - theme.spacing.lg * 2 - theme.spacing.sm * 6) / 7,
    aspectRatio: 0.8,
    backgroundColor: colors.white,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.sm,
  },
  dateChipBlocked: {
    backgroundColor: colors.error,
  },
  dateChipDayOff: {
    backgroundColor: colors.lightGray,
    opacity: 0.5,
  },
  dateChipDay: {
    fontSize: rs(9, 11),
    fontWeight: "600",
    color: colors.darkGray,
    textTransform: "uppercase",
  },
  dateChipNumber: {
    fontSize: rs(16, 18),
    fontWeight: "700",
    color: colors.charcoal,
  },
  dateChipTextBlocked: {
    color: colors.white,
  },
  dateChipTextDayOff: {
    color: colors.midGray,
  },
  dateChipBlockedLabel: {
    fontSize: rs(7, 9),
    fontWeight: "700",
    color: colors.white,
    textTransform: "uppercase",
  },
});
