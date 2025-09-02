import { createContext, useContext } from "react";

// Define the context type
type SnackbarContextType = {
  showSnackbar: (message: string) => void;
  hideSnackbar: () => void;
};

export const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};
