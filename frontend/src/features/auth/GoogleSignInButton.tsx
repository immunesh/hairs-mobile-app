import { Alert, Pressable, StyleSheet, Text } from "react-native";

import { colors } from "@/theme/colors";

type Props = {
  onSuccess: () => void;
};

/**
 * Native (iOS/Android) placeholder. Google Sign-In there needs its own OAuth
 * client IDs per platform plus a custom dev build — see GoogleSignInButton.web.tsx
 * for the working web implementation.
 */
export function GoogleSignInButton(_props: Props) {
  return (
    <Pressable
      onPress={() =>
        Alert.alert("Coming soon", "Google Sign-In on mobile isn't set up yet — use email login for now.")
      }
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.text}>Continue with Google</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    borderColor: colors.purple.light,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.75,
  },
  text: {
    color: colors.purple.dark,
    fontSize: 16,
    fontWeight: "600",
  },
});
