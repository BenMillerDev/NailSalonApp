import { useRouter } from "expo-router";
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
import { useServices } from "../../src/hooks/useServices";
import { SalonService } from "../../src/services/services";
import { formatDuration, formatPrice } from "../../src/utils/formatters";
import { rs } from "../../src/utils/responsive";

export default function ServicesScreen() {
  const { servicesByCategory, isLoading, remove, toggle } = useServices();
  const router = useRouter();

  const handleDelete = (service: SalonService) => {
    Alert.alert(
      "Delete Service",
      `Are you sure you want to delete "${service.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (service.id) await remove(service.id);
          },
        },
      ],
    );
  };

  const handleToggle = async (service: SalonService) => {
    if (service.id) await toggle(service.id, !service.isActive);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  const categories = Object.keys(servicesByCategory);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services</Text>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.85}
          onPress={() => router.push("/(owner)/service-form" as any)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Empty State */}
      {categories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💅</Text>
          <Text style={styles.emptyTitle}>No services yet</Text>
          <Text style={styles.emptyText}>
            Tap the Add button to create your first service
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {categories.map((category) => (
            <View key={category} style={styles.categorySection}>
              {/* Category Header */}
              <Text style={styles.categoryTitle}>{category}</Text>

              {/* Services in Category */}
              {servicesByCategory[category].map((service) => (
                <View key={service.id} style={styles.serviceCard}>
                  {/* Service Info */}
                  <View style={styles.serviceInfo}>
                    <View style={styles.serviceNameRow}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Switch
                        value={service.isActive}
                        onValueChange={() => handleToggle(service)}
                        trackColor={{
                          false: colors.midGray,
                          true: colors.primaryLight,
                        }}
                        thumbColor={
                          service.isActive ? colors.primary : colors.white
                        }
                      />
                    </View>
                    <Text style={styles.serviceDescription}>
                      {service.description}
                    </Text>
                    <View style={styles.serviceMeta}>
                      <View style={styles.metaChip}>
                        <Text style={styles.metaText}>
                          {formatDuration(service.duration)}
                        </Text>
                      </View>
                      <View style={styles.metaChip}>
                        <Text style={styles.metaText}>
                          {formatPrice(service.price)}
                        </Text>
                      </View>
                      {!service.isActive && (
                        <View style={[styles.metaChip, styles.inactiveChip]}>
                          <Text style={styles.inactiveChipText}>Hidden</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.serviceActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() =>
                        router.push({
                          pathname: "/(owner)/service-form" as any,
                          params: { serviceId: service.id },
                        })
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(service)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
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
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: rs(28, 34),
    fontWeight: "700",
    color: colors.charcoal,
    letterSpacing: -0.5,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.round,
  },
  addButtonText: {
    fontSize: rs(14, 16),
    fontWeight: "700",
    color: colors.white,
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

  // Scroll
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },

  // Category
  categorySection: {
    marginBottom: theme.spacing.lg,
  },
  categoryTitle: {
    fontSize: rs(13, 15),
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },

  // Service card
  serviceCard: {
    backgroundColor: colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  serviceInfo: {
    marginBottom: theme.spacing.sm,
  },
  serviceNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  serviceName: {
    fontSize: rs(16, 18),
    fontWeight: "700",
    color: colors.charcoal,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  serviceDescription: {
    fontSize: rs(13, 15),
    color: colors.darkGray,
    lineHeight: rs(20, 22),
    marginBottom: theme.spacing.sm,
  },
  serviceMeta: {
    flexDirection: "row",
    gap: theme.spacing.xs,
    flexWrap: "wrap",
  },
  metaChip: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.round,
  },
  metaText: {
    fontSize: rs(12, 13),
    fontWeight: "600",
    color: colors.accentDark,
  },
  inactiveChip: {
    backgroundColor: colors.lightGray,
  },
  inactiveChipText: {
    fontSize: rs(12, 13),
    fontWeight: "600",
    color: colors.darkGray,
  },

  // Action buttons
  serviceActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: theme.spacing.sm,
  },
  editButton: {
    flex: 1,
    backgroundColor: colors.accentLight,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    alignItems: "center",
  },
  editButtonText: {
    fontSize: rs(13, 15),
    fontWeight: "600",
    color: colors.accentDark,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#FFF0F0",
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: rs(13, 15),
    fontWeight: "600",
    color: colors.error,
  },
});
