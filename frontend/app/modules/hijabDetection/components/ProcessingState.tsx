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

const { width } = Dimensions.get("window");

interface ProcessingStateProps {
  image: string | null;
  COLORS: any;
  t: (key: string) => string;
  isRTL: () => boolean;
  handleCancel: () => void;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({
  image,
  COLORS,
  t,
  isRTL,
  handleCancel,
}) => (
  <Animatable.View
    animation="fadeIn"
    duration={800}
    style={styles.processingContainer}
  >
    {/* Image with scan animation */}
    {image && (
      <Animatable.View
        animation="fadeIn"
        duration={500}
        style={styles.processingImageContainer}
      >
        <Image
          source={{ uri: image }}
          style={styles.processingImage}
          resizeMode="cover"
        />
        {/* Scan line animation */}
        <Animatable.View
          animation={{ from: { translateY: -300 }, to: { translateY: 350 } }}
          iterationCount="infinite"
          duration={2000}
          style={styles.scanLine}
        >
          <LinearGradient
            colors={["transparent", COLORS.primary, "transparent"]}
            style={styles.scanLineGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </Animatable.View>
        {/* Corner indicators */}
        <View style={styles.cornerIndicators}>
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            duration={1000}
            style={[styles.corner, styles.topLeft]}
          />
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            duration={1000}
            delay={250}
            style={[styles.corner, styles.topRight]}
          />
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            duration={1000}
            delay={500}
            style={[styles.corner, styles.bottomLeft]}
          />
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            duration={1000}
            delay={750}
            style={[styles.corner, styles.bottomRight]}
          />
        </View>
      </Animatable.View>
    )}
    {/* Simple processing messages */}
    <Animatable.Text
      animation="fadeInUp"
      delay={300}
      style={[styles.loadingTitle, isRTL() && { textAlign: "right" }]}
    >
      {t("hijabDetection.processing.title")}
    </Animatable.Text>
    <Animatable.Text
      animation="pulse"
      iterationCount="infinite"
      duration={2000}
      style={[styles.loadingSubtitle, isRTL() && { textAlign: "right" }]}
    >
      {t("hijabDetection.processing.analyzingFaces")}
    </Animatable.Text>
    <Animatable.Text
      animation="fadeInUp"
      delay={600}
      style={[styles.encouragingText, isRTL() && { textAlign: "right" }]}
    >
      {t("hijabDetection.processing.tipMessage")}
    </Animatable.Text>
    {/* Simple cancel button */}
    <Animatable.View animation="fadeInUp" delay={900}>
      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
        <Ionicons name="close-circle" size={20} color="#EF4444" />
        <Text style={styles.cancelButtonText}>
          {t("hijabDetection.processing.cancelAnalysis")}
        </Text>
      </TouchableOpacity>
    </Animatable.View>
  </Animatable.View>
);

const styles = StyleSheet.create({
  processingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  processingImageContainer: {
    width: width - 80,
    height: 350,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 30,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  processingImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  scanLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    zIndex: 2,
  },
  scanLineGradient: {
    width: "100%",
    height: "100%",
    opacity: 0.8,
  },
  scanOverlay: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 8,
    zIndex: 3,
  },
  scanIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  cornerIndicators: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 12,
    left: 12,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 12,
    right: 12,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 12,
    left: 12,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 12,
    right: 12,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 8,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  encouragingText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.grey,
    marginBottom: 30,
    textAlign: "center",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 8,
  },
  cancelButtonText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "600",
  },
});
