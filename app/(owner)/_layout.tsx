import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import colors from "../../src/constants/colors";
import { rs } from "../../src/utils/responsive";

// ─────────────────────────────────────────────
// TAB ICONS
// Simple emoji-based icons to start
// We can replace with proper icons later
// ─────────────────────────────────────────────

function TabIcon({
  emoji,
  label,
  focused,
}: {
  emoji: string;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={styles.tabIcon}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text
        style={[
          styles.tabLabel,
          focused ? styles.tabLabelActive : styles.tabLabelInactive,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// LAYOUT
// ─────────────────────────────────────────────

export default function OwnerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.midGray,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📅" label="Bookings" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💅" label="Services" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="availability"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🗓" label="Schedule" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚙️" label="Settings" focused={focused} />
          ),
        }}
      />

      {/* Hide service-form from tab bar since it's a sub-screen */}
      <Tabs.Screen
        name="service-form"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0EEF2",
    height: rs(65, 75),
    paddingBottom: rs(8, 12),
    paddingTop: rs(6, 8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tabIcon: {
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    width: rs(58, 70), // constrains each tab width so they don't spread too far
  },
  tabEmoji: {
    fontSize: rs(20, 24), // slightly smaller emoji
  },
  tabLabel: {
    fontSize: rs(9, 11), // slightly smaller text
    fontWeight: "600",
    textAlign: "center",
  },
  tabLabelActive: {
    color: colors.primary,
  },
  tabLabelInactive: {
    color: colors.midGray,
  },
});
