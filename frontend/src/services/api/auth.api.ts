import { apiClient, unwrap } from "./client";
import type {
  ApiEnvelope,
  AuthSession,
  LoginPayload,
  RegisterPayload,
  User,
} from "./types";

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<ApiEnvelope<AuthSession>>("/auth/login", payload);
  return unwrap(data);
}

export async function register(payload: RegisterPayload) {
  const { data } = await apiClient.post<ApiEnvelope<AuthSession>>("/auth/register", payload);
  return unwrap(data);
}

export async function googleAuth(credential: string) {
  const { data } = await apiClient.post<ApiEnvelope<AuthSession>>("/auth/google", { credential });
  return unwrap(data);
}

export async function getCurrentUser() {
  const { data } = await apiClient.get<ApiEnvelope<User>>("/auth/me");
  return unwrap(data);
}

export async function logout(refreshToken: string | null) {
  await apiClient.post("/auth/logout", refreshToken ? { refreshToken } : {});
}

export async function forgotPassword(email: string) {
  const { data } = await apiClient.post<ApiEnvelope<{ message: string }>>("/auth/forgot-password", { email });
  return unwrap(data);
}
