import React from "react";
import { Availability } from "../types";
import { formatDate, formatDuration, formatPrice } from "../utils/formatters";

interface Props {
  availability: Availability;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  totalDuration: number;
  totalPrice: number;
  onBack: () => void;
  onNext: () => void;
}

type DayKey =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

const DAY_KEYS: DayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export default function DatePicker({
  availability,
  selectedDate,
  onSelectDate,
  totalDuration,
  totalPrice,
  onBack,
  onNext,
}: Props) {
  // Generate next 60 days
  const days: Date[] = [];
  for (let i = 0; i < 60; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push(date);
  }

  const isDateAvailable = (date: Date): boolean => {
    const dayKey = DAY_KEYS[date.getDay()];
    const daySchedule = availability[dayKey];
    if (!daySchedule?.isOpen) return false;

    const isoDate = date.toISOString().split("T")[0];
    if (availability.blockedDates?.includes(isoDate)) return false;

    return true;
  };

  // Group days by month/week for display
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  days.forEach((date, index) => {
    currentWeek.push(date);
    if (currentWeek.length === 7 || index === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Pick a Date</h2>
      <p style={styles.subtitle}>
        {formatDuration(totalDuration)} • {formatPrice(totalPrice)}
      </p>

      {/* Calendar */}
      <div style={styles.calendar}>
        {/* Day Headers */}
        <div style={styles.dayHeaders}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} style={styles.dayHeader}>
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} style={styles.week}>
            {week.map((date, dayIndex) => {
              const isAvailable = isDateAvailable(date);
              const isSelected =
                selectedDate?.toDateString() === date.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <button
                  key={dayIndex}
                  style={{
                    ...styles.dayButton,
                    ...(isSelected ? styles.dayButtonSelected : {}),
                    ...(isToday && !isSelected ? styles.dayButtonToday : {}),
                    ...(!isAvailable ? styles.dayButtonUnavailable : {}),
                  }}
                  onClick={() => isAvailable && onSelectDate(date)}
                  disabled={!isAvailable}
                >
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: isSelected || isToday ? 700 : 500,
                      color: isSelected
                        ? "#fff"
                        : !isAvailable
                          ? "#B8C4D0"
                          : "#1E2D3D",
                    }}
                  >
                    {date.getDate()}
                  </span>
                  {isToday && !isSelected && <span style={styles.todayDot} />}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Selected Date Display */}
      {selectedDate && (
        <div style={styles.selectedDateBanner}>
          <span style={styles.selectedDateText}>
            📅 {formatDate(selectedDate)}
          </span>
        </div>
      )}

      {/* Navigation */}
      <div style={styles.navBar}>
        <button style={styles.backButton} onClick={onBack}>
          ← Back
        </button>
        <button
          style={{
            ...styles.nextButton,
            opacity: selectedDate ? 1 : 0.4,
          }}
          onClick={onNext}
          disabled={!selectedDate}
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
  calendar: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 2px 8px rgba(30,45,61,0.08)",
  },
  dayHeaders: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    marginBottom: 8,
  },
  dayHeader: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: 700,
    color: "#B8C4D0",
    textTransform: "uppercase",
    padding: "4px 0",
  },
  week: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 4,
    marginBottom: 4,
  },
  dayButton: {
    aspectRatio: "1",
    borderRadius: 10,
    border: "none",
    backgroundColor: "#F7F9FC",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    transition: "all 0.15s ease",
  },
  dayButtonSelected: {
    backgroundColor: "#4A90D9",
    boxShadow: "0 0 0 3px rgba(74,144,217,0.25)",
  },
  dayButtonToday: {
    backgroundColor: "#D6EAFA",
  },
  dayButtonUnavailable: {
    backgroundColor: "transparent",
    cursor: "not-allowed",
    opacity: 0.4,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: "50%",
    backgroundColor: "#4A90D9",
    position: "absolute",
    bottom: 4,
  },
  selectedDateBanner: {
    backgroundColor: "#F0F7FF",
    borderRadius: 12,
    padding: "12px 16px",
    marginTop: 16,
    border: "1px solid #D6EAFA",
  },
  selectedDateText: {
    fontSize: 15,
    fontWeight: 600,
    color: "#2C6FAC",
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
