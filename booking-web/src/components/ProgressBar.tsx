import React from "react";

interface Props {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export default function ProgressBar({
  currentStep,
  totalSteps,
  labels,
}: Props) {
  return (
    <div style={styles.container}>
      {/* Progress Track */}
      <div style={styles.track}>
        <div
          style={{
            ...styles.fill,
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
          }}
        />
        {/* Step Dots */}
        {labels.map((label, index) => {
          const stepNumber = index + 1;
          const isComplete = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          return (
            <div key={label} style={styles.stepContainer}>
              <div
                style={{
                  ...styles.dot,
                  ...(isComplete ? styles.dotComplete : {}),
                  ...(isActive ? styles.dotActive : {}),
                }}
              >
                {isComplete ? (
                  <span style={styles.checkmark}>✓</span>
                ) : (
                  <span
                    style={{
                      ...styles.stepNumber,
                      color: isActive ? "#fff" : "#B8C4D0",
                    }}
                  >
                    {stepNumber}
                  </span>
                )}
              </div>
              <span
                style={{
                  ...styles.label,
                  color: isActive
                    ? "#4A90D9"
                    : isComplete
                      ? "#2C6FAC"
                      : "#B8C4D0",
                  fontWeight: isActive ? "700" : "500",
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "24px 24px 8px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #EEF2F7",
  },
  track: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 16,
  },
  fill: {
    position: "absolute",
    top: 28,
    left: "6.5%",
    height: 3,
    backgroundColor: "#4A90D9",
    borderRadius: 999,
    transition: "width 0.4s ease",
    zIndex: 0,
  },
  stepContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    zIndex: 1,
    flex: 1,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    backgroundColor: "#EEF2F7",
    border: "2px solid #B8C4D0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },
  dotActive: {
    backgroundColor: "#4A90D9",
    borderColor: "#4A90D9",
    boxShadow: "0 0 0 4px rgba(74, 144, 217, 0.2)",
  },
  dotComplete: {
    backgroundColor: "#2C6FAC",
    borderColor: "#2C6FAC",
  },
  checkmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: 600,
  },
  label: {
    fontSize: 11,
    textAlign: "center",
    whiteSpace: "nowrap",
  },
};
