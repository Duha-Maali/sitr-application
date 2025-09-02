import { SnackbarProvider } from "@/app/shared/components/SnackbarProvider";
import i18n from "@/app/shared/services/i18";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider";
import { StatusBar } from "expo-status-bar";
import { I18nextProvider } from "react-i18next";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import InitialLayout from "./shared/components/InintialLayout";

export default function RootLayout() {
  return (
    <SnackbarProvider>
      <ClerkAndConvexProvider>
        <I18nextProvider i18n={i18n}>
          <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: "grey" }}>
              <StatusBar style="light" />
              <InitialLayout />
            </SafeAreaView>
          </SafeAreaProvider>
        </I18nextProvider>
      </ClerkAndConvexProvider>
    </SnackbarProvider>
  );
}
