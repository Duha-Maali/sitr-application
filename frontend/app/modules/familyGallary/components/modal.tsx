import { COLORS } from "@/app/shared/constants/theme";
import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Button, Checkbox } from "react-native-paper";
import { t, isRTL } from "@/app/shared/services/i18";

export default function Modal() {
  const [confirm, setConfirm] = useState(false);
  const [modalVisible, setModalVisible] = useState(true);

  // Arrays of image paths
  const goodImages = [
    require("@/assets/images/good/1.png"),
    require("@/assets/images/good/2.png"),
    require("@/assets/images/good/3.png"),
    require("@/assets/images/good/4.png"),
  ];

  const badImages = [
    require("@/assets/images/bad/1.png"),
    require("@/assets/images/bad/2.png"),
    require("@/assets/images/bad/3.png"),
    require("@/assets/images/bad/4.png"),
  ];

  if (modalVisible)
    return (
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, isRTL() && { textAlign: "right" }]}>
            {t("modal.photoGuideTitle")}
          </Text>

          <View style={styles.guideSection}>
            <Text
              style={[styles.sectionTitle, isRTL() && { textAlign: "right" }]}
            >
              {t("modal.pleaseSelect")}
            </Text>
            <Text
              style={[
                styles.sectionSubtitle,
                isRTL() && { textAlign: "right" },
              ]}
            >
              {t("modal.forBestResults")}
            </Text>
          </View>

          <View style={styles.guideList}>
            {/* Good Examples */}
            <View style={styles.guideItem}>
              <Text
                style={[styles.goodExample, isRTL() && { textAlign: "right" }]}
              >
                {t("modal.goodExample")}
              </Text>
              <Text
                style={[styles.guideText, isRTL() && { textAlign: "right" }]}
              >
                {t("modal.goodDescription")}
              </Text>
              <View style={styles.imageWrapper}>
                {goodImages.map((image, index) => (
                  <Image key={index} source={image} style={styles.image} />
                ))}
              </View>
            </View>

            {/* Bad Examples */}
            <View style={styles.guideItem}>
              <Text
                style={[styles.badExample, isRTL() && { textAlign: "right" }]}
              >
                {t("modal.badExample")}
              </Text>
              <Text
                style={[styles.guideText, isRTL() && { textAlign: "right" }]}
              >
                {t("modal.badDescription")}
              </Text>
              <View style={styles.imageWrapper}>
                {badImages.map((image, index) => (
                  <Image key={index} source={image} style={styles.image} />
                ))}
              </View>
            </View>
          </View>

          <View
            style={[
              styles.checkboxContainer,
              isRTL() && { flexDirection: "row-reverse" },
            ]}
          >
            <Checkbox
              status={confirm ? "checked" : "unchecked"}
              onPress={() => setConfirm(!confirm)}
            />
            <Text style={styles.checkboxLabel}>
              {t("modal.readAndUnderstand")}
            </Text>
          </View>
          <Button
            disabled={!confirm}
            onPress={() => {
              setModalVisible(false);
            }}
            contentStyle={isRTL() && { flexDirection: "row-reverse" }}
          >
            {t("modal.addNewMember")}
          </Button>
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  modalContent: {
    width: "90%",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: "center",
  },
  guideSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  sectionSubtitle: {
    color: "#666",
    marginTop: 5,
  },
  guideList: {
    width: "100%",
    marginBottom: 20,
  },
  guideItem: {
    marginVertical: 5,
  },
  goodExample: {
    color: "green",
    marginRight: 10,
    fontWeight: "bold",
  },
  badExample: {
    color: "red",
    marginRight: 10,
    fontWeight: "bold",
  },
  imageWrapper: {
    flexWrap: "wrap",
    flexDirection: "row",
    gap: 5,
    marginTop: 10,
    marginLeft: 10,
  },
  guideText: {
    fontSize: 14,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  checkboxLabel: {
    marginLeft: 5,
    fontSize: 16,
    color: "rgba(0, 0, 0, 0.7)",
  },
  image: {
    width: 70,
    height: 70,
    marginRight: 5,
    borderRadius: 5,
  },
});
