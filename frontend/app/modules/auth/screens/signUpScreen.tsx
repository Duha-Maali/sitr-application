import { useAuth } from "@/app/modules/auth/hooks/useAuth";
import { COLORS } from "@/app/shared/constants/theme";
import { isRTL, t } from "@/app/shared/services/i18";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { z } from "zod";

const SignUpScreen = () => {
  // Define validation schema for sign-up inputs
  const signUpSchema = z
    .object({
      fullName: z.string().min(3, { message: t("validation.fullNameMin") }),
      email: z.string().email({ message: t("validation.emailInvalid") }),
      password: z.string().min(6, { message: t("validation.passwordMin") }),
      confirmPassword: z
        .string()
        .min(6, { message: t("validation.confirmPasswordMin") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordsMismatch"),
      path: ["confirmPassword"],
    });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  }); // State for form fields
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUpFn, loading, error } = useAuth();

  const router = useRouter();

  // Handle sign-up logic
  const handleSignUp = async () => {
    const result = signUpSchema.safeParse(formData); // Validate form data using Zod schema

    if (!result.success) {
      // Extract errors from Zod validation
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        fullName: fieldErrors.fullName?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      });
      return;
    }

    setErrors({});
    // sign-up logic
    await signUpFn(formData.email, formData.password);
  };

  // Handle changes in form fields
  const handleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("./signInScreen")}>
          <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("signUp.title")}</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={styles.container}>
        {/* Logo */}
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />

        {/* Full Name Input */}
        <TextInput
          label={t("signUp.fullName")}
          value={formData.fullName}
          onChangeText={(value) => handleInputChange("fullName", value)}
          mode="outlined"
          style={styles.input}
          theme={{ roundness: 20 }}
          right={isRTL() ? <TextInput.Icon icon="account" /> : undefined}
          left={!isRTL() ? <TextInput.Icon icon="account" /> : undefined}
          textAlign={isRTL() ? "right" : "left"}
          error={!!errors.fullName}
        />
        {errors.fullName ? (
          <Text style={[styles.errorText, isRTL() && { textAlign: "right" }]}>
            {errors.fullName}
          </Text>
        ) : null}

        {/* Email Input */}
        <TextInput
          label={t("signUp.email")}
          value={formData.email}
          onChangeText={(value) => handleInputChange("email", value)}
          mode="outlined"
          style={styles.input}
          theme={{ roundness: 20 }}
          keyboardType="email-address"
          autoCapitalize="none"
          right={isRTL() ? <TextInput.Icon icon="email" /> : undefined}
          left={!isRTL() ? <TextInput.Icon icon="email" /> : undefined}
          textAlign={isRTL() ? "right" : "left"}
          error={!!errors.email}
        />
        {errors.email ? (
          <Text style={[styles.errorText, isRTL() && { textAlign: "right" }]}>
            {errors.email}
          </Text>
        ) : null}

        {/* Password Input */}
        <TextInput
          label={t("signUp.password")}
          value={formData.password}
          onChangeText={(value) => handleInputChange("password", value)}
          mode="outlined"
          style={styles.input}
          theme={{ roundness: 20 }}
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
        {errors.password ? (
          <Text style={[styles.errorText, isRTL() && { textAlign: "right" }]}>
            {errors.password}
          </Text>
        ) : null}

        {/* Confirm Password Input */}
        <TextInput
          label={t("signUp.confirmPassword")}
          value={formData.confirmPassword}
          onChangeText={(value) => handleInputChange("confirmPassword", value)}
          mode="outlined"
          style={styles.input}
          theme={{ roundness: 20 }}
          secureTextEntry={!showConfirmPassword}
          left={
            !isRTL() ? (
              <TextInput.Icon icon="lock" />
            ) : (
              <TextInput.Icon
                icon={showConfirmPassword ? "eye-off" : "eye"}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            )
          }
          right={
            isRTL() ? (
              <TextInput.Icon icon="lock" />
            ) : (
              <TextInput.Icon
                icon={showConfirmPassword ? "eye-off" : "eye"}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            )
          }
          textAlign={isRTL() ? "right" : "left"}
          error={!!errors.confirmPassword}
        />
        {errors.confirmPassword ? (
          <Text style={[styles.errorText, isRTL() && { textAlign: "right" }]}>
            {errors.confirmPassword}
          </Text>
        ) : null}

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Sign-Up Button */}
        <Button
          mode="contained"
          onPress={handleSignUp}
          style={styles.signUpButton}
          contentStyle={isRTL() && { flexDirection: "row-reverse" }}
          disabled={loading} 
        >
          {loading ? t("signUp.loading") : t("signUp.button")}
        </Button>

        {/* Sign-In Link */}
        <View
          style={[
            styles.signInContainer,
            isRTL() && { flexDirection: "row-reverse" },
          ]}
        >
          <Text>{t("signUp.alreadyHaveAccount")} </Text>
          <TouchableOpacity onPress={() => router.replace("./signInScreen")}>
            <Text style={styles.signInText}>{t("signUp.signIn")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.surfaceLight,
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "600",
    color: COLORS.primary,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 30,
    zIndex: 0,
  },
  input: {
    width: "100%",
    marginBottom: 15,
    backgroundColor: "white",
  },
  errorText: {
    width: "100%",
    color: "red",
    marginBottom: 10,
  },
  signUpButton: {
    width: "100%",
    backgroundColor: COLORS.secondary,
    marginBottom: 20,
    marginTop: 30,
  },
  signInContainer: {
    flexDirection: "row",
    marginTop: 25,
    borderTopColor: COLORS.surfaceLight,
    borderTopWidth: 1,
    padding: 8,
  },
  signInText: {
    color: COLORS.secondary,
    fontWeight: "bold",
  },
});

export default SignUpScreen;
