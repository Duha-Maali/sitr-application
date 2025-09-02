import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, TextInput } from "react-native-paper";
import { useAuth } from "../hooks/useAuth";
import { Loader } from "@/app/shared/components/Loader";
import { t, isRTL } from "@/app/shared/services/i18";

const EmailVerification = () => {
  const [code, setCode] = useState("");
  const { onVerify, error, loading } = useAuth();

  if (loading) return <Loader />;
  return (
    <View style={styles.container}>
      <Text style={[styles.title, isRTL() && { textAlign: "right" }]}>
        {t("emailVerification.title")}
      </Text>
      <Text style={[styles.subtitle, isRTL() && { textAlign: "right" }]}>
        {t("emailVerification.subtitle")}
      </Text>
      <TextInput
        value={code}
        placeholder={t("emailVerification.placeholder")}
        onChangeText={(code) => setCode(code)}
        mode="outlined"
        style={styles.input}
        theme={{ roundness: 10 }}
        textAlign={isRTL() ? "right" : "left"}
      />
      {error && (
        <Text style={[styles.errorText, isRTL() && { textAlign: "right" }]}>
          {error}
        </Text>
      )}
      <TouchableOpacity
        style={[styles.button, (!code || loading) && styles.disabledButton]}
        onPress={() => onVerify(code)}
        disabled={!code || loading}
      >
        <Text style={styles.buttonText}>
          {loading
            ? t("emailVerification.verifying")
            : t("emailVerification.verify")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default EmailVerification;
