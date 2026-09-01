import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { getApiErrorMessage } from "@/services/api/client";
import { useGoogleAuth } from "./hooks";
import { loadGoogleIdentityScript } from "./googleIdentityScript.web";

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

type Props = {
  onSuccess: () => void;
};

/**
 * Renders Google's own "Sign in with Google" button via Google Identity
 * Services. GIS mounts into a plain DOM node (not a React tree it controls),
 * so the button lives in a raw <div ref> rather than an RN <View> child.
 */
export function GoogleSignInButton({ onSuccess }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scriptError, setScriptError] = useState<string | null>(null);

  const googleAuth = useGoogleAuth();

  // GIS's `callback` closes over whatever was passed to `initialize`, which
  // only runs once. This ref lets that one callback always see latest props.
  const handleCredentialRef = useRef((_credential: string) => {});
  handleCredentialRef.current = (credential: string) => {
    googleAuth.mutate(credential, { onSuccess });
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !containerWidth) return;

    let cancelled = false;

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !mountRef.current) return;

        window.google!.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => handleCredentialRef.current(response.credential),
          use_fedcm_for_prompt: true,
        });

        mountRef.current.innerHTML = "";
        window.google!.accounts.id.renderButton(mountRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: Math.min(containerWidth, 400),
        });
      })
      .catch((error: Error) => {
        if (!cancelled) setScriptError(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [containerWidth]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <Text style={styles.configErrorText}>
        Google Sign-In is not configured. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID and restart Expo.
      </Text>
    );
  }

  return (
    <View>
      <View
        style={styles.mountPoint}
        onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
      >
        <div ref={mountRef} />
      </View>

      {googleAuth.isPending ? (
        <View style={styles.overlay}>
          <ActivityIndicator color={colors.purple.DEFAULT} />
        </View>
      ) : null}

      {scriptError ? <Text style={styles.errorText}>{scriptError}</Text> : null}
      {googleAuth.isError ? (
        <Text style={styles.errorText}>{getApiErrorMessage(googleAuth.error)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  mountPoint: {
    width: "100%",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  errorText: {
    color: "#B3261E",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  configErrorText: {
    color: "#B3261E",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
