import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { DayKey } from "../utils/timeSlots";
import { db } from "./firebase";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface DaySchedule {
  isOpen: boolean;
  startTime: string; // "9:00"
  endTime: string; // "18:00"
}

export interface OwnerAvailability {
  ownerId: string;
  sunday: DaySchedule;
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  bufferTime: number; // minutes between appointments
  maxBookingsPerDay: number;
  blockedDates: string[]; // ISO date strings
  updatedAt?: any;
}

export interface BlockedDate {
  date: string; // ISO string
  reason?: string;
}

// ─────────────────────────────────────────────
// DEFAULT AVAILABILITY
// ─────────────────────────────────────────────

export const DEFAULT_AVAILABILITY: Omit<OwnerAvailability, "ownerId"> = {
  sunday: { isOpen: false, startTime: "9:00", endTime: "18:00" },
  monday: { isOpen: false, startTime: "9:00", endTime: "18:00" },
  tuesday: { isOpen: true, startTime: "9:00", endTime: "18:00" },
  wednesday: { isOpen: true, startTime: "9:00", endTime: "18:00" },
  thursday: { isOpen: true, startTime: "9:00", endTime: "18:00" },
  friday: { isOpen: true, startTime: "9:00", endTime: "18:00" },
  saturday: { isOpen: true, startTime: "9:00", endTime: "17:00" },
  bufferTime: 15,
  maxBookingsPerDay: 8,
  blockedDates: [],
};

// ─────────────────────────────────────────────
// AVAILABILITY FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Fetch availability for a given owner
 * Creates default availability if none exists yet
 */
export async function getAvailability(
  ownerId: string,
): Promise<OwnerAvailability> {
  try {
    const docRef = doc(db, "availability", ownerId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      return snapshot.data() as OwnerAvailability;
    }

    // No availability set yet — create defaults
    const defaultData: OwnerAvailability = {
      ...DEFAULT_AVAILABILITY,
      ownerId,
    };
    await setDoc(docRef, defaultData);
    return defaultData;
  } catch (error) {
    console.error("Error fetching availability:", error);
    return { ...DEFAULT_AVAILABILITY, ownerId };
  }
}

/**
 * Save the full availability object
 */
export async function saveAvailability(
  ownerId: string,
  availability: Omit<OwnerAvailability, "ownerId">,
): Promise<{ success: boolean; error?: string }> {
  try {
    await setDoc(doc(db, "availability", ownerId), {
      ...availability,
      ownerId,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update a single day's schedule
 */
export async function updateDaySchedule(
  ownerId: string,
  day: DayKey,
  schedule: DaySchedule,
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, "availability", ownerId), {
      [day]: schedule,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update buffer time between appointments
 */
export async function updateBufferTime(
  ownerId: string,
  bufferTime: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, "availability", ownerId), {
      bufferTime,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Add a blocked date
 */
export async function addBlockedDate(
  ownerId: string,
  date: string,
  currentBlockedDates: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    const updated = [...currentBlockedDates, date];
    await updateDoc(doc(db, "availability", ownerId), {
      blockedDates: updated,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Remove a blocked date
 */
export async function removeBlockedDate(
  ownerId: string,
  date: string,
  currentBlockedDates: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    const updated = currentBlockedDates.filter((d) => d !== date);
    await updateDoc(doc(db, "availability", ownerId), {
      blockedDates: updated,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
