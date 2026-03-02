import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Appointment,
  AppointmentStatus,
  updateAppointmentNotes,
  updateAppointmentStatus,
} from "../services/appointments";
import { db } from "../services/firebase";

export function useAppointments() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [past, setPast] = useState<Appointment[]>([]);
  const [todays, setTodays] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const now = new Date().toISOString();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // ─────────────────────────────────────────────
    // UPCOMING LISTENER
    // ─────────────────────────────────────────────
    const upcomingQuery = query(
      collection(db, "appointments"),
      where("ownerId", "==", user.uid),
      where("startTime", ">=", now),
      where("status", "in", ["pending", "confirmed"]),
      orderBy("startTime", "asc"),
    );

    const unsubUpcoming = onSnapshot(
      upcomingQuery,
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Appointment,
        );
        setUpcoming(data);
        setIsLoading(false);
      },
      (error) => {
        console.error("Upcoming listener error:", error);
        setIsLoading(false);
      },
    );

    // ─────────────────────────────────────────────
    // PAST LISTENER
    // ─────────────────────────────────────────────
    const pastQuery = query(
      collection(db, "appointments"),
      where("ownerId", "==", user.uid),
      where("startTime", "<", now),
      orderBy("startTime", "desc"),
    );

    const unsubPast = onSnapshot(
      pastQuery,
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Appointment,
        );
        setPast(data);
      },
      (error) => {
        console.error("Past listener error:", error);
      },
    );

    // ─────────────────────────────────────────────
    // TODAY'S LISTENER
    // ─────────────────────────────────────────────
    const todaysQuery = query(
      collection(db, "appointments"),
      where("ownerId", "==", user.uid),
      where("startTime", ">=", startOfDay.toISOString()),
      where("startTime", "<=", endOfDay.toISOString()),
      orderBy("startTime", "asc"),
    );

    const unsubTodays = onSnapshot(
      todaysQuery,
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Appointment,
        );
        setTodays(data);
      },
      (error) => {
        console.error("Todays listener error:", error);
      },
    );

    // Cleanup all listeners when component unmounts
    return () => {
      unsubUpcoming();
      unsubPast();
      unsubTodays();
    };
  }, [user]);

  // Keep fetchAll for manual refresh compatibility
  const fetchAll = useCallback(async () => {
    // Listeners handle updates automatically
    // This is kept for pull-to-refresh compatibility
  }, []);

  const updateStatus = async (
    appointmentId: string,
    status: AppointmentStatus,
  ) => {
    const result = await updateAppointmentStatus(appointmentId, status);
    return result;
  };

  const updateNotes = async (appointmentId: string, notes: string) => {
    const result = await updateAppointmentNotes(appointmentId, notes);
    return result;
  };

  return {
    upcoming,
    past,
    todays,
    isLoading,
    fetchAll,
    updateStatus,
    updateNotes,
  };
}
