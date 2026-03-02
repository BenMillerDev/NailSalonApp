import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../../src/constants/colors";
import theme from "../../src/constants/theme";
import { useAuth } from "../../src/context/AuthContext";
import { useAppointments } from "../../src/hooks/useAppointments";
import { Appointment } from "../../src/services/appointments";
import { formatAppointmentDate, formatTime } from "../../src/utils/dateHelpers";
import { formatDuration, formatPrice } from "../../src/utils/formatters";
import { rs } from "../../src/utils/responsive";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ─────────────────────────────────────────────
// SUB COMPONENTS
// ─────────────────────────────────────────────

function StatCard({
  label,
  value,
  subValue,
  color,
}: {
  label: string;
  value: string;
  subValue?: string;
  color?: string;
}) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={[statStyles.value, color ? { color } : {}]}>{value}</Text>
      {subValue && <Text style={statStyles.subValue}>{subValue}</Text>}
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  label: {
    fontSize: rs(8, 10),
    fontWeight: "600",
    color: colors.darkGray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: rs(24, 28),
    fontWeight: "700",
    color: colors.charcoal,
    letterSpacing: -0.5,
  },
  subValue: {
    fontSize: rs(11, 13),
    color: colors.midGray,
    marginTop: 2,
  },
});

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  return (
    <View style={apptStyles.row}>
      <View
        style={[
          apptStyles.statusDot,
          { backgroundColor: getStatusColor(appointment.status) },
        ]}
      />
      <View style={apptStyles.timeColumn}>
        <Text style={apptStyles.time}>{formatTime(appointment.startTime)}</Text>
        <Text style={apptStyles.duration}>
          {formatDuration(appointment.totalDuration)}
        </Text>
      </View>
      <View style={apptStyles.infoColumn}>
        <Text style={apptStyles.clientName}>{appointment.clientName}</Text>
        <Text style={apptStyles.services} numberOfLines={1}>
          {appointment.services.map((s) => s.name).join(", ")}
        </Text>
      </View>
      <Text style={apptStyles.price}>
        {formatPrice(appointment.totalPrice)}
      </Text>
    </View>
  );
}

const apptStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    gap: theme.spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  timeColumn: {
    width: rs(52, 60),
    flexShrink: 0,
  },
  time: {
    fontSize: rs(13, 15),
    fontWeight: "700",
    color: colors.charcoal,
  },
  duration: {
    fontSize: rs(10, 12),
    color: colors.midGray,
    marginTop: 1,
  },
  infoColumn: {
    flex: 1,
  },
  clientName: {
    fontSize: rs(14, 16),
    fontWeight: "600",
    color: colors.charcoal,
  },
  services: {
    fontSize: rs(11, 13),
    color: colors.darkGray,
    marginTop: 1,
  },
  price: {
    fontSize: rs(14, 16),
    fontWeight: "700",
    color: colors.charcoal,
    flexShrink: 0,
  },
});

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────

