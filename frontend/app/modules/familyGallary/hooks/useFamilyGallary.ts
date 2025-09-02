import { useSnackbar } from "@/app/shared/contexts/snakbarContext";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useAuth } from "@clerk/clerk-expo";

// Create persistent storage outside the hook to survive re-renders
const globalPollingIntervals = new Map<string, NodeJS.Timeout>();
const globalPollingMembers = new Set<string>();

export const useFamilyGallery = () => {
  const [loading, setLoading] = useState(false);
  const [pollingMembers, setPollingMembers] = useState<Set<string>>(() => {
    // Initialize with global state
    return new Set(globalPollingMembers);
  });
  const pollingIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(
    globalPollingIntervals
  );
  const { userId } = useAuth();
  const { showSnackbar } = useSnackbar();

  // Add hook lifecycle logging
  console.log(
    `🔄 useFamilyGallery hook running/re-running at:`,
    new Date().toISOString()
  );
  console.log(`👤 Current userId:`, userId);
  console.log(`📊 Current pollingMembers size:`, pollingMembers.size);
  console.log(`📊 Global pollingMembers size:`, globalPollingMembers.size);
  console.log(
    `📊 Current intervals map size:`,
    pollingIntervalsRef.current.size
  );
  console.log(`📊 Global intervals map size:`, globalPollingIntervals.size);

  // Sync global state with local state
  useEffect(() => {
    if (pollingMembers.size !== globalPollingMembers.size) {
      console.log(`🔄 Syncing pollingMembers state with global state`);
      setPollingMembers(new Set(globalPollingMembers));
    }
  }, [pollingMembers.size]);

  const createFM = useMutation(api.familyMembers.createFM);
  const deleteFM = useMutation(api.familyMembers.deleteFM);
  const updateFM = useMutation(api.familyMembers.updateFM);
  const deleteFMStorage = useMutation(api.familyMembers.deleteFMStorage);
  const updateApiStatus = useMutation(api.familyMembers.updateApiStatus);
  const generateUploadUrlFn = useMutation(api.users.generateUploadUrl);

  const familyMembers = useQuery(api.familyMembers.getFM, userId ? {} : "skip");

  // Memoize the FM list so it updates only when data changes
  const FM: Doc<"familyMembers">[] | undefined = useMemo(() => {
    setLoading(true);
    familyMembers && setLoading(false);
    return familyMembers ?? [];
  }, [familyMembers]);

  const sendProcessingRequest = async (
    userId: string | null,
    familyMemberId: string,
    imageUrls: string[]
  ): Promise<string> => {
    try {
      const requestBody = {
        user_id: userId,
        family_member_id: familyMemberId,
        urls: imageUrls,
      };

      console.log(
        "Sending processing request:",
        JSON.stringify(requestBody, null, 2)
      );

      const response = await fetch("http://192.168.1.155:5000/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error("Failed to process images:", response.statusText);
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log("Images processing request sent successfully:", responseData);

      if (!responseData.task_id) {
        throw new Error("No task_id received from API");
      }

      return responseData.task_id;
    } catch (error) {
      console.error("Error sending processing request:", error);
      throw error;
    }
  };

  // Function to check processing status via API
  const checkProcessingStatus = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(
        `http://192.168.1.155:5000/status/${taskId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to check processing status:",
          response.statusText
        );
        return null;
      }

      const statusData = await response.json();
      console.log("Processing status:", statusData);
      return statusData;
    } catch (error) {
      console.error("Error checking processing status:", error);
      return null;
    }
  }, []);

  // Function to start polling for a specific task
  const startPolling = useCallback(
    (familyMemberId: string, taskId: string) => {
      if (pollingIntervalsRef.current.has(familyMemberId)) {
        console.log(`Already polling for family member: ${familyMemberId}`);
        return; // Already polling this member
      }

      console.log(
        `🔄 Starting polling for family member: ${familyMemberId}, task: ${taskId}`
      );

      // Force immediate state update
      console.log(`🔄 About to add ${familyMemberId} to polling set...`);

      // Update global state first
      globalPollingMembers.add(familyMemberId);
      console.log(
        `✅ Added to global polling set:`,
        familyMemberId,
        `Total:`,
        Array.from(globalPollingMembers)
      );

      setPollingMembers((prev) => {
        console.log(`🔍 Current polling members before add:`, Array.from(prev));
        const newSet = new Set(globalPollingMembers); // Use global state
        console.log(
          `✅ Added to polling set:`,
          familyMemberId,
          `Total polling:`,
          Array.from(newSet)
        );
        return newSet;
      });
      console.log(`🔄 setPollingMembers call completed`);

      // Add a slight delay to ensure state update processes
      setTimeout(() => {
        console.log(
          `🕐 Delayed check - current pollingMembers should include:`,
          familyMemberId
        );
      }, 100);

      // Update status to processing and store task_id
      const updateStatus = async () => {
        try {
          await updateApiStatus({
            FmId: familyMemberId as Id<"familyMembers">,
            apiStatus: "processing",
            apiTaskId: taskId,
          });
          console.log(`✅ Status updated to processing for: ${familyMemberId}`);
        } catch (error) {
          console.error(
            `❌ Failed to update status for ${familyMemberId}:`,
            error
          );
          console.log(
            `⚠️ Continuing with polling despite status update failure`
          );
        }
      };

      // Don't await this to avoid blocking polling setup
      updateStatus().catch((error) => {
        console.error(
          `❌ Status update failed, but polling will continue:`,
          error
        );
      });

      let pollCount = 0;
      const maxPolls = 120; // Stop after 10 minutes (120 * 5 seconds)

      console.log(`⏰ Setting up interval for task: ${taskId}`);

      // Define the polling function
      const pollFunction = async () => {
        pollCount++;
        console.log(
          `🔍 Poll #${pollCount} for task: ${taskId} (max: ${maxPolls})`
        );

        if (pollCount >= maxPolls) {
          console.log(`⏰ Max polling attempts reached for task: ${taskId}`);
          const interval = pollingIntervalsRef.current.get(familyMemberId);
          if (interval) {
            clearInterval(interval);
            pollingIntervalsRef.current.delete(familyMemberId);
          }
          setPollingMembers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(familyMemberId);
            return newSet;
          });

          // Update status to failed due to timeout
          try {
            await updateApiStatus({
              FmId: familyMemberId as Id<"familyMembers">,
              apiStatus: "failed",
              apiTaskId: taskId,
              apiError: "Processing timeout - maximum polling time exceeded",
            });
            console.log(
              `⏰ Status updated to failed (timeout) for: ${familyMemberId}`
            );
          } catch (error) {
            console.error(`❌ Failed to update timeout status:`, error);
          }

          showSnackbar("Processing timeout - please try again");
          return;
        }

        try {
          console.log(`📡 Checking status for task: ${taskId}`);
          const statusData = await checkProcessingStatus(taskId);
          console.log(`📊 Poll result for task ${taskId}:`, statusData);

          if (statusData) {
            const { status, errors, message } = statusData;
            console.log(
              `📋 Status: ${status}, Errors: ${errors}, Message: ${message}`
            );

            if (status === "completed" || status === "failed") {
              console.log(
                `🏁 Final status received for task ${taskId}: ${status}`
              );

              // Stop polling
              const interval = pollingIntervalsRef.current.get(familyMemberId);
              if (interval) {
                clearInterval(interval);
                pollingIntervalsRef.current.delete(familyMemberId);
              }
              // Update global state first
              globalPollingMembers.delete(familyMemberId);
              console.log(
                `❌ Removed from global polling set:`,
                familyMemberId,
                `Remaining:`,
                Array.from(globalPollingMembers)
              );

              setPollingMembers((prev) => {
                const newSet = new Set(globalPollingMembers); // Use global state
                console.log(
                  `❌ Removed from polling set:`,
                  familyMemberId,
                  `Remaining:`,
                  Array.from(newSet)
                );
                return newSet;
              });

              // Update the family member status
              try {
                await updateApiStatus({
                  FmId: familyMemberId as Id<"familyMembers">,
                  apiStatus: status,
                  apiTaskId: taskId,
                  apiError:
                    status === "failed"
                      ? message || "Unknown error"
                      : undefined,
                });
                console.log(
                  `✅ Final status updated for ${familyMemberId}: ${status}`
                );
              } catch (error) {
                console.error(`❌ Failed to update final status:`, error);
              }

              if (status === "completed") {
                showSnackbar("Processing completed successfully!");
              } else {
                const errorMsg =
                  errors?.join(", ") || message || "Unknown error";
                showSnackbar(`Processing failed: ${errorMsg}`);
              }

              console.log(
                `🛑 Polling stopped for family member: ${familyMemberId}, task: ${taskId}, status: ${status}`
              );
            } else if (status === "processing" || status === "queued") {
              console.log(
                `⏳ Task ${taskId} still ${status}, continuing to poll... (${pollCount}/${maxPolls})`
              );
            } else {
              console.warn(`⚠️ Unknown status for task ${taskId}:`, status);
            }
          } else {
            console.warn(`⚠️ No status data returned for task: ${taskId}`);
          }
        } catch (error) {
          console.error(`❌ Error during polling for task ${taskId}:`, error);
          // Continue polling even if one request fails
        }
      };

      // Execute first poll immediately
      console.log(`🚀 Executing first poll immediately for task: ${taskId}`);
      pollFunction();

      // Set up interval for subsequent polls every 5 seconds
      console.log(
        `⏱️ Setting up 5-second polling interval for task: ${taskId}`
      );

      const interval = setInterval(() => {
        console.log(
          `⏰ 5-second interval triggered for task: ${taskId} at ${new Date().toISOString()}`
        );
        console.log(`🔄 About to execute pollFunction for task: ${taskId}`);
        try {
          pollFunction();
        } catch (error) {
          console.error(`❌ Error in polling interval:`, error);
        }
      }, 5000);

      console.log(
        `📋 Interval created for task ${taskId} (every 5 seconds), storing in ref`
      );
      console.log(`🆔 Interval ID:`, interval);
      console.log(`🔍 Interval type:`, typeof interval);
      console.log(`🔍 Is interval truthy:`, !!interval);

      pollingIntervalsRef.current.set(familyMemberId, interval);
      console.log(
        `📊 Active polling intervals:`,
        Array.from(pollingIntervalsRef.current.keys())
      );
      console.log(
        `📊 Interval refs map size:`,
        pollingIntervalsRef.current.size
      );
      console.log(`⏱️ Next poll will happen in 5 seconds for task: ${taskId}`);
      console.log(
        `✅ Polling setup completed successfully for task: ${taskId}`
      );

      // Verify the interval wasn't cleared immediately
      setTimeout(() => {
        const stillExists = pollingIntervalsRef.current.has(familyMemberId);
        console.log(
          `🕐 After 1 second - interval still exists for ${familyMemberId}:`,
          stillExists
        );
        if (stillExists) {
          console.log(`🕐 Interval should fire in ~4 more seconds...`);
        }
      }, 1000);
    },
    [checkProcessingStatus, updateApiStatus, showSnackbar]
  );

  // Function to stop polling for a specific family member
  const stopPolling = useCallback((familyMemberId: string) => {
    const interval = pollingIntervalsRef.current.get(familyMemberId);
    if (interval) {
      clearInterval(interval);
      pollingIntervalsRef.current.delete(familyMemberId);

      // Update global state
      globalPollingMembers.delete(familyMemberId);
      console.log(
        `❌ Removed from global polling set via stopPolling:`,
        familyMemberId
      );

      setPollingMembers((prev) => {
        const newSet = new Set(globalPollingMembers);
        return newSet;
      });
      console.log(`Polling stopped for family member: ${familyMemberId}`);
    }
  }, []);

  // Function to manually refresh status for stuck processing
  const refreshProcessingStatus = useCallback(
    async (familyMemberId: string, taskId?: string) => {
      if (!taskId) {
        console.log("No task ID available for refresh");
        return;
      }

      try {
        console.log(`Manually refreshing status for task: ${taskId}`);
        const statusData = await checkProcessingStatus(taskId);

        if (statusData) {
          const { status, errors, message } = statusData;

          await updateApiStatus({
            FmId: familyMemberId as Id<"familyMembers">,
            apiStatus: status,
            apiTaskId: taskId,
            apiError:
              status === "failed" ? message || "Unknown error" : undefined,
          });

          if (status === "completed" || status === "failed") {
            stopPolling(familyMemberId);
            showSnackbar(
              status === "completed"
                ? "Processing completed!"
                : `Processing failed: ${errors?.join(", ") || (typeof message === "object" ? message.m || JSON.stringify(message) : message) || "Unknown error"}`
            );
          }
        }
      } catch (error) {
        console.error("Error refreshing status:", error);
        showSnackbar("Failed to refresh status");
      }
    },
    [checkProcessingStatus, updateApiStatus, stopPolling, showSnackbar]
  );

  // Enhanced sendProcessingRequest function with polling
  const sendProcessingRequestWithPolling = useCallback(
    async (
      userId: string | null,
      familyMemberId: string,
      imageUrls: string[]
    ) => {
      try {
        console.log(
          `🚀 Starting processing request for family member: ${familyMemberId}`
        );
        console.log(`📸 Image URLs count: ${imageUrls.length}`);

        const taskId = await sendProcessingRequest(
          userId,
          familyMemberId,
          imageUrls
        );

        console.log(
          `✅ Processing request successful, received task ID: ${taskId}`
        );
        console.log(
          `🔄 Starting polling for family member: ${familyMemberId} with task: ${taskId}`
        );

        // Start polling after successful request
        startPolling(familyMemberId, taskId);
        return taskId;
      } catch (error) {
        console.error("❌ Failed to send processing request:", error);
        throw error;
      }
    },
    [startPolling]
  );

  // Clean up intervals on unmount
  useEffect(() => {
    console.log(`🔧 Cleanup useEffect mounted`);
    return () => {
      console.log(
        `🧹 CLEANUP RUNNING! Clearing ${pollingIntervalsRef.current.size} intervals`
      );
      console.log(
        `🧹 Before cleanup - Global polling members:`,
        Array.from(globalPollingMembers)
      );
      console.log(
        `🧹 Before cleanup - Global intervals:`,
        Array.from(globalPollingIntervals.keys())
      );

      pollingIntervalsRef.current.forEach((interval, familyMemberId) => {
        console.log(`🧹 Clearing interval for:`, familyMemberId);
        clearInterval(interval);
      });
      pollingIntervalsRef.current.clear();

      // IMPORTANT: Don't clear global state on cleanup!
      // The global state should persist across hook re-renders
      // Only individual polling functions should remove from global state when they complete
      console.log(
        `🧹 NOT clearing global state - intervals should persist across hook re-renders`
      );

      // Clear recovery timeout
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
        console.log(`🧹 Cleared recovery timeout`);
      }

      console.log(`🧹 Cleanup completed`);
    };
  }, []);

  const deleteMemberFn = async (FmId: Id<"familyMembers">) => {
    setLoading(true);
    try {
      // Stop polling for this member if it's currently being polled
      stopPolling(FmId);

      // Delete from backend API (ChromaDB) first - must succeed before proceeding
      if (userId) {
        console.log(
          `🗑️ Deleting from backend API for user: ${userId}, member: ${FmId}`
        );
        const apiResponse = await fetch(
          "http://192.168.1.155:5000/delete_family_member",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: userId,
              family_member_id: FmId,
            }),
          }
        );

        if (!apiResponse.ok) {
          const errorData = await apiResponse.json();
          console.error("API deletion failed:", errorData);
          throw new Error(errorData.message || "Failed to delete");
        }

        const responseData = await apiResponse.json();
        console.log(`✅ Backend deletion successful:`, responseData);

        if (responseData.deleted_count > 0) {
          console.log(
            `🗑️ Deleted ${responseData.deleted_count} records from ChromaDB`
          );
        }
      }

      // Delete from Convex
      await deleteFM({ FmId });
      showSnackbar("Your family member has been deleted");
    } catch (err: any) {
      showSnackbar(err.message || "Failed to delete family member");
    } finally {
      setLoading(false);
    }
  };

  const addNewFamilyMember = async (
    name: string,
    gender: "male" | "female",
    hijabStatus: boolean,
    images: string[]
  ) => {
    setLoading(true);
    try {
      const uploadUrl = await generateUploadUrlFn();
      const storageIds = await Promise.all(
        images.map(async (image) => {
          const uploadResults = await FileSystem.uploadAsync(uploadUrl, image, {
            httpMethod: "POST",
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
            mimeType: "image/jpeg",
          });
          if (uploadResults.status !== 200) throw new Error("Upload failed");
          const { storageId } = JSON.parse(uploadResults.body);
          return storageId;
        })
      );

      const result = await createFM({
        name,
        gender,
        hijabStatus,
        images,
        storageIds,
      });

      const { familyMemberId: newFamilyMemberId, publicImageUrls } = result;

      showSnackbar("Family member stored successfully");

      // Automatically start processing after successful creation
      if (newFamilyMemberId && userId) {
        console.log(
          `🎯 Auto-starting processing for new family member: ${newFamilyMemberId}`
        );
        console.log(`👤 User ID: ${userId}`);
        console.log(`🖼️ Images to process: ${publicImageUrls.length}`);
        console.log(`🔗 Public URLs for processing:`, publicImageUrls);

        try {
          // Use the public URLs returned from createFM
          await sendProcessingRequestWithPolling(
            userId,
            newFamilyMemberId,
            publicImageUrls
          );
          console.log(
            `✅ Auto-processing started successfully for: ${newFamilyMemberId}`
          );
          showSnackbar("Processing started automatically");
        } catch (processingError) {
          console.error("❌ Auto-processing failed:", processingError);
          showSnackbar("Family member saved, but processing failed to start");
        }
      } else {
        console.log(
          `⚠️ Auto-processing skipped - newFamilyMemberId: ${newFamilyMemberId}, userId: ${userId}`
        );
      }

      console.log(
        `🔄 About to navigate to Gallery, polling should continue...`
      );

      // Add a small delay to ensure polling is fully set up before navigation
      setTimeout(() => {
        console.log(`🔄 Navigating to Gallery now...`);
        router.replace("/(tabs)/Gallery");
      }, 500);
    } catch (err: any) {
      showSnackbar(err.message || "Failed to add family member");
    } finally {
      setLoading(false);
    }
  };

  const updateFamilyMember = async (
    FmId: Id<"familyMembers">,
    name: string,
    gender: "male" | "female",
    hijabStatus: boolean,
    images: string[],
    prevStorageIds: Id<"_storage">[]
  ) => {
    setLoading(true);
    try {
      const uploadUrl = await generateUploadUrlFn();

      const newStorageIds = await Promise.all(
        images.map(async (image, index) => {
          const prevStorageId = prevStorageIds[index];
          if (image.startsWith("https") && prevStorageId) {
            return prevStorageId;
          }
          const uploadResults = await FileSystem.uploadAsync(uploadUrl, image, {
            httpMethod: "POST",
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
            mimeType: "image/jpeg",
          });
          if (uploadResults.status !== 200) throw new Error("Upload failed");
          const { storageId } = JSON.parse(uploadResults.body);
          return storageId;
        })
      );

      const filteredPrevStorageIds = prevStorageIds.filter(
        (prevId) => !newStorageIds.includes(prevId)
      );

      if (filteredPrevStorageIds.length > 0) {
        await deleteFMStorage({ storageIds: filteredPrevStorageIds });
      }

      const result = await updateFM({
        FmId,
        name,
        gender,
        hijabStatus,
        images,
        storageIds: newStorageIds,
      });

      const { publicImageUrls } = result;

      showSnackbar("Family member updated successfully");

      // Automatically start processing after successful update
      if (userId) {
        try {
          console.log(
            `🔗 Using public URLs for processing update:`,
            publicImageUrls
          );
          await sendProcessingRequestWithPolling(userId, FmId, publicImageUrls);
          showSnackbar("Processing started automatically");
        } catch (processingError) {
          console.error("Auto-processing failed:", processingError);
          showSnackbar("Family member updated, but processing failed to start");
        }
      }

      router.replace("/(tabs)/Gallery");
    } catch (err: any) {
      showSnackbar(err.message || "Failed to update family member");
    } finally {
      setLoading(false);
    }
  };

  // Test function for debugging polling
  const testPolling = useCallback(
    (familyMemberId: string, taskId: string) => {
      console.log(
        `🧪 TEST: Starting manual polling test for ${familyMemberId} with task ${taskId}`
      );
      startPolling(familyMemberId, taskId);
    },
    [startPolling]
  );

  // Recovery mechanism: restart polling for processing members that aren't being polled
  const recoveryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing recovery timeout
    if (recoveryTimeoutRef.current) {
      clearTimeout(recoveryTimeoutRef.current);
    }

    // Debounce the recovery check to avoid rapid-fire executions
    recoveryTimeoutRef.current = setTimeout(() => {
      if (FM && FM.length > 0) {
        const processingMembers = FM.filter(
          (member) =>
            member.apiStatus === "processing" &&
            member.apiTaskId &&
            (!globalPollingMembers.has(member._id) || // Not in global state, OR
              !pollingIntervalsRef.current.has(member._id)) // In global state but missing actual interval
        );

        if (processingMembers.length > 0) {
          console.log(
            `🔄 Found ${processingMembers.length} processing members without polling, restarting...`
          );
          console.log(
            `🔍 Current global polling members:`,
            Array.from(globalPollingMembers)
          );
          console.log(
            `🔍 Current global intervals:`,
            Array.from(globalPollingIntervals.keys())
          );
          console.log(
            `🔍 Current actual intervals in ref:`,
            Array.from(pollingIntervalsRef.current.keys())
          );
          console.log(
            `🔍 Processing members found:`,
            processingMembers.map((m) => ({
              name: m.name,
              id: m._id,
              taskId: m.apiTaskId,
              inGlobalSet: globalPollingMembers.has(m._id),
              hasActualInterval: pollingIntervalsRef.current.has(m._id),
            }))
          );

          processingMembers.forEach((member) => {
            console.log(
              `🔄 Restarting polling for processing member: ${member.name} (${member._id}) with task: ${member.apiTaskId}`
            );
            startPolling(member._id, member.apiTaskId!);
          });
        } else {
          console.log(`✅ No processing members need polling restart`);
        }
      }
    }, 1000); // 1 second debounce
  }, [FM, startPolling]);

  return {
    deleteMemberFn,
    addNewFamilyMember,
    updateFamilyMember,
    sendProcessingRequest: sendProcessingRequestWithPolling,
    sendProcessingRequestWithPolling,
    startPolling,
    stopPolling,
    refreshProcessingStatus,
    testPolling,
    pollingMembers,
    FM,
    loading,
  };
};
