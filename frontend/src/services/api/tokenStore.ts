import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Tokens live in memory so the axios interceptors stay synchronous, and are
 * mirrored into AsyncStorage so a session survives an app reload.
 */

const ACCESS_TOKEN_KEY = "hairsup.accessToken";
const REFRESH_TOKEN_KEY = "hairsup.refreshToken";

let accessToken: string | null = null;
let refreshToken: string | null = null;

type SignOutListener = () => void;

const signOutListeners = new Set<SignOutListener>();

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken;
}

/** Reads persisted tokens into memory. Call once on app start. */
export async function hydrateTokens() {
  const storedTokens = await AsyncStorage.multiGet([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  const tokenMap = Object.fromEntries(storedTokens) as Record<string, string | null>;

  accessToken = tokenMap[ACCESS_TOKEN_KEY] ?? null;
  refreshToken = tokenMap[REFRESH_TOKEN_KEY] ?? null;

  return { accessToken, refreshToken };
}

export async function setTokens(tokens: { accessToken: string; refreshToken: string }) {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;

  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, tokens.accessToken],
    [REFRESH_TOKEN_KEY, tokens.refreshToken],
  ]);
}

export async function clearTokens() {
  accessToken = null;
  refreshToken = null;

  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
}

/**
 * Lets the auth layer react when the API client gives up on a session (refresh
 * token rejected), without the client importing the redux store.
 */
export function onForcedSignOut(listener: SignOutListener) {
  signOutListeners.add(listener);
  return () => signOutListeners.delete(listener);
}

export function emitForcedSignOut() {
  signOutListeners.forEach((listener) => listener());
}
