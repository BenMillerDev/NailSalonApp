import { Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

// Device type detection
export const isTablet = width >= 768;
export const isSmallPhone = width < 375;
export const isIOS = Platform.OS === "ios";

// Responsive sizing — pass a phone value and a tablet value
// Returns the right one based on device type
export const rs = (phoneSize, tabletSize) => {
  return isTablet ? tabletSize : phoneSize;
};

// Width as a percentage of screen width
export const wp = (percentage) => {
  return (percentage / 100) * width;
};

// Height as a percentage of screen height
export const hp = (percentage) => {
  return (percentage / 100) * height;
};

// Limits content width on tablet so it never stretches too wide
// On phone this just returns the full screen width
export const containerWidth = isTablet ? Math.min(width * 0.65, 700) : width;

// Normalized font size — scales slightly based on screen size
// so text looks right on both small phones and large tablets
export const fontSize = (size) => {
  const scale = width / 390; // 390 is base iPhone 14 width
  const scaled = size * scale;
  // Cap how much it scales so text never gets extreme
  return Math.round(Math.min(scaled, size * (isTablet ? 1.3 : 1.1)));
};

export { height as screenHeight, width as screenWidth };

