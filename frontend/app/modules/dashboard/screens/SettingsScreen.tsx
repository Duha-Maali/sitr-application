import {
  changeLanguage,
  getCurrentLanguage,
  t,
  isRTL,
} from "@/app/shared/services/i18";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Header from "@/app/shared/components/Header";
import { COLORS } from "@/app/shared/constants/theme";
import { Alert, ScrollView, TouchableOpacity } from "react-native";
import { Divider, List } from "react-native-paper";
import { useAuth } from "../../auth/hooks/useAuth";
import * as Animatable from "react-native-animatable";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function SettingsScreen() {
  const { signOutFn } = useAuth();
  const currentLanguage = getCurrentLanguage();

  const freeSpace = () => {
    Alert.alert(t("settings.freeSpace"), t("settings.clearCachedFiles"));
  };

  const shareApp = () => {
    Alert.alert(t("settings.shareApp"), t("settings.shareAppDescription"));
  };

  const rateApp = () => {
    Alert.alert(t("settings.rateApp"), t("settings.rateAppDescription"));
  };

  const deleteAccount = () => {
    Alert.alert(
      t("settings.deleteAccount"),
      t("settings.deleteAccountConfirm")
    );
  };

  const logout = () => {
    Alert.alert(t("settings.logout"), t("settings.logoutConfirm"));
  };

  const settingsSections = [
    {
      title: t("settings.general"),
      items: [
        {
          title: t("settings.changeLanguage"),
          description: t(`languages.${currentLanguage}`),
          icon: "language",
          type: "language",
          color: "#3B82F6",
        },
        {
          title: t("settings.freeSpace"),
          description: t("settings.clearCachedFiles"),
          icon: "trash-bin",
          onPress: freeSpace,
          color: "#EF4444",
        },
      ],
    },
    {
      title: "Community",
      items: [
        {
          title: t("settings.shareApp"),
          description: t("settings.shareAppDescription"),
          icon: "share-social",
          onPress: shareApp,
          color: "#10B981",
        },
        {
          title: t("settings.rateApp"),
          description: t("settings.rateAppDescription"),
          icon: "star",
          onPress: rateApp,
          color: "#F59E0B",
        },
      ],
    },
    {
      title: "Account",
      items: [
        /* { todo: delete account
          title: t("settings.deleteAccount"),
          description: t("settings.deleteAccountDescription"),
          icon: "person-remove",
          onPress: deleteAccount,
          color: "#EF4444",
        }, */
        {
          title: t("settings.logout"),
          description: t("settings.logoutDescription"),
          icon: "log-out",
          onPress: signOutFn,
          color: "#6B7280",
        },
      ],
    },
  ];

  return (
    <>
      <Header title={t("settings.title")} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, sectionIndex) => (
          <Animatable.View
            key={section.title}
            animation="fadeInUp"
            delay={sectionIndex * 150}
            duration={600}
            style={styles.section}
          >
            <Text
              style={[styles.sectionTitle, isRTL() && { textAlign: "right" }]}
            >
              {section.title}
            </Text>

            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={item.title}>
                  {item.type === "language" ? (
                    <LanguageSelector />
                  ) : (
                    <Animatable.View
                      animation="fadeIn"
                      delay={sectionIndex * 150 + itemIndex * 100}
                    >
                      <TouchableOpacity
                        style={[
                          styles.settingItem,
                          isRTL() && { flexDirection: "row-reverse" },
                        ]}
                        onPress={item.onPress}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.iconContainer,
                            { backgroundColor: `${item.color}15` },
                          ]}
                        >
                          <Ionicons
                            name={item.icon as any}
                            size={20}
                            color={item.color}
                          />
                        </View>
                        <View style={styles.itemContent}>
                          <Text
                            style={[
                              styles.itemTitle,
                              isRTL() && { textAlign: "right" },
                            ]}
                          >
                            {item.title}
                          </Text>
                          <Text
                            style={[
                              styles.itemDescription,
                              isRTL() && { textAlign: "right" },
                            ]}
                          >
                            {item.description}
                          </Text>
                        </View>
                        <Ionicons
                          name={isRTL() ? "chevron-back" : "chevron-forward"}
                          size={20}
                          color={COLORS.grey}
                        />
                      </TouchableOpacity>
                    </Animatable.View>
                  )}
                  {itemIndex < section.items.length - 1 && (
                    <View style={styles.itemDivider} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </Animatable.View>
        ))}

        {/* App Info Section */}
        <Animatable.View
          animation="fadeInUp"
          delay={settingsSections.length * 150}
          duration={600}
          style={styles.appInfoSection}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.appInfoCard}
          >
            <View
              style={[
                styles.appInfoContent,
                isRTL() && { flexDirection: "row-reverse" },
              ]}
            >
              <Ionicons name="shield-checkmark" size={32} color="white" />
              <View style={styles.appInfoText}>
                <Text
                  style={[
                    styles.appInfoTitle,
                    isRTL() && { textAlign: "right" },
                  ]}
                >
                  SITR سِـتـــر
                </Text>
                <Text
                  style={[
                    styles.appInfoSubtitle,
                    isRTL() && { textAlign: "right" },
                  ]}
                >
                  Version 1.0.0
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animatable.View>
      </ScrollView>
    </>
  );
}

