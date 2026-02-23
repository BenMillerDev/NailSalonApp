import { TextStyle, ViewStyle } from "react-native";
import colors from "./colors";

const theme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 999,
  },

  fonts: {
    sizes: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 17,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    weights: {
      regular: "400" as const,
      medium: "500" as const,
      semibold: "600" as const,
      bold: "700" as const,
    },
  },

  shadows: {
    sm: {
      shadowColor: colors.charcoal,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    } as ViewStyle,
    md: {
      shadowColor: colors.charcoal,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    } as ViewStyle,
    lg: {
      shadowColor: colors.charcoal,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    } as ViewStyle,
  },

  components: {
    screen: {
      flex: 1,
      backgroundColor: colors.offWhite,
    } as ViewStyle,
    card: {
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 16,
    } as ViewStyle,
    input: {
      backgroundColor: colors.lightGray,
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      color: colors.charcoal,
      borderWidth: 1,
      borderColor: colors.midGray,
    } as TextStyle,
    button: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    } as ViewStyle,
    buttonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600" as const,
    } as TextStyle,
  },

  header: {
    backgroundColor: colors.white,
    titleStyle: {
      color: colors.charcoal,
      fontSize: 17,
      fontWeight: "600" as const,
    } as TextStyle,
    borderBottomColor: colors.lightGray,
  },
};

export default theme;
