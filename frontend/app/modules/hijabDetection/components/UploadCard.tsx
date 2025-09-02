import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface UploadCardProps {
  image: string | null;
  styles: any;
  COLORS: any;
  t: (key: string) => string;
  isRTL: () => boolean;
  pickImage: () => void;
  cancelImage: () => void;
  isLoading: boolean;
  checkImage: () => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  image,
  styles,
  COLORS,
  t,
  isRTL,
  pickImage,
  cancelImage,
  isLoading,
  checkImage,
}) => (
  <View style={styles.card}>
    {/* Upload Area */}
    <TouchableOpacity
      onPress={pickImage}
      style={styles.uploadArea}
      activeOpacity={0.8}
    >
      {image ? (
        <Animatable.View
          animation="zoomIn"
          duration={500}
          style={styles.imageContainer}
        >
          <Image source={{ uri: image }} style={styles.imagePreview} />
          <View style={styles.imageOverlay}>
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={pickImage}
            >
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.changeImageText}>
                {t("hijabDetection.upload.change")}
              </Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      ) : (
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          style={styles.uploadPlaceholder}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.uploadIcon}
          >
            <Ionicons name="cloud-upload" size={48} color="white" />
          </LinearGradient>
          <Text style={[styles.uploadTitle, isRTL() && { textAlign: "right" }]}>
            {t("hijabDetection.uploadPhoto")}
          </Text>
          <Text
            style={[styles.uploadSubtitle, isRTL() && { textAlign: "right" }]}
          >
            {t("hijabDetection.upload.selectFromGallery")}
          </Text>
          <View style={styles.supportedFormats}>
            <Text
              style={[styles.supportedText, isRTL() && { textAlign: "right" }]}
            >
              {t("hijabDetection.upload.supportedFormats")}
            </Text>
          </View>
        </Animatable.View>
      )}
    </TouchableOpacity>
    {/* Action Buttons */}
    {image && (
      <Animatable.View
        animation="slideInUp"
        duration={500}
        style={styles.actionContainer}
      >
        <View
          style={[
            styles.buttonContainer,
            isRTL() && { flexDirection: "row-reverse" },
          ]}
        >
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={cancelImage}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color="#EF4444" />
            <Text style={styles.secondaryButtonText}>
              {t("hijabDetection.cancelButton")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
            <Text style={styles.tertiaryButtonText}>
              {t("hijabDetection.uploadButton")}
            </Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>
    )}
    {/* Check Button */}
    <Animatable.View
      animation={image ? "bounceIn" : "fadeIn"}
      delay={image ? 600 : 0}
      style={styles.checkButtonContainer}
    >
      <TouchableOpacity
        style={[
          styles.checkButton,
          (!image || isLoading) && styles.disabledButton,
        ]}
        onPress={checkImage}
        disabled={!image || isLoading}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={
            image && !isLoading
              ? [COLORS.secondary, "#10B981"]
              : ["#D1D5DB", "#9CA3AF"]
          }
          style={styles.gradientButton}
        >
          <Ionicons
            name={isLoading ? "hourglass" : "checkmark-circle"}
            size={24}
            color="white"
          />
          <Text style={styles.checkButtonText}>
            {isLoading
              ? t("hijabDetection.upload.loading")
              : t("hijabDetection.checkButton")}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  </View>
);