const LanguageSelector = () => {
  const currentLanguage = getCurrentLanguage();
  const [expanded, setExpanded] = React.useState(false);

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.settingItem,
          isRTL() && { flexDirection: "row-reverse" },
        ]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: "#3B82F615" }]}>
          <Ionicons name="language" size={20} color="#3B82F6" />
        </View>
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, isRTL() && { textAlign: "right" }]}>
            {t("settings.changeLanguage")}
          </Text>
          <Text
            style={[styles.itemDescription, isRTL() && { textAlign: "right" }]}
          >
            {t(`languages.${currentLanguage}`)}
          </Text>
        </View>
        <Animatable.View
          animation={expanded ? "rotate" : undefined}
          duration={200}
        >
          <Ionicons
            name={
              expanded
                ? "chevron-up"
                : isRTL()
                  ? "chevron-back"
                  : "chevron-forward"
            }
            size={20}
            color={COLORS.grey}
          />
        </Animatable.View>
      </TouchableOpacity>

      {expanded && (
        <Animatable.View
          animation="slideInDown"
          duration={300}
          style={styles.languageOptions}
        >
          <TouchableOpacity
            style={[
              styles.languageOption,
              currentLanguage === "en" && styles.languageOptionSelected,
              isRTL() && { flexDirection: "row-reverse" },
            ]}
            onPress={() => {
              changeLanguage("en");
              setExpanded(false);
            }}
          >
            {currentLanguage === "en" && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={COLORS.primary}
              />
            )}
            <Text
              style={[
                styles.languageOptionText,
                currentLanguage === "en" && styles.languageOptionTextSelected,
              ]}
            >
              {t("languages.en")}
            </Text>
          </TouchableOpacity>

          <View style={styles.itemDivider} />

          <TouchableOpacity
            style={[
              styles.languageOption,
              currentLanguage === "ar" && styles.languageOptionSelected,
              isRTL() && { flexDirection: "row-reverse" },
            ]}
            onPress={() => {
              changeLanguage("ar");
              setExpanded(false);
            }}
          >
            {currentLanguage === "ar" && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={COLORS.primary}
              />
            )}
            <Text
              style={[
                styles.languageOptionText,
                currentLanguage === "ar" && styles.languageOptionTextSelected,
              ]}
            >
              {t("languages.ar")}
            </Text>
          </TouchableOpacity>
        </Animatable.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 14,
    color: COLORS.grey,
    lineHeight: 18,
  },
  itemDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 76,
  },
  languageOptions: {
    backgroundColor: "#F8FAFC",
    marginTop: 1,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingLeft: 76,
    gap: 12,
  },
  languageOptionSelected: {
    backgroundColor: "#EFF6FF",
  },
  languageOptionText: {
    fontSize: 16,
    color: COLORS.grey,
    fontWeight: "500",
  },
  languageOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  appInfoSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginTop: 20,
  },
  appInfoCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  appInfoContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  appInfoText: {
    flex: 1,
  },
  appInfoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  appInfoSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
});
