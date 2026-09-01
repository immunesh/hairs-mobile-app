import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { colors } from "@/theme/colors";
import type { RootStackParamList } from "@/core/navigation/types";
import { useRegister } from "@/features/auth/hooks";
import { GoogleSignInButton } from "@/features/auth/GoogleSignInButton";
import { getApiErrorMessage } from "@/services/api/client";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const register = useRegister();

  const errorMessage = formError ?? (register.error ? getApiErrorMessage(register.error) : null);

  const goToHome = () => navigation.reset({ index: 0, routes: [{ name: "Home" }] });

  const handleRegister = () => {
    const trimmedName = name.trim().replace(/\s+/g, " ");
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setFormError("Fill in your name, email and password.");
      return;
    }

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    // The API stores first and last name separately; the form collects one field.
    const [firstName, ...rest] = trimmedName.split(" ");

    setFormError(null);
    register.mutate(
      {
        firstName,
        lastName: rest.join(" "),
        email: trimmedEmail,
        password,
      },
      { onSuccess: goToHome }
    );
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={12}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Join HairsUp to get started</Text>

      <View style={styles.form}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor={colors.purple.light}
          autoCapitalize="words"
          editable={!register.isPending}
          style={styles.input}
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.purple.light}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          editable={!register.isPending}
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.purple.light}
          secureTextEntry
          editable={!register.isPending}
          onSubmitEditing={handleRegister}
          style={styles.input}
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable
          onPress={handleRegister}
          disabled={register.isPending}
          style={({ pressed }) => [
            styles.registerButton,
            pressed && styles.pressed,
            register.isPending && styles.disabled,
          ]}
        >
          {register.isPending ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.registerText}>Register</Text>
          )}
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <GoogleSignInButton onSuccess={goToHome} />

        <Pressable onPress={() => navigation.navigate("Login")} style={styles.loginLink}>
          <Text style={styles.loginLinkText}>Already have an account? Login</Text>
        </Pressable>
      </View>
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
  registerButton: {
    backgroundColor: colors.purple.DEFAULT,
    borderRadius: 999,
    paddingVertical: 14,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  registerText: {
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
  loginLink: {
    alignItems: "center",
    marginTop: 8,
  },
  loginLinkText: {
    color: colors.purple.DEFAULT,
    fontSize: 14,
    fontWeight: "600",
  },
});
