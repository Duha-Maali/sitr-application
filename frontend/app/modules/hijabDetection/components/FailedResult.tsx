import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { t, isRTL } from "@/app/shared/services/i18";

const { width } = Dimensions.get("window");

interface FailedResultProps {
  image: string | null;
  detectionResult: any;
  handleShareImage: () => void;
  handleStartOver: () => void;
}

export const FailedResult: React.FC<FailedResultProps> = ({
  image,
  detectionResult,
  handleShareImage,
  handleStartOver,
}) => (
  <Animatable.View
    animation="fadeIn"
    duration={800}
    style={styles.resultContainer}
  >
    {/* Show original image */}
    {image && (
      <Animatable.View
        animation="zoomIn"
        delay={200}
        duration={800}
        style={styles.failedImageContainer}
      >
        <Image
          source={{ uri: image }}
          style={styles.failedImage}
          resizeMode="cover"
        />
      </Animatable.View>
    )}
    <Animatable.View
      animation="bounceIn"
      delay={400}
      duration={1000}
      style={[
        styles.resultIcon,
        { backgroundColor: "rgba(16, 185, 129, 0.1)" },
      ]}
    >
      <Ionicons name="checkmark-circle" size={42} color="#10B981" />
    </Animatable.View>
    <Animatable.Text
      animation="slideInUp"
      delay={600}
      style={[
        styles.resultTitle,
        { color: "#10B981" },
        isRTL() && { textAlign: "right" },
      ]}
    >
      {t("hijabDetection.results.safeToShare")}
    </Animatable.Text>
    {/* Action buttons */}
    <View
      style={[
        styles.failedActionContainer,
        isRTL() && { flexDirection: "row-reverse" },
      ]}
    >
      <TouchableOpacity style={styles.shareButton} onPress={handleShareImage}>
        <LinearGradient
          colors={["#3B82F6", "#1D4ED8"]}
          style={styles.shareGradient}
        >
          <Ionicons name="share-outline" size={20} color="white" />
          <Text style={styles.shareButtonText}>
            {t("hijabDetection.results.sharePhoto")}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.startOverButton}
        onPress={handleStartOver}
      >
        <LinearGradient
          colors={["#10B981", "#3B82F6"]}
          style={styles.startOverGradient}
        >
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.startOverButtonText}>
            {t("hijabDetection.results.tryAgain")}
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
  },
  resultIcon: {
    width: 80,
    height: 80,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3B82F6",
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
  failedImageContainer: {
    width: width - 80,
    height: 350,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  failedImage: {
    width: "100%",
    height: "100%",
  },
  failedActionContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  shareButton: {
    flex: 1,
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  shareGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  shareButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  startOverButton: {
    flex: 1,
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  startOverGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  startOverButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
