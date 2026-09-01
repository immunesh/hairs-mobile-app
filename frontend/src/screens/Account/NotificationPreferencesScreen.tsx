import React, { useState } from "react";
import { StyleSheet, View, Text, Switch, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { colors } from "@/theme/colors";

export function NotificationPreferencesScreen() {
  const navigation = useNavigation();
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [offersPromotions, setOffersPromotions] = useState(true);
  const [newArrivals, setNewArrivals] = useState(false);
  const [blogTips, setBlogTips] = useState(true);
  const [restockAlerts, setRestockAlerts] = useState(true);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color={colors.purple.DEFAULT} />
          </Pressable>
          <Text style={styles.title}>Notification Preferences</Text>
        </View>

        <View style={styles.card}>
          <PreferenceRow
            title="Order Updates"
            description="Get notified on order status changes"
            value={orderUpdates}
            onValueChange={setOrderUpdates}
          />
          <PreferenceRow
            title="Offers & Promotions"
            description="Exclusive deals and discounts"
            value={offersPromotions}
            onValueChange={setOffersPromotions}
          />
          <PreferenceRow
            title="New Arrivals"
            description="Be first to know about new products"
            value={newArrivals}
            onValueChange={setNewArrivals}
          />
          <PreferenceRow
            title="Blog & Style Tips"
            description="Weekly hair care and styling guides"
            value={blogTips}
            onValueChange={setBlogTips}
          />
          <PreferenceRow
            title="Restock Alerts"
            description="Notify when wishlist items are back"
            value={restockAlerts}
            onValueChange={setRestockAlerts}
          />

          <Pressable style={styles.saveButton} onPress={() => navigation.goBack()}>
            <Text style={styles.saveText}>Save Preferences</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PreferenceRow({ title, description, value, onValueChange }: { title: string; description: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceText}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E5E7EB", true: colors.purple.DEFAULT }}
        thumbColor={value ? "#fff" : "#F9FAFB"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { padding: 16, paddingTop: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, elevation: 2, marginRight: 12 },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 20, elevation: 4 },
  preferenceRow: { backgroundColor: "#F8FAFC", borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  preferenceText: { flex: 1, paddingRight: 12 },
  preferenceTitle: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 4 },
  preferenceDescription: { fontSize: 13, color: "#6B7280" },
  saveButton: { marginTop: 12, backgroundColor: colors.purple.DEFAULT, borderRadius: 999, paddingVertical: 14, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
