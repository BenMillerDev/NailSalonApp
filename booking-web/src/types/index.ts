// ─────────────────────────────────────────────
// SERVICE TYPES
// ─────────────────────────────────────────────

export interface Service {
  id: string;
  category: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  addOns: string[];
  isActive: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export interface NailLength {
  id: string;
  label: string;
  extraDuration: number;
  extraPrice: number;
}

// ─────────────────────────────────────────────
// AVAILABILITY TYPES
// ─────────────────────────────────────────────

export interface DaySchedule {
  isOpen: boolean;
  startTime: string;
  endTime: string;
}

export interface Availability {
  ownerId: string;
  sunday: DaySchedule;
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  bufferTime: number;
  maxBookingsPerDay: number;
  blockedDates: string[];
}

// ─────────────────────────────────────────────
// BOOKING TYPES
// ─────────────────────────────────────────────

export interface BookingState {
  // Step 1 — Services
  selectedServices: Service[];
  selectedAddOns: AddOn[];
  nailShape: string;
  nailLength: NailLength | null;

  // Step 2 — Date
  selectedDate: Date | null;

  // Step 3 — Time
  selectedTime: Date | null;

  // Step 4 — Customer info
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
}

export interface AppointmentPayload {
  ownerId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  services: { id: string; name: string; duration: number; price: number }[];
  addOns: { id: string; name: string; duration: number; price: number }[];
  startTime: string;
  endTime: string;
  totalDuration: number;
  totalPrice: number;
  status: "pending";
  nailShape?: string;
  nailLength?: string;
  notes?: string;
}

// ─────────────────────────────────────────────
// OWNER TYPES
// ─────────────────────────────────────────────

export interface OwnerProfile {
  uid: string;
  name: string;
  salonName: string;
  email: string;
  phone: string;
}
