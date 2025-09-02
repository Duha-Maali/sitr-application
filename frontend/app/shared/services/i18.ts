import ar from "@/app/shared/locales/ar.json";
import en from "@/app/shared/locales/en.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";
const resources = {
  ar: { translation: ar },
  en: { translation: en },
};

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem("language");

  if (!savedLanguage) {
    savedLanguage = "en";
  }

  if (savedLanguage === "ar") {
    I18nManager.forceRTL(true);
  } else {
    I18nManager.forceRTL(false);
  }

  i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: "ar",
    interpolation: {
      escapeValue: false,
    },
  });
};

initI18n();

export const changeLanguage = (language: string) => {
  i18n.changeLanguage(language);
  AsyncStorage.setItem("language", language);
  if (language === "ar") {
    I18nManager.forceRTL(true);
  } else {
    I18nManager.forceRTL(false);
  }
  Updates.reloadAsync();
};

export const getCurrentLanguage = () => {
  return i18n.language;
};

export const isRTL = () => {
  return i18n.language === "ar";
};

export const t = i18n.t;

export default i18n;
