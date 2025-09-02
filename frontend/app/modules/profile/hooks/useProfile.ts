import { useSnackbar } from "@/app/shared/contexts/snakbarContext";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";

export const useProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { userId } = useAuth();
  const { showSnackbar } = useSnackbar();

  const generateUploadUrlFn = useMutation(api.users.generateUploadUrl);
  const updateProfile = useMutation(api.users.updateProfile);

  const userProfileQuery = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip"
  );

  // Update state when query result changes
  useEffect(() => {
    if (userProfileQuery) {
      setProfile(userProfileQuery);
    }
  }, [userProfileQuery]);

  const updateProfileFn = async (userName: string, image: string) => {
    setLoading(true);
    try {
      let storageId: Id<"_storage"> | undefined;

      if (!image.startsWith("https")) {
        const uploadUrl = await generateUploadUrlFn();
        const uploadResults = await FileSystem.uploadAsync(uploadUrl, image, {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          mimeType: "image/jpeg",
        });

        if (uploadResults.status !== 200) {
          throw new Error("Upload failed");
        }

        const { storageId: newStorageId } = JSON.parse(uploadResults.body);
        storageId = newStorageId;
      }

      await updateProfile(
        storageId
          ? { userName, image, storageId }
          : { userName, image }
      );

      showSnackbar("Your profile updated successfully");
    } catch (err: any) {
      showSnackbar(err.message || "Failed to update profile");
      setError(err.message || "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  return { profile, updateProfileFn, loading, error };
};
