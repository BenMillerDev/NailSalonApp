import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    Linking,
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
import { useClients } from "../../src/hooks/useClients";
import { formatAppointmentDateTime } from "../../src/utils/dateHelpers";
import { formatDuration, formatPrice } from "../../src/utils/formatters";
import { rs } from "../../src/utils/responsive";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const avatarColors = [
    "#4A90D9",
    "#7BB8E8",
    "#2C6FAC",
    "#5BAD8F",
    "#E8C97A",
    "#D97A7A",
  ];
  const index = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[index];
}

function getStatusColor(status: string): string {
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

export default function ClientProfileScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const { clients, saveNote } = useClients();

  const client = clients.find((c) => c.email === email);

  const [notes, setNotes] = useState(client?.notes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  if (!client) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const handleSaveNotes = async () => {
    Keyboard.dismiss();
    setIsSavingNotes(true);
    await saveNote(client.email, notes);
    setIsSavingNotes(false);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${client.phone}`);
  };

  const handleText = () => {
    Linking.openURL(`sms:${client.phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${client.email}`);
  };

  const fillDue = client.fillDueDate ? new Date(client.fillDueDate) : null;
  const isFillOverdue = fillDue && fillDue < new Date();
  const isFillDueSoon =
    fillDue &&
    !isFillOverdue &&
    fillDue < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Text style={styles.backText}>‹ Clients</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Client Header */}
          <View style={styles.clientHeader}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: getAvatarColor(client.name) },
              ]}
            >
              <Text style={styles.avatarText}>{getInitials(client.name)}</Text>
            </View>
            <Text style={styles.clientName}>{client.name}</Text>
            <Text style={styles.clientEmail}>{client.email}</Text>

            {/* Contact Actions */}
            <View style={styles.contactActions}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleCall}
                activeOpacity={0.85}
              >
                <Text style={styles.contactButtonEmoji}>📞</Text>
                <Text style={styles.contactButtonLabel}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleText}
                activeOpacity={0.85}
              >
                <Text style={styles.contactButtonEmoji}>💬</Text>
                <Text style={styles.contactButtonLabel}>Text</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleEmail}
                activeOpacity={0.85}
              >
                <Text style={styles.contactButtonEmoji}>✉️</Text>
                <Text style={styles.contactButtonLabel}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{client.totalVisits}</Text>
              <Text style={styles.statLabel}>Visits</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {formatPrice(client.totalSpent)}
              </Text>
              <Text style={styles.statLabel}>Spent</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {client.lastVisitDate
                  ? new Date(client.lastVisitDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A"}
              </Text>
              <Text style={styles.statLabel}>Last Visit</Text>
            </View>
          </View>

          {/* Fill Due Date */}
          {fillDue && (
            <View
              style={[
                styles.fillCard,
                {
                  backgroundColor: isFillOverdue
                    ? colors.error + "15"
                    : isFillDueSoon
                      ? colors.status.pending + "15"
                      : colors.status.confirmed + "15",
                },
              ]}
            >
              <Text style={styles.fillTitle}>
                {isFillOverdue
                  ? "⚠️ Fill Overdue"
                  : isFillDueSoon
                    ? "⏰ Fill Due Soon"
                    : "✅ Fill Schedule"}
              </Text>
              <Text
                style={[
                  styles.fillDate,
                  {
                    color: isFillOverdue
                      ? colors.error
                      : isFillDueSoon
                        ? colors.status.pending
                        : colors.status.confirmed,
                  },
                ]}
              >
                {isFillOverdue ? "Was due " : "Due "}
                {fillDue.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              {isFillOverdue || isFillDueSoon ? (
                <TouchableOpacity
                  style={styles.fillReminderButton}
                  onPress={handleText}
                  activeOpacity={0.85}
                >
                  <Text style={styles.fillReminderText}>
                    💬 Send Reminder Text
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}

          {/* Preferred Services */}
          {client.preferredServices.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Preferred Services</Text>
              <View style={styles.card}>
                {client.preferredServices.map((service, index) => (
                  <View
                    key={service.name}
                    style={[
                      styles.serviceRow,
                      index < client.preferredServices.length - 1 &&
                        styles.serviceRowBorder,
                    ]}
                  >
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceCount}>{service.count}x</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Notes */}
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.notesInput}
              placeholder="Add private notes about this client — preferences, allergies, style notes..."
              placeholderTextColor={colors.midGray}
              value={notes}
              onChangeText={(text) => {
                setNotes(text);
                setNotesSaved(false);
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {notes !== (client.notes || "") && (
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
                  <Text style={styles.saveNotesText}>
                    {notesSaved ? "✓ Saved" : "Save Notes"}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Appointment History */}
          <Text style={styles.sectionTitle}>
            Appointment History ({client.appointments.length})
          </Text>
          <View style={styles.card}>
            {client.appointments.length === 0 ? (
              <Text style={styles.noAppointmentsText}>No appointments yet</Text>
            ) : (
              client.appointments.map((appt, index) => (
                <View
                  key={appt.id}
                  style={[
                    styles.appointmentRow,
                    index < client.appointments.length - 1 &&
                      styles.appointmentRowBorder,
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(appt.status) },
                    ]}
                  />
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentDate}>
                      {formatAppointmentDateTime(new Date(appt.startTime))}
                    </Text>
                    <Text style={styles.appointmentServices}>
                      {appt.services.map((s) => s.name).join(", ")}
                      {appt.addOns.length > 0 &&
                        ` + ${appt.addOns.map((a) => a.name).join(", ")}`}
                    </Text>
                    <Text style={styles.appointmentDuration}>
                      {formatDuration(appt.totalDuration)}
                    </Text>
                  </View>
                  <Text style={styles.appointmentPrice}>
                    {formatPrice(appt.totalPrice)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    ...theme.components.screen,
    paddingTop: rs(60, 80),
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Header
  header: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: rs(16, 18),
    fontWeight: "600",
    color: colors.primary,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },

  // Client header
  clientHeader: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: rs(72, 88),
    height: rs(72, 88),
    borderRadius: rs(36, 44),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: rs(28, 34),
    fontWeight: "700",
    color: colors.white,
  },
  clientName: {
    fontSize: rs(24, 28),
    fontWeight: "700",
    color: colors.charcoal,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  clientEmail: {
    fontSize: rs(13, 15),
    color: colors.darkGray,
    marginBottom: theme.spacing.md,
  },

  // Contact actions
  contactActions: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  contactButton: {
    backgroundColor: colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    alignItems: "center",
    minWidth: rs(70, 84),
    ...theme.shadows.sm,
  },
  contactButtonEmoji: {
    fontSize: rs(22, 26),
    marginBottom: 4,
  },
  contactButtonLabel: {
    fontSize: rs(11, 13),
    fontWeight: "600",
    color: colors.darkGray,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    alignItems: "center",
    ...theme.shadows.sm,
  },
  statValue: {
    fontSize: rs(18, 22),
    fontWeight: "700",
    color: colors.charcoal,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: rs(10, 12),
    fontWeight: "600",
    color: colors.darkGray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // Fill card
  fillCard: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  fillTitle: {
    fontSize: rs(14, 16),
    fontWeight: "700",
    color: colors.charcoal,
    marginBottom: 4,
  },
  fillDate: {
    fontSize: rs(13, 15),
    fontWeight: "600",
    marginBottom: theme.spacing.sm,
  },
  fillReminderButton: {
    backgroundColor: colors.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    alignItems: "center",
    ...theme.shadows.sm,
  },
  fillReminderText: {
    fontSize: rs(13, 15),
    fontWeight: "700",
    color: colors.primary,
  },

  // Section titles
  sectionTitle: {
    fontSize: rs(13, 15),
    fontWeight: "700",
    color: colors.charcoal,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },

  // Services
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  serviceRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  serviceName: {
    fontSize: rs(14, 16),
    fontWeight: "600",
    color: colors.charcoal,
  },
  serviceCount: {
    fontSize: rs(13, 15),
    fontWeight: "700",
    color: colors.primary,
  },

  // Notes
  notesInput: {
    fontSize: rs(14, 16),
    color: colors.charcoal,
    minHeight: rs(100, 120),
    textAlignVertical: "top",
    lineHeight: rs(22, 24),
  },
  saveNotesButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  saveNotesText: {
    fontSize: rs(14, 16),
    fontWeight: "700",
    color: colors.white,
  },

  // Appointments
  appointmentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  appointmentRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    flexShrink: 0,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentDate: {
    fontSize: rs(13, 15),
    fontWeight: "700",
    color: colors.charcoal,
    marginBottom: 2,
  },
  appointmentServices: {
    fontSize: rs(12, 14),
    color: colors.darkGray,
    marginBottom: 2,
  },
  appointmentDuration: {
    fontSize: rs(11, 13),
    color: colors.midGray,
  },
  appointmentPrice: {
    fontSize: rs(14, 16),
    fontWeight: "700",
    color: colors.charcoal,
    flexShrink: 0,
  },
  noAppointmentsText: {
    fontSize: rs(14, 16),
    color: colors.midGray,
    textAlign: "center",
    paddingVertical: theme.spacing.md,
  },
});
