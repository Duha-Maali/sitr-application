import Header from "@/app/shared/components/Header";
import { COLORS } from "@/app/shared/constants/theme";
import { isRTL, t } from "@/app/shared/services/i18";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import * as Animatable from "react-native-animatable";

export default function Dashboard() {
  const dynamicStyles = styles();
  return (
    <>
      <Header
        title={t("dashboard.title")}
        iconName="settings-outline"
        onBackPress={() =>
          router.push("/modules/dashboard/screens/SettingsScreen")
        }
      />
      <View style={dynamicStyles.container}>
        {/* Welcome Card */}
        <Animatable.View animation="fadeInDown" delay={200} duration={700}>
          <View style={dynamicStyles.welcomeCard}>
            <LinearGradient
              colors={["#667eea", "#764ba2", "#f093fb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={dynamicStyles.welcomeGradient}
            >
              {/* Decorative circles */}
              <View style={dynamicStyles.decorativeCircle1} />
              <View style={dynamicStyles.decorativeCircle2} />
              <View style={dynamicStyles.decorativeCircle3} />

              <View
                style={[
                  dynamicStyles.welcomeContent,
                  isRTL() && { flexDirection: "row-reverse" },
                ]}
              >
                <View
                  style={[
                    dynamicStyles.welcomeTextContainer,
                    isRTL() && { paddingRight: 0, paddingLeft: 20 },
                  ]}
                >
                  <Animatable.Text
                    animation="slideInLeft"
                    delay={500}
                    style={[
                      dynamicStyles.welcomeText,
                      isRTL() && { textAlign: "right" },
                    ]}
                  >
                    {t("dashboard.welcome")}
                  </Animatable.Text>
                  <Animatable.Text
                    animation="slideInLeft"
                    delay={700}
                    style={[
                      dynamicStyles.welcomeSubtext,
                      isRTL() && { textAlign: "right" },
                    ]}
                  >
                    Privacy-first photo management
                  </Animatable.Text>
                </View>
                <Animatable.View animation="bounceIn" delay={900}>
                  <View style={dynamicStyles.logoContainer}>
                    <Image
                      source={require("@/assets/images/logo.png")}
                      style={dynamicStyles.logo}
                      resizeMode="contain"
                    />
                  </View>
                </Animatable.View>
              </View>
            </LinearGradient>
          </View>
        </Animatable.View>

        {/* Action Cards Container */}
        <View style={dynamicStyles.cardsContainer}>
          {/* Gallery Card */}
          <Animatable.View animation="fadeInUp" delay={300} duration={700}>
            <Link href="/(tabs)/Gallery" asChild>
              <TouchableOpacity style={dynamicStyles.card} activeOpacity={0.9}>
                <LinearGradient
                  colors={["white", COLORS.lightPurple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    dynamicStyles.cardGradient,
                    isRTL() && { flexDirection: "row-reverse" }
                  ]}
                >
                  <View style={[
                    dynamicStyles.cardIconContainer,
                    isRTL() && { marginRight: 0, marginLeft: 20 }
                  ]}>
                    <Ionicons name="images" size={32} color="black" />
                  </View>
                  <View style={dynamicStyles.cardContent}>
                    <Text
                      style={[
                        dynamicStyles.cardTitle,
                        isRTL() && { textAlign: "right" },
                      ]}
                    >
                      {t("dashboard.myGallery")}
                    </Text>
                    <Text
                      style={[
                        dynamicStyles.cardNote,
                        isRTL() && { textAlign: "right" },
                      ]}
                    >
                      {t("dashboard.myGalleryDescription")}
                    </Text>
                  </View>
                  <View style={dynamicStyles.cardArrow}>
                    <Ionicons
                      name={isRTL() ? "chevron-back" : "chevron-forward"}
                      size={24}
                      color="rgba(255, 255, 255, 0.8)"
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Link>
          </Animatable.View>

          {/* Hijab Detector Card */}
          <Animatable.View animation="fadeInUp" delay={450} duration={700}>
            <Link href="/(tabs)/HijabDetection" asChild>
              <TouchableOpacity style={dynamicStyles.card} activeOpacity={0.9}>
                <LinearGradient
                  colors={["white", COLORS.lightPurple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    dynamicStyles.cardGradient,
                    isRTL() && { flexDirection: "row-reverse" }
                  ]}
                >
                  <View style={[
                    dynamicStyles.cardIconContainer,
                    isRTL() && { marginRight: 0, marginLeft: 20 }
                  ]}>
                    <Ionicons name="eye" size={32} color="black" />
                  </View>
                  <View style={dynamicStyles.cardContent}>
                    <Text
                      style={[
                        dynamicStyles.cardTitle,
                        isRTL() && { textAlign: "right" },
                      ]}
                    >
                      {t("dashboard.hijabDetector")}
                    </Text>
                    <Text
                      style={[
                        dynamicStyles.cardNote,
                        isRTL() && { textAlign: "right" },
                      ]}
                    >
                      {t("dashboard.hijabDetectorDescription")}
                    </Text>
                  </View>
                  <View style={dynamicStyles.cardArrow}>
                    <Ionicons
                      name={isRTL() ? "chevron-back" : "chevron-forward"}
                      size={24}
                      color="rgba(255, 255, 255, 0.8)"
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Link>
          </Animatable.View>
        </View>
      </View>
    </>
  );
}

const styles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8FAFC",
      padding: 20,
    },
    welcomeCard: {
      marginBottom: 32,
      borderRadius: 24,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    welcomeGradient: {
      position: "relative",
      overflow: "hidden",
    },
    decorativeCircle1: {
      position: "absolute",
      top: -50,
      right: -50,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    decorativeCircle2: {
      position: "absolute",
      bottom: -30,
      left: -40,
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
    decorativeCircle3: {
      position: "absolute",
      top: "50%",
      right: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.06)",
    },
    welcomeContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 28,
      paddingVertical: 36,
    },
    welcomeTextContainer: {
      flex: 1,
      paddingRight: 20,
    },
    welcomeText: {
      fontSize: 28,
      fontWeight: "800",
      color: "white",
      marginBottom: 8,
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    welcomeSubtext: {
      fontSize: 14,
      color: "rgba(255, 255, 255, 0.9)",
      fontWeight: "500",
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    logo: {
      width: 200,
      height: 200,
    },
    cardsContainer: {
      gap: 20,
      marginBottom: 32,
    },
    card: {
      borderRadius: 20,
      overflow: "hidden",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 6,
    },
    cardGradient: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      minHeight: 100,
    },
    cardIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 20,
    },
    cardContent: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "black",
      marginBottom: 6,
      textShadowColor: "rgba(0, 0, 0, 0.2)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    cardNote: {
      fontSize: 14,
      color: "rgba(0, 0, 0, 0.5)",
      lineHeight: 20,
      fontWeight: "500",
    },
    cardArrow: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      justifyContent: "center",
      alignItems: "center",
    },
  });
