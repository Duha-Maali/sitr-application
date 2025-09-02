import { useAuth } from "@/app/modules/auth/hooks/useAuth";
import { COLORS } from "@/app/shared/constants/theme";
import { isRTL, t } from "@/app/shared/services/i18";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

const SignInScreen = () => {
  // State variables to manage form inputs and errors
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { signInFn, loading, error, SSOFn } = useAuth();

  // Function to handle the sign-in process
  const handleSignIn = async () => {
    // sign-in logic
    await signInFn(email, password);
  };

  const handleGoogleLogin = async () => {
    SSOFn();
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header with back button */}
      <View
        style={[styles.header, isRTL() && { flexDirection: "row-reverse" }]}
      >
        <Text style={styles.headerTitle}>{t("signIn.title")}</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={styles.container}>
        {/* Logo */}
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />

        {/* Email Input Field */}
        <TextInput
          label={t("signIn.email")}
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          theme={{ roundness: 20 }}
          keyboardType="email-address"
          autoCapitalize="none"
          right={isRTL() ? <TextInput.Icon icon="account" /> : undefined}
          left={!isRTL() ? <TextInput.Icon icon="account" /> : undefined}
          textAlign={isRTL() ? "right" : "left"}
        />

        {/* Password Input Field */}
        <TextInput
          label={t("signIn.password")}
          value={password}
          onChangeText={setPassword}
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
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Forgot Password Link */}
        <TouchableOpacity
          onPress={() => router.push("./forgotPasswordScreen")}
          style={[
            styles.forgotPassword,
            isRTL() && { alignSelf: "flex-start" },
          ]}
        >
          <Text style={styles.forgotPasswordText}>
            {t("signIn.forgotPassword")}
          </Text>
        </TouchableOpacity>

        {/* Sign-In Button */}
        <Button
          mode="contained"
          onPress={handleSignIn}
          style={styles.signInButton}
          contentStyle={isRTL() && { flexDirection: "row-reverse" }}
          disabled={loading}
        >
          {loading ? t("signIn.loading") : t("signIn.button")}
        </Button>

        {/* Google Sign-In Button */}
        <Button
          mode="outlined"
          onPress={handleGoogleLogin}
          style={styles.googleButton}
          icon="google"
          contentStyle={isRTL() && { flexDirection: "row-reverse" }}
          disabled={loading}
        >
          {loading ? t("signIn.loading") : t("signIn.googleButton")}
        </Button>

        {/* Sign-Up Link */}
        <View
          style={[
            styles.signUpContainer,
            isRTL() && { flexDirection: "row-reverse" },
          ]}
        >
          <Text>{t("signIn.noAccount")} </Text>
          <TouchableOpacity
            onPress={() => router.replace("/modules/auth/screens/signUpScreen")}
          >
            <Text style={styles.signUpText}>{t("signIn.signUp")}</Text>
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
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 50,
    zIndex: 0,
  },
  input: {
    width: "100%",
    marginBottom: 10,
    backgroundColor: "white",
    textAlign: isRTL() ? "right" : "left",
  },
  errorText: {
    width: "100%",
    color: "red",
    marginBottom: 10,
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    color: COLORS.primary,
    marginBottom: 25,
  },
  signInButton: {
    width: "100%",
    backgroundColor: COLORS.secondary,
    marginBottom: 15,
  },
  googleButton: {
    width: "100%",
    borderColor: COLORS.secondary,
    borderWidth: 1,
    marginBottom: 20,
  },
  signUpContainer: {
    flexDirection: "row",
    marginTop: 25,
    borderTopColor: COLORS.surfaceLight,
    borderTopWidth: 1,
    padding: 8,
  },
  signUpText: {
    color: COLORS.secondary,
    fontWeight: "bold",
  },
});

export default SignInScreen;
