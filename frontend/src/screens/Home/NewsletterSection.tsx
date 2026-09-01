import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    const trimmed = email.trim();

    if (!EMAIL_PATTERN.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }

    setError(null);
    setSubscribed(true);
  };

  return (
    <View style={styles.container}>
      <Ionicons name="sparkles" size={28} color={colors.purple.DEFAULT} />

      <Text style={styles.title}>Get Exclusive Offers & Style Tips</Text>
      <Text style={styles.subtitle}>
        Join 2 lakh+ subscribers. Get first access to new arrivals, styling tips, and exclusive
        discounts.
      </Text>

      {subscribed ? (
        <View style={styles.successRow}>
          <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
          <Text style={styles.successText}>You're subscribed! Check your inbox soon.</Text>
        </View>
      ) : (
        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (error) setError(null);
            }}
            placeholder="Enter your email address"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            style={styles.input}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            onPress={handleSubscribe}
            style={({ pressed }) => [styles.subscribeButton, pressed && styles.pressed]}
          >
            <Text style={styles.subscribeButtonText}>Subscribe Free</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.caption}>No spam. Unsubscribe anytime. We respect your privacy.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    marginHorizontal: 20,
    borderRadius: 24,
    backgroundColor: "#F6F1FA",
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.85,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F1233",
    textAlign: "center",
    marginTop: 14,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 22,
  },
  form: {
    width: "100%",
    gap: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5D9F0",
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 13,
    fontSize: 14,
    color: "#1F1233",
  },
  errorText: {
    color: "#B3261E",
    fontSize: 12,
    fontWeight: "600",
    marginTop: -4,
    marginLeft: 6,
  },
  subscribeButton: {
    backgroundColor: colors.purple.DEFAULT,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  subscribeButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  successRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 13,
    width: "100%",
    justifyContent: "center",
  },
  successText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F1233",
    flexShrink: 1,
  },
  caption: {
    fontSize: 12,
    color: "#9B93A6",
    textAlign: "center",
    marginTop: 16,
  },
});
