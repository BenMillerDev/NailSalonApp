import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";
import { db } from "../firebase";
import {
    AppointmentPayload,
    Availability,
    OwnerProfile,
    Service,
} from "../types";

/**
 * Fetch owner profile by uid
 */
export async function getOwnerProfile(
  ownerId: string,
): Promise<OwnerProfile | null> {
  try {
    console.log("Fetching owner profile for:", ownerId);
    console.log("Firebase config:", {
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? "present" : "MISSING",
    });
    const docRef = doc(db, "users", ownerId);
    const snapshot = await getDoc(docRef);
    console.log("Snapshot exists:", snapshot.exists());
    if (snapshot.exists()) {
      return snapshot.data() as OwnerProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching owner profile:", error);
    return null;
  }
}

/**
 * Fetch active services for an owner
 */
export async function getOwnerServices(ownerId: string): Promise<Service[]> {
  try {
    const q = query(
      collection(db, "services"),
      where("ownerId", "==", ownerId),
      where("isActive", "==", true),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Service,
    );
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

/**
 * Fetch owner availability
 */
export async function getOwnerAvailability(
  ownerId: string,
): Promise<Availability | null> {
  try {
    const docRef = doc(db, "availability", ownerId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as Availability;
    }
    return null;
  } catch (error) {
    console.error("Error fetching availability:", error);
    return null;
  }
}

/**
 * Fetch existing bookings for a specific date
 * Used by the time slot algorithm
 */
export async function getBookingsForDate(
  ownerId: string,
  date: Date,
): Promise<{ startTime: string; endTime: string; id: string }[]> {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, "appointments"),
      where("ownerId", "==", ownerId),
      where("startTime", ">=", startOfDay.toISOString()),
      where("startTime", "<=", endOfDay.toISOString()),
      where("status", "in", ["pending", "confirmed"]),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      startTime: doc.data().startTime,
      endTime: doc.data().endTime,
    }));
  } catch (error) {
    console.error("Error fetching bookings for date:", error);
    return [];
  }
}

/**
 * Create a new appointment booking
 */
export async function createBooking(
  payload: AppointmentPayload,
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, "appointments"), {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
