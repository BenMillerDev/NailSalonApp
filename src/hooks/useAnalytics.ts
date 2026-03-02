import { useMemo } from "react";
import { Appointment } from "../services/appointments";
import { useAppointments } from "./useAppointments";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type TimePeriod = "week" | "month" | "year";

export interface DailyRevenue {
  label: string;
  revenue: number;
  count: number;
}

export interface ServiceStat {
  name: string;
  count: number;
  revenue: number;
}

export interface DayStat {
  day: string;
  count: number;
}

export interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  totalClients: number;
  avgBookingValue: number;
  completionRate: number;
  revenueByPeriod: DailyRevenue[];
  topServices: ServiceStat[];
  busiestDays: DayStat[];
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getDateRange(period: TimePeriod): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (period) {
    case "week":
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case "month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "year":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}

function filterAppointments(
  appointments: Appointment[],
  start: Date,
  end: Date,
): Appointment[] {
  return appointments.filter((a) => {
    const date = new Date(a.startTime);
    return date >= start && date <= end && a.status !== "cancelled";
  });
}

function getRevenueByPeriod(
  appointments: Appointment[],
  period: TimePeriod,
  start: Date,
): DailyRevenue[] {
  if (period === "week") {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days.map((day, index) => {
      const dayAppts = appointments.filter((a) => {
        const date = new Date(a.startTime);
        return date.getDay() === index;
      });
      return {
        label: day,
        revenue: dayAppts.reduce((sum, a) => sum + a.totalPrice, 0),
        count: dayAppts.length,
      };
    });
  }

  if (period === "month") {
    const weeks = ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5"];
    return weeks.map((week, index) => {
      const weekAppts = appointments.filter((a) => {
        const date = new Date(a.startTime);
        const weekNum = Math.floor((date.getDate() - 1) / 7);
        return weekNum === index;
      });
      return {
        label: week,
        revenue: weekAppts.reduce((sum, a) => sum + a.totalPrice, 0),
        count: weekAppts.length,
      };
    });
  }

  // Year — by month
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months.map((month, index) => {
    const monthAppts = appointments.filter((a) => {
      const date = new Date(a.startTime);
      return date.getMonth() === index;
    });
    return {
      label: month,
      revenue: monthAppts.reduce((sum, a) => sum + a.totalPrice, 0),
      count: monthAppts.length,
    };
  });
}

function getTopServices(appointments: Appointment[]): ServiceStat[] {
  const stats: Record<string, ServiceStat> = {};

  appointments.forEach((appt) => {
    appt.services.forEach((service) => {
      if (!stats[service.name]) {
        stats[service.name] = { name: service.name, count: 0, revenue: 0 };
      }
      stats[service.name].count++;
      stats[service.name].revenue += service.price;
    });
  });

  return Object.values(stats)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function getBusiestDays(appointments: Appointment[]): DayStat[] {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const counts = new Array(7).fill(0);

  appointments.forEach((a) => {
    const dayIndex = new Date(a.startTime).getDay();
    counts[dayIndex]++;
  });

  return days
    .map((day, index) => ({ day, count: counts[index] }))
    .sort((a, b) => b.count - a.count);
}

// ─────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────

export function useAnalytics(period: TimePeriod) {
  const { upcoming, past } = useAppointments();
  const allAppointments = [...upcoming, ...past];

  const analytics = useMemo((): AnalyticsData => {
    const { start, end } = getDateRange(period);
    const filtered = filterAppointments(allAppointments, start, end);
    const completed = filtered.filter((a) => a.status === "completed");
    const allNonCancelled = allAppointments.filter(
      (a) => a.status !== "cancelled",
    );

    const totalRevenue = completed.reduce((sum, a) => sum + a.totalPrice, 0);
    const totalBookings = filtered.length;
    const uniqueClients = new Set(filtered.map((a) => a.clientEmail)).size;
    const avgBookingValue =
      completed.length > 0 ? totalRevenue / completed.length : 0;
    const completionRate =
      totalBookings > 0 ? (completed.length / totalBookings) * 100 : 0;

    return {
      totalRevenue,
      totalBookings,
      totalClients: uniqueClients,
      avgBookingValue,
      completionRate,
      revenueByPeriod: getRevenueByPeriod(filtered, period, start),
      topServices: getTopServices(allNonCancelled),
      busiestDays: getBusiestDays(allNonCancelled),
    };
  }, [allAppointments, period]);

  return analytics;
}
