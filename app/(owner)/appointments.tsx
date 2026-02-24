import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import colors from "../../src/constants/colors";
import theme from "../../src/constants/theme";
import { useAppointments } from "../../src/hooks/useAppointments";
import {
  Appointment,
  AppointmentStatus,
} from "../../src/services/appointments";
import {
  formatTime
} from "../../src/utils/dateHelpers";
import { formatDuration, formatPrice } from "../../src/utils/formatters";
import { rs } from "../../src/utils/responsive";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type TabType = "upcoming" | "past";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getStatusColor(status: AppointmentStatus): string {
  switch (status) {
    case "confirmed":
      return colors.status.confirmed;
    case "pending":
      return colors.status.pending;
    case "completed":
      return colors.status.completed;
    case "cancelled":
      return colors.status.cancelled;
    default:
      return colors.midGray;
  }
}

function getStatusLabel(status: AppointmentStatus): string {
  switch (status) {
    case "confirmed":
      return "Confirmed";
    case "pending":
      return "Pending";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

// ─────────────────────────────────────────────
// APPOINTMENT CARD COMPONENT
// ─────────────────────────────────────────────

function AppointmentCard({
  appointment,
  onUpdateStatus,
  onUpdateNotes,
}: {
  appointment: Appointment;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(appointment.notes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const handleSaveNotes = async () => {
    Keyboard.dismiss();
    setIsSavingNotes(true);
    await onUpdateNotes(appointment.id!, notes);
    setIsSavingNotes(false);
  };

  const serviceNames = appointment.services.map((s) => s.name).join(", ");
  const addOnNames =
    appointment.addOns.length > 0
      ? ` + ${appointment.addOns.map((a) => a.name).join(", ")}`
      : "";

  return (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={() => setIsExpanded(!isExpanded)}
      activeOpacity={0.9}
    >
      {/* Status Bar */}
      <View
        style={[
          styles.statusBar,
          { backgroundColor: getStatusColor(appointment.status) },
        ]}
      />

      {/* Card Content */}
      <View style={styles.cardContent}>
        {/* Top Row */}
        <View style={styles.cardTopRow}>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{appointment.clientName}</Text>
            <Text style={styles.appointmentTime}>
              {formatTime(appointment.startTime)} —{" "}
              {formatTime(appointment.endTime)}
            </Text>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.appointmentPrice}>
              {formatPrice(appointment.totalPrice)}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(appointment.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: getStatusColor(appointment.status) },
                ]}
              >
                {getStatusLabel(appointment.status)}
              </Text>
            </View>
          </View>
        </View>

        {/* Services */}
        <Text style={styles.servicesList}>
          {serviceNames}
          {addOnNames}
        </Text>

        {/* Duration */}
        <Text style={styles.appointmentDuration}>
          {formatDuration(appointment.totalDuration)}
        </Text>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />

            {/* Client Details */}
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Client Details</Text>
              <Text style={styles.detailText}>
                📱 {appointment.clientPhone}
              </Text>
              <Text style={styles.detailText}>
                ✉️ {appointment.clientEmail}
              </Text>
              {appointment.nailShape && (
                <Text style={styles.detailText}>
                  💅 Shape: {appointment.nailShape}
                </Text>
              )}
              {appointment.nailLength && (
                <Text style={styles.detailText}>
                  📏 Length: {appointment.nailLength}
                </Text>
              )}
            </View>

            {/* Status Actions */}
            {appointment.status !== "cancelled" &&
              appointment.status !== "completed" && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>Update Status</Text>
                  <View style={styles.statusActions}>
                    {appointment.status === "pending" && (
                      <TouchableOpacity
                        style={[
                          styles.statusAction,
                          styles.statusActionConfirm,
                        ]}
                        onPress={() =>
                          onUpdateStatus(appointment.id!, "confirmed")
                        }
                        activeOpacity={0.8}
                      >
                        <Text style={styles.statusActionText}>✓ Confirm</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.statusAction, styles.statusActionComplete]}
                      onPress={() =>
                        onUpdateStatus(appointment.id!, "completed")
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.statusActionText}>✓ Complete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.statusAction, styles.statusActionCancel]}
                      onPress={() => {
                        Alert.alert(
                          "Cancel Appointment",
                          `Are you sure you want to cancel ${appointment.clientName}'s appointment?`,
                          [
                            { text: "Keep", style: "cancel" },
                            {
                              text: "Cancel Appointment",
                              style: "destructive",
                              onPress: () =>
                                onUpdateStatus(appointment.id!, "cancelled"),
                            },
                          ],
                        );
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.statusActionCancelText}>
                        ✕ Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

            {/* Notes */}
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Notes</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add notes about this appointment..."
                placeholderTextColor={colors.midGray}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
              {notes !== (appointment.notes || "") && (
                <TouchableOpacity
                  style={[
                    styles.saveNotesButton,
                    isSavingNotes && { opacity: 0.7 },
                  ]}
                  onPress={handleSaveNotes}
                  disabled={isSavingNotes}
                  activeOpacity={0.85}
                >
                  {isSavingNotes ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.saveNotesText}>Save Notes</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Expand Indicator */}
        <Text style={styles.expandIndicator}>
          {isExpanded ? "▲ Less" : "▼ More"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────

export default function AppointmentsScreen() {
  const { upcoming, past, todays, isLoading, updateStatus, updateNotes } =
    useAppointments();
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");

  const handleUpdateStatus = async (id: string, status: AppointmentStatus) => {
    const result = await updateStatus(id, status);
    if (!result.success) {
      Alert.alert(
        "Error",
        result.error || "Could not update appointment status.",
      );
    }
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    const result = await updateNotes(id, notes);
    if (!result.success) {
      Alert.alert("Error", result.error || "Could not save notes.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </View>
    );
  }

  const displayedAppointments = activeTab === "upcoming" ? upcoming : past;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Appointments</Text>
        </View>

        {/* Today's Summary */}
        {todays.length > 0 && (
          <View style={styles.todayBanner}>
            <Text style={styles.todayBannerText}>
              📅 {todays.length} appointment{todays.length > 1 ? "s" : ""} today
            </Text>
            <Text style={styles.todayBannerTime}>
              First at {formatTime(todays[0].startTime)}
            </Text>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "upcoming" && styles.tabActive]}
            onPress={() => setActiveTab("upcoming")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "upcoming" && styles.tabTextActive,
              ]}
            >
              Upcoming ({upcoming.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "past" && styles.tabActive]}
            onPress={() => setActiveTab("past")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "past" && styles.tabTextActive,
              ]}
            >
              Past ({past.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Appointments List */}
        {displayedAppointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>
              {activeTab === "upcoming" ? "🗓" : "📋"}
            </Text>
            <Text style={styles.emptyTitle}>
              {activeTab === "upcoming"
                ? "No upcoming appointments"
                : "No past appointments"}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === "upcoming"
                ? "New bookings will appear here when clients book through your link"
                : "Completed appointments will appear here"}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Group by date */}
            {groupAppointmentsByDate(displayedAppointments).map(
              ({ date, appointments }) => (
                <View key={date}>
                  <Text style={styles.dateHeader}>{date}</Text>
                  {appointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onUpdateStatus={handleUpdateStatus}
                      onUpdateNotes={handleUpdateNotes}
                    />
                  ))}
                </View>
              ),
            )}
          </ScrollView>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function groupAppointmentsByDate(
  appointments: Appointment[],
): { date: string; appointments: Appointment[] }[] {
  const groups: Record<string, Appointment[]> = {};

  appointments.forEach((appointment) => {
    const date = formatAppointmentDate(appointment.startTime);
    if (!groups[date]) groups[date] = [];
    groups[date].push(appointment);
  });

  return Object.entries(groups).map(([date, appointments]) => ({
    date,
    appointments,
  }));
}

function formatAppointmentDate(isoString: string): string {
  const date = new Date(isoString);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
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
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: rs(28, 34),
    fontWeight: "700",
    color: colors.charcoal,
    letterSpacing: -0.5,
  },

  // Today banner
  todayBanner: {
    backgroundColor: colors.primaryLight,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  todayBannerText: {
    fontSize: rs(14, 16),
    fontWeight: "700",
    color: colors.primaryDark,
  },
  todayBannerTime: {
    fontSize: rs(13, 15),
    color: colors.primaryDark,
  },

  // Tabs
  tabs: {
    flexDirection: "row",
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: colors.lightGray,
    borderRadius: theme.radius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: colors.white,
    ...theme.shadows.sm,
  },
  tabText: {
    fontSize: rs(13, 15),
    fontWeight: "600",
    color: colors.darkGray,
  },
  tabTextActive: {
    color: colors.primary,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  emptyEmoji: {
    fontSize: rs(56, 72),
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: rs(18, 22),
    fontWeight: "700",
    color: colors.charcoal,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  emptyText: {
    fontSize: rs(13, 15),
    color: colors.darkGray,
    textAlign: "center",
    lineHeight: rs(20, 24),
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },

  // Date header
  dateHeader: {
    fontSize: rs(13, 15),
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },

  // Appointment card
  appointmentCard: {
    backgroundColor: colors.white,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.sm,
    flexDirection: "row",
    overflow: "hidden",
    ...theme.shadows.sm,
  },
  statusBar: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: theme.spacing.md,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: rs(16, 18),
    fontWeight: "700",
    color: colors.charcoal,
  },
  appointmentTime: {
    fontSize: rs(12, 14),
    color: colors.darkGray,
    marginTop: 2,
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  appointmentPrice: {
    fontSize: rs(16, 18),
    fontWeight: "700",
    color: colors.charcoal,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.round,
  },
  statusBadgeText: {
    fontSize: rs(11, 13),
    fontWeight: "700",
  },
  servicesList: {
    fontSize: rs(13, 15),
    color: colors.darkGray,
    marginBottom: 2,
  },
  appointmentDuration: {
    fontSize: rs(12, 13),
    color: colors.midGray,
  },
  expandIndicator: {
    fontSize: rs(11, 13),
    color: colors.midGray,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },

  // Expanded content
  expandedContent: {
    marginTop: theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginBottom: theme.spacing.md,
  },
  detailSection: {
    marginBottom: theme.spacing.md,
  },
  detailTitle: {
    fontSize: rs(12, 14),
    fontWeight: "700",
    color: colors.charcoal,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    fontSize: rs(13, 15),
    color: colors.darkGray,
    marginBottom: 4,
  },

  // Status actions
  statusActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  statusAction: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    alignItems: "center",
  },
  statusActionConfirm: {
    backgroundColor: colors.status.confirmed + "20",
  },
  statusActionComplete: {
    backgroundColor: colors.status.completed + "20",
  },
  statusActionCancel: {
    backgroundColor: colors.status.cancelled + "20",
  },
  statusActionText: {
    fontSize: rs(13, 15),
    fontWeight: "700",
    color: colors.status.confirmed,
  },
  statusActionCancelText: {
    fontSize: rs(13, 15),
    fontWeight: "700",
    color: colors.status.cancelled,
  },

  // Notes
  notesInput: {
    backgroundColor: colors.lightGray,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    fontSize: rs(13, 15),
    color: colors.charcoal,
    textAlignVertical: "top",
    minHeight: rs(70, 90),
    borderWidth: 1,
    borderColor: colors.midGray,
  },
  saveNotesButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  saveNotesText: {
    fontSize: rs(13, 15),
    fontWeight: "700",
    color: colors.white,
  },
});
