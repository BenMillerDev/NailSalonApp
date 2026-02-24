import React, { useState } from "react";
import { BookingState } from "../types";
import {
    formatDate,
    formatDuration,
    formatPrice,
    formatTime,
    isValidEmail,
    isValidPhone,
} from "../utils/formatters";

interface Props {
  booking: BookingState;
  totalDuration: number;
  totalPrice: number;
  isSubmitting: boolean;
  error: string | null;
  onUpdate: (field: keyof BookingState, value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export default function CustomerForm({
  booking,
  totalDuration,
  totalPrice,
  isSubmitting,
  error,
  onUpdate,
  onBack,
  onSubmit,
}: Props) {
  const [errors, setErrors] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
  });

  const validate = () => {
    const newErrors = {
      clientName: "",
      clientEmail: "",
      clientPhone: "",
    };
    let isValid = true;

    if (!booking.clientName.trim()) {
      newErrors.clientName = "Your name is required";
      isValid = false;
    }

    if (!booking.clientEmail.trim()) {
      newErrors.clientEmail = "Email is required";
      isValid = false;
    } else if (!isValidEmail(booking.clientEmail)) {
      newErrors.clientEmail = "Please enter a valid email";
      isValid = false;
    }

    if (!booking.clientPhone.trim()) {
      newErrors.clientPhone = "Phone number is required";
      isValid = false;
    } else if (!isValidPhone(booking.clientPhone)) {
      newErrors.clientPhone = "Please enter a valid 10 digit number";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit();
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Details</h2>
      <p style={styles.subtitle}>
        Almost done — just need a few details to confirm your booking
      </p>

      {/* Booking Summary */}
      <div style={styles.summaryCard}>
        <h3 style={styles.summaryTitle}>Booking Summary</h3>
        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Services</span>
          <span style={styles.summaryValue}>
            {booking.selectedServices.map((s) => s.name).join(", ")}
            {booking.selectedAddOns.length > 0 &&
              ` + ${booking.selectedAddOns.map((a) => a.name).join(", ")}`}
          </span>
        </div>
        {booking.nailShape && (
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Shape</span>
            <span style={styles.summaryValue}>{booking.nailShape}</span>
          </div>
        )}
        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Date</span>
          <span style={styles.summaryValue}>
            {booking.selectedDate ? formatDate(booking.selectedDate) : ""}
          </span>
        </div>
        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Time</span>
          <span style={styles.summaryValue}>
            {booking.selectedTime ? formatTime(booking.selectedTime) : ""}
          </span>
        </div>
        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Duration</span>
          <span style={styles.summaryValue}>
            {formatDuration(totalDuration)}
          </span>
        </div>
        <div
          style={{
            ...styles.summaryRow,
            borderTop: "1px solid #EEF2F7",
            paddingTop: 12,
            marginTop: 4,
          }}
        >
          <span
            style={{
              ...styles.summaryLabel,
              fontWeight: 700,
              color: "#1E2D3D",
            }}
          >
            Total
          </span>
          <span
            style={{
              ...styles.summaryValue,
              fontWeight: 700,
              color: "#1E2D3D",
              fontSize: 18,
            }}
          >
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>

      {/* Form Fields */}
      <div style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Your Name</label>
          <input
            style={{
              ...styles.input,
              ...(errors.clientName ? styles.inputError : {}),
            }}
            placeholder="Jane Doe"
            value={booking.clientName}
            onChange={(e) => {
              onUpdate("clientName", e.target.value);
              if (errors.clientName)
                setErrors((prev) => ({ ...prev, clientName: "" }));
            }}
          />
          {errors.clientName && (
            <span style={styles.errorText}>{errors.clientName}</span>
          )}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input
            style={{
              ...styles.input,
              ...(errors.clientEmail ? styles.inputError : {}),
            }}
            placeholder="your@email.com"
            type="email"
            value={booking.clientEmail}
            onChange={(e) => {
              onUpdate("clientEmail", e.target.value);
              if (errors.clientEmail)
                setErrors((prev) => ({ ...prev, clientEmail: "" }));
            }}
          />
          {errors.clientEmail && (
            <span style={styles.errorText}>{errors.clientEmail}</span>
          )}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Phone Number</label>
          <input
            style={{
              ...styles.input,
              ...(errors.clientPhone ? styles.inputError : {}),
            }}
            placeholder="(555) 123-4567"
            type="tel"
            value={booking.clientPhone}
            onChange={(e) => {
              onUpdate("clientPhone", e.target.value);
              if (errors.clientPhone)
                setErrors((prev) => ({ ...prev, clientPhone: "" }));
            }}
          />
          {errors.clientPhone && (
            <span style={styles.errorText}>{errors.clientPhone}</span>
          )}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Notes (Optional)</label>
          <textarea
            style={styles.textarea}
            placeholder="Any special requests, inspo photos, allergies..."
            value={booking.notes}
            onChange={(e) => onUpdate("notes", e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={styles.errorBanner}>
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Navigation */}
      <div style={styles.navBar}>
        <button
          style={styles.backButton}
          onClick={onBack}
          disabled={isSubmitting}
        >
          ← Back
        </button>
        <button
          style={{
            ...styles.submitButton,
            opacity: isSubmitting ? 0.7 : 1,
          }}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "24px 20px 100px",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1E2D3D",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#5B6B7C",
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    boxShadow: "0 2px 8px rgba(30,45,61,0.08)",
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#4A90D9",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 16,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#5B6B7C",
    flexShrink: 0,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1E2D3D",
    textAlign: "right",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1E2D3D",
  },
  input: {
    backgroundColor: "#F7F9FC",
    border: "1.5px solid #EEF2F7",
    borderRadius: 12,
    padding: "14px 16px",
    fontSize: 15,
    color: "#1E2D3D",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  inputError: {
    borderColor: "#D97A7A",
  },
  errorText: {
    fontSize: 12,
    color: "#D97A7A",
  },
  textarea: {
    backgroundColor: "#F7F9FC",
    border: "1.5px solid #EEF2F7",
    borderRadius: 12,
    padding: "14px 16px",
    fontSize: 15,
    color: "#1E2D3D",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    resize: "none",
    fontFamily: "inherit",
  },
  errorBanner: {
    backgroundColor: "#FFF0F0",
    border: "1px solid #D97A7A",
    borderRadius: 12,
    padding: "12px 16px",
    marginTop: 16,
    fontSize: 14,
    color: "#D97A7A",
  },
  navBar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTop: "1px solid #EEF2F7",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    boxShadow: "0 -4px 16px rgba(30,45,61,0.08)",
    zIndex: 100,
  },
  backButton: {
    backgroundColor: "#EEF2F7",
    color: "#5B6B7C",
    border: "none",
    borderRadius: 12,
    padding: "12px 24px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  submitButton: {
    backgroundColor: "#4A90D9",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 24px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
};
