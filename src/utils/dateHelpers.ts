import {
    addDays,
    differenceInDays,
    differenceInMinutes,
    format,
    formatDistanceToNow,
    isBefore,
    isThisWeek,
    isToday,
    isTomorrow,
    parseISO,
    startOfDay
} from "date-fns";

/**
 * Format a date for display in the app
 * e.g. "Monday, March 3" or "Today" or "Tomorrow"
 */
export function formatAppointmentDate(date) {
  const parsed = typeof date === "string" ? parseISO(date) : date;

  if (isToday(parsed)) return "Today";
  if (isTomorrow(parsed)) return "Tomorrow";
  if (isThisWeek(parsed)) return format(parsed, "EEEE"); // "Wednesday"
  return format(parsed, "EEEE, MMMM d"); // "Monday, March 3"
}

/**
 * Format a full appointment date and time for confirmations
 * e.g. "Monday, March 3 at 2:30 PM"
 */
export function formatAppointmentDateTime(date) {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  return format(parsed, "EEEE, MMMM d 'at' h:mm a");
}

/**
 * Format just the time portion
 * e.g. "2:30 PM"
 */
export function formatTime(date) {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  return format(parsed, "h:mm a");
}

/**
 * Format a short date for calendar displays
 * e.g. "Mar 3"
 */
export function formatShortDate(date) {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  return format(parsed, "MMM d");
}

/**
 * Format a date for Firestore storage
 * Always store dates as ISO strings for consistency
 */
export function toFirestoreDate(date) {
  return date.toISOString();
}

/**
 * Get a human readable relative time
 * e.g. "in 2 days", "3 hours ago"
 */
export function getRelativeTime(date) {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(parsed, { addSuffix: true });
}

/**
 * Get the next N days as an array of Date objects
 * Used to populate the date picker in the booking flow
 */
export function getNextDays(numDays = 30) {
  const days = [];
  const today = new Date();
  for (let i = 0; i < numDays; i++) {
    days.push(addDays(today, i));
  }
  return days;
}

/**
 * Get the days of the current week for the owner's dashboard calendar
 */
export function getCurrentWeekDays() {
  const days = [];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = addDays(today, -dayOfWeek);

  for (let i = 0; i < 7; i++) {
    days.push(addDays(startOfWeek, i));
  }
  return days;
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date) {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  return isBefore(parsed, startOfDay(new Date()));
}

/**
 * Check if an appointment is coming up soon (within 24 hours)
 */
export function isUpcomingSoon(date) {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  const now = new Date();
  const diff = differenceInMinutes(parsed, now);
  return diff > 0 && diff <= 1440; // 1440 minutes = 24 hours
}

/**
 * Calculate how many days until a fill is due
 * Used for the fill reminder system
 */
export function daysUntilFill(lastAppointmentDate, fillIntervalDays) {
  const parsed =
    typeof lastAppointmentDate === "string"
      ? parseISO(lastAppointmentDate)
      : lastAppointmentDate;
  const fillDueDate = addDays(parsed, fillIntervalDays);
  const daysRemaining = differenceInDays(fillDueDate, new Date());
  return {
    dueDate: fillDueDate,
    daysRemaining,
    isOverdue: daysRemaining < 0,
    isDueSoon: daysRemaining >= 0 && daysRemaining <= 3,
  };
}

/**
 * Get the day name from a Date object
 * Matches the format used in availability settings
 * e.g. "monday", "tuesday"
 */
export function getDayKey(date) {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[date.getDay()];
}

/**
 * Format a day key back to a display label
 * e.g. "monday" → "Monday"
 */
export function formatDayLabel(dayKey) {
  return dayKey.charAt(0).toUpperCase() + dayKey.slice(1);
}
