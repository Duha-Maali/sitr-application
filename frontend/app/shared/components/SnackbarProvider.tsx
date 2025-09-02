import { SnackbarContext } from "@/app/shared/contexts/snakbarContext";
import React, { ReactNode, useState } from "react";
import { Snackbar } from "react-native-paper";

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  const showSnackbar = (message: string) => {
    setMessage(message);
    setVisible(true);
  };

  const hideSnackbar = () => {
    setVisible(false);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={hideSnackbar}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => {
            hideSnackbar();
          },
        }}
      >
        {message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
