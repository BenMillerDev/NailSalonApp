import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import colors from "../../src/constants/colors";
import theme from "../../src/constants/theme";
import { useAuth } from "../../src/context/AuthContext";
import { isValidEmail } from "../../src/utils/formatters";
import { containerWidth, rs } from "../../src/utils/responsive";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const { signIn } = useAuth();
  const router = useRouter();

  const validate = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    setIsLoading(true);
    const result = await signIn(email.trim().toLowerCase(), password);
    setIsLoading(false);

    if (!result.success) {
      Alert.alert("Sign In Failed", result.error);
    }
    // If successful, AuthContext's onAuthStateChanged listener
    // will fire and _layout.tsx will automatically redirect to dashboard
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>💅</Text>
          </View>
          <Text style={styles.appName}>NailSalon</Text>
          <Text style={styles.tagline}>Your booking studio</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSubtitle}>
            Sign in to manage your appointments
          </Text>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="your@email.com"
              placeholderTextColor={colors.midGray}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              placeholder="Enter your password"
              placeholderTextColor={colors.midGray}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: "" }));
              }}
              secureTextEntry
              autoComplete="password"
            />
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Google sign-in will be available in the full build.",
              )
            }
            activeOpacity={0.85}
          >
            <Text style={styles.googleButtonText}>🔵 Continue with Google</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text style={styles.footerLink}>Create one</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: rs(60, 80),
    paddingBottom: theme.spacing.xl,
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  logoContainer: {
    width: rs(80, 100),
    height: rs(80, 100),
    borderRadius: rs(24, 30),
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  logoEmoji: {
    fontSize: rs(36, 48),
  },
  appName: {
    fontSize: rs(28, 36),
    fontWeight: "700",
    color: colors.charcoal,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: rs(14, 16),
    color: colors.darkGray,
    marginTop: 4,
  },

  // Card
  card: {
    width: containerWidth - theme.spacing.lg * 2,
    backgroundColor: colors.white,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  cardTitle: {
    fontSize: rs(22, 28),
    fontWeight: "700",
    color: colors.charcoal,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: rs(13, 15),
    color: colors.darkGray,
    marginBottom: theme.spacing.lg,
  },

  // Inputs
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: rs(13, 15),
    fontWeight: "600",
    color: colors.charcoal,
    marginBottom: 6,
  },
  input: {
    ...theme.components.input,
    fontSize: rs(15, 17),
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: rs(12, 13),
    color: colors.error,
    marginTop: 4,
  },

  // Buttons
  button: {
    ...theme.components.button,
    marginTop: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...theme.components.buttonText,
    fontSize: rs(16, 18),
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lightGray,
  },
  dividerText: {
    fontSize: 13,
    color: colors.midGray,
    marginHorizontal: theme.spacing.sm,
  },

  // Google button
  googleButton: {
    borderWidth: 1.5,
    borderColor: colors.midGray,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: "center",
  },
  googleButtonText: {
    fontSize: rs(15, 17),
    fontWeight: "600",
    color: colors.charcoal,
  },

  // Footer
  footer: {
    flexDirection: "row",
    marginTop: theme.spacing.lg,
    alignItems: "center",
  },
  footerText: {
    fontSize: rs(13, 15),
    color: colors.darkGray,
  },
  footerLink: {
    fontSize: rs(13, 15),
    fontWeight: "700",
    color: colors.primary,
  },
});
