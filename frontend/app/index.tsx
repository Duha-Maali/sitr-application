import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import SplashScreen from "./modules/dashboard/components/SplashScreen";

export default function Index() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  }, []);

  if (isVisible) {
    return <SplashScreen />;
  }

  return <Redirect href="/modules/auth/screens/signInScreen" />;
}
