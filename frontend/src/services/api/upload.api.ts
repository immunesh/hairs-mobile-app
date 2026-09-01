import { apiClient } from "./client";

export async function uploadImage(formData: FormData) {
  const { data } = await apiClient.post<{ success: boolean; url: string }>("/upload/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}
