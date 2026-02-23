import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "../../src/constants/colors";
import theme from "../../src/constants/theme";
import { useAuth } from "../../src/context/AuthContext";
import { containerWidth, rs } from "../../src/utils/responsive";

export default function DashboardScreen() {
  const { userProfile, logOut } = useAuth();
  const router = useRouter();

  const handleLogOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logOut();
          // _layout.tsx will automatically redirect to login
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back 💅</Text>
          <Text style={styles.salonName}>
            {userProfile?.salonName || "Your Salon"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogOut}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Placeholder Content */}
      <View style={styles.content}>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderEmoji}>🎉</Text>
          <Text style={styles.placeholderTitle}>You&apos;re all set!</Text>
          <Text style={styles.placeholderText}>
            Your account is created and you&apos;re logged in. The full
            dashboard is coming next.
          </Text>
        </View>

        {/* Quick stat placeholders */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Today&apos;s Bookings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Total Clients</Text>
          </View>
        </View>
        {/* Temporary nav buttons for testing */}
        <View style={styles.tempNav}>
          <TouchableOpacity
            style={styles.tempNavButton}
            onPress={() => router.push("/(owner)/services")}
            activeOpacity={0.85}
          >
            <Text style={styles.tempNavText}>→ Services</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...theme.components.screen,
    paddingTop: rs(60, 80),
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    fontSize: rs(14, 16),
    color: colors.darkGray,
    marginBottom: 2,
  },
  salonName: {
    fontSize: rs(24, 30),
    fontWeight: "700",
    color: colors.charcoal,
    letterSpacing: -0.5,
  },
  logoutButton: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.round,
  },
  logoutText: {
    fontSize: rs(13, 15),
    fontWeight: "600",
    color: colors.darkGray,
  },

  // Content
  content: {
    paddingHorizontal: theme.spacing.lg,
    alignItems: "center",
  },

  // Placeholder card
  placeholderCard: {
    width: containerWidth - theme.spacing.lg * 2,
    backgroundColor: colors.white,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  placeholderEmoji: {
    fontSize: rs(48, 64),
    marginBottom: theme.spacing.md,
  },
  placeholderTitle: {
    fontSize: rs(20, 24),
    fontWeight: "700",
    color: colors.charcoal,
    marginBottom: theme.spacing.sm,
  },
  placeholderText: {
    fontSize: rs(14, 16),
    color: colors.darkGray,
    textAlign: "center",
    lineHeight: rs(22, 26),
  },

  // Stats row
  statsRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    width: containerWidth - theme.spacing.lg * 2,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    alignItems: "center",
    ...theme.shadows.sm,
  },
  statNumber: {
    fontSize: rs(28, 36),
    fontWeight: "700",
    color: colors.primary,
  },
  statLabel: {
    fontSize: rs(11, 13),
    color: colors.darkGray,
    textAlign: "center",
    marginTop: 2,
  },
  // temporary nav buttons for testing
  tempNav: {
    marginTop: theme.spacing.lg,
    width: containerWidth - theme.spacing.lg * 2,
    gap: theme.spacing.sm,
  },
  tempNavButton: {
    backgroundColor: colors.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  tempNavText: {
    fontSize: rs(15, 17),
    fontWeight: "600",
    color: colors.primary,
  },
});
