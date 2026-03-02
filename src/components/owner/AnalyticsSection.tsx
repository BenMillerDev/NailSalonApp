import { useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import colors from "../../constants/colors";
import theme from "../../constants/theme";
import { TimePeriod, useAnalytics } from "../../hooks/useAnalytics";
import { formatPrice } from "../../utils/formatters";
import { rs } from "../../utils/responsive";

// ─────────────────────────────────────────────
// BAR CHART
// ─────────────────────────────────────────────

function BarChart({
  data,
}: {
  data: { label: string; revenue: number; count: number }[];
}) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.bars}>
        {data.map((item, index) => (
          <View key={index} style={chartStyles.barColumn}>
            <Text style={chartStyles.barValue}>
              {item.revenue > 0 ? formatPrice(item.revenue) : ""}
            </Text>
            <View style={chartStyles.barTrack}>
              <View
                style={[
                  chartStyles.bar,
                  {
                    height:
                      `${Math.max((item.revenue / maxRevenue) * 100, item.revenue > 0 ? 4 : 0)}%` as any,
                    backgroundColor:
                      item.revenue > 0 ? colors.primary : colors.lightGray,
                  },
                ]}
              />
            </View>
            <Text style={chartStyles.barLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.sm,
  },
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: rs(120, 150),
    gap: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  barValue: {
    fontSize: rs(7, 9),
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 2,
    textAlign: "center",
  },
  barTrack: {
    flex: 1,
    width: "80%",
    justifyContent: "flex-end",
    backgroundColor: colors.lightGray,
    borderRadius: theme.radius.sm,
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    borderRadius: theme.radius.sm,
    minHeight: 2,
  },
  barLabel: {
    fontSize: rs(8, 10),
    fontWeight: "600",
    color: colors.darkGray,
    marginTop: 4,
    textAlign: "center",
  },
});

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

const PERIODS: { key: TimePeriod; label: string }[] = [
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" },
];

export default function AnalyticsSection() {
  const [period, setPeriod] = useState<TimePeriod>("month");
  const analytics = useAnalytics(period);

  return (
    <View>
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[
              styles.periodChip,
              period === p.key && styles.periodChipActive,
            ]}
            onPress={() => setPeriod(p.key)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.periodChipText,
                period === p.key && styles.periodChipTextActive,
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Key Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {formatPrice(analytics.totalRevenue)}
          </Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{analytics.totalBookings}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{analytics.totalClients}</Text>
          <Text style={styles.statLabel}>Clients</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {formatPrice(analytics.avgBookingValue)}
          </Text>
          <Text style={styles.statLabel}>Avg Value</Text>
        </View>
      </View>

      {/* Completion Rate */}
      <View style={styles.card}>
        <View style={styles.completionHeader}>
          <Text style={styles.cardTitle}>Completion Rate</Text>
          <Text style={styles.completionValue}>
            {analytics.completionRate.toFixed(0)}%
          </Text>
        </View>
        <View style={styles.completionTrack}>
          <View
            style={[
              styles.completionFill,
              { width: `${analytics.completionRate}%` as any },
            ]}
          />
        </View>
        <Text style={styles.completionSubtext}>
          Completed vs total non-cancelled bookings
        </Text>
      </View>

      {/* Revenue Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Revenue</Text>
        <BarChart data={analytics.revenueByPeriod} />
      </View>

      {/* Top Services */}
      {analytics.topServices.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Services</Text>
          {analytics.topServices.map((service, index) => {
            const maxCount = analytics.topServices[0].count;
            return (
              <View key={service.name} style={styles.serviceRow}>
                <Text style={styles.serviceRank}>#{index + 1}</Text>
                <View style={styles.serviceInfo}>
                  <View style={styles.serviceNameRow}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceStats}>
                      {service.count}x • {formatPrice(service.revenue)}
                    </Text>
                  </View>
                  <View style={styles.serviceTrack}>
                    <View
                      style={[
                        styles.serviceFill,
                        {
                          width: `${(service.count / maxCount) * 100}%` as any,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Busiest Days */}
      {analytics.busiestDays.some((d) => d.count > 0) && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Busiest Days</Text>
          {analytics.busiestDays
            .filter((d) => d.count > 0)
            .map((day, index) => {
              const maxCount = analytics.busiestDays[0].count;
              return (
                <View key={day.day} style={styles.dayRow}>
                  <Text style={styles.dayName}>{day.day}</Text>
                  <View style={styles.dayTrack}>
                    <View
                      style={[
                        styles.dayFill,
                        {
                          width: `${(day.count / maxCount) * 100}%` as any,
                          backgroundColor:
                            index === 0 ? colors.primary : colors.primaryLight,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.dayCount}>{day.count}</Text>
                </View>
              );
            })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Period selector
  periodSelector: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  periodChip: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.round,
    borderWidth: 1.5,
    borderColor: colors.midGray,
    alignItems: "center",
  },
  periodChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodChipText: {
    fontSize: rs(11, 13),
    fontWeight: "600",
    color: colors.darkGray,
  },
  periodChipTextActive: {
    color: colors.white,
  },

  // Stats grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  statCard: {
    width: "47.5%",
    backgroundColor: colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  statValue: {
    fontSize: rs(20, 24),
    fontWeight: "700",
    color: colors.charcoal,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: rs(11, 13),
    fontWeight: "600",
    color: colors.darkGray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardTitle: {
    fontSize: rs(13, 15),
    fontWeight: "700",
    color: colors.charcoal,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },

  // Completion rate
  completionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  completionValue: {
    fontSize: rs(20, 24),
    fontWeight: "700",
    color: colors.primary,
  },
  completionTrack: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: theme.radius.round,
    overflow: "hidden",
    marginBottom: theme.spacing.sm,
  },
  completionFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: theme.radius.round,
  },
  completionSubtext: {
    fontSize: rs(11, 13),
    color: colors.midGray,
  },

  // Top services
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  serviceRank: {
    fontSize: rs(12, 14),
    fontWeight: "700",
    color: colors.midGray,
    width: rs(24, 28),
  },
  serviceInfo: {
    flex: 1,
  },
  serviceNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  serviceName: {
    fontSize: rs(13, 15),
    fontWeight: "600",
    color: colors.charcoal,
    flex: 1,
  },
  serviceStats: {
    fontSize: rs(11, 13),
    color: colors.darkGray,
  },
  serviceTrack: {
    height: 4,
    backgroundColor: colors.lightGray,
    borderRadius: theme.radius.round,
    overflow: "hidden",
  },
  serviceFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: theme.radius.round,
  },

  // Busiest days
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  dayName: {
    fontSize: rs(12, 14),
    fontWeight: "600",
    color: colors.darkGray,
    width: rs(72, 84),
  },
  dayTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: theme.radius.round,
    overflow: "hidden",
  },
  dayFill: {
    height: "100%",
    borderRadius: theme.radius.round,
  },
  dayCount: {
    fontSize: rs(12, 14),
    fontWeight: "700",
    color: colors.charcoal,
    width: rs(20, 24),
    textAlign: "right",
  },
});
