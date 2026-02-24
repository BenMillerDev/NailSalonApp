import { addMinutes, isAfter, isBefore, isSameDay, parseISO } from "date-fns";
import { AddOn, Availability, NailLength, Service } from "../types";

export type DayKey =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
}

interface BlockedRange {
  start: Date;
  end: Date;
}

export interface SlotsByPeriod {
  morning: Date[];
  afternoon: Date[];
  evening: Date[];
}

/**
 * Generate available time slots for a given date
 */
export function getAvailableSlots(
  date: Date,
  totalDuration: number,
  availability: Availability,
  existingBookings: Booking[],
  bufferTime: number = 15,
): Date[] {
  const dayOfWeek = getDayName(date);
  const dayAvailability = availability[dayOfWeek];

  if (!dayAvailability || !dayAvailability.isOpen) return [];

  const blockedRanges = getBlockedRanges(date, existingBookings, bufferTime);

  const manualBlocks = availability.blockedDates || [];
  const isDateBlocked = manualBlocks.some((blocked) =>
    isSameDay(parseISO(blocked), date),
  );
  if (isDateBlocked) return [];

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

  const now = new Date();
  if (isSameDay(date, now)) {
    const minimumStart = addMinutes(now, 60);
    return slots.filter((slot) => isAfter(slot, minimumStart));
  }

  return slots;
}

/**
 * Calculate total duration of selected services and add-ons
 */
export function calculateTotalDuration(
  selectedServices: Service[],
  selectedAddOns: AddOn[] = [],
  nailLength: NailLength | null = null,
): number {
  const servicesDuration = selectedServices.reduce(
    (total, s) => total + s.duration,
    0,
  );
  const addOnsDuration = selectedAddOns.reduce(
    (total, a) => total + a.duration,
    0,
  );
  const lengthExtra = nailLength ? nailLength.extraDuration : 0;
  return servicesDuration + addOnsDuration + lengthExtra;
}

/**
 * Calculate total price
 */
export function calculateTotalPrice(
  selectedServices: Service[],
  selectedAddOns: AddOn[] = [],
  nailLength: NailLength | null = null,
): number {
  const servicesPrice = selectedServices.reduce(
    (total, s) => total + s.price,
    0,
  );
  const addOnsPrice = selectedAddOns.reduce((total, a) => total + a.price, 0);
  const lengthExtra = nailLength ? nailLength.extraPrice : 0;
  return servicesPrice + addOnsPrice + lengthExtra;
}

/**
 * Group slots by morning / afternoon / evening
 */
export function groupSlotsByPeriod(slots: Date[]): SlotsByPeriod {
  return {
    morning: slots.filter((s) => s.getHours() >= 6 && s.getHours() < 12),
    afternoon: slots.filter((s) => s.getHours() >= 12 && s.getHours() < 17),
    evening: slots.filter((s) => s.getHours() >= 17),
  };
}

// ─────────────────────────────────────────────
// PRIVATE HELPERS
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
    .filter((b) => isSameDay(parseISO(b.startTime), date))
    .map((b) => ({
      start: addMinutes(parseISO(b.startTime), -bufferTime),
      end: addMinutes(parseISO(b.endTime), bufferTime),
    }));
}

function overlapsWithBlocked(
  slotStart: Date,
  slotEnd: Date,
  blockedRanges: BlockedRange[],
): boolean {
  return blockedRanges.some(
    (range) => isBefore(slotStart, range.end) && isAfter(slotEnd, range.start),
  );
}
