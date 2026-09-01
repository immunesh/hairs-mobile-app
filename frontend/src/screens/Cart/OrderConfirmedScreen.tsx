import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { colors } from "@/theme/colors";

export function OrderConfirmedScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.page} style={styles.wrapper} showsVerticalScrollIndicator={false}>
      <View style={styles.statusBadge}>
        <Ionicons name="checkmark" size={28} color={colors.purple.DEFAULT} />
      </View>
      <Text style={styles.title}>Order Confirmed!</Text>
      <Text style={styles.subtitle}>Thank you for your order. We&apos;re getting it ready for you!</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.sectionLabel}>Order Number</Text>
            <Text style={styles.orderNumber}>HU-MS7WK97A-JV27</Text>
          </View>
          <TouchableOpacity style={styles.invoiceButton} activeOpacity={0.85}>
            <Ionicons name="download-outline" size={16} color={colors.purple.DEFAULT} />
            <Text style={styles.invoiceText}>Invoice</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timelineItem}> 
          <View style={[styles.timelineDot, styles.timelineDotCompleted]}>
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineLabel}>Order Placed</Text>
            <Text style={styles.timelineMeta}>Just now</Text>
          </View>
        </View>

        <View style={styles.timelineItem}> 
          <View style={[styles.timelineDot, styles.timelineDotActive]}>
            <Ionicons name="cube" size={12} color="#fff" />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineLabel}>Processing</Text>
            <Text style={styles.timelineMeta}>Within 24 hours</Text>
          </View>
          <View style={styles.timelineStatusBadge}>
            <Text style={styles.timelineStatusText}>In Progress</Text>
          </View>
        </View>

        <View style={styles.timelineItem}> 
          <View style={[styles.timelineDot, styles.timelineDotInactive]}>
            <Ionicons name="cube" size={12} color="#9CA3AF" />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineLabel}>Shipped</Text>
            <Text style={styles.timelineMeta}>1-2 business days</Text>
          </View>
        </View>

        <View style={styles.timelineItem}> 
          <View style={[styles.timelineDot, styles.timelineDotInactive]}>
            <Ionicons name="location-outline" size={12} color="#9CA3AF" />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineLabel}>Out for Delivery</Text>
            <Text style={styles.timelineMeta}>3-5 business days</Text>
          </View>
        </View>

        <View style={styles.timelineItem}> 
          <View style={[styles.timelineDot, styles.timelineDotInactive]}>
            <Ionicons name="checkmark-done-outline" size={12} color="#9CA3AF" />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineLabel}>Delivered</Text>
            <Text style={styles.timelineMeta}>Expected Wednesday, 5 August</Text>
          </View>
        </View>

        <View style={styles.estimateBox}>
          <Text style={styles.estimateLabel}>Estimated Delivery: Wednesday, 5 August</Text>
          <Text style={styles.estimateText}>You will receive an email + SMS with tracking details.</Text>
        </View>
      </View>

      <View style={styles.actionRow}> 
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9} onPress={() => navigation.navigate("OrderTracking" as never)}>
          <Text style={styles.primaryText}>Track Order</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.9} onPress={() => navigation.navigate("Home" as never)}>
          <Text style={styles.secondaryText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.reviewCard}>
        <Ionicons name="star" size={20} color={colors.purple.DEFAULT} style={{ marginBottom: 10 }} />
        <Text style={styles.reviewTitle}>Enjoying your new wig?</Text>
        <Text style={styles.reviewSubtitle}>Share your experience and help others find their perfect style.</Text>
        <TouchableOpacity activeOpacity={0.9}>
          <Text style={styles.reviewLink}>Write a Review →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.white },
  page: { padding: 16, paddingBottom: 32, gap: 18 },
  statusBadge: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(165,243,252,0.2)", alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: 24 },
  title: { textAlign: "center", fontSize: 24, fontWeight: "800", color: colors.purple.dark, marginTop: 14 },
  subtitle: { textAlign: "center", color: "#6B7280", fontSize: 14, lineHeight: 20, marginTop: 8 },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 16, elevation: 4, marginTop: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  sectionLabel: { color: "#6B7280", fontSize: 12, fontWeight: "700", textTransform: "uppercase", marginBottom: 6 },
  orderNumber: { fontSize: 18, fontWeight: "800", color: colors.purple.DEFAULT },
  invoiceButton: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: colors.purple.DEFAULT, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  invoiceText: { color: colors.purple.DEFAULT, fontSize: 13, fontWeight: "700" },
  timelineItem: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 },
  timelineDot: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  timelineDotCompleted: { backgroundColor: "#22C55E" },
  timelineDotActive: { backgroundColor: colors.purple.DEFAULT },
  timelineDotInactive: { backgroundColor: "#E5E7EB" },
  timelineContent: { flex: 1 },
  timelineLabel: { fontSize: 14, fontWeight: "700", color: colors.purple.dark },
  timelineMeta: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  timelineStatusBadge: { backgroundColor: "#F5E8FF", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  timelineStatusText: { color: colors.purple.DEFAULT, fontSize: 11, fontWeight: "700" },
  estimateBox: { backgroundColor: "#F8F0FF", borderRadius: 20, padding: 16, marginTop: 12 },
  estimateLabel: { color: colors.purple.DEFAULT, fontSize: 14, fontWeight: "700", marginBottom: 6 },
  estimateText: { fontSize: 13, color: "#6B7280", lineHeight: 20 },
  actionRow: { flexDirection: "column", gap: 12, marginTop: 6 },
  primaryButton: { backgroundColor: colors.purple.DEFAULT, borderRadius: 999, paddingVertical: 16, alignItems: "center" },
  primaryText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  secondaryButton: { backgroundColor: "#fff", borderRadius: 999, paddingVertical: 16, alignItems: "center", borderWidth: 1, borderColor: colors.purple.DEFAULT },
  secondaryText: { color: colors.purple.DEFAULT, fontSize: 15, fontWeight: "700" },
  reviewCard: { backgroundColor: "#fff", borderRadius: 24, padding: 20, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 12, elevation: 3 },
  reviewTitle: { fontSize: 16, fontWeight: "800", color: colors.purple.dark, marginBottom: 8, textAlign: "center" },
  reviewSubtitle: { fontSize: 13, color: "#6B7280", textAlign: "center", lineHeight: 20, marginBottom: 12 },
  reviewLink: { color: colors.purple.DEFAULT, fontSize: 14, fontWeight: "700" },
});
