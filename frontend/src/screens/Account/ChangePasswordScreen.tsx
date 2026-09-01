import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, Pressable, ScrollView, Platform, KeyboardAvoidingView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { colors } from "@/theme/colors";

export function ChangePasswordScreen() {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color={colors.purple.DEFAULT} />
          </Pressable>
          <Text style={styles.title}>Change Password</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              secureTextEntry
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              secureTextEntry
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              secureTextEntry
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <Pressable style={styles.saveButton} onPress={() => {}}>
            <Ionicons name="lock-closed" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.saveText}>Update Password</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { padding: 16, paddingTop: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, elevation: 2, marginRight: 12 },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 20, elevation: 4 },
  fieldGroup: { marginBottom: 16 },
  label: { color: "#374151", fontSize: 13, marginBottom: 8 },
  input: { backgroundColor: "#F8FAFC", borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", paddingHorizontal: 16, paddingVertical: 14, color: "#111827", fontSize: 15 },
  saveButton: { marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.purple.DEFAULT, borderRadius: 999, paddingVertical: 14 },
  saveText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
