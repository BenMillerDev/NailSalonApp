import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    addBlockedDate,
    DaySchedule,
    getAvailability,
    OwnerAvailability,
    removeBlockedDate,
    saveAvailability,
    updateBufferTime,
    updateDaySchedule,
} from "../services/availability";
import { DayKey } from "../utils/timeSlots";

export function useAvailability() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<OwnerAvailability | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAvailability = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const data = await getAvailability(user.uid);
    setAvailability(data);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const saveAll = async (data: Omit<OwnerAvailability, "ownerId">) => {
    if (!user) return { success: false, error: "Not logged in" };
    setIsSaving(true);
    const result = await saveAvailability(user.uid, data);
    if (result.success) await fetchAvailability();
    setIsSaving(false);
    return result;
  };

  const updateDay = async (day: DayKey, schedule: DaySchedule) => {
    if (!user) return { success: false, error: "Not logged in" };
    const result = await updateDaySchedule(user.uid, day, schedule);
    if (result.success) await fetchAvailability();
    return result;
  };

  const updateBuffer = async (bufferTime: number) => {
    if (!user) return { success: false, error: "Not logged in" };
    const result = await updateBufferTime(user.uid, bufferTime);
    if (result.success) await fetchAvailability();
    return result;
  };

  const blockDate = async (date: string) => {
    if (!user || !availability)
      return { success: false, error: "Not logged in" };
    const result = await addBlockedDate(
      user.uid,
      date,
      availability.blockedDates,
    );
    if (result.success) await fetchAvailability();
    return result;
  };

  const unblockDate = async (date: string) => {
    if (!user || !availability)
      return { success: false, error: "Not logged in" };
    const result = await removeBlockedDate(
      user.uid,
      date,
      availability.blockedDates,
    );
    if (result.success) await fetchAvailability();
    return result;
  };

  return {
    availability,
    isLoading,
    isSaving,
    fetchAvailability,
    saveAll,
    updateDay,
    updateBuffer,
    blockDate,
    unblockDate,
  };
}
