import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";

export default function InitialLayout() {
  const { isLoaded, isSignedIn, sessionId } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    const inAuthScreen = segments[0] === undefined || (segments[0] === "modules" && segments[1] === "auth");
    
    if (!isSignedIn && !inAuthScreen) router.replace("/modules/auth/screens/signInScreen");
    else if (isSignedIn && inAuthScreen) router.replace("/(tabs)/Dashboard");
  }, [isLoaded, isSignedIn, segments]);

  if (!isLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
