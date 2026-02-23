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
import {
    formatName,
    isValidEmail,
    isValidPhone,
} from "../../src/utils/formatters";
import { containerWidth, rs } from "../../src/utils/responsive";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [salonName, setSalonName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    salonName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const { signUp } = useAuth();
  const router = useRouter();

  const validate = () => {
    const newErrors = {
      name: "",
      salonName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Your name is required";
      isValid = false;
    }

    if (!salonName.trim()) {
      newErrors.salonName = "Salon name is required";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!isValidPhone(phone)) {
      newErrors.phone = "Please enter a valid 10 digit phone number";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    setIsLoading(true);
    const result = await signUp(
      email.trim().toLowerCase(),
      password,
      formatName(name),
      salonName.trim(),
      phone.trim(),
    );
    setIsLoading(false);

    if (!result.success) {
      Alert.alert("Sign Up Failed", result.error);
    }
    // If successful, AuthContext's onAuthStateChanged listener
    // will fire and _layout.tsx will automatically redirect to dashboard
  };

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
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
          <Text style={styles.tagline}>Set up your booking studio</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create your account</Text>
          <Text style={styles.cardSubtitle}>
            You&apos;ll use this to manage your schedule and clients
          </Text>

          {/* Your Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Your Name</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              placeholder="Jane Doe"
              placeholderTextColor={colors.midGray}
              value={name}
              onChangeText={(text) => {
                setName(text);
                clearError("name");
              }}
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
            />
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
          </View>

          {/* Salon Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Salon Name</Text>
            <TextInput
              style={[
                styles.input,
                errors.salonName ? styles.inputError : null,
              ]}
              placeholder="Glam Nails & Lashes"
              placeholderTextColor={colors.midGray}
              value={salonName}
              onChangeText={(text) => {
                setSalonName(text);
                clearError("salonName");
              }}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {errors.salonName ? (
              <Text style={styles.errorText}>{errors.salonName}</Text>
            ) : null}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="your@email.com"
              placeholderTextColor={colors.midGray}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearError("email");
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

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={[styles.input, errors.phone ? styles.inputError : null]}
              placeholder="(555) 123-4567"
              placeholderTextColor={colors.midGray}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                clearError("phone");
              }}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            {errors.phone ? (
              <Text style={styles.errorText}>{errors.phone}</Text>
            ) : null}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              placeholder="At least 6 characters"
              placeholderTextColor={colors.midGray}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError("password");
              }}
              secureTextEntry
              autoComplete="new-password"
            />
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword ? styles.inputError : null,
              ]}
              placeholder="Re-enter your password"
              placeholderTextColor={colors.midGray}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearError("confirmPassword");
              }}
              secureTextEntry
              autoComplete="new-password"
            />
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign In Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.footerLink}>Sign in</Text>
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

  // Button
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
