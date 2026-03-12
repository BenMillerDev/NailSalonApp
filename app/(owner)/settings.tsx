import * as Clipboard from "expo-clipboard";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import colors from "../../src/constants/colors";
import theme from "../../src/constants/theme";
import { useAuth } from "../../src/context/AuthContext";
import { db } from "../../src/services/firebase";
import { rs } from "../../src/utils/responsive";

export default function SettingsScreen() {
  const { user, userProfile, logOut } = useAuth();

  const [name, setName] = useState(userProfile?.name || "");
  const [salonName, setSalonName] = useState(userProfile?.salonName || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Build the booking link using the owner's UID
  const bookingLink = `https://nailsalonapp-a0fc5.web.app?owner=${user?.uid}`;

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(bookingLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `Book an appointment at ${salonName}: ${bookingLink}`,
        url: bookingLink,
      });
    } catch (error) {
      // Fallback to clipboard
      await handleCopyLink();
      Alert.alert(
        "Link Copied",
        "Your booking link has been copied to clipboard.",
      );
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!name.trim() || !salonName.trim()) {
      Alert.alert("Required Fields", "Name and salon name are required.");
      return;
    }

    Keyboard.dismiss();
    setIsSaving(true);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        salonName: salonName.trim(),
        phone: phone.trim(),
      });
      setHasChanges(false);
      Alert.alert("Saved", "Your profile has been updated.");
    } catch (error) {
      Alert.alert("Error", "Could not save profile. Please try again.");
    }

    setIsSaving(false);
  };

  const handleLogOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => await logOut(),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Settings</Text>
          </View>

          {/* Booking Link Section */}
          <Text style={styles.sectionTitle}>Your Booking Link</Text>
          <View style={styles.card}>
            <Text style={styles.bookingLinkDescription}>
              Share this link with clients so they can book appointments
              directly. Send it via text, Instagram, or anywhere you connect
              with clients.
            </Text>

            {/* Link Display */}
            <View style={styles.linkBox}>
              <Text
                style={styles.linkText}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {bookingLink}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.linkActions}>
              <TouchableOpacity
                style={[
                  styles.linkButton,
                  linkCopied && styles.linkButtonSuccess,
                ]}
                onPress={handleCopyLink}
                activeOpacity={0.85}
              >
                <Text style={styles.linkButtonText}>
                  {linkCopied ? "✓ Copied!" : "📋 Copy Link"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.linkButton, styles.linkButtonShare]}
                onPress={handleShareLink}
                activeOpacity={0.85}
              >
                <Text
                  style={[styles.linkButtonText, styles.linkButtonShareText]}
                >
                  ↑ Share Link
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Section */}
          <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
            Profile
          </Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setHasChanges(true);
                }}
                autoCapitalize="words"
                autoCorrect={false}
                placeholder="Jane Doe"
                placeholderTextColor={colors.midGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Salon Name</Text>
              <TextInput
                style={styles.input}
                value={salonName}
                onChangeText={(text) => {
                  setSalonName(text);
                  setHasChanges(true);
                }}
                autoCapitalize="words"
                autoCorrect={false}
                placeholder="Glam Nails & Lashes"
                placeholderTextColor={colors.midGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setHasChanges(true);
                }}
                keyboardType="phone-pad"
                placeholder="(555) 123-4567"
                placeholderTextColor={colors.midGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.readOnlyInput}>
                <Text style={styles.readOnlyText}>{userProfile?.email}</Text>
              </View>
              <Text style={styles.inputHint}>Email cannot be changed</Text>
            </View>

            {hasChanges && (
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  isSaving && styles.saveButtonDisabled,
                ]}
                onPress={handleSaveProfile}
                disabled={isSaving}
                activeOpacity={0.85}
              >
                {isSaving ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Account Section */}
          <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
            Account
          </Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleLogOut}
              activeOpacity={0.85}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          {/* App Version */}
          <Text style={styles.versionText}>NailSalon v1.0.0</Text>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...theme.components.screen,
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  scrollContent: {
    paddingTop: rs(60, 80),
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },

  // Header
  header: {
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: rs(28, 34),
    fontWeight: "700",
    color: colors.charcoal,
    letterSpacing: -0.5,
  },

  // Section titles
  sectionTitle: {
    fontSize: rs(13, 15),
    fontWeight: "700",
    color: colors.charcoal,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },
  sectionTitleSpaced: {
    marginTop: theme.spacing.xl,
  },

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },

  // Booking link
  bookingLinkDescription: {
    fontSize: rs(13, 15),
    color: colors.darkGray,
    lineHeight: rs(20, 22),
    marginBottom: theme.spacing.md,
  },
  linkBox: {
    backgroundColor: colors.lightGray,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.midGray,
  },
  linkText: {
    fontSize: rs(12, 14),
    color: colors.darkGray,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  linkActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  linkButton: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.midGray,
  },
  linkButtonSuccess: {
    backgroundColor: colors.status.confirmed + "20",
    borderColor: colors.status.confirmed,
  },
  linkButtonShare: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  linkButtonText: {
    fontSize: rs(14, 16),
    fontWeight: "700",
    color: colors.charcoal,
  },
  linkButtonShareText: {
    color: colors.white,
  },

  // Profile inputs
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
  readOnlyInput: {
    backgroundColor: colors.lightGray,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  readOnlyText: {
    fontSize: rs(15, 17),
    color: colors.midGray,
  },
  inputHint: {
    fontSize: rs(11, 13),
    color: colors.midGray,
    marginTop: 4,
  },

  // Save button
  saveButton: {
    ...theme.components.button,
    marginTop: theme.spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    ...theme.components.buttonText,
    fontSize: rs(15, 17),
  },

  // Sign out
  signOutButton: {
    padding: theme.spacing.md,
    alignItems: "center",
    borderRadius: theme.radius.md,
    backgroundColor: "#FFF0F0",
  },
  signOutText: {
    fontSize: rs(15, 17),
    fontWeight: "700",
    color: colors.error,
  },

  // Version
  versionText: {
    fontSize: rs(12, 13),
    color: colors.midGray,
    textAlign: "center",
    marginTop: theme.spacing.xl,
  },
});
