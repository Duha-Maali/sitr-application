import { useSnackbar } from "@/app/shared/contexts/snakbarContext";
import {
  getClerkInstance,
  useClerk,
  useSignIn,
  useSignUp,
} from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { useSSO } from "@clerk/clerk-expo";

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  let [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // Step state for managing reset process
  const { showSnackbar } = useSnackbar();
  const { signOut } = useClerk();
  const { signIn } = useSignIn();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startSSOFlow } = useSSO();
  const clerk = getClerkInstance();

  const signInFn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const signInAttempt = await signIn?.create({
        identifier: email,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt?.status === "complete") {
        if (setActive) {
          await setActive({ session: signInAttempt.createdSessionId });
        } else {
          console.error("setActive is undefined");
        }
        router.replace("/");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message);
    } finally {
      setLoading(false);
    }
  };

  const signUpFn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signUp?.create({
        emailAddress: email,
        password,
      });
      await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });
      router.replace("/modules/auth/screens/emailVerification");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const SSOFn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });
      if (setActive && createdSessionId) {
        setActive({ session: createdSessionId });
        router.replace("/(tabs)/Dashboard");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message);
    } finally {
      setLoading(false);
    }
  };

  const signOutFn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut();
      router.replace("/");
    } catch (error: any) {
      showSnackbar(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async (code: string) => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/(tabs)/Dashboard");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        setError(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message);
    }
  };

  const requestReset = async (email: string) => {
    if (!isLoaded || !clerk.client) {
      Alert.alert("Error", "System not ready. Please try again.");
      return;
    }

    setLoading(true);
    try {
      const result = await clerk.client.signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      if (result) {
        showSnackbar("Password reset code sent to your email");
        setError("");
        setStep(2);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (code: string) => {
    if (!isLoaded || !clerk.client) {
      Alert.alert("Error", "System not ready. Please try again.");
      return;
    }

    setLoading(true);
    try {
      const result = await clerk.client.signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      });

      setError("");
      setStep(3);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (newPassword: string) => {
    if (!isLoaded || !clerk.client) {
      Alert.alert("Error", "System not ready. Please try again.");
      return;
    }

    setLoading(true);
    try {
      const result = await clerk.client.signIn.resetPassword({
        password: newPassword,
      });
      await setActive({ session: result.createdSessionId });
      router.replace("/");
      showSnackbar("Password reset successfully");
      setError("");
      setStep(1);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const ChangePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    if (!isLoaded || !clerk.user) {
      Alert.alert("Error", "System not ready. Please try again.");
      return false;
    }

    setLoading(true);
    try {
      await clerk.user.updatePassword({
        currentPassword,
        newPassword,
      });
      setError(""); // Clear any previous errors
      return true; // Success
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to change password");
      return false; // Failure
    } finally {
      setLoading(false);
    }
  };

  return {
    signInFn,
    signUpFn,
    signOutFn,
    SSOFn,
    onVerify,
    requestReset,
    verifyCode,
    resetPassword,
    ChangePassword,
    loading,
    error,
    setError,
    step,
    setStep,
  };
}
