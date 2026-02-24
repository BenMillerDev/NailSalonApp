import React from "react";
import { BookingState } from "../types";
import {
    formatDate,
    formatDuration,
    formatPrice,
    formatTime,
} from "../utils/formatters";

interface Props {
  booking: BookingState;
  salonName: string;
  totalDuration: number;
  totalPrice: number;
}

export default function Confirmation({
  booking,
  salonName,
  totalDuration,
  totalPrice,
}: Props) {
  return (
    <div style={styles.container}>
      {/* Success Icon */}
      <div style={styles.successIcon}>
        <span style={styles.checkmark}>✓</span>
      </div>

      <h2 style={styles.title}>You&apos;re booked!</h2>
      <p style={styles.subtitle}>
        Your appointment at {salonName} has been requested. You&apos;ll receive
        a confirmation once it&apos;s approved.
      </p>

      {/* Booking Details Card */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Appointment Details</h3>

        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>📍 Salon</span>
          <span style={styles.detailValue}>{salonName}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>💅 Services</span>
          <span style={styles.detailValue}>
            {booking.selectedServices.map((s) => s.name).join(", ")}
            {booking.selectedAddOns.length > 0 &&
              ` + ${booking.selectedAddOns.map((a) => a.name).join(", ")}`}
          </span>
        </div>
        {booking.nailShape && (
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>✂️ Shape</span>
            <span style={styles.detailValue}>{booking.nailShape}</span>
          </div>
        )}
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>📅 Date</span>
          <span style={styles.detailValue}>
            {booking.selectedDate ? formatDate(booking.selectedDate) : ""}
          </span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>⏰ Time</span>
          <span style={styles.detailValue}>
            {booking.selectedTime ? formatTime(booking.selectedTime) : ""}
          </span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>⏱ Duration</span>
          <span style={styles.detailValue}>
            {formatDuration(totalDuration)}
          </span>
        </div>
        <div
          style={{
            ...styles.detailRow,
            borderTop: "1px solid #EEF2F7",
            paddingTop: 12,
            marginTop: 4,
          }}
        >
          <span
            style={{ ...styles.detailLabel, fontWeight: 700, color: "#1E2D3D" }}
          >
            💰 Total
          </span>
          <span
            style={{
              ...styles.detailValue,
              fontWeight: 700,
              fontSize: 18,
              color: "#1E2D3D",
            }}
          >
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>

      {/* Tips */}
      <div style={styles.tipsCard}>
        <h3 style={styles.tipsTitle}>Before Your Appointment</h3>
        <ul style={styles.tipsList}>
          <li style={styles.tip}>
            Remove any existing polish before arriving to save time
          </li>
          <li style={styles.tip}>
            Avoid moisturizer on your hands the morning of your appointment
          </li>
          <li style={styles.tip}>
            Arrive 5 minutes early so we can get started on time
          </li>
          <li style={styles.tip}>
            You&apos;ll receive a reminder the day before your appointment
          </li>
        </ul>
      </div>

      {/* Client Info */}
      <div style={styles.clientCard}>
        <p style={styles.clientInfo}>
          Confirmation details will be sent to{" "}
          <strong>{booking.clientEmail}</strong>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "40px 20px 60px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    backgroundColor: "#4A90D9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    boxShadow: "0 0 0 12px rgba(74,144,217,0.15)",
  },
  checkmark: {
    fontSize: 36,
    color: "#fff",
    fontWeight: 700,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#1E2D3D",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#5B6B7C",
    textAlign: "center",
    lineHeight: 1.6,
    marginBottom: 32,
    maxWidth: 320,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    boxShadow: "0 2px 8px rgba(30,45,61,0.08)",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#4A90D9",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 16,
  },
  detailLabel: {
    fontSize: 13,
    color: "#5B6B7C",
    flexShrink: 0,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1E2D3D",
    textAlign: "right",
  },
  tipsCard: {
    backgroundColor: "#F0F7FF",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    marginBottom: 16,
    border: "1px solid #D6EAFA",
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#2C6FAC",
    marginBottom: 12,
  },
  tipsList: {
    paddingLeft: 20,
    margin: 0,
  },
  tip: {
    fontSize: 13,
    color: "#3D7DBF",
    lineHeight: 1.6,
    marginBottom: 6,
  },
  clientCard: {
    width: "100%",
    textAlign: "center",
  },
  clientInfo: {
    fontSize: 13,
    color: "#5B6B7C",
  },
};
