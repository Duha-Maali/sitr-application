import { Platform } from "react-native";

// Helper function to simplify font family naming
const getFontFamily = (baseName) => {
  return Platform.select({
    ios: baseName, // iOS uses the exact filename (e.g., "AmiriRegular")
    android: baseName, // Android also uses the exact filename (no "-" needed)
  });
};

export const fontFamilies = {
  // AMIRI FONT FAMILY (Arabic)
  AMIRI: {
    normal: getFontFamily("AmiriRegular"),
    bold: getFontFamily("AmiriBold"),
    italic: getFontFamily("AmiriItalic"),
    boldItalic: getFontFamily("AmiriBoldItalic"),
  },

  // INTER1BPT FONT FAMILY (Sans-serif)
  INTER: {
    thin: getFontFamily("Inter18ptThin"),
    normal: getFontFamily("Inter18ptRegular"),
    semiBold: getFontFamily("Inter18ptSemiBold"),
    bold: getFontFamily("Inter18ptBold"),
  },
};
