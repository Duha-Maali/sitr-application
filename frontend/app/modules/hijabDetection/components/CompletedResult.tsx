import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/app/shared/constants/theme";
import { t, isRTL } from "@/app/shared/services/i18";

const { width } = Dimensions.get("window");

interface CompletedResultProps {
  detectionResult: any;
  handleStartOver: () => void;
  handleShareImage: () => void;
}

export const CompletedResult: React.FC<CompletedResultProps> = ({
  detectionResult,
  handleStartOver,
  handleShareImage,
}) => (
  <Animatable.View
    animation="fadeIn"
    duration={800}
    style={styles.resultContainer}
  >
    {/* Show processed result image */}
    {detectionResult.resultImageUrl && (
      <Animatable.View
        animation="zoomIn"
        delay={200}
        duration={800}
        style={styles.resultImageContainer}
      >
        <Image
          source={{ uri: detectionResult.resultImageUrl }}
          style={styles.resultImage}
          resizeMode="cover"
        />
      </Animatable.View>
    )}
    <Animatable.View
      animation="bounceIn"
      delay={400}
      duration={1000}
      style={[styles.resultIcon, { backgroundColor: "#FEF2F2" }]}
    >
      <Ionicons name="warning" size={42} color="#F59E0B" />
    </Animatable.View>
    <Text
      style={[
        { color: "#F59E0B", fontSize: 18, fontWeight: "700" },
        isRTL() && { textAlign: "right" },
      ]}
    >
      {t("hijabDetection.results.attention")}
    </Text>
    <Animatable.Text
      animation="slideInUp"
      delay={600}
      style={[
        styles.resultTitle,
        { color: COLORS.primary },
        isRTL() && { textAlign: "right" },
      ]}
    >
      <Text style={[styles.resultText, isRTL() && { textAlign: "right" }]}>
        {t("hijabDetection.results.noHijabFound")}
      </Text>
    </Animatable.Text>
    <Animatable.Text
      animation="slideInUp"
      delay={1000}
      style={[styles.successText, isRTL() && { textAlign: "center" }]}
    >
      {t("hijabDetection.results.processingComplete")}
    </Animatable.Text>

    <View
      style={[
        styles.buttonContainer,
        isRTL() && { flexDirection: "row-reverse" },
      ]}
    >
      <TouchableOpacity onPress={handleShareImage}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.shareGradient}
        >
          <Ionicons name="share-social" size={20} color="white" />
          <Text style={styles.shareButtonText}>
            {t("hijabDetection.results.share")}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleStartOver}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.startOverGradient}
        >
          <Ionicons name="camera" size={20} color="white" />
          <Text style={styles.startOverButtonText}>
            {t("hijabDetection.results.analyzeAgain")}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  </Animatable.View>
);

const styles = StyleSheet.create({
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  resultIcon: {
    width: 80,
    height: 80,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F59E0B",
    marginBottom: 8,
    textAlign: "center",
  },
  resultMessage: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 12,
  },
  resultText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "700",
    opacity: 0.9,
    marginBottom: 15,
    lineHeight: 22,
  },
  successText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "left",
    fontWeight: "400",
    opacity: 0.9,
    marginBottom: 20,
    lineHeight: 20,
  },
  resultImageContainer: {
    width: width - 80,
    height: 350,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  resultImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  shareGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
    borderRadius: 25,
    flex: 1,
    maxWidth: 140,
  },
  shareButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  startOverGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    gap: 8,
    borderRadius: 25,
  },
  startOverButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
