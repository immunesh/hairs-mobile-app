import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { colors } from "@/theme/colors";
import { getProfile, updateProfile } from "@/services/api/user.api";
import { queryKeys } from "@/services/query/keys";
import type { User } from "@/services/api/types";

export function ProfileScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const { data: user, isLoading, isError } = useQuery<User>({
    queryKey: queryKeys.currentUser,
    queryFn: getProfile,
  });

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.currentUser, updatedUser);
      setFirstName(updatedUser.firstName ?? "");
      setLastName(updatedUser.lastName ?? "");
      setPhone(updatedUser.phone ?? "");
    },
  });

  const onSave = () => {
    mutation.mutate({ firstName, lastName, phone });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color={colors.purple.DEFAULT} />
          </Pressable>
          <Text style={styles.title}>Personal Information</Text>
        </View>

        <View style={styles.card}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.purple.DEFAULT} />
            </View>
          ) : isError ? (
            <Text style={styles.errorText}>Unable to load profile. Please try again.</Text>
          ) : (
            <>
              <View style={styles.row}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
                </View>
              </View>

              <View style={styles.inputGroupFull}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput style={[styles.input, styles.inputDisabled]} value={email} editable={false} selectTextOnFocus={false} />
                <Text style={styles.hint}>Email cannot be changed</Text>
              </View>

              <View style={styles.inputGroupFull}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
                  placeholder="eg. 1234567890"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <Pressable style={styles.saveButton} onPress={onSave} disabled={mutation.isPending}>
                <Ionicons name="checkmark" size={16} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.saveText}>{mutation.isPending ? "Saving..." : "Save Changes"}</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { padding: 16, paddingTop: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginRight: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 20, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 20, elevation: 4 },
  loadingContainer: { minHeight: 220, alignItems: "center", justifyContent: "center" },
  errorText: { color: "#DC2626", textAlign: "center", marginBottom: 16 },
  row: { flexDirection: "row", gap: 12 },
  inputGroup: { flex: 1 },
  inputGroupFull: { marginTop: 16 },
  label: { color: "#374151", fontSize: 13, marginBottom: 8 },
  input: { backgroundColor: "#F8FAFC", borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB", padding: 14, color: "#111827", fontSize: 15 },
  inputDisabled: { opacity: 0.6 },
  hint: { marginTop: 6, color: "#9CA3AF", fontSize: 12 },
  saveButton: { marginTop: 24, backgroundColor: colors.purple.DEFAULT, paddingVertical: 14, borderRadius: 999, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  saveText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
