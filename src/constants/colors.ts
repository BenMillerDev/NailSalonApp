const colors = {
  // Primary brand colors
  primary: '#C9748F',
  primaryLight: '#E8B4C0',
  primaryDark: '#9E4F67',

  // Secondary accent
  accent: '#B8A9C9',
  accentLight: '#DDD6E8',
  accentDark: '#8B7AA8',

  // Neutrals
  white: '#FFFFFF',
  offWhite: '#FAF8F9',
  lightGray: '#F2EEF0',
  midGray: '#C4B8BE',
  darkGray: '#6B5B62',
  charcoal: '#2D2229',

  // Semantic colors
  success: '#7DBF9E',
  warning: '#E8C97A',
  error: '#D97A7A',
  info: '#7AAED9',

  // Booking status colors
  status: {
    confirmed: '#7DBF9E',
    pending: '#E8C97A',
    cancelled: '#D97A7A',
    completed: '#B8A9C9'
  } as const,

  // Transparent overlays
  overlay: 'rgba(45, 34, 41, 0.5)',
  overlayLight: 'rgba(45, 34, 41, 0.2)',
} as const

export type AppColors = typeof colors
export default colors