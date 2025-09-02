import { COLORS } from "@/app/shared/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

type tapOption = {
  size: number | undefined;
  color: string | undefined;
};

export default function _layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.grey,
        tabBarStyle: {
          position: "absolute",
          flex: 1,
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: "white",
          borderTopWidth: 0,
          height: 50,
          paddingTop: 5,
        },
      }}
    >
      <Tabs.Screen
        name="Dashboard"
        options={{
          tabBarIcon: ({ size, color }: tapOption) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Gallery"
        options={{
          tabBarIcon: ({ size, color }: tapOption) => (
            <Ionicons name="folder-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="HijabDetection"
        options={{
          tabBarIcon: ({ size, color }: tapOption) => (
            <Ionicons name="scan-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ size, color }: tapOption) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
