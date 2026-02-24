import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    Appointment,
    AppointmentStatus,
    getPastAppointments,
    getTodaysAppointments,
    getUpcomingAppointments,
    updateAppointmentNotes,
    updateAppointmentStatus
} from "../services/appointments";

export function useAppointments() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [past, setPast] = useState<Appointment[]>([]);
  const [todays, setTodays] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const [upcomingData, pastData, todaysData] = await Promise.all([
      getUpcomingAppointments(user.uid),
      getPastAppointments(user.uid),
      getTodaysAppointments(user.uid),
    ]);
    setUpcoming(upcomingData);
    setPast(pastData);
    setTodays(todaysData);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const updateStatus = async (
    appointmentId: string,
    status: AppointmentStatus,
  ) => {
    const result = await updateAppointmentStatus(appointmentId, status);
    if (result.success) await fetchAll();
    return result;
  };

  const updateNotes = async (appointmentId: string, notes: string) => {
    const result = await updateAppointmentNotes(appointmentId, notes);
    if (result.success) await fetchAll();
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
