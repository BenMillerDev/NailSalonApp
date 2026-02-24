import React from "react";
import Confirmation from "./components/Confirmation";
import CustomerForm from "./components/CustomerForm";
import DatePicker from "./components/DatePicker";
import ProgressBar from "./components/ProgressBar";
import ServiceSelector from "./components/ServiceSelector";
import TimePicker from "./components/TimePicker";
import { useBooking } from "./hooks/useBooking";

// ─────────────────────────────────────────────
// Get owner ID from URL
// URL format: yoursalon.web.app/book?owner=OWNER_ID
// ─────────────────────────────────────────────

function getOwnerId(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get("owner") || "";
}

const STEPS = ["Services", "Date", "Time", "Confirm"];

export default function App() {
  const ownerId = getOwnerId();
  const {
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
  } = useBooking(ownerId);

  // No owner ID in URL
  if (!ownerId) {
    return (
      <div style={styles.errorPage}>
        <span style={styles.errorEmoji}>🔗</span>
        <h2 style={styles.errorTitle}>Invalid booking link</h2>
        <p style={styles.errorText}>
          This booking link appears to be invalid. Please contact the salon for
          a valid link.
        </p>
      </div>
    );
  }

  // Loading owner data
  if (isLoading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  // Owner not found
  if (!ownerProfile) {
    return (
      <div style={styles.errorPage}>
        <span style={styles.errorEmoji}>😕</span>
        <h2 style={styles.errorTitle}>Salon not found</h2>
        <p style={styles.errorText}>
          We couldn&apos;t find this salon. Please check the link and try again.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      {/* Salon Header */}
      <div style={styles.salonHeader}>
        <div style={styles.salonLogo}>💅</div>
        <div>
          <h1 style={styles.salonName}>{ownerProfile.salonName}</h1>
          <p style={styles.salonSubtitle}>Book your appointment</p>
        </div>
      </div>

      {/* Success State */}
      {isComplete ? (
        <Confirmation
          booking={booking}
          salonName={ownerProfile.salonName}
          totalDuration={totalDuration}
          totalPrice={totalPrice}
        />
      ) : (
        <>
          {/* Progress Bar */}
          <ProgressBar
            currentStep={step}
            totalSteps={STEPS.length}
            labels={STEPS}
          />

          {/* Step Content */}
          {step === 1 && (
            <ServiceSelector
              services={services}
              selectedServices={booking.selectedServices}
              selectedAddOns={booking.selectedAddOns}
              onToggleService={toggleService}
              onToggleAddOn={toggleAddOn}
              nailShape={booking.nailShape}
              onSetNailShape={setNailShape}
              nailLength={booking.nailLength}
              onSetNailLength={setNailLength}
              totalDuration={totalDuration}
              totalPrice={totalPrice}
              onNext={() => goToStep(2)}
            />
          )}

          {step === 2 && availability && (
            <DatePicker
              availability={availability}
              selectedDate={booking.selectedDate}
              onSelectDate={setSelectedDate}
              totalDuration={totalDuration}
              totalPrice={totalPrice}
              onBack={() => goToStep(1)}
              onNext={() => goToStep(3)}
            />
          )}

          {step === 3 && booking.selectedDate && (
            <TimePicker
              availableSlots={availableSlots}
              selectedTime={booking.selectedTime}
              selectedDate={booking.selectedDate}
              isLoading={isLoadingSlots}
              totalDuration={totalDuration}
              totalPrice={totalPrice}
              onSelectTime={setSelectedTime}
              onBack={() => goToStep(2)}
              onNext={() => goToStep(4)}
            />
          )}

          {step === 4 && (
            <CustomerForm
              booking={booking}
              totalDuration={totalDuration}
              totalPrice={totalPrice}
              isSubmitting={isSubmitting}
              error={error}
              onUpdate={updateCustomerInfo}
              onBack={() => goToStep(3)}
              onSubmit={submitBooking}
            />
          )}
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: "100vh",
    backgroundColor: "#F7F9FC",
    maxWidth: 480,
    margin: "0 auto",
  },
  salonHeader: {
    backgroundColor: "#fff",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    borderBottom: "1px solid #EEF2F7",
    boxShadow: "0 2px 8px rgba(30,45,61,0.06)",
  },
  salonLogo: {
    width: 52,
    height: 52,
    backgroundColor: "#D6EAFA",
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
  },
  salonName: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1E2D3D",
    letterSpacing: -0.3,
  },
  salonSubtitle: {
    fontSize: 13,
    color: "#5B6B7C",
    marginTop: 2,
  },
  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: "#F7F9FC",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #EEF2F7",
    borderTop: "3px solid #4A90D9",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: 15,
    color: "#5B6B7C",
  },
  errorPage: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
    textAlign: "center",
    backgroundColor: "#F7F9FC",
  },
  errorEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1E2D3D",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: "#5B6B7C",
    lineHeight: 1.6,
  },
};