export default function DashboardScreen() {
  const { user, userProfile, logOut } = useAuth();
  const { todays, upcoming, isLoading, fetchAll } = useAppointments();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const bookingLink = `https://nailsalonapp-a0fc5.web.app?owner=${user?.uid}`;

  const prevUpcomingCount = useRef(upcoming.length);
  const [newBookingAlert, setNewBookingAlert] = useState(false);

  useEffect(() => {
    if (
      upcoming.length > prevUpcomingCount.current &&
      prevUpcomingCount.current !== 0
    ) {
      setNewBookingAlert(true);
      setTimeout(() => setNewBookingAlert(false), 4000);
    }
    prevUpcomingCount.current = upcoming.length;
  }, [upcoming.length]);

  // Today's stats
  const todaysRevenue = todays
    .filter((a) => a.status !== "cancelled")
    .reduce((sum, a) => sum + a.totalPrice, 0);

  const confirmedToday = todays.filter(
    (a) => a.status === "confirmed" || a.status === "completed",
  ).length;

  const pendingCount = upcoming.filter((a) => a.status === "pending").length;

  // Next 3 upcoming appointments (excluding today)
  const today = new Date();
  const upcomingThisWeek = upcoming
    .filter((a) => {
      const apptDate = new Date(a.startTime);
      return apptDate.toDateString() !== today.toDateString();
    })
    .slice(0, 3);

  const onRefresh = async () => {
    setRefreshing(true);
    // Listeners update automatically — just show the spinner briefly
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshing(false);
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(bookingLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `Book an appointment at ${userProfile?.salonName}: ${bookingLink}`,
        url: bookingLink,
      });
    } catch (error) {
      await handleCopyLink();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{getGreeting()} 👋</Text>
          <Text style={styles.salonName}>{userProfile?.salonName}</Text>
        </View>
      </View>

      {/* New Booking Alert */}
      {newBookingAlert && (
        <View style={styles.newBookingBanner}>
          <Text style={styles.newBookingText}>🎉 New booking received!</Text>
        </View>
      )}

      {/* Today's Stats */}
      <Text style={styles.sectionTitle}>Today</Text>
      <View style={styles.statsRow}>
        <StatCard
          label="Appointments"
          value={String(todays.length)}
          subValue={`${confirmedToday} confirmed`}
          color={todays.length > 0 ? colors.primary : colors.midGray}
        />
        <StatCard
          label="Revenue"
          value={formatPrice(todaysRevenue)}
          subValue={todays.length === 0 ? "No bookings yet" : undefined}
          color={todaysRevenue > 0 ? colors.status.confirmed : colors.midGray}
        />
        {pendingCount > 0 && (
          <StatCard
            label="Pending"
            value={String(pendingCount)}
            subValue="need review"
            color={colors.status.pending}
          />
        )}
      </View>

      {/* Today's Schedule */}
      {todays.length > 0 ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Today&apos;s Schedule</Text>
            <TouchableOpacity
              onPress={() => router.push("/(owner)/appointments")}
              activeOpacity={0.8}
            >
              <Text style={styles.cardLink}>See all</Text>
            </TouchableOpacity>
          </View>
          {todays.map((appointment) => (
            <AppointmentRow key={appointment.id} appointment={appointment} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🗓</Text>
          <Text style={styles.emptyTitle}>No appointments today</Text>
          <Text style={styles.emptyText}>
            Share your booking link to start receiving appointments
          </Text>
          <TouchableOpacity
            style={styles.copyLinkButton}
            onPress={handleCopyLink}
            activeOpacity={0.85}
          >
            <Text style={styles.copyLinkText}>
              {linkCopied ? "✓ Copied!" : "📋 Copy Booking Link"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Upcoming This Week */}
      {upcomingThisWeek.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
            Coming Up
          </Text>
          <View style={styles.card}>
            {upcomingThisWeek.map((appointment, index) => (
              <View key={appointment.id}>
                {/* Date label if different from previous */}
                {(index === 0 ||
                  formatAppointmentDate(new Date(appointment.startTime)) !==
                    formatAppointmentDate(
                      new Date(upcomingThisWeek[index - 1].startTime),
                    )) && (
                  <Text style={styles.dateLabel}>
                    {formatAppointmentDate(new Date(appointment.startTime))}
                  </Text>
                )}
                <AppointmentRow appointment={appointment} />
              </View>
            ))}
            {upcoming.length > 3 && (
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => router.push("/(owner)/appointments")}
                activeOpacity={0.8}
              >
                <Text style={styles.seeAllText}>
                  See all {upcoming.length} upcoming appointments →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      {/* Share Booking Link */}
      <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
        Your Booking Link
      </Text>
      <View style={styles.card}>
        <Text style={styles.bookingLinkDescription}>
          Share this link with clients so they can book appointments directly.
        </Text>
        <View style={styles.linkActions}>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleCopyLink}
            activeOpacity={0.85}
          >
            <Text style={styles.linkButtonText}>
              {linkCopied ? "✓ Copied!" : "📋 Copy Link"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.linkButton, styles.linkButtonShare]}
            onPress={handleShareLink}
            activeOpacity={0.85}
          >
            <Text style={[styles.linkButtonText, styles.linkButtonShareText]}>
              ↑ Share Link
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
        Quick Actions
      </Text>
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => router.push("/(owner)/services")}
          activeOpacity={0.85}
        >
          <Text style={styles.quickActionEmoji}>💅</Text>
          <Text style={styles.quickActionLabel}>Services</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => router.push("/(owner)/availability")}
          activeOpacity={0.85}
        >
          <Text style={styles.quickActionEmoji}>🗓</Text>
          <Text style={styles.quickActionLabel}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => router.push("/(owner)/appointments")}
          activeOpacity={0.85}
        >
          <Text style={styles.quickActionEmoji}>📋</Text>
          <Text style={styles.quickActionLabel}>Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={handleShareLink}
          activeOpacity={0.85}
        >
          <Text style={styles.quickActionEmoji}>↑</Text>
          <Text style={styles.quickActionLabel}>Share Link</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  scrollContent: {
    paddingTop: rs(60, 80),
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm, // add gap between name and button
  },
  greeting: {
    fontSize: rs(14, 16),
    color: colors.darkGray,
    marginBottom: 2,
  },
  salonName: {
    fontSize: rs(22, 26), // slightly smaller to give more room
    fontWeight: "700",
    color: colors.charcoal,
    letterSpacing: -0.5,
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

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: rs(14, 16),
    fontWeight: "700",
    color: colors.charcoal,
  },
  cardLink: {
    fontSize: rs(13, 15),
    fontWeight: "600",
    color: colors.primary,
  },

  // Empty state
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    alignItems: "center",
    ...theme.shadows.sm,
  },
  emptyEmoji: {
    fontSize: rs(40, 48),
    marginBottom: theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: rs(16, 18),
    fontWeight: "700",
    color: colors.charcoal,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    fontSize: rs(13, 15),
    color: colors.darkGray,
    textAlign: "center",
    lineHeight: rs(20, 22),
    marginBottom: theme.spacing.md,
  },
  copyLinkButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.round,
  },
  copyLinkText: {
    fontSize: rs(14, 16),
    fontWeight: "700",
    color: colors.white,
  },

  // Date label
  dateLabel: {
    fontSize: rs(12, 14),
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: theme.spacing.sm,
    marginBottom: 4,
  },

  // See all
  seeAllButton: {
    paddingTop: theme.spacing.md,
    alignItems: "center",
  },
  seeAllText: {
    fontSize: rs(13, 15),
    fontWeight: "600",
    color: colors.primary,
  },

  // Quick actions
  quickActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.sm, // reduced from md
    alignItems: "center",
    gap: 4, // reduced from xs
    ...theme.shadows.sm,
  },
  quickActionEmoji: {
    fontSize: rs(20, 24), // reduced from 24/28
  },
  quickActionLabel: {
    fontSize: rs(9, 11), // reduced from 10/12
    fontWeight: "600",
    color: colors.darkGray,
    textAlign: "center",
  },
  newBookingBanner: {
    backgroundColor: colors.status.confirmed,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: "center",
  },
  newBookingText: {
    fontSize: rs(15, 17),
    fontWeight: "700",
    color: colors.white,
  },

  bookingLinkDescription: {
    fontSize: rs(13, 15),
    color: colors.darkGray,
    marginBottom: theme.spacing.md,
    lineHeight: rs(20, 22),
  },
  linkActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  linkButton: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.midGray,
  },
  linkButtonShare: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  linkButtonText: {
    fontSize: rs(14, 16),
    fontWeight: "700",
    color: colors.charcoal,
  },
  linkButtonShareText: {
    color: colors.white,
  },
});
