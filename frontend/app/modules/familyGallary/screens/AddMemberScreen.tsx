import Header from "@/app/shared/components/Header";
import { COLORS } from "@/app/shared/constants/theme";
import { Doc } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  Checkbox,
  Divider,
  HelperText,
  List,
  TextInput,
} from "react-native-paper";
import { z } from "zod";
import Modal from "../components/modal";
import { useFamilyGallery } from "../hooks/useFamilyGallary";
import { Loader } from "@/app/shared/components/Loader";
import { t, isRTL } from "@/app/shared/services/i18";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";

// Define form schema with Zod
const getFormSchema = () =>
  z.object({
    name: z.string().min(1, t("validation.nameRequired")),
    gender: z.enum(["female", "male"]),
    wearsHijab: z.boolean(),
    photos: z
      .array(z.string())
      .min(5, t("validation.photosMinRequired"))
      .max(10, t("validation.photosMaxAllowed")),
  });

const FormScreen = () => {
  const { member } = useLocalSearchParams();
  const FM: Doc<"familyMembers"> | undefined =
    typeof member === "string" ? JSON.parse(member) : undefined;

  const [formData, setFormData] = useState({
    name: FM?.name || "",
    gender: FM?.gender,
    wearsHijab: FM?.hijabStatus || false,
    photos: FM?.images || [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAccordionExpanded, setAccordionExpanded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { addNewFamilyMember, updateFamilyMember, loading } =
    useFamilyGallery();

  const handlePhotoUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert(t("familyGallery.cameraRollPermission"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 1,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      const newPhotos = result.assets.slice(0, 10 - formData.photos.length);
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos.map((asset) => asset.uri)],
      }));
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...formData.photos];
    newPhotos.splice(index, 1);
    setFormData((prev) => ({ ...prev, photos: newPhotos }));
  };

  const validateForm = () => {
    try {
      const formSchema = getFormSchema();
      formSchema.parse(formData);
      setErrors({});
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        e.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0]] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const onSubmit = () => {
    if (validateForm()) {
      if (FM) {
        // Update existing family member
        updateFamilyMember(
          FM._id,
          formData.name,
          formData.gender as "male" | "female",
          formData.wearsHijab,
          formData.photos,
          FM.storageIds
        );
      } else {
        // Add new family member
        addNewFamilyMember(
          formData.name,
          formData.gender as "male" | "female",
          formData.wearsHijab,
          formData.photos
        );
      }
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return !!formData.gender;
      case 3:
        return formData.photos.length >= 5 && formData.photos.length <= 10;
      default:
        return false;
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      {!member && <Modal />}
      <Header
        title={
          FM ? t("familyGallery.updateMember") : t("familyGallery.addMember")
        }
        onBackPress={() => router.replace("/(tabs)/Gallery")}
      />

      {/* Progress Indicator */}
      <Animatable.View
        animation="fadeInDown"
        duration={600}
        style={styles.progressContainer}
      >
        <View style={styles.progressBar}>
          {[1, 2, 3].map((step) => (
            <View key={step} style={styles.progressItem}>
              <View
                style={[
                  styles.progressCircle,
                  currentStep >= step && styles.progressCircleActive,
                  currentStep === step && styles.progressCircleCurrent,
                ]}
              >
                {currentStep > step ? (
                  <Ionicons name="checkmark" size={16} color="white" />
                ) : (
                  <Text
                    style={[
                      styles.progressText,
                      currentStep >= step && styles.progressTextActive,
                    ]}
                  >
                    {step}
                  </Text>
                )}
              </View>
              {step < 3 && (
                <View
                  style={[
                    styles.progressLine,
                    currentStep > step && styles.progressLineActive,
                  ]}
                />
              )}
            </View>
          ))}
        </View>
        <View style={styles.stepLabels}>
          <Text style={[styles.stepLabel, isRTL() && { textAlign: "right" }]}>
            {t("familyGallery.steps.basicInfo")}
          </Text>
          <Text style={[styles.stepLabel, isRTL() && { textAlign: "right" }]}>
            {t("familyGallery.steps.details")}
          </Text>
          <Text style={[styles.stepLabel, isRTL() && { textAlign: "right" }]}>
            {t("familyGallery.steps.photos")}
          </Text>
        </View>
      </Animatable.View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Animatable.View
              animation="slideInRight"
              duration={400}
              style={styles.stepContainer}
            >
              <View style={styles.stepHeader}>
                <Ionicons
                  name="person-outline"
                  size={32}
                  color={COLORS.primary}
                />
                <Text
                  style={[styles.stepTitle, isRTL() && { textAlign: "right" }]}
                >
                  {t("familyGallery.steps.basicInformation")}
                </Text>
                <Text
                  style={[
                    styles.stepSubtitle,
                    isRTL() && { textAlign: "right" },
                  ]}
                >
                  {t("familyGallery.steps.startWithBasics")}
                </Text>
              </View>

              <View style={styles.inputSection}>
                <TextInput
                  label={t("familyGallery.name")}
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, name: text }))
                  }
                  mode="outlined"
                  style={styles.input}
                  theme={{ roundness: 12 }}
                  error={!!errors.name}
                  textAlign={isRTL() ? "right" : "left"}
                />
                {errors.name && (
                  <Animatable.Text
                    animation="shake"
                    style={[
                      styles.errorText,
                      isRTL() && { textAlign: "right" },
                    ]}
                  >
                    {errors.name}
                  </Animatable.Text>
                )}
              </View>
            </Animatable.View>
          )}

          {/* Step 2: Gender and Hijab Status */}
          {currentStep === 2 && (
            <Animatable.View
              animation="slideInRight"
              duration={400}
              style={styles.stepContainer}
            >
              <View style={styles.stepHeader}>
                <Ionicons
                  name="options-outline"
                  size={32}
                  color={COLORS.primary}
                />
                <Text
                  style={[styles.stepTitle, isRTL() && { textAlign: "right" }]}
                >
                  {t("familyGallery.steps.personalDetails")}
                </Text>
                <Text
                  style={[
                    styles.stepSubtitle,
                    isRTL() && { textAlign: "right" },
                  ]}
                >
                  {t("familyGallery.steps.understandPreferences")}
                </Text>
              </View>

              <View style={styles.inputSection}>
                {/* Gender Selection */}
                <Text
                  style={[
                    styles.sectionLabel,
                    isRTL() && { textAlign: "right" },
                  ]}
                >
                  {t("familyGallery.steps.gender")}
                </Text>
                <View
                  style={[
                    styles.genderContainer,
                    isRTL() && { flexDirection: "row-reverse" },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.genderOption,
                      formData.gender === "female" &&
                        styles.genderOptionSelected,
                    ]}
                    onPress={() => {
                      setFormData((prev) => ({ ...prev, gender: "female" }));
                    }}
                  >
                    <Ionicons
                      name="woman-outline"
                      size={24}
                      color={
                        formData.gender === "female" ? "white" : COLORS.primary
                      }
                    />
                    <Text
                      style={[
                        styles.genderText,
                        formData.gender === "female" &&
                          styles.genderTextSelected,
                      ]}
                    >
                      {t("familyGallery.female")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.genderOption,
                      formData.gender === "male" && styles.genderOptionSelected,
                    ]}
                    onPress={() => {
                      setFormData((prev) => ({
                        ...prev,
                        gender: "male",
                        wearsHijab: false,
                      }));
                    }}
                  >
                    <Ionicons
                      name="man-outline"
                      size={24}
                      color={
                        formData.gender === "male" ? "white" : COLORS.primary
                      }
                    />
                    <Text
                      style={[
                        styles.genderText,
                        formData.gender === "male" && styles.genderTextSelected,
                      ]}
                    >
                      {t("familyGallery.male")}
                    </Text>
                  </TouchableOpacity>
                </View>

                {errors.gender && (
                  <Animatable.Text
                    animation="shake"
                    style={[
                      styles.errorText,
                      isRTL() && { textAlign: "right" },
                    ]}
                  >
                    {errors.gender}
                  </Animatable.Text>
                )}

                {/* Hijab Checkbox */}
                {formData.gender === "female" && (
                  <Animatable.View animation="fadeIn" duration={300}>
                    <TouchableOpacity
                      style={[
                        styles.hijabContainer,
                        isRTL() && { flexDirection: "row-reverse" },
                      ]}
                      onPress={() =>
                        setFormData((prev) => ({
                          ...prev,
                          wearsHijab: !prev.wearsHijab,
                        }))
                      }
                    >
                      <Checkbox
                        status={formData.wearsHijab ? "checked" : "unchecked"}
                        onPress={() =>
                          setFormData((prev) => ({
                            ...prev,
                            wearsHijab: !prev.wearsHijab,
                          }))
                        }
                      />
                      <Text style={styles.hijabLabel}>
                        {t("familyGallery.doesWearHijab")}
                      </Text>
                    </TouchableOpacity>
                  </Animatable.View>
                )}
              </View>
            </Animatable.View>
          )}

          {/* Step 3: Photo Upload */}
          {currentStep === 3 && (
            <Animatable.View
              animation="slideInRight"
              duration={400}
              style={styles.stepContainer}
            >
              <View style={styles.stepHeader}>
                <Ionicons
                  name="camera-outline"
                  size={32}
                  color={COLORS.primary}
                />
                <Text
                  style={[styles.stepTitle, isRTL() && { textAlign: "right" }]}
                >
                  {t("familyGallery.steps.photos")}
                </Text>
                <Text
                  style={[
                    styles.stepSubtitle,
                    isRTL() && { textAlign: "right" },
                  ]}
                >
                  {t("familyGallery.steps.addPhotosForRecognition")}
                </Text>
              </View>

              <View style={styles.photosSection}>
                <HelperText
                  type={errors.photos ? "error" : "info"}
                  visible={true}
                  style={[
                    styles.photosHelper,
                    isRTL() && { textAlign: "right" },
                  ]}
                >
                  {errors.photos
                    ? errors.photos
                    : t("familyGallery.photosUploaded", {
                        count: formData.photos.length,
                      })}
                </HelperText>

                {/* Display uploaded photos */}
                <View style={styles.photosGrid}>
                  {formData.photos.map((uri: string, index: number) => (
                    <Animatable.View
                      key={index}
                      animation="fadeIn"
                      delay={index * 100}
                      style={styles.photoItem}
                    >
                      <Image source={{ uri }} style={styles.photoImage} />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => removePhoto(index)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={24}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    </Animatable.View>
                  ))}

                  {formData.photos.length < 10 && (
                    <TouchableOpacity
                      style={styles.addPhotoButton}
                      onPress={handlePhotoUpload}
                    >
                      <Ionicons name="add" size={32} color={COLORS.primary} />
                      <Text
                        style={[
                          styles.addPhotoText,
                          isRTL() && { textAlign: "right" },
                        ]}
                      >
                        {t("familyGallery.steps.addPhoto")}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Animatable.View>
          )}

          {/* Navigation Buttons */}
          <Animatable.View
            animation="fadeInUp"
            delay={200}
            style={styles.navigationContainer}
          >
            <View style={styles.buttonRow}>
              {currentStep > 1 && (
                <TouchableOpacity
                  style={styles.previousButton}
                  onPress={handlePrevious}
                >
                  <Ionicons
                    name="arrow-back"
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text style={styles.previousButtonText}>
                    {t("familyGallery.steps.previous")}
                  </Text>
                </TouchableOpacity>
              )}

              <View style={{ flex: 1 }} />

              {currentStep < 3 ? (
                <TouchableOpacity
                  style={[
                    styles.nextButton,
                    !isStepValid(currentStep) && styles.buttonDisabled,
                  ]}
                  onPress={handleNext}
                  disabled={!isStepValid(currentStep)}
                >
                  <LinearGradient
                    colors={
                      isStepValid(currentStep)
                        ? [COLORS.primary, COLORS.secondary]
                        : ["#E5E7EB", "#E5E7EB"]
                    }
                    style={styles.gradientButton}
                  >
                    <Text style={styles.nextButtonText}>
                      {t("familyGallery.steps.next")}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    !isStepValid(currentStep) && styles.buttonDisabled,
                  ]}
                  onPress={onSubmit}
                  disabled={!isStepValid(currentStep)}
                >
                  <LinearGradient
                    colors={
                      isStepValid(currentStep)
                        ? [COLORS.primary, COLORS.secondary]
                        : ["#E5E7EB", "#E5E7EB"]
                    }
                    style={styles.gradientButton}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text style={styles.submitButtonText}>
                      {FM
                        ? t("familyGallery.steps.update")
                        : t("familyGallery.submit")}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </Animatable.View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  progressItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  progressCircleActive: {
    backgroundColor: COLORS.primary,
  },
  progressCircleCurrent: {
    backgroundColor: COLORS.secondary,
    transform: [{ scale: 1.1 }],
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  progressTextActive: {
    color: "white",
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: COLORS.primary,
  },
  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stepLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  stepContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stepHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: COLORS.grey,
    textAlign: "center",
  },
  inputSection: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: COLORS.white,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 12,
  },
  genderContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  genderOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: "transparent",
    gap: 8,
  },
  genderOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  genderTextSelected: {
    color: "white",
  },
  hijabContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  hijabLabel: {
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 8,
    fontWeight: "500",
  },
  photosSection: {
    marginBottom: 20,
  },
  photosHelper: {
    fontSize: 14,
    marginBottom: 16,
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  photoItem: {
    width: "30%",
    aspectRatio: 1,
    position: "relative",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  removePhotoButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 12,
  },
  addPhotoButton: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  addPhotoText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
    marginTop: 4,
  },
  navigationContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  previousButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    gap: 8,
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  nextButton: {
    borderRadius: 12,
    overflow: "hidden",
    minWidth: 120,
  },
  submitButton: {
    borderRadius: 12,
    overflow: "hidden",
    minWidth: 140,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 24,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
});

export default FormScreen;
