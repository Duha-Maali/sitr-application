import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";

interface RecognizeFaces {
  image: string | File | any; // Allow any type for raw image assets
  user_id: string;
  family_member_ids: Array<{
    id: string;
    gender: "male" | "female";
    hijab: boolean;
  }>;
}

interface RecognizeFacesResponse {
  status: string;
  task_id: string;
}

interface RecognitionStatusResponse {
  status: "queued" | "processing" | "completed" | "error" | "failed";
  message: string;
  errors: string[];
  result: string | null;
}

// Use consistent base URL for all API calls
const BASE_URL = "http://192.168.1.155:5000";

export const recognizeNoHijab = async (
  params: RecognizeFaces
): Promise<string> => {
  try {
    const formData = new FormData();

    // Handle Expo ImagePicker asset format
    if (params.image && typeof params.image === "object" && params.image.uri) {
      const fileForUpload = {
        uri: params.image.uri,
        type: params.image.mimeType || "image/jpeg",
        name: params.image.fileName || `image_${Date.now()}.jpg`,
      };
      formData.append("image", fileForUpload as any);
    } else {
      // Fallback for other formats
      formData.append("image", params.image);
    }

    formData.append("user_id", params.user_id);
    formData.append(
      "family_member_ids",
      JSON.stringify(params.family_member_ids)
    );

    // Try using fetch first, fallback to XMLHttpRequest if needed
    try {
      const response = await fetch(`${BASE_URL}/recognize_faces`, {
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type header - let the browser set it for FormData
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RecognizeFacesResponse = await response.json();
      return data.task_id;
    } catch (fetchError) {
      // Fallback to XMLHttpRequest for React Native compatibility
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", `${BASE_URL}/recognize_faces`, true);

        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data: RecognizeFacesResponse = JSON.parse(xhr.responseText);
              resolve(data.task_id);
            } catch (error) {
              reject(new Error("Failed to parse server response"));
            }
          } else {
            reject(new Error(`HTTP error! status: ${xhr.status}`));
          }
        };

        xhr.onerror = function () {
          reject(new Error("Network request failed"));
        };

        xhr.ontimeout = function () {
          reject(new Error("Request timeout"));
        };

        xhr.timeout = 30000; // 30 second timeout

        xhr.send(formData);
      });
    }
  } catch (error) {
    throw error;
  }
};

export const getRecognitionStatus = async (
  taskId: string
): Promise<RecognitionStatusResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/status_rec/${taskId}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: RecognitionStatusResponse = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const getResultImage = async (taskId: string): Promise<string> => {
  try {
    const response = await fetch(`${BASE_URL}/result_image/${taskId}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // For React Native: Download and save to local file system
    const fileName = `result_${taskId}_${Date.now()}.png`
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    // Download file directly
    const downloadResult = await FileSystem.downloadAsync(
      `${BASE_URL}/result_image/${taskId}`,
      fileUri
    );

    console.log("Result image saved to:", downloadResult.uri);
    return downloadResult.uri;
  } catch (error) {
    throw error;
  }
};
