import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, Modal, Platform, Alert } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { colors } from "@/theme/colors";
import type { RootStackParamList } from "@/core/navigation/types";
import { useLogin } from "@/features/auth/hooks";
import { GoogleSignInButton } from "@/features/auth/GoogleSignInButton";
import { getApiErrorMessage } from "@/services/api/client";
import { forgotPassword } from "@/services/api/auth.api";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

  const login = useLogin();

  const errorMessage = formError ?? (login.error ? getApiErrorMessage(login.error) : null);

  // Reset the stack so Back cannot return to the login screen.
  const goToHome = () => navigation.reset({ index: 0, routes: [{ name: "Home" }] });

  const handleLogin = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setFormError("Please enter both email and password.");
      return;
    }

    setFormError(null);
    login.mutate(
      { email: trimmedEmail, password },
      {
        onSuccess: goToHome,
      }
    );
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = forgotEmail.trim();
    if (!trimmedEmail) {
      if (Platform.OS === "web") {
        window.alert("Please enter your email address.");
      } else {
        Alert.alert("Error", "Please enter your email address.");
      }
      return;
    }
    setIsSendingReset(true);
    try {
      await forgotPassword(trimmedEmail);
      setIsSendingReset(false);
      setForgotModalVisible(false);
      const successMsg = `A temporary password has been sent to ${trimmedEmail}`;
      if (Platform.OS === "web") {
        window.alert(successMsg);
      } else {
        Alert.alert("Reset Password", successMsg);
      }
      setForgotEmail("");
    } catch (err: any) {
      setIsSendingReset(false);
      const errorMsg = getApiErrorMessage(err, "Failed to send reset link.");
      if (Platform.OS === "web") {
        window.alert(errorMsg);
      } else {
        Alert.alert("Error", errorMsg);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={12}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Login to continue with HairsUp</Text>

      <View style={styles.form}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.purple.light}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          editable={!login.isPending}
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.purple.light}
          secureTextEntry
          editable={!login.isPending}
          onSubmitEditing={handleLogin}
          style={styles.input}
        />

        <Pressable onPress={() => setForgotModalVisible(true)} style={styles.forgotLink}>
          <Text style={styles.forgotLinkText}>Forgot Password?</Text>
        </Pressable>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable
          onPress={handleLogin}
          disabled={login.isPending}
          style={({ pressed }) => [
            styles.loginButton,
            pressed && styles.pressed,
            login.isPending && styles.disabled,
          ]}
        >
          {login.isPending ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.loginText}>Login</Text>
          )}
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <GoogleSignInButton onSuccess={goToHome} />

        <Pressable onPress={() => navigation.navigate("Register")} style={styles.registerLink}>
          <Text style={styles.registerLinkText}>Don't have an account? Register</Text>
        </Pressable>
      </View>

      <Modal visible={forgotModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Forgot Password</Text>
            <Text style={styles.modalSubtitle}>Enter your email address and we'll send you a link to reset your password.</Text>
            <TextInput
              value={forgotEmail}
              onChangeText={setForgotEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.purple.light}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.modalInput}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalOutlineButton} onPress={() => setForgotModalVisible(false)}>
                <Text style={styles.modalOutlineText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSaveButton} onPress={handleForgotPassword} disabled={isSendingReset}>
                {isSendingReset ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Send Link</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 32,
    paddingTop: 64,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 32,
  },
  backText: {
    color: colors.purple.DEFAULT,
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.purple.dark,
  },
  subtitle: {
    fontSize: 15,
    color: colors.purple.DEFAULT,
    marginTop: 8,
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.purple.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.purple.dark,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.6,
  },
  errorText: {
    color: "#B3261E",
    fontSize: 13,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: colors.purple.DEFAULT,
    borderRadius: 999,
    paddingVertical: 14,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  loginText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.purple.light,
  },
  dividerText: {
    color: colors.purple.DEFAULT,
    fontSize: 13,
    fontWeight: "600",
  },
  registerLink: {
    alignItems: "center",
    marginTop: 8,
  },
  registerLinkText: {
    color: colors.purple.DEFAULT,
    fontSize: 14,
    fontWeight: "600",
  },
  forgotLink: {
    alignSelf: "flex-end",
    marginTop: -4,
  },
  forgotLinkText: {
    color: colors.purple.DEFAULT,
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.purple.dark,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: colors.purple.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.purple.dark,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalOutlineButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.purple.DEFAULT,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOutlineText: {
    color: colors.purple.DEFAULT,
    fontWeight: "700",
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: colors.purple.DEFAULT,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveText: {
    color: "#fff",
    fontWeight: "700",
  },
});
