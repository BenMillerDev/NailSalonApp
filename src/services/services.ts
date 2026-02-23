import {
    addDoc,
    collection,
    deleteDoc,
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

export interface SalonService {
  id?: string;
  ownerId: string;
  category: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  addOns: string[];
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ServiceFormData {
  category: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  addOns: string[];
  isActive: boolean;
}

// ─────────────────────────────────────────────
// SERVICE FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Fetch all services for a given owner
 */
export async function getServices(ownerId: string): Promise<SalonService[]> {
  try {
    const q = query(
      collection(db, "services"),
      where("ownerId", "==", ownerId),
      orderBy("category"),
      orderBy("name"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as SalonService,
    );
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

/**
 * Add a new service
 */
export async function addService(
  ownerId: string,
  serviceData: ServiceFormData,
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, "services"), {
      ...serviceData,
      ownerId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing service
 */
export async function updateService(
  serviceId: string,
  serviceData: Partial<ServiceFormData>,
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, "services", serviceId), {
      ...serviceData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a service
 */
export async function deleteService(
  serviceId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, "services", serviceId));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Toggle a service active/inactive
 * Lets the owner hide services without deleting them
 */
export async function toggleServiceActive(
  serviceId: string,
  isActive: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, "services", serviceId), {
      isActive,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Seed default services for a new owner account
 * Called automatically after signup
 */
export async function seedDefaultServices(
  ownerId: string,
  defaultServices: ServiceFormData[],
): Promise<void> {
  try {
    const promises = defaultServices.map((service) =>
      addDoc(collection(db, "services"), {
        ...service,
        ownerId,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
    await Promise.all(promises);
  } catch (error) {
    console.error("Error seeding default services:", error);
  }
}
