import { doc, getDoc, setDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Appointment } from "../services/appointments";
import { db } from "../services/firebase";
import { useAppointments } from "./useAppointments";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface ClientProfile {
  email: string;
  name: string;
  phone: string;
  appointments: Appointment[];
  totalSpent: number;
  totalVisits: number;
  lastVisitDate: string | null;
  preferredServices: { name: string; count: number }[];
  notes: string;
  fillDueDate: string | null;
}

export interface ClientNote {
  ownerId: string;
  clientEmail: string;
  notes: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getPreferredServices(
  appointments: Appointment[],
): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  appointments.forEach((appt) => {
    appt.services.forEach((service) => {
      counts[service.name] = (counts[service.name] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

function getFillDueDate(appointments: Appointment[]): string | null {
  // Find the most recent gel or acrylic appointment
  const fillServices = [
    "Gel Manicure",
    "Acrylic Full Set",
    "Acrylic Fill",
    "Gel Fill",
  ];
  const fillAppointments = appointments
    .filter(
      (a) =>
        a.status === "completed" &&
        a.services.some((s) => fillServices.some((f) => s.name.includes(f))),
    )
    .sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    );

  if (fillAppointments.length === 0) return null;

  // Fill is typically due 2-3 weeks after last appointment
  const lastFill = new Date(fillAppointments[0].startTime);
  const dueDate = new Date(lastFill);
  dueDate.setDate(dueDate.getDate() + 21);
  return dueDate.toISOString();
}

// ─────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────

export function useClients() {
  const { user } = useAuth();
  const { upcoming, past } = useAppointments();
  const [clientNotes, setClientNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Build client profiles from appointments
  const allAppointments = [...upcoming, ...past];

  const clients = Object.values(
    allAppointments.reduce(
      (acc, appt) => {
        const key = appt.clientEmail;
        if (!acc[key]) {
          acc[key] = {
            email: appt.clientEmail,
            name: appt.clientName,
            phone: appt.clientPhone,
            appointments: [],
          };
        }
        acc[key].appointments.push(appt);
        return acc;
      },
      {} as Record<
        string,
        {
          email: string;
          name: string;
          phone: string;
          appointments: Appointment[];
        }
      >,
    ),
  )
    .map((client) => {
      const completedAppts = client.appointments.filter(
        (a) => a.status === "completed",
      );
      const sortedAppts = [...client.appointments].sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      );
      const lastVisit =
        completedAppts.length > 0
          ? completedAppts.sort(
              (a, b) =>
                new Date(b.startTime).getTime() -
                new Date(a.startTime).getTime(),
            )[0].startTime
          : null;

      return {
        email: client.email,
        name: client.name,
        phone: client.phone,
        appointments: sortedAppts,
        totalSpent: completedAppts.reduce((sum, a) => sum + a.totalPrice, 0),
        totalVisits: completedAppts.length,
        lastVisitDate: lastVisit,
        preferredServices: getPreferredServices(client.appointments),
        notes: clientNotes[client.email] || "",
        fillDueDate: getFillDueDate(client.appointments),
      } as ClientProfile;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // Load notes from Firestore
  const fetchNotes = useCallback(async () => {
    if (!user || clients.length === 0) return;
    setIsLoading(true);
    try {
      const notesMap: Record<string, string> = {};
      await Promise.all(
        clients.map(async (client) => {
          const noteId = `${user.uid}_${client.email}`;
          const docRef = doc(db, "clientNotes", noteId);
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
            notesMap[client.email] = snapshot.data().notes || "";
          }
        }),
      );
      setClientNotes(notesMap);
    } catch (error) {
      console.error("Error fetching client notes:", error);
    }
    setIsLoading(false);
  }, [user, allAppointments.length]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const saveNote = async (clientEmail: string, notes: string) => {
    if (!user) return { success: false };
    try {
      const noteId = `${user.uid}_${clientEmail}`;
      await setDoc(doc(db, "clientNotes", noteId), {
        ownerId: user.uid,
        clientEmail,
        notes,
        updatedAt: new Date().toISOString(),
      });
      setClientNotes((prev) => ({ ...prev, [clientEmail]: notes }));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  return {
    clients,
    isLoading,
    saveNote,
  };
}
