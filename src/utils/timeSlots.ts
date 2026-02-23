import {
  addMinutes,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
} from "date-fns";
import { AddOn, NailLength, Service } from "../constants/services";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface Availability {
  sunday?: DayAvailability;
  monday?: DayAvailability;
  tuesday?: DayAvailability;
  wednesday?: DayAvailability;
  thursday?: DayAvailability;
  friday?: DayAvailability;
  saturday?: DayAvailability;
  blockedDates?: string[];
}

export interface DayAvailability {
  isOpen: boolean;
  startTime: string; // "9:00"
  endTime: string; // "18:00"
}

export interface Booking {
  id: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
}

export interface BlockedRange {
  start: Date;
  end: Date;
}

export interface SlotsByPeriod {
  morning: Date[];
  afternoon: Date[];
  evening: Date[];
}

export type DayKey =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

// ─────────────────────────────────────────────
// CORE TIME SLOT ALGORITHM
// ─────────────────────────────────────────────

/**
 * Generate available time slots for a given date
 *
 * @param date - The date to check
 * @param totalDuration - Total minutes needed (services + add-ons)
 * @param availability - Owner's weekly availability from Firestore
 * @param existingBookings - Already booked appointments for this date
 * @param bufferTime - Minutes between appointments (default 15)
 * @returns Array of available start times as Date objects
 */
export function getAvailableSlots(
  date: Date,
  totalDuration: number,
  availability: Availability,
  existingBookings: Booking[],
  bufferTime: number = 15,
): Date[] {
  // Step 1 — Get the owner's hours for this day of the week
  const dayOfWeek = getDayName(date);
  const dayAvailability = availability[dayOfWeek];

  // If the owner isn't working this day, return nothing
  if (!dayAvailability || !dayAvailability.isOpen) {
    return [];
  }

  // Step 2 — Build the list of already blocked time ranges for this date
  const blockedRanges = getBlockedRanges(date, existingBookings, bufferTime);

  // Step 3 — Check if this date is manually blocked by the owner
  const manualBlocks = availability.blockedDates || [];
  const isDateBlocked = manualBlocks.some((blocked) =>
    isSameDay(parseISO(blocked), date),
  );
  if (isDateBlocked) return [];

  // Step 4 — Generate every possible start time in 15 minute increments
  const workStart = parseTimeString(date, dayAvailability.startTime);
  const workEnd = parseTimeString(date, dayAvailability.endTime);
  const slots: Date[] = [];
  let current = workStart;

  while (isBefore(current, workEnd)) {
    const slotEnd = addMinutes(current, totalDuration);

    if (
      !isAfter(slotEnd, workEnd) &&
      !overlapsWithBlocked(current, slotEnd, blockedRanges)
    ) {
      slots.push(new Date(current));
    }

    current = addMinutes(current, 15);
  }

  // Step 5 — Filter out slots that have already passed if checking today
  const now = new Date();
  if (isSameDay(date, now)) {
    const minimumStart = addMinutes(now, 60);
    return slots.filter((slot) => isAfter(slot, minimumStart));
  }

  return slots;
}

/**
 * Calculate the total duration of a booking
 * including all selected services, add-ons, and nail length extras
 *
 * @param selectedServices - Service objects from services.ts
 * @param selectedAddOns - Add-on objects from services.ts
 * @param nailLength - Nail length object with extraDuration
 * @returns Total duration in minutes
 */
export function calculateTotalDuration(
  selectedServices: Service[],
  selectedAddOns: AddOn[] = [],
  nailLength: NailLength | null = null,
): number {
  const servicesDuration = selectedServices.reduce((total, service) => {
    return total + service.duration;
  }, 0);

  const addOnsDuration = selectedAddOns.reduce((total, addOn) => {
    return total + addOn.duration;
  }, 0);

  const lengthExtra = nailLength ? nailLength.extraDuration : 0;

  return servicesDuration + addOnsDuration + lengthExtra;
}

/**
 * Calculate the total price of a booking
 *
 * @param selectedServices - Service objects
 * @param selectedAddOns - Add-on objects
 * @param nailLength - Nail length object with extraPrice
 * @returns Total price in dollars
 */
export function calculateTotalPrice(
  selectedServices: Service[],
  selectedAddOns: AddOn[] = [],
  nailLength: NailLength | null = null,
): number {
  const servicesPrice = selectedServices.reduce((total, service) => {
    return total + service.price;
  }, 0);

  const addOnsPrice = selectedAddOns.reduce((total, addOn) => {
    return total + addOn.price;
  }, 0);

  const lengthExtra = nailLength ? nailLength.extraPrice : 0;

  return servicesPrice + addOnsPrice + lengthExtra;
}

/**
 * Check if a specific time slot is still available
 * Used right before confirming a booking to prevent
 * two people booking the same slot simultaneously
 *
 * @param startTime - Proposed start time
 * @param totalDuration - Total minutes needed
 * @param existingBookings - Current bookings for that day
 * @param bufferTime - Buffer between appointments
 * @returns True if slot is still available
 */
export function isSlotStillAvailable(
  startTime: Date,
  totalDuration: number,
  existingBookings: Booking[],
  bufferTime: number = 15,
): boolean {
  const endTime = addMinutes(startTime, totalDuration);
  const blockedRanges = getBlockedRanges(
    startTime,
    existingBookings,
    bufferTime,
  );
  return !overlapsWithBlocked(startTime, endTime, blockedRanges);
}

/**
 * Format a time slot for display
 * e.g. Date → "2:30 PM"
 */
export function formatTimeSlot(date: Date): string {
  return format(date, "h:mm a");
}

/**
 * Format a duration in minutes to a readable string
 * e.g. 90 → "1 hr 30 min", 60 → "1 hr", 45 → "45 min"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) return `${hours} hr`;
  return `${hours} hr ${remaining} min`;
}

/**
 * Group time slots by morning / afternoon / evening
 * Makes the booking UI easier to navigate
 */
export function groupSlotsByPeriod(slots: Date[]): SlotsByPeriod {
  return {
    morning: slots.filter((slot) => {
      const hour = slot.getHours();
      return hour >= 6 && hour < 12;
    }),
    afternoon: slots.filter((slot) => {
      const hour = slot.getHours();
      return hour >= 12 && hour < 17;
    }),
    evening: slots.filter((slot) => {
      const hour = slot.getHours();
      return hour >= 17;
    }),
  };
}

// ─────────────────────────────────────────────
// PRIVATE HELPER FUNCTIONS
// ─────────────────────────────────────────────

function getDayName(date: Date): DayKey {
  const days: DayKey[] = [
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

function parseTimeString(date: Date, timeString: string): Date {
  const [hours, minutes] = timeString.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function getBlockedRanges(
  date: Date,
  bookings: Booking[],
  bufferTime: number,
): BlockedRange[] {
  return bookings
    .filter((booking) => isSameDay(parseISO(booking.startTime), date))
    .map((booking) => ({
      start: addMinutes(parseISO(booking.startTime), -bufferTime),
      end: addMinutes(parseISO(booking.endTime), bufferTime),
    }));
}

function overlapsWithBlocked(
  slotStart: Date,
  slotEnd: Date,
  blockedRanges: BlockedRange[],
): boolean {
  return blockedRanges.some((range) => {
    return isBefore(slotStart, range.end) && isAfter(slotEnd, range.start);
  });
}
