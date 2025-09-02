import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";

const AuthLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/(tabs)/Dashboard");
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return null;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
};

export default AuthLayout;
