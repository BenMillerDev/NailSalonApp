import {
    addDoc,
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "./firebase";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface Appointment {
  id?: string;
  ownerId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  services: AppointmentService[];
  addOns: AppointmentAddOn[];
  startTime: string; // ISO string
  endTime: string; // ISO string
  totalDuration: number; // minutes
  totalPrice: number;
  status: AppointmentStatus;
  notes?: string;
  nailShape?: string;
  nailLength?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface AppointmentService {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export interface AppointmentAddOn {
  id: string;
  name: string;
  duration: number;
  price: number;
}

// ─────────────────────────────────────────────
// APPOINTMENT FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Fetch all appointments for an owner
 */
export async function getAppointments(ownerId: string): Promise<Appointment[]> {
  try {
    const q = query(
      collection(db, "appointments"),
      where("ownerId", "==", ownerId),
      orderBy("startTime", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Appointment,
    );
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
}

/**
 * Fetch upcoming appointments for an owner
 */
export async function getUpcomingAppointments(
  ownerId: string,
): Promise<Appointment[]> {
  try {
    const now = new Date().toISOString();
    const q = query(
      collection(db, "appointments"),
      where("ownerId", "==", ownerId),
      where("startTime", ">=", now),
      where("status", "in", ["pending", "confirmed"]),
      orderBy("startTime", "asc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Appointment,
    );
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    return [];
  }
}

/**
 * Fetch past appointments for an owner
 */
export async function getPastAppointments(
  ownerId: string,
): Promise<Appointment[]> {
  try {
    const now = new Date().toISOString();
    const q = query(
      collection(db, "appointments"),
      where("ownerId", "==", ownerId),
      where("startTime", "<", now),
      orderBy("startTime", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Appointment,
    );
  } catch (error) {
    console.error("Error fetching past appointments:", error);
    return [];
  }
}

/**
 * Create a new appointment
 * Called from the customer booking flow
 */
export async function createAppointment(
  appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">,
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, "appointments"), {
      ...appointment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, "appointments", appointmentId), {
      status,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update appointment notes
 */
export async function updateAppointmentNotes(
  appointmentId: string,
  notes: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, "appointments", appointmentId), {
      notes,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get today's appointments for the dashboard
 */
export async function getTodaysAppointments(
  ownerId: string,
): Promise<Appointment[]> {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, "appointments"),
      where("ownerId", "==", ownerId),
      where("startTime", ">=", startOfDay.toISOString()),
      where("startTime", "<=", endOfDay.toISOString()),
      orderBy("startTime", "asc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Appointment,
    );
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    return [];
  }
}
