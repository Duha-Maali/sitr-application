import { useAuth } from "@/app/modules/auth/hooks/useAuth";
import { useProfile } from "@/app/modules/profile/hooks/useProfile";
import { COLORS } from "@/app/shared/constants/theme";
import { isRTL, t } from "@/app/shared/services/i18";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { z } from "zod";
import { Loader } from "@/app/shared/components/Loader";
import { router } from "expo-router";
import * as Animatable from "react-native-animatable";

const AccountScreen = () => {
  const accountSchema = z
    .object({
      name: z
        .string()
        .min(2, { message: t("validation.nameRequired") })
        .nullable()
        .optional(),
      currentPassword: z.string().optional(),
      password: z.string().optional(),
      confirmPassword: z.string().optional(),
    })
    .refine(
      (data) =>
        (data.password === null && data.confirmPassword === null) ||
        data.password === data.confirmPassword,
      {
        message: t("validation.passwordsMismatch"),
        path: ["confirmPassword"],
      }
    );

  /* STATES */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCanceld, setIsCanceld] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    currentPassword?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { updateProfileFn, profile, loading } = useProfile();
  const { signOutFn, ChangePassword, error, setError } = useAuth();
  const { user } = useUser();
  const passwordEnabled = user?.passwordEnabled || false;

  useEffect(() => {
    const fetchProfile = async () => {
      if (profile) {
        setProfileImage(profile.image);
        setFormData({
          name: profile.userName || "",
          email: profile.email || "",
          currentPassword: "",
          password: "",
          confirmPassword: "",
        });
      }
    };
    setErrors({});
    setError("");
    setIsEditing(false);
    setIsCanceld(false);
    fetchProfile();
    formData.password = "";
    formData.currentPassword = "";
    formData.confirmPassword = "";
  }, [isCanceld, profile]);

  const pickImage = async () => {
    if (!isEditing) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert(t("account.cameraPermission"));
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    const result = accountSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        currentPassword: fieldErrors.currentPassword?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      });

      return;
    }
    setErrors({});

    // Check if password change is requested
    if (formData.password && formData.currentPassword) {
      const passwordChangeSuccess = await ChangePassword(
        formData.currentPassword,
        formData.password
      );
      // Only update profile if password change succeeded
      if (passwordChangeSuccess) {
        updateProfileFn(formData.name, profileImage);
      }
    } else {
      // No password change requested, update profile directly
      updateProfileFn(formData.name, profileImage);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading || !profile) return <Loader />;

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 100}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* HEADER */}
          <Animatable.View
            animation="fadeIn"
            duration={600}
            style={styles.headerContainer}
          ></Animatable.View>
          {/* Gradient Header Background */}
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary, COLORS.lightPurple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientHeader}
          />

          <View style={styles.container}>
            {/* Profile Image with Animation */}
            <Animatable.View
              animation="bounceIn"
              delay={300}
              duration={800}
              style={styles.profileSection}
            >
              <TouchableOpacity onPress={pickImage} disabled={!isEditing}>
                <View style={styles.profileImageContainer}>
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                  />
                  {isEditing && (
                    <Animatable.View
                      animation="pulse"
                      iterationCount="infinite"
                      style={styles.editPhotoIcon}
                    >
                      <Ionicons name="camera-outline" size={20} color="white" />
                    </Animatable.View>
                  )}
                </View>
              </TouchableOpacity>
              <Animatable.View
                animation="fadeInUp"
                delay={500}
                style={styles.userInfo}
              >
                <Text style={styles.userName}>{formData.name}</Text>
                <Text style={styles.userEmail}>{formData.email}</Text>
              </Animatable.View>
            </Animatable.View>

            {/* Form Container with Animation */}
            <Animatable.View
              animation="fadeInUp"
              delay={700}
              duration={600}
              style={styles.formContainer}
            >
              {/* Name Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  label={t("account.name")}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange("name", value)}
                  mode="outlined"
                  style={styles.input}
                  theme={{ roundness: 12 }}
                  editable={isEditing}
                  left={
                    !isRTL() ? <TextInput.Icon icon="account" /> : undefined
                  }
                  right={
                    isRTL() ? <TextInput.Icon icon="account" /> : undefined
                  }
                  textAlign={isRTL() ? "right" : "left"}
                  error={!!errors.name}
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

              {/* Email Input */}
              {!isEditing && (
                <View style={styles.inputContainer}>
                  <TextInput
                    label={t("account.email")}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange("email", value)}
                    mode="outlined"
                    style={styles.input}
                    theme={{ roundness: 12 }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={false}
                    left={
                      !isRTL() ? <TextInput.Icon icon="email" /> : undefined
                    }
                    right={
                      isRTL() ? <TextInput.Icon icon="email" /> : undefined
                    }
                    textAlign={isRTL() ? "right" : "left"}
                    error={!!errors.email}
                  />
                  {errors.email && (
                    <Animatable.Text
                      animation="shake"
                      style={[
                        styles.errorText,
                        isRTL() && { textAlign: "right" },
                      ]}
                    >
                      {errors.email}
                    </Animatable.Text>
                  )}
                </View>
              )}

              {/* Password Change Notice */}
              {isEditing && !passwordEnabled && (
                <Animatable.View
                  animation="fadeIn"
                  style={styles.noticeContainer}
                >
                  <Text style={styles.noticeText}>
                    {t("account.passwordChangeNote")}
                  </Text>
                </Animatable.View>
              )}

              {/* Password Fields */}
              {isEditing && passwordEnabled && (
                <Animatable.View animation="slideInUp" duration={400}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      label={t("account.currentPassword")}
                      value={formData.currentPassword}
                      onChangeText={(value) =>
                        handleInputChange("currentPassword", value)
                      }
                      mode="outlined"
                      style={styles.input}
                      theme={{ roundness: 12 }}
                      secureTextEntry={!showCurrentPassword}
                      left={
                        !isRTL() ? (
                          <TextInput.Icon icon="lock" />
                        ) : (
                          <TextInput.Icon
                            icon={showCurrentPassword ? "eye-off" : "eye"}
                            onPress={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                          />
                        )
                      }
                      right={
                        isRTL() ? (
                          <TextInput.Icon icon="lock" />
                        ) : (
                          <TextInput.Icon
                            icon={showCurrentPassword ? "eye-off" : "eye"}
                            onPress={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                          />
                        )
                      }
                      textAlign={isRTL() ? "right" : "left"}
                      error={!!errors.currentPassword}
                    />
                    {errors.currentPassword && (
                      <Animatable.Text
                        animation="shake"
                        style={[
                          styles.errorText,
                          isRTL() && { textAlign: "right" },
                        ]}
                      >
                        {errors.currentPassword}
                      </Animatable.Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <TextInput
                      label={t("account.newPassword")}
                      value={formData.password}
                      onChangeText={(value) =>
                        handleInputChange("password", value)
                      }
                      mode="outlined"
                      style={styles.input}
                      theme={{ roundness: 12 }}
                      secureTextEntry={!showPassword}
                      left={
                        !isRTL() ? (
                          <TextInput.Icon icon="lock" />
                        ) : (
                          <TextInput.Icon
                            icon={showPassword ? "eye-off" : "eye"}
                            onPress={() => setShowPassword(!showPassword)}
                          />
                        )
                      }
                      right={
                        isRTL() ? (
                          <TextInput.Icon icon="lock" />
                        ) : (
                          <TextInput.Icon
                            icon={showPassword ? "eye-off" : "eye"}
                            onPress={() => setShowPassword(!showPassword)}
                          />
                        )
                      }
                      textAlign={isRTL() ? "right" : "left"}
                      error={!!errors.password}
                    />
                    {errors.password && (
                      <Animatable.Text
                        animation="shake"
                        style={[
                          styles.errorText,
                          isRTL() && { textAlign: "right" },
                        ]}
                      >
                        {errors.password}
                      </Animatable.Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <TextInput
                      label={t("signUp.confirmPassword")}
                      value={formData.confirmPassword}
                      onChangeText={(value) =>
                        handleInputChange("confirmPassword", value)
                      }
                      mode="outlined"
                      style={styles.input}
                      theme={{ roundness: 12 }}
                      secureTextEntry={!showConfirmPassword}
                      left={
                        !isRTL() ? (
                          <TextInput.Icon icon="lock" />
                        ) : (
                          <TextInput.Icon
                            icon={showConfirmPassword ? "eye-off" : "eye"}
                            onPress={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          />
                        )
                      }
                      right={
                        isRTL() ? (
                          <TextInput.Icon icon="lock" />
                        ) : (
                          <TextInput.Icon
                            icon={showConfirmPassword ? "eye-off" : "eye"}
                            onPress={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          />
                        )
                      }
                      textAlign={isRTL() ? "right" : "left"}
                      error={!!errors.confirmPassword}
                    />
                    {errors.confirmPassword && (
                      <Animatable.Text
                        animation="shake"
                        style={[
                          styles.errorText,
                          isRTL() && { textAlign: "right" },
                        ]}
                      >
                        {errors.confirmPassword}
                      </Animatable.Text>
                    )}
                  </View>
                </Animatable.View>
              )}

              {/* Error Message */}
              {error && isEditing && (
                <Animatable.Text
                  animation="shake"
                  style={[styles.errorText, isRTL() && { textAlign: "right" }]}
                >
                  {error}
                </Animatable.Text>
              )}

              {/* Action Buttons */}
              <Animatable.View
                animation="fadeInUp"
                delay={900}
                style={styles.buttonContainer}
              >
                {isEditing ? (
                  <View
                    style={[
                      styles.buttonRow,
                      isRTL() && { flexDirection: "row-reverse" },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleSubmit}
                      disabled={
                        !formData.currentPassword &&
                        (!!formData.password || !!formData.confirmPassword)
                      }
                    >
                      <LinearGradient
                        colors={[COLORS.primary, COLORS.secondary]}
                        style={styles.gradientButton}
                      >
                        <Text style={styles.buttonText}>
                          {t("account.saveChanges")}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setIsCanceld(true)}
                    >
                      <Text style={styles.cancelButtonText}>
                        {t("account.cancel")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.secondary]}
                      style={styles.gradientButton}
                    >
                      <Ionicons
                        name="pencil"
                        size={20}
                        color="white"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.buttonText}>
                        {t("account.editProfile")}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </Animatable.View>
            </Animatable.View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerContainer: {
    backgroundColor: COLORS.white,
  },
  header: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerButton: {
    padding: 12,
    borderRadius: 12,
    backdropFilter: "blur(10px)",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.white,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  gradientHeader: {
    height: 220,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileSection: {
    alignItems: "center",
    marginTop: -100,
    marginBottom: 30,
  },
  profileImageContainer: {
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderColor: COLORS.white,
    borderWidth: 4,
  },
  editPhotoIcon: {
    position: "absolute",
    right: 5,
    bottom: 5,
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  userInfo: {
    alignItems: "center",
    marginTop: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: COLORS.grey,
  },
  formContainer: {
    flex: 1,
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noticeContainer: {
    backgroundColor: "#FFF3CD",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FFC107",
  },
  noticeText: {
    color: "#856404",
    fontSize: 14,
    fontWeight: "500",
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 40,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 15,
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.grey,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
  },
  editButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: COLORS.grey,
    fontSize: 16,
    fontWeight: "600",
  },
  curvedBackgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  curvedLayer1: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  curvedLayer2: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  curvedLayer3: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  curvedGradient1: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  curvedGradient2: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  curvedGradient3: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  decorativeCircle1: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  decorativeCircle2: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  decorativeCircle3: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  decorativeCircle4: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});

export default AccountScreen;
