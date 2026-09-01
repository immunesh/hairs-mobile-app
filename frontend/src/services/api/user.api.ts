import { apiClient, unwrap } from "./client";
import type { ApiEnvelope, User } from "./types";

export async function getProfile() {
  const { data } = await apiClient.get<ApiEnvelope<User>>("/users/profile");
  return unwrap(data);
}

export async function updateProfile(payload: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string | null;
}) {
  const { data } = await apiClient.put<ApiEnvelope<User>>("/users/profile", payload);
  return unwrap(data);
}
