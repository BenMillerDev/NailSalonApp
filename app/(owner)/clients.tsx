import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import colors from "../../src/constants/colors";
import theme from "../../src/constants/theme";
import { ClientProfile, useClients } from "../../src/hooks/useClients";
import { formatPrice } from "../../src/utils/formatters";
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
  const colors = [
    "#4A90D9",
    "#7BB8E8",
    "#2C6FAC",
    "#5BAD8F",
    "#E8C97A",
    "#D97A7A",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

function ClientCard({
  client,
  onPress,
}: {
  client: ClientProfile;
  onPress: () => void;
}) {
  const lastVisit = client.lastVisitDate
    ? new Date(client.lastVisitDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "No visits yet";

  const fillDue = client.fillDueDate ? new Date(client.fillDueDate) : null;

  const isFillOverdue = fillDue && fillDue < new Date();
  const isFillDueSoon =
    fillDue &&
    !isFillOverdue &&
    fillDue < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <TouchableOpacity
      style={styles.clientCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Avatar */}
      <View
        style={[
          styles.avatar,
          { backgroundColor: getAvatarColor(client.name) },
        ]}
      >
        <Text style={styles.avatarText}>{getInitials(client.name)}</Text>
      </View>

      {/* Info */}
      <View style={styles.clientInfo}>
        <View style={styles.clientNameRow}>
          <Text style={styles.clientName}>{client.name}</Text>
          {(isFillOverdue || isFillDueSoon) && (
            <View
              style={[
                styles.fillBadge,
                {
                  backgroundColor: isFillOverdue
                    ? colors.error + "20"
                    : colors.status.pending + "20",
                },
              ]}
            >
              <Text
                style={[
                  styles.fillBadgeText,
                  {
                    color: isFillOverdue ? colors.error : colors.status.pending,
                  },
                ]}
              >
                {isFillOverdue ? "Fill overdue" : "Fill due soon"}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.clientMeta}>
          {client.totalVisits} visit{client.totalVisits !== 1 ? "s" : ""} •{" "}
          {formatPrice(client.totalSpent)} spent • Last: {lastVisit}
        </Text>
        {client.preferredServices.length > 0 && (
          <Text style={styles.clientServices} numberOfLines={1}>
            {client.preferredServices.map((s) => s.name).join(", ")}
          </Text>
        )}
      </View>

      {/* Chevron */}
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function ClientsScreen() {
  const router = useRouter();
  const { clients, isLoading } = useClients();
  const [search, setSearch] = useState("");

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading clients...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clients</Text>
        <Text style={styles.headerCount}>{clients.length} total</Text>
      </View>

      {/* Search */}
      {clients.length > 0 && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or phone..."
            placeholderTextColor={colors.midGray}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
      )}

      {/* List */}
      {clients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>👥</Text>
          <Text style={styles.emptyTitle}>No clients yet</Text>
          <Text style={styles.emptyText}>
            Clients will appear here automatically once they book an appointment
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.email}
          renderItem={({ item }) => (
            <ClientCard
              client={item}
              onPress={() =>
                router.push({
                  pathname: "/(owner)/client-profile" as any,
                  params: { email: item.email },
                })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>
                No clients match &quot;{search}&quot;
              </Text>
            </View>
          }
        />
      )}
    </View>
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
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: rs(28, 34),
    fontWeight: "700",
    color: colors.charcoal,
    letterSpacing: -0.5,
  },
  headerCount: {
    fontSize: rs(13, 15),
    color: colors.darkGray,
    fontWeight: "500",
  },

  // Search
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    ...theme.components.input,
    fontSize: rs(14, 16),
  },

  // List
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },

  // Client card
  clientCard: {
    backgroundColor: colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  avatar: {
    width: rs(44, 52),
    height: rs(44, 52),
    borderRadius: rs(22, 26),
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: rs(16, 18),
    fontWeight: "700",
    color: colors.white,
  },
  clientInfo: {
    flex: 1,
  },
  clientNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: 2,
    flexWrap: "wrap",
  },
  clientName: {
    fontSize: rs(15, 17),
    fontWeight: "700",
    color: colors.charcoal,
  },
  fillBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.round,
  },
  fillBadgeText: {
    fontSize: rs(10, 12),
    fontWeight: "700",
  },
  clientMeta: {
    fontSize: rs(12, 13),
    color: colors.darkGray,
    marginBottom: 2,
  },
  clientServices: {
    fontSize: rs(11, 13),
    color: colors.midGray,
  },
  chevron: {
    fontSize: rs(20, 24),
    color: colors.midGray,
    flexShrink: 0,
  },

  // Empty
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
    fontSize: rs(20, 24),
    fontWeight: "700",
    color: colors.charcoal,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: rs(14, 16),
    color: colors.darkGray,
    textAlign: "center",
    lineHeight: rs(22, 26),
  },
  noResultsContainer: {
    paddingTop: theme.spacing.xl,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: rs(14, 16),
    color: colors.darkGray,
  },
});
