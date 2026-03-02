import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "../../constants/colors";
import theme from "../../constants/theme";
import { rs } from "../../utils/responsive";

interface ChecklistItem {
  label: string;
  description: string;
  isComplete: boolean;
  onPress: () => void;
}

interface Props {
  hasAddedService: boolean;
  hasSetAvailability: boolean;
  hasSharedLink: boolean;
  onAddService: () => void;
  onSetAvailability: () => void;
  onShareLink: () => void;
  onDismiss: () => void;
}

function ChecklistRow({ item, index }: { item: ChecklistItem; index: number }) {
  return (
    <TouchableOpacity
      style={[styles.row, item.isComplete && styles.rowComplete]}
      onPress={item.isComplete ? undefined : item.onPress}
      activeOpacity={item.isComplete ? 1 : 0.8}
    >
      {/* Step indicator */}
      <View
        style={[
          styles.stepIndicator,
          item.isComplete && styles.stepIndicatorComplete,
        ]}
      >
        {item.isComplete ? (
          <Text style={styles.checkmark}>✓</Text>
        ) : (
          <Text style={styles.stepNumber}>{index + 1}</Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.rowContent}>
        <Text
          style={[styles.rowLabel, item.isComplete && styles.rowLabelComplete]}
        >
          {item.label}
        </Text>
        <Text style={styles.rowDescription}>{item.description}</Text>
      </View>

      {/* Arrow */}
      {!item.isComplete && <Text style={styles.arrow}>›</Text>}
    </TouchableOpacity>
  );
}

export default function OnboardingChecklist({
  hasAddedService,
  hasSetAvailability,
  hasSharedLink,
  onAddService,
  onSetAvailability,
  onShareLink,
  onDismiss,
}: Props) {
  const completedCount = [
    hasAddedService,
    hasSetAvailability,
    hasSharedLink,
  ].filter(Boolean).length;

  const totalSteps = 3;

  const items: ChecklistItem[] = [
    {
      label: "Add your first service",
      description: "Add the services you offer so clients can book them",
      isComplete: hasAddedService,
      onPress: onAddService,
    },
    {
      label: "Set your availability",
      description: "Tell clients when you're open for bookings",
      isComplete: hasSetAvailability,
      onPress: onSetAvailability,
    },
    {
      label: "Share your booking link",
      description: "Send your link to clients so they can start booking",
      isComplete: hasSharedLink,
      onPress: onShareLink,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Get started 🚀</Text>
          <Text style={styles.subtitle}>
            {completedCount} of {totalSteps} steps complete
          </Text>
        </View>
        {completedCount === totalSteps && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
            activeOpacity={0.8}
          >
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${(completedCount / totalSteps) * 100}%` as any },
          ]}
        />
      </View>

      {/* Checklist Items */}
      <View style={styles.checklist}>
        {items.map((item, index) => (
          <ChecklistRow key={item.label} item={item} index={index} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    ...theme.shadows.sm,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: rs(16, 18),
    fontWeight: "700",
    color: colors.charcoal,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: rs(12, 14),
    color: colors.darkGray,
  },
  dismissButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.round,
    backgroundColor: colors.lightGray,
  },
  dismissText: {
    fontSize: rs(12, 14),
    fontWeight: "600",
    color: colors.darkGray,
  },

  // Progress
  progressTrack: {
    height: 4,
    backgroundColor: colors.lightGray,
    borderRadius: theme.radius.round,
    marginBottom: theme.spacing.md,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: theme.radius.round,
  },

  // Rows
  checklist: {
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: colors.offWhite,
  },
  rowComplete: {
    backgroundColor: colors.status.confirmed + "10",
  },
  stepIndicator: {
    width: rs(28, 32),
    height: rs(28, 32),
    borderRadius: rs(14, 16),
    backgroundColor: colors.lightGray,
    borderWidth: 1.5,
    borderColor: colors.midGray,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepIndicatorComplete: {
    backgroundColor: colors.status.confirmed,
    borderColor: colors.status.confirmed,
  },
  checkmark: {
    fontSize: rs(13, 15),
    fontWeight: "700",
    color: colors.white,
  },
  stepNumber: {
    fontSize: rs(12, 14),
    fontWeight: "700",
    color: colors.darkGray,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: rs(13, 15),
    fontWeight: "700",
    color: colors.charcoal,
    marginBottom: 2,
  },
  rowLabelComplete: {
    color: colors.darkGray,
    textDecorationLine: "line-through",
  },
  rowDescription: {
    fontSize: rs(11, 13),
    color: colors.darkGray,
    lineHeight: rs(16, 18),
  },
  arrow: {
    fontSize: rs(20, 24),
    color: colors.midGray,
    flexShrink: 0,
  },
});
