import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    InputAccessoryView,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import colors from "../../src/constants/colors";
import { ADD_ONS, SERVICE_CATEGORIES } from "../../src/constants/services";
import theme from "../../src/constants/theme";
import { useServices } from "../../src/hooks/useServices";
import { ServiceFormData } from "../../src/services/services";
import { formatPrice } from "../../src/utils/formatters";
import { rs } from "../../src/utils/responsive";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type CategoryKey = keyof typeof SERVICE_CATEGORIES;

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const PRICE_INPUT_ACCESSORY_ID = "price-input-accessory";

const DURATION_OPTIONS = [15, 20, 30, 45, 60, 75, 90, 105, 120, 135, 150, 180];

const EMPTY_FORM: ServiceFormData = {
  category: SERVICE_CATEGORIES.NAILS,
  name: "",
  description: "",
  duration: 60,
  price: 0,
  addOns: [],
  isActive: true,
};

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function ServiceFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ serviceId?: string }>();
  const { services, add, update } = useServices();

  const isEditing = !!params.serviceId;
  const existingService = services.find((s) => s.id === params.serviceId);

  const [form, setForm] = useState<ServiceFormData>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    description: "",
    price: "",
  });

  // Populate form if editing
  useEffect(() => {
    if (isEditing && existingService) {
      setForm({
        category: existingService.category,
        name: existingService.name,
        description: existingService.description,
        duration: existingService.duration,
        price: existingService.price,
        addOns: existingService.addOns,
        isActive: existingService.isActive,
      });
    }
  }, [isEditing, existingService]);

  const updateField = <K extends keyof ServiceFormData>(
    field: K,
    value: ServiceFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleAddOn = (addOnId: string) => {
    setForm((prev) => ({
      ...prev,
      addOns: prev.addOns.includes(addOnId)
        ? prev.addOns.filter((id) => id !== addOnId)
        : [...prev.addOns, addOnId],
    }));
  };

  const validate = () => {
    const newErrors = { name: "", description: "", price: "" };
    let isValid = true;

    if (!form.name.trim()) {
      newErrors.name = "Service name is required";
      isValid = false;
    }

    if (!form.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    }

    if (!form.price || form.price <= 0) {
      newErrors.price = "Please enter a valid price";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    if (!validate()) return;

    setIsLoading(true);
    const result =
      isEditing && params.serviceId
        ? await update(params.serviceId, form)
        : await add(form);
    setIsLoading(false);

    if (result.success) {
      router.back();
    } else {
      Alert.alert(
        "Error",
        result.error || "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.cancelButton}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? "Edit Service" : "New Service"}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Category Picker */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryRow}>
              {Object.keys(SERVICE_CATEGORIES).map((key) => {
                const category = SERVICE_CATEGORIES[key as CategoryKey];
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.categoryChip,
                      form.category === category && styles.categoryChipActive,
                    ]}
                    onPress={() => updateField("category", category)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        form.category === category &&
                          styles.categoryChipTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Service Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Name</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              placeholder="e.g. Gel Manicure"
              placeholderTextColor={colors.midGray}
              value={form.name}
              onChangeText={(text) => updateField("name", text)}
              autoCapitalize="words"
            />
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.description ? styles.inputError : null,
              ]}
              placeholder="Describe what's included in this service..."
              placeholderTextColor={colors.midGray}
              value={form.description}
              onChangeText={(text) => updateField("description", text)}
              multiline
              numberOfLines={3}
            />
            {errors.description ? (
              <Text style={styles.errorText}>{errors.description}</Text>
            ) : null}
          </View>

          {/* Duration Picker */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Duration</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.durationRow}
            >
              {DURATION_OPTIONS.map((duration) => {
                const hours = Math.floor(duration / 60);
                const mins = duration % 60;
                const label =
                  hours > 0
                    ? mins > 0
                      ? `${hours}h ${mins}m`
                      : `${hours}h`
                    : `${mins}m`;
                return (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.durationChip,
                      form.duration === duration && styles.durationChipActive,
                    ]}
                    onPress={() => updateField("duration", duration)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.durationChipText,
                        form.duration === duration &&
                          styles.durationChipTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Price */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price</Text>
            <View style={styles.priceInputRow}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.priceInput,
                  errors.price ? styles.inputError : null,
                ]}
                placeholder="0"
                placeholderTextColor={colors.midGray}
                value={form.price > 0 ? String(form.price) : ""}
                onChangeText={(text) =>
                  updateField("price", parseFloat(text) || 0)
                }
                keyboardType="decimal-pad"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                inputAccessoryViewID={PRICE_INPUT_ACCESSORY_ID}
              />
            </View>
            {errors.price ? (
              <Text style={styles.errorText}>{errors.price}</Text>
            ) : null}
          </View>

          {/* Add-Ons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Add-Ons</Text>
            <Text style={styles.sectionSubtitle}>
              Select which add-ons clients can attach to this service
            </Text>
            <View style={styles.addOnsGrid}>
              {ADD_ONS.map((addOn) => {
                const isSelected = form.addOns.includes(addOn.id);
                return (
                  <TouchableOpacity
                    key={addOn.id}
                    style={[
                      styles.addOnChip,
                      isSelected && styles.addOnChipActive,
                    ]}
                    onPress={() => toggleAddOn(addOn.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.addOnName,
                        isSelected && styles.addOnNameActive,
                      ]}
                    >
                      {addOn.name}
                    </Text>
                    <Text
                      style={[
                        styles.addOnPrice,
                        isSelected && styles.addOnPriceActive,
                      ]}
                    >
                      +{formatPrice(addOn.price)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Visible to Clients Toggle */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visibility</Text>
            <View style={styles.visibilityRow}>
              {[true, false].map((value) => (
                <TouchableOpacity
                  key={String(value)}
                  style={[
                    styles.visibilityChip,
                    form.isActive === value && styles.visibilityChipActive,
                  ]}
                  onPress={() => updateField("isActive", value)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.visibilityText,
                      form.isActive === value && styles.visibilityTextActive,
                    ]}
                  >
                    {value ? "👁 Visible to clients" : "🙈 Hidden"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Done toolbar for numeric keyboard */}
        {Platform.OS === "ios" && (
          <InputAccessoryView nativeID={PRICE_INPUT_ACCESSORY_ID}>
            <View style={styles.keyboardAccessory}>
              <TouchableOpacity
                onPress={Keyboard.dismiss}
                style={styles.keyboardDoneButton}
                activeOpacity={0.8}
              >
                <Text style={styles.keyboardDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </InputAccessoryView>
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    ...theme.components.screen,
    paddingTop: rs(60, 80),
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: rs(17, 20),
    fontWeight: "700",
    color: colors.charcoal,
  },
  cancelButton: {
    padding: theme.spacing.xs,
  },
  cancelText: {
    fontSize: rs(15, 17),
    color: colors.darkGray,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.round,
    minWidth: 60,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveText: {
    fontSize: rs(15, 17),
    fontWeight: "700",
    color: colors.white,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },

  // Sections
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: rs(13, 15),
    fontWeight: "700",
    color: colors.charcoal,
    marginBottom: theme.spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: rs(12, 14),
    color: colors.darkGray,
    marginBottom: theme.spacing.sm,
    marginTop: -theme.spacing.xs,
  },

  // Inputs
  input: {
    ...theme.components.input,
    fontSize: rs(15, 17),
  },
  textArea: {
    height: rs(90, 110),
    textAlignVertical: "top",
    paddingTop: theme.spacing.sm,
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

  // Category
  categoryRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  categoryChip: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: colors.midGray,
    alignItems: "center",
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: rs(13, 15),
    fontWeight: "600",
    color: colors.darkGray,
  },
  categoryChipTextActive: {
    color: colors.white,
  },

  // Duration
  durationRow: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  durationChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.round,
    borderWidth: 1.5,
    borderColor: colors.midGray,
    alignItems: "center",
  },
  durationChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationChipText: {
    fontSize: rs(13, 15),
    fontWeight: "600",
    color: colors.darkGray,
  },
  durationChipTextActive: {
    color: colors.white,
  },

  // Price
  priceInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  dollarSign: {
    fontSize: rs(20, 24),
    fontWeight: "700",
    color: colors.charcoal,
  },
  priceInput: {
    flex: 1,
  },

  // Add-ons
  addOnsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  addOnChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: colors.midGray,
    alignItems: "center",
  },
  addOnChipActive: {
    backgroundColor: colors.accentLight,
    borderColor: colors.accent,
  },
  addOnName: {
    fontSize: rs(13, 15),
    fontWeight: "600",
    color: colors.darkGray,
  },
  addOnNameActive: {
    color: colors.accentDark,
  },
  addOnPrice: {
    fontSize: rs(11, 13),
    color: colors.midGray,
    marginTop: 2,
  },
  addOnPriceActive: {
    color: colors.accent,
  },

  // Visibility
  visibilityRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  visibilityChip: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: colors.midGray,
    alignItems: "center",
  },
  visibilityChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  visibilityText: {
    fontSize: rs(13, 15),
    fontWeight: "600",
    color: colors.darkGray,
  },
  visibilityTextActive: {
    color: colors.primaryDark,
  },

  keyboardAccessory: {
    backgroundColor: colors.lightGray,
    borderTopWidth: 1,
    borderTopColor: colors.midGray,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  keyboardDoneButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  keyboardDoneText: {
    fontSize: rs(16, 18),
    fontWeight: "700",
    color: colors.primary,
  },
});
