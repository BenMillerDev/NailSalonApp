/**
 * Format a price in dollars
 * e.g. 50 → "$50" or 50.5 → "$50.50"
 */
export function formatPrice(amount) {
  if (amount % 1 === 0) return `$${amount}`;
  return `$${amount.toFixed(2)}`;
}

/**
 * Format a price range for services with variable pricing
 * e.g. formatPriceRange(50, 75) → "$50 - $75"
 */
export function formatPriceRange(min, max) {
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} - ${formatPrice(max)}`;
}

/**
 * Format a phone number for display
 * e.g. "5551234567" → "(555) 123-4567"
 */
export function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length !== 10) return phone;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
}

/**
 * Strip formatting from a phone number for storage
 * e.g. "(555) 123-4567" → "5551234567"
 */
export function cleanPhoneNumber(phone) {
  return phone.replace(/\D/g, "");
}

/**
 * Validate a phone number
 */
export function isValidPhone(phone) {
  const cleaned = cleanPhoneNumber(phone);
  return cleaned.length === 10;
}

/**
 * Validate an email address
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Format a person's name — capitalize first letter of each word
 * e.g. "jane doe" → "Jane Doe"
 */
export function formatName(name) {
  return name
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Get initials from a name for avatar displays
 * e.g. "Jane Doe" → "JD"
 */
export function getInitials(name) {
  return name
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

/**
 * Truncate long text with ellipsis
 * e.g. truncateText("A very long description", 20) → "A very long descript..."
 */
export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

/**
 * Format a booking summary for notifications and confirmations
 * e.g. "Gel Manicure + Nail Art • 1 hr 15 min • $60"
 */
export function formatBookingSummary(
  services,
  addOns,
  totalDuration,
  totalPrice,
) {
  const serviceNames = services.map((s) => s.name).join(" + ");
  const addOnNames =
    addOns.length > 0 ? ` + ${addOns.map((a) => a.name).join(" + ")}` : "";
  const duration = formatDuration(totalDuration);
  const price = formatPrice(totalPrice);
  return `${serviceNames}${addOnNames} • ${duration} • ${price}`;
}

/**
 * Format duration in minutes to readable string
 * Duplicated here so formatters.js is self contained
 * e.g. 90 → "1 hr 30 min"
 */
export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) return `${hours} hr`;
  return `${hours} hr ${remaining} min`;
}

/**
 * Format a service category for display
 * e.g. "NAILS" → "Nails"
 */
export function formatCategory(category) {
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
}
