import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/clerk-expo";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import {
  recognizeNoHijab,
  getRecognitionStatus,
  getResultImage,
} from "../services/detection.service";

export interface DetectionResult {
  status: "idle" | "processing" | "completed" | "failed";
  taskId: string | null;
  error: string | null;
  resultImageUrl: string | null;
}

export const useHijabDetection = () => {
  const [detectionResult, setDetectionResult] = useState<DetectionResult>({
    status: "idle",
    taskId: null,
    error: null,
    resultImageUrl: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Get authentication state from Clerk
  const { isSignedIn } = useAuth();

  // Get current user from Convex (only if authenticated)
  const currentUser = useQuery(api.users.currentUser, isSignedIn ? {} : "skip");

  // Get family members for current user (only if authenticated)
  const familyMembers = useQuery(
    api.familyMembers.getFM,
    isSignedIn ? {} : "skip"
  );

  // Refs for cancellation management
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCancelledRef = useRef(false);

    // Start detection
  const startDetection = async (params: { image: any }) => {
    try {
      setIsLoading(true);
      isCancelledRef.current = false;

      // Check if we have required data
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      if (!familyMembers || familyMembers.length === 0) {
        throw new Error(
          "No family members found. Please add family members first."
        );
      }

      // Transform family members data to match backend expectations
      const familyMemberIds = familyMembers.map(
        (member: Doc<"familyMembers">) => ({
          id: member._id,
          gender: member.gender as "male" | "female",
          hijab: member.hijabStatus,
        })
      );

      const taskId = await recognizeNoHijab({
        image: params.image,
        user_id: currentUser.clerkId,
        family_member_ids: familyMemberIds,
      });

      if (taskId) {
        setDetectionResult({
          status: "processing",
          taskId: taskId,
          error: null,
          resultImageUrl: null,
        });

        // Start polling for status
        setTimeout(() => {
          pollStatus(taskId);
        }, 1000);
      } else {
        throw new Error("No task ID received");
      }
    } catch (error) {
      setDetectionResult({
        status: "failed",
        taskId: null,
        error: error instanceof Error ? error.message : "Upload failed",
        resultImageUrl: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for status updates
  const pollStatus = async (taskId: string) => {
    if (isCancelledRef.current) {
      return;
    }

    try {
      const result = await getRecognitionStatus(taskId);

      if (isCancelledRef.current) {
        return;
      }

      // Map backend status to our simplified status
      if (result.status === "failed" || result.status === "error") {
        setDetectionResult({
          status: "failed",
          taskId,
          error: result.message || "Detection failed",
          resultImageUrl: null,
        });
      } else if (result.status === "completed") {
        try {
          // Fetch the actual result image response
          const resultImageResponse = await getResultImage(taskId);

          setDetectionResult({
            status: "completed",
            taskId,
            error: null,
            resultImageUrl: resultImageResponse,
          });
        } catch (imageError) {
          setDetectionResult({
            status: "failed",
            taskId,
            error: "Failed to fetch result image",
            resultImageUrl: null,
          });
        }
      } else {
        // "queued", "processing" -> processing
        pollingTimeoutRef.current = setTimeout(() => {
          pollStatus(taskId);
        }, 5000);
      }
    } catch (error) {
      if (!isCancelledRef.current) {
        setDetectionResult({
          status: "failed",
          taskId,
          error: "Failed to check status",
          resultImageUrl: null,
        });
      }
    }
  };

  // Cancel detection
  const cancelDetection = () => {
    // Set cancellation flag
    isCancelledRef.current = true;

    // Clear any pending timeouts
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    // Reset state
    setDetectionResult({
      status: "idle",
      taskId: null,
      error: null,
      resultImageUrl: null,
    });
  };

  // Reset detection
  const resetDetection = () => {
    // Set cancellation flag to stop any ongoing polling
    isCancelledRef.current = true;

    // Clear any pending timeouts
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    setDetectionResult({
      status: "idle",
      taskId: null,
      error: null,
      resultImageUrl: null,
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  return {
    detectionResult,
    isLoading: isSignedIn ? !currentUser || !familyMembers : false,
    startDetection,
    resetDetection,
    cancelDetection,
    currentUser,
    familyMembers,
  };
};
