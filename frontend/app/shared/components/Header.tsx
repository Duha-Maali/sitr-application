import { COLORS } from "@/app/shared/constants/theme"; // Ensure the path to COLORS is correct
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  title: string;
  onBackPress?: () => void; // Optional custom back button handler
  iconName?: React.ComponentProps<typeof Ionicons>["name"];
}

const Header: React.FC<HeaderProps> = ({
  title,
  onBackPress,
  iconName = "arrow-back",
}) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBackPress || (() => router.canGoBack() && router.back())}
      >
        <Ionicons name={iconName} size={28} color={COLORS.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 28 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Shadow for Android
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
    paddingVertical: 13,
  },
});

export default Header;
