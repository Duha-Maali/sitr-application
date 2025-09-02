// screens/ResetPasswordScreen.tsx
import Header from "@/app/shared/components/Header";
import { COLORS } from "@/app/shared/constants/theme";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { t, isRTL } from "@/app/shared/services/i18";

import { useAuth } from "../hooks/useAuth";

const ResetPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const { requestReset, verifyCode, resetPassword, error, step, loading } =
    useAuth();

  const handleRequestReset = async () => {
    requestReset(email);
  };

  const handleVerifyCode = async () => {
    verifyCode(code);
  };

  const handleResetPassword = async () => {
    resetPassword(newPassword);
  };

  return (
    <>
      <Header
        title={
          step === 1
            ? t("forgotPassword.resetPassword")
            : step === 2
              ? t("forgotPassword.verificationCode")
              : t("forgotPassword.setNewPassword")
        }
      />
      <View style={styles.container}>
        {step === 1 && (
          <>
            <Text
              style={[styles.headerTitle, isRTL() && { textAlign: "right" }]}
            >
              {t("forgotPassword.resetPassword")}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t("signIn.email")}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
              mode="outlined"
              textAlign={isRTL() ? "right" : "left"}
            />
            {error && (
              <Text
                style={[styles.errorText, isRTL() && { textAlign: "right" }]}
              >
                {error}
              </Text>
            )}
            <Button
              mode="contained"
              style={styles.resetButton}
              onPress={handleRequestReset}
              disabled={loading || !email}
              contentStyle={isRTL() && { flexDirection: "row-reverse" }}
            >
              {loading
                ? t("forgotPassword.sending")
                : t("forgotPassword.sendResetCode")}
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <Text
              style={[styles.headerTitle, isRTL() && { textAlign: "right" }]}
            >
              {t("forgotPassword.enterVerificationCode")}
            </Text>
            <Text style={[isRTL() && { textAlign: "right" }]}>
              {t("forgotPassword.checkEmailForCode")}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t("forgotPassword.verificationCodePlaceholder")}
              value={code}
              onChangeText={setCode}
              editable={!loading}
              mode="outlined"
              textAlign={isRTL() ? "right" : "left"}
            />
            {error && (
              <Text
                style={[styles.errorText, isRTL() && { textAlign: "right" }]}
              >
                {error}
              </Text>
            )}
            <Button
              mode="contained"
              style={styles.resetButton}
              onPress={handleVerifyCode}
              disabled={loading || !code}
              contentStyle={isRTL() && { flexDirection: "row-reverse" }}
            >
              {loading
                ? t("forgotPassword.verifying")
                : t("forgotPassword.verifyCode")}
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <Text
              style={[styles.headerTitle, isRTL() && { textAlign: "right" }]}
            >
              {t("forgotPassword.setNewPassword")}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t("forgotPassword.newPasswordPlaceholder")}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              editable={!loading}
              mode="outlined"
              textAlign={isRTL() ? "right" : "left"}
            />
            <TextInput
              style={styles.input}
              placeholder={t("forgotPassword.confirmPasswordPlaceholder")}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
              mode="outlined"
              textAlign={isRTL() ? "right" : "left"}
            />
            {error && (
              <Text
                style={[styles.errorText, isRTL() && { textAlign: "right" }]}
              >
                {error}
              </Text>
            )}
            <Button
              mode="contained"
              style={styles.resetButton}
              onPress={handleResetPassword}
              disabled={loading || !newPassword || !confirmPassword}
              contentStyle={isRTL() && { flexDirection: "row-reverse" }}
            >
              {loading
                ? t("forgotPassword.resetting")
                : t("forgotPassword.button")}
            </Button>
          </>
        )}
      </View>
    </>
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
  headerTitle: {
    fontSize: 25,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    marginBottom: 10,
    backgroundColor: "white",
  },
  resetButton: {
    width: "100%",
    backgroundColor: COLORS.secondary,
    marginBottom: 15,
    marginTop: 8,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});

export default ResetPasswordScreen;
