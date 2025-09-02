import Header from "@/app/shared/components/Header";
import { COLORS } from "@/app/shared/constants/theme";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { Button, List } from "react-native-paper";
import { useFamilyGallery } from "../hooks/useFamilyGallary";
import { Loader } from "@/app/shared/components/Loader";
import { t, isRTL } from "@/app/shared/services/i18";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@clerk/clerk-expo";

export default function GalleryHomeScreen() {
  const {
    FM,
    deleteMemberFn,
    pollingMembers,
    refreshProcessingStatus,
    loading,
  } = useFamilyGallery();
  const { userId } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {}, [FM]);

  const removeFM = (memberID: Id<"familyMembers">) => {
    deleteMemberFn(memberID);
  };

  const toggleExpanded = (memberId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  const getStatusInfo = (member: Doc<"familyMembers">) => {
    const status = member.apiStatus || "queued";
    const isPolling = pollingMembers.has(member._id);

    console.log(
      `🎨 UI Status for ${member.name}: status=${status}, isPolling=${isPolling}, pollingMembers=`,
      Array.from(pollingMembers)
    );

    switch (status) {
      case "processing":
        return {
          text: t("familyGallery.status.processing"),
          icon: "sync" as const,
          color: "#F59E0B",
          bgColor: "#FEF3C7",
        };
      case "completed":
        return {
          text: t("familyGallery.status.completed"),
          icon: "checkmark-circle" as const,
          color: "#10B981",
          bgColor: "#D1FAE5",
        };
      case "failed":
        return {
          text: t("familyGallery.status.failed"),
          icon: "close-circle" as const,
          color: "#EF4444",
          bgColor: "#FEE2E2",
        };
      case "queued":
        return {
          text: isPolling
            ? t("familyGallery.status.starting")
            : t("familyGallery.status.queued"),
          icon: "time" as const,
          color: "#6366F1",
          bgColor: "#EEF2FF",
        };
      default:
        return {
          text: t("familyGallery.status.unknown"),
          icon: "help-circle" as const,
          color: "#6B7280",
          bgColor: "#F3F4F6",
        };
    }
  };

  if (!FM || loading) return <Loader />;

  return (
    <>
      <Header title={t("familyGallery.title")} />
      <View style={styles.container}>
        <LinearGradient
          colors={["#F8FAFC", "#EFF6FF", "#E5E0F7"]}
          style={styles.gradientBackground}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {FM.length === 0 ? <NoFMFound /> : null}

            {FM.length > 0 && (
              <Animatable.View
                animation="fadeInUp"
                duration={600}
                style={styles.membersContainer}
              >
                {FM.map((member, index) => {
                  const isExpanded = expandedItems.has(member._id);
                  const statusInfo = getStatusInfo(member);

                  return (
                    <Animatable.View
                      key={member._id}
                      animation="slideInUp"
                      delay={index * 150}
                      duration={500}
                      style={styles.memberCard}
                    >
                      <View style={styles.memberHeader}>
                        <View style={styles.memberInfo}>
                          {member.images && member.images.length > 0 ? (
                            <View style={styles.avatarContainer}>
                              <Image
                                source={{ uri: member.images[0] }}
                                style={styles.avatar}
                              />
                            </View>
                          ) : (
                            <View
                              style={[
                                styles.avatarContainer,
                                styles.avatarPlaceholder,
                              ]}
                            >
                              <Ionicons
                                name="person"
                                size={24}
                                color={COLORS.grey}
                              />
                            </View>
                          )}
                          <View style={styles.memberDetails}>
                            <View style={styles.nameContainer}>
                              <Text
                                style={[
                                  styles.memberName,
                                  isRTL() && { textAlign: "right" },
                                ]}
                              >
                                {member.name}
                              </Text>
                              {/* Processing Status Badge */}
                              {member.apiStatus &&
                                member.apiStatus !== "queued" && (
                                  <View
                                    style={[
                                      styles.statusBadge,
                                      {
                                        backgroundColor: statusInfo.color,
                                      },
                                    ]}
                                  >
                                    <Ionicons
                                      name={statusInfo.icon}
                                      size={10}
                                      color="white"
                                    />
                                  </View>
                                )}
                            </View>
                            <Text
                              style={[
                                styles.memberGender,
                                !isRTL() && { textAlign: "right" },
                              ]}
                            >
                              {member.gender === "male"
                                ? t("familyGallery.male")
                                : t("familyGallery.female")}
                              {member.hijabStatus &&
                                ` • ${t("familyGallery.wearsHijab")}`}
                            </Text>

                            {/* Status Information */}
                            <View
                              style={[
                                styles.statusContainer,
                                { backgroundColor: statusInfo.bgColor },
                              ]}
                            >
                              <Animatable.View
                                animation={
                                  member.apiStatus === "processing"
                                    ? "rotate"
                                    : undefined
                                }
                                iterationCount={
                                  member.apiStatus === "processing"
                                    ? "infinite"
                                    : 1
                                }
                                duration={2000}
                              >
                                <Ionicons
                                  name={statusInfo.icon}
                                  size={14}
                                  color={statusInfo.color}
                                />
                              </Animatable.View>
                              <Text
                                style={[
                                  styles.statusText,
                                  { color: statusInfo.color },
                                  isRTL() && { textAlign: "right" },
                                ]}
                              >
                                {statusInfo.text}
                              </Text>
                              {member.apiStatus === "processing" &&
                                member.apiTaskId && (
                                  <TouchableOpacity
                                    style={styles.refreshButton}
                                    onPress={() =>
                                      refreshProcessingStatus(
                                        member._id,
                                        member.apiTaskId
                                      )
                                    }
                                  >
                                    <Ionicons
                                      name="refresh"
                                      size={12}
                                      color={statusInfo.color}
                                    />
                                  </TouchableOpacity>
                                )}
                              {member.apiError && (
                                <Text
                                  style={styles.errorText}
                                  numberOfLines={1}
                                >
                                  {member.apiError}
                                </Text>
                              )}
                            </View>
                          </View>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.expandButton,
                            !isRTL()
                              ? styles.expandButtonRTL
                              : styles.expandButtonLTR,
                          ]}
                          onPress={() => toggleExpanded(member._id)}
                        >
                          <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            color={COLORS.primary}
                          />
                        </TouchableOpacity>
                      </View>

                      {/* Expandable Photos Section */}
                      {isExpanded && (
                        <Animatable.View
                          animation="fadeInDown"
                          duration={300}
                          style={styles.photosSection}
                        >
                          <Text
                            style={[
                              styles.photosSectionTitle,
                              isRTL() && { textAlign: "right" },
                            ]}
                          >
                            {t("familyGallery.photosCount", {
                              count: member.images?.length || 0,
                            })}
                          </Text>
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.photosContainer}
                          >
                            {member.images?.map((imageUrl, index) => (
                              <View key={index} style={styles.photoWrapper}>
                                <Image
                                  source={{ uri: imageUrl }}
                                  style={styles.memberPhoto}
                                />
                              </View>
                            ))}
                          </ScrollView>

                          {/* Action Buttons in Expanded Section */}
                          <View
                            style={[
                              styles.actionButtons,
                              isRTL() && { flexDirection: "row-reverse" },
                            ]}
                          >
                            <TouchableOpacity
                              style={[styles.actionButton, styles.editButton]}
                              onPress={() =>
                                router.push({
                                  pathname:
                                    "/modules/familyGallary/screens/AddMemberScreen",
                                  params: { member: JSON.stringify(member) },
                                })
                              }
                            >
                              <Ionicons
                                name="create-outline"
                                size={16}
                                color={COLORS.primary}
                              />
                              <Text
                                style={[
                                  styles.actionButtonText,
                                  { color: COLORS.primary },
                                  isRTL() && { textAlign: "right" },
                                ]}
                              >
                                {t("familyGallery.edit")}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.actionButton, styles.deleteButton]}
                              onPress={() => removeFM(member._id)}
                              disabled={loading}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={16}
                                color="#EF4444"
                              />
                              <Text
                                style={[
                                  styles.actionButtonText,
                                  { color: "#EF4444" },
                                  isRTL() && { textAlign: "right" },
                                ]}
                              >
                                {loading
                                  ? t("familyGallery.deleting")
                                  : t("familyGallery.delete")}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </Animatable.View>
                      )}
                    </Animatable.View>
                  );
                })}
              </Animatable.View>
            )}
          </ScrollView>
        </LinearGradient>

        {/* Add New Member Button */}
        <View style={[styles.fab, isRTL() && styles.fabRTL]}>
          <TouchableOpacity
            style={styles.fabButton}
            onPress={() =>
              router.push("/modules/familyGallary/screens/AddMemberScreen")
            }
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.fabGradient}
            >
              <Ionicons name="add" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const NoFMFound = () => (
  <Animatable.View
    animation="fadeInUp"
    duration={600}
    style={styles.noMembersContainer}
  >
    <Animatable.View
      animation="pulse"
      iterationCount="infinite"
      style={styles.noMembersIconContainer}
    >
      <Ionicons name="people-outline" size={64} color={COLORS.grey} />
    </Animatable.View>
    <Text style={[styles.noMembersText, isRTL() && { textAlign: "right" }]}>
      {t("familyGallery.noMembersFound")}
    </Text>
    <Animatable.View
      animation="fadeInUp"
      delay={300}
      style={[styles.getStartedButton, isRTL() && { alignItems: "flex-end" }]}
    >
      <TouchableOpacity
        onPress={() =>
          router.replace("/modules/familyGallary/screens/AddMemberScreen")
        }
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={[
            styles.getStartedGradient,
            isRTL() && { flexDirection: "row-reverse" },
          ]}
        >
          <Ionicons
            name="add-circle"
            size={20}
            color="white"
            style={isRTL() ? { marginLeft: 8 } : { marginRight: 8 }}
          />
          <Text style={styles.getStartedText}>
            {t("familyGallery.getStarted")}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  </Animatable.View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 120,
    paddingTop: 16,
  },
  membersContainer: {
    paddingHorizontal: 16,
  },
  memberCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 20,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  memberHeader: {
    padding: 20,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  memberDetails: {
    flex: 1,
    paddingTop: 2,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  memberName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    lineHeight: 22,
  },
  statusBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  memberGender: {
    fontSize: 13,
    color: COLORS.grey,
    fontWeight: "500",
    marginBottom: 8,
    lineHeight: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 14,
  },
  errorText: {
    fontSize: 10,
    color: "#EF4444",
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  refreshButton: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },

  photosSection: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FAFBFC",
  },
  photosSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 12,
  },
  photosContainer: {
    paddingRight: 20,
  },
  photoWrapper: {
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberPhoto: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  expandButton: {
    position: "absolute",
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expandButtonLTR: {
    right: 20,
  },
  expandButtonRTL: {
    left: 20,
  },
  actionButtons: {
    flexDirection: "row",
    paddingTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  editButton: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  deleteButton: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 30,
    right: 20,
  },
  floatingButton: {
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 40,
  },
  floatingButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  noMembersContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  noMembersIconContainer: {
    marginBottom: 24,
  },
  noMembersText: {
    fontSize: 16,
    color: COLORS.grey,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  getStartedButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  getStartedGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  getStartedText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
  },
  fabRTL: {
    right: undefined,
    left: 20,
  },
  fabButton: {
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 40,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});
