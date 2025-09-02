import React from "react";
import { Image, ImageBackground, StyleSheet, Text, View } from "react-native";
import { t, isRTL } from "@/app/shared/services/i18";

export default function SplashScreen() {
  return (
    <ImageBackground
      source={require("@/assets/images/landingScreen.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={[styles.hadithText, isRTL() && { textAlign: "right" }]}>
          {t("splash.hadithText")}
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
  },
  hadithText: {
    marginTop: 20,
    fontSize: 18,
    textAlign: "center",
    fontFamily: "AmiriRegular",
  },
});
