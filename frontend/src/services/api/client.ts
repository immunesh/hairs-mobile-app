import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

import type { ApiEnvelope, RefreshedTokens } from "./types";
import {
  clearTokens,
  emitForcedSignOut,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "./tokenStore";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api";

/** Origin of the backend, for assets served outside /api (e.g. /uploads). */
export const SERVER_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

/** Endpoints that must never trigger a token refresh on 401. */
const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/google"];

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});

/**
 * Access tokens expire after 15 minutes, so a 401 is refreshed once and the
 * original request replayed. Concurrent 401s share a single refresh call.
 */
let refreshInFlight: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const storedRefreshToken = getRefreshToken();
  if (!storedRefreshToken) throw new Error("No refresh token available");

  // Plain axios, not apiClient: this call must not re-enter these interceptors.
  const { data } = await axios.post<ApiEnvelope<RefreshedTokens>>(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken: storedRefreshToken },
    { headers: { "Content-Type": "application/json" }, timeout: 10000 }
  );

  await setTokens(data.data);
  return data.data.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;
    const isUnauthorized = error.response?.status === 401;
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => config?.url?.includes(path));

    if (!isUnauthorized || !config || config._retried || isAuthEndpoint) {
      throw error;
    }

    if (!getRefreshToken()) {
      await clearTokens();
      emitForcedSignOut();
      throw error;
    }

    config._retried = true;

    try {
      refreshInFlight = refreshInFlight ?? refreshAccessToken();
      const freshToken = await refreshInFlight;

      const headers = AxiosHeaders.from(config.headers);
      headers.set("Authorization", `Bearer ${freshToken}`);
      config.headers = headers;

      return apiClient.request(config);
    } catch {
      await clearTokens();
      emitForcedSignOut();
      throw error;
    } finally {
      refreshInFlight = null;
    }
  }
);

/**
 * Normalises the two response shapes the backend uses: `{ success, data }`
 * (auth, cart, wishlist) and bare payloads (categories, hero slides).
 */
export function unwrap<T>(payload: ApiEnvelope<T> | T): T {
  if (
    payload !== null &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    "success" in payload &&
    "data" in payload
  ) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}

/** Pulls the backend's `message` out of an error, with sensible fallbacks. */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) return message;

    if (error.code === "ECONNABORTED") return "The request timed out. Please try again.";
    if (!error.response) {
      return `Cannot reach the server at ${API_BASE_URL}. Is the backend running?`;
    }
  }

  return fallback;
}

/** Turns a stored image path into an absolute URL when it is server-relative. */
export function resolveAssetUrl(path: string | null | undefined) {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;

  return `${SERVER_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
