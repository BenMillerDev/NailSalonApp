import React from "react";
import {
    formatDate,
    formatDuration,
    formatPrice,
    formatTime,
} from "../utils/formatters";
import { groupSlotsByPeriod } from "../utils/timeSlots";

interface Props {
  availableSlots: Date[];
  selectedTime: Date | null;
  selectedDate: Date;
  isLoading: boolean;
  totalDuration: number;
  totalPrice: number;
  onSelectTime: (time: Date) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function TimePicker({
  availableSlots,
  selectedTime,
  selectedDate,
  isLoading,
  totalDuration,
  totalPrice,
  onSelectTime,
  onBack,
  onNext,
}: Props) {
  const grouped = groupSlotsByPeriod(availableSlots);
  const periods = [
    { key: "morning", label: "Morning", slots: grouped.morning },
    { key: "afternoon", label: "Afternoon", slots: grouped.afternoon },
    { key: "evening", label: "Evening", slots: grouped.evening },
  ].filter((p) => p.slots.length > 0);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Pick a Time</h2>
      <p style={styles.subtitle}>
        {formatDate(selectedDate)} • {formatDuration(totalDuration)} •{" "}
        {formatPrice(totalPrice)}
      </p>

      {isLoading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Finding available times...</p>
        </div>
      ) : availableSlots.length === 0 ? (
        <div style={styles.emptyContainer}>
          <span style={styles.emptyEmoji}>😔</span>
          <h3 style={styles.emptyTitle}>No times available</h3>
          <p style={styles.emptyText}>
            There are no available slots on this date for your selected
            services. Please go back and choose a different date.
          </p>
        </div>
      ) : (
        periods.map((period) => (
          <div key={period.key} style={styles.period}>
            <h3 style={styles.periodTitle}>{period.label}</h3>
            <div style={styles.slotsGrid}>
              {period.slots.map((slot, index) => {
                const isSelected = selectedTime?.getTime() === slot.getTime();
                return (
                  <button
                    key={index}
                    style={{
                      ...styles.slotButton,
                      ...(isSelected ? styles.slotButtonSelected : {}),
                    }}
                    onClick={() => onSelectTime(slot)}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: isSelected ? "#fff" : "#1E2D3D",
                      }}
                    >
                      {formatTime(slot)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Navigation */}
      <div style={styles.navBar}>
        <button style={styles.backButton} onClick={onBack}>
          ← Back
        </button>
        <button
          style={{
            ...styles.nextButton,
            opacity: selectedTime ? 1 : 0.4,
          }}
          onClick={onNext}
          disabled={!selectedTime}
        >
          Next →
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
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 0",
    gap: 16,
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid #EEF2F7",
    borderTop: "3px solid #4A90D9",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: 15,
    color: "#5B6B7C",
  },
  emptyContainer: {
    textAlign: "center",
    padding: "48px 24px",
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1E2D3D",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#5B6B7C",
    lineHeight: 1.6,
  },
  period: {
    marginBottom: 24,
  },
  periodTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#4A90D9",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  slotsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
  },
  slotButton: {
    backgroundColor: "#fff",
    border: "1.5px solid #EEF2F7",
    borderRadius: 12,
    padding: "12px 8px",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.15s ease",
    boxShadow: "0 1px 4px rgba(30,45,61,0.06)",
  },
  slotButtonSelected: {
    backgroundColor: "#4A90D9",
    borderColor: "#4A90D9",
    boxShadow: "0 0 0 3px rgba(74,144,217,0.2)",
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
  nextButton: {
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
