import { addMinutes } from "date-fns";
import { useEffect, useState } from "react";
import {
    createBooking,
    getBookingsForDate,
    getOwnerAvailability,
    getOwnerProfile,
    getOwnerServices,
} from "../services/bookingService";
import {
    AddOn,
    AppointmentPayload,
    Availability,
    BookingState,
    NailLength,
    OwnerProfile,
    Service,
} from "../types";
import {
    calculateTotalDuration,
    calculateTotalPrice,
    getAvailableSlots,
} from "../utils/timeSlots";

const INITIAL_STATE: BookingState = {
  selectedServices: [],
  selectedAddOns: [],
  nailShape: "",
  nailLength: null,
  selectedDate: null,
  selectedTime: null,
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  notes: "",
};

export function useBooking(ownerId: string) {
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState<BookingState>(INITIAL_STATE);
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load owner data on mount
  useEffect(() => {
    async function loadOwnerData() {
      setIsLoading(true);
      const [profile, ownerServices, ownerAvailability] = await Promise.all([
        getOwnerProfile(ownerId),
        getOwnerServices(ownerId),
        getOwnerAvailability(ownerId),
      ]);
      setOwnerProfile(profile);
      setServices(ownerServices);
      setAvailability(ownerAvailability);
      setIsLoading(false);
    }
    loadOwnerData();
  }, [ownerId]);

  // Load available slots when date changes
  useEffect(() => {
    async function loadSlots() {
      if (!booking.selectedDate || !availability) return;
      if (booking.selectedServices.length === 0) return;

      setIsLoadingSlots(true);
      const totalDuration = calculateTotalDuration(
        booking.selectedServices,
        booking.selectedAddOns,
        booking.nailLength,
      );
      const existingBookings = await getBookingsForDate(
        ownerId,
        booking.selectedDate,
      );
      const slots = getAvailableSlots(
        booking.selectedDate,
        totalDuration,
        availability,
        existingBookings,
        availability.bufferTime,
      );
      setAvailableSlots(slots);
      setIsLoadingSlots(false);
    }
    loadSlots();
  }, [
    booking.selectedDate,
    booking.selectedServices,
    booking.selectedAddOns,
    booking.nailLength,
    availability,
    ownerId,
  ]);

  // Derived values
  const totalDuration = calculateTotalDuration(
    booking.selectedServices,
    booking.selectedAddOns,
    booking.nailLength,
  );
  const totalPrice = calculateTotalPrice(
    booking.selectedServices,
    booking.selectedAddOns,
    booking.nailLength,
  );

  // Update helpers
  const toggleService = (service: Service) => {
    setBooking((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.find((s) => s.id === service.id)
        ? prev.selectedServices.filter((s) => s.id !== service.id)
        : [...prev.selectedServices, service],
      // Reset date and time when services change
      selectedDate: null,
      selectedTime: null,
    }));
  };

  const toggleAddOn = (addOn: AddOn) => {
    setBooking((prev) => ({
      ...prev,
      selectedAddOns: prev.selectedAddOns.find((a) => a.id === addOn.id)
        ? prev.selectedAddOns.filter((a) => a.id !== addOn.id)
        : [...prev.selectedAddOns, addOn],
      selectedDate: null,
      selectedTime: null,
    }));
  };

  const setNailShape = (shape: string) => {
    setBooking((prev) => ({ ...prev, nailShape: shape }));
  };

  const setNailLength = (length: NailLength | null) => {
    setBooking((prev) => ({
      ...prev,
      nailLength: length,
      selectedDate: null,
      selectedTime: null,
    }));
  };

  const setSelectedDate = (date: Date) => {
    setBooking((prev) => ({ ...prev, selectedDate: date, selectedTime: null }));
  };

  const setSelectedTime = (time: Date) => {
    setBooking((prev) => ({ ...prev, selectedTime: time }));
  };

  const updateCustomerInfo = (field: keyof BookingState, value: string) => {
    setBooking((prev) => ({ ...prev, [field]: value }));
  };

  const goToStep = (newStep: number) => {
    setStep(newStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitBooking = async () => {
    if (!booking.selectedTime || !ownerProfile) return;

    setIsSubmitting(true);
    setError(null);

    const endTime = addMinutes(booking.selectedTime, totalDuration);

    const payload: AppointmentPayload = {
      ownerId,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      clientPhone: booking.clientPhone,
      services: booking.selectedServices.map((s) => ({
        id: s.id,
        name: s.name,
        duration: s.duration,
        price: s.price,
      })),
      addOns: booking.selectedAddOns.map((a) => ({
        id: a.id,
        name: a.name,
        duration: a.duration,
        price: a.price,
      })),
      startTime: booking.selectedTime.toISOString(),
      endTime: endTime.toISOString(),
      totalDuration,
      totalPrice,
      status: "pending",
      nailShape: booking.nailShape || undefined,
      nailLength: booking.nailLength?.label || undefined,
      notes: booking.notes || undefined,
    };

    const result = await createBooking(payload);
    setIsSubmitting(false);

    if (result.success) {
      setIsComplete(true);
    } else {
      setError(result.error || "Something went wrong. Please try again.");
    }
  };

  return {
    step,
    booking,
    ownerProfile,
    services,
    availability,
    availableSlots,
    totalDuration,
    totalPrice,
    isLoading,
    isLoadingSlots,
    isSubmitting,
    isComplete,
    error,
    toggleService,
    toggleAddOn,
    setNailShape,
    setNailLength,
    setSelectedDate,
    setSelectedTime,
    updateCustomerInfo,
    goToStep,
    submitBooking,
  };
}
