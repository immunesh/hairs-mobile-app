import React, { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import * as authApi from "@/services/api/auth.api";
import {
  clearTokens,
  getRefreshToken,
  hydrateTokens,
  onForcedSignOut,
  setTokens,
} from "@/services/api/tokenStore";
import type { AuthSession, LoginPayload, RegisterPayload } from "@/services/api/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signedIn, signedOut } from "./authSlice";

export function useAuth() {
  const { user, status } = useAppSelector((state) => state.auth);

  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    isRestoring: status === "restoring",
  };
}

/**
 * Restores a persisted session on app start and reacts to the API client
 * giving up on an expired refresh token.
 */
export function useSessionBootstrap() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const { accessToken } = await hydrateTokens();
        if (!accessToken) {
          if (!cancelled) dispatch(signedOut());
          return;
        }

        const user = await authApi.getCurrentUser();
        if (!cancelled) {
          dispatch(signedIn(user));
          await queryClient.invalidateQueries();
        }
      } catch {
        await clearTokens();
        if (!cancelled) dispatch(signedOut());
      } finally {
        if (!cancelled) setIsReady(true);
      }
    }

    restore();

    const unsubscribe = onForcedSignOut(() => {
      dispatch(signedOut());
      queryClient.clear();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [dispatch, queryClient]);

  return isReady;
}

function useSessionMutation<TPayload>(
  mutationFn: (payload: TPayload) => Promise<AuthSession>
) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async (session) => {
      await setTokens({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      });
      dispatch(signedIn(session.user));
      await queryClient.invalidateQueries();
    },
  });
}

export function useLogin() {
  return useSessionMutation<LoginPayload>(authApi.login);
}

export function useRegister() {
  return useSessionMutation<RegisterPayload>(authApi.register);
}

/** Exchanges a Google Identity Services ID token for a HairsUp session. */
export function useGoogleAuth() {
  return useSessionMutation<string>(authApi.googleAuth);
}

export function useLogout() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // The server-side token revoke is best-effort; the local session is
      // cleared either way.
      await authApi.logout(getRefreshToken()).catch(() => undefined);
      await clearTokens();
    },
    onSuccess: () => {
      dispatch(signedOut());
      queryClient.clear();
    },
  });
}
