const colors = {
  // Primary brand colors
  primary: "#4A90D9", // Cornflower blue — main buttons, headers, accents
  primaryLight: "#A8CCF0", // Light blue — backgrounds, subtle highlights
  primaryDark: "#2C6FAC", // Deep blue — pressed states, active elements

  // Secondary accent
  accent: "#7BB8E8", // Soft sky blue — secondary buttons, tags
  accentLight: "#D6EAFA", // Very light blue — card backgrounds, chips
  accentDark: "#3D7DBF", // Medium blue — active secondary elements

  // Neutrals
  white: "#FFFFFF",
  offWhite: "#F7F9FC", // Slightly cool white — screen backgrounds
  lightGray: "#EEF2F7", // Card backgrounds, input fields
  midGray: "#B8C4D0", // Borders, dividers
  darkGray: "#5B6B7C", // Secondary text
  charcoal: "#1E2D3D", // Primary text

  // Semantic colors
  success: "#5BAD8F", // Soft green — confirmed bookings
  warning: "#E8C97A", // Soft gold — pending, waitlist
  error: "#D97A7A", // Soft red — errors, cancellations
  info: "#7AAED9", // Soft blue — informational messages

  // Booking status colors
  status: {
    confirmed: "#5BAD8F",
    pending: "#E8C97A",
    cancelled: "#D97A7A",
    completed: "#7BB8E8",
  } as const,

  // Transparent overlays
  overlay: "rgba(30, 45, 61, 0.5)",
  overlayLight: "rgba(30, 45, 61, 0.2)",
} as const;

export type AppColors = typeof colors;
export default colors;
