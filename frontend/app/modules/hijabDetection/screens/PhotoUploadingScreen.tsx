import { COLORS } from "@/app/shared/constants/theme";
import { isRTL, t } from "@/app/shared/services/i18";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { useHijabDetection } from "../hooks/useHijabDetection";
import { FailedResult } from "../components/FailedResult";
import { CompletedResult } from "../components/CompletedResult";
import { ProcessingState } from "../components/ProcessingState";
import { UploadCard } from "../components/UploadCard";
import Header from "@/app/shared/components/Header";

const { width } = Dimensions.get("window");

export default function HijabDetectionScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [rawImageAsset, setRawImageAsset] = useState<any>(null);

  const {
    detectionResult,
    isLoading,
    startDetection,
    resetDetection,
    cancelDetection,
    currentUser,
    familyMembers,
  } = useHijabDetection();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setRawImageAsset(result.assets[0]);
    }
  };

  const cancelImage = () => {
    setImage(null);
    setRawImageAsset(null);
  };

  const checkImage = async () => {
    if (!image || !rawImageAsset) {
      Alert.alert("No Image", "Please select an image first");
      return;
    }

    if (isLoading) {
      Alert.alert("Loading", "Please wait while we load your data");
      return;
    }

    if (!currentUser) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    if (!familyMembers || familyMembers.length === 0) {
      Alert.alert(
        "No Family Members",
        "Please add family members first before using hijab detection."
      );
      return;
    }

    try {
      console.log("Passing raw image asset:", rawImageAsset);
      await startDetection({ image: rawImageAsset });
    } catch (error) {
      console.error("Error processing image:", error);
      Alert.alert("Error", "Failed to process the image. Please try again.");
    }
  };

  const handleStartOver = () => {
    resetDetection();
    setImage(null);
    setRawImageAsset(null);
  };

  const handleCancel = () => {
    cancelDetection();
    setImage(null);
    setRawImageAsset(null);
  };

  const handleShareImage = async () => {
    // Determine which image to share - result image if available, otherwise original
    const imageToShare = detectionResult.resultImageUrl || image;
    console.log("imageToShare", imageToShare);
    if (!imageToShare) {
      Alert.alert("Error", "No image available to share");
      return;
    }

    try {
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Error", "Sharing is not available on this device");
        return;
      }

      // Use expo-sharing to share the local file
      await Sharing.shareAsync(imageToShare, {
        mimeType: "image/jpeg",
        dialogTitle: "Share your hijab detection result",
      });
    } catch (error) {
      console.error("Error sharing image:", error);
      Alert.alert("Error", "Failed to share the image. Please try again.");
    }
  };

  // Render based on current status
  const renderContent = () => {
    if (detectionResult.status === "processing") {
      return (
        <ProcessingState
          image={image}
          COLORS={COLORS}
          t={t}
          isRTL={isRTL}
          handleCancel={handleCancel}
        />
      );
    }
    if (detectionResult.status === "failed") {
      return (
        <FailedResult
          image={image}
          detectionResult={detectionResult}
          handleShareImage={handleShareImage}
          handleStartOver={handleStartOver}
        />
      );
    }
    if (detectionResult.status === "completed") {
      return (
        <CompletedResult
          detectionResult={detectionResult}
          handleStartOver={handleStartOver}
          handleShareImage={handleShareImage}
        />
      );
    }
    return (
      <Animatable.View
        animation="fadeInUp"
        delay={300}
        duration={700}
        style={styles.contentContainer}
      >
        <UploadCard
          image={image}
          styles={styles}
          COLORS={COLORS}
          t={t}
          isRTL={isRTL}
          pickImage={pickImage}
          cancelImage={cancelImage}
          isLoading={isLoading}
          checkImage={checkImage}
        />
      </Animatable.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#F8FAFC", "#EFF6FF", "#E5E0F7"]}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <Header title={t("hijabDetection.title")} />
        {/* Dynamic Content */}
        {renderContent()}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.grey,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
    marginTop: 100,
  },
  uploadArea: {
    marginBottom: 24,
  },
  imageContainer: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 280,
    borderRadius: 16,
  },
  imageOverlay: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  changeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  changeImageText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  uploadPlaceholder: {
    height: 280,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 32,
  },
  uploadIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  uploadSubtitle: {
    fontSize: 14,
    color: COLORS.grey,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  supportedFormats: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  supportedText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },
  actionContainer: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 8,
  },
  secondaryButtonText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
  },
  tertiaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    gap: 8,
  },
  tertiaryButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  checkButtonContainer: {
    marginTop: 8,
  },
  checkButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  checkButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  processingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  processingImageContainer: {
    width: width - 40,
    height: 300,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  loadingRingContainer: {
    marginBottom: 30,
  },
  loadingRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  loadingRingInner: {
    width: "100%",
    height: "100%",
    borderRadius: 56,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
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
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  resultMessage: {
    fontSize: 16,
    color: COLORS.grey,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: "center",
    fontStyle: "italic",
    opacity: 0.8,
    marginBottom: 20,
  },
  successText: {
    fontSize: 14,
    color: "#10B981",
    textAlign: "center",
    fontWeight: "500",
    opacity: 0.9,
    marginBottom: 20,
    lineHeight: 20,
  },
  resultImageContainer: {
    width: width - 80,
    height: 250,
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
  failedImageContainer: {
    width: width - 80,
    height: 200,
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
});
