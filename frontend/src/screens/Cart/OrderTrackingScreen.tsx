import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

import { colors } from "@/theme/colors";
import type { RootStackParamList } from "@/core/navigation/types";
import { getOrders } from "@/services/api/order.api";
import { queryKeys } from "@/services/query/keys";

export function OrderTrackingScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "OrderTracking">>();
  const orderParam = route.params?.order;

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: queryKeys.orders,
    queryFn: getOrders,
    enabled: !orderParam,
  });

  const order = orderParam ?? orders[0];

  if (!order && ordersLoading) {
    return (
      <View style={[styles.wrapper, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.purple.DEFAULT} />
      </View>
    );
  }

  const orderNumber = order?.orderNumber || "HU-UNKNOWN";
  const dateStr = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    : "Recently";

  const formatPrice = (value: number) => {
    return `₹${Math.round(value).toLocaleString("en-IN")}`;
  };

  const STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
  const currentStepIndex = STEPS.indexOf(order?.status || "PENDING");

  const getDotStyle = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return styles.timelineDotComplete;
    if (stepIndex === currentStepIndex) return styles.timelineDotActive;
    return styles.timelineDotEmpty;
  };

  const getDotIcon = (stepIndex: number, defaultIcon: string) => {
    if (stepIndex < currentStepIndex) return "checkmark";
    return defaultIcon as any;
  };

  const trackingText = order?.awbNumber
    ? `${order.courier || "Standard Courier"}: ${order.awbNumber}`
    : "Not Available Yet";

  const address = order?.address;
  const paymentMethod = order?.paymentMethod || "COD";
  const paymentStatus = order?.paymentStatus || "PENDING";

  const subtotal = order?.subtotal || 0;
  const discount = order?.discount || 0;
  const shipping = order?.shipping || 0;
  const gst = order?.tax || 0;
  const total = order?.total || 0;

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.purple.dark} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle} numberOfLines={1}>Order {orderNumber}</Text>
          <Text style={styles.pageSubtitle}>Placed on {dateStr}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{order?.status || "Order Placed"}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tracking Number</Text>
          <Text style={styles.trackingText}>{trackingText}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Tracking</Text>
          <View style={styles.timeline}>
            <View style={styles.timelinePointRow}>
              <View style={[styles.timelineDot, getDotStyle(0)]}>
                <Ionicons name={getDotIcon(0, "checkmark")} size={12} color="#fff" />
              </View>
              <View style={styles.timelineTextBox}>
                <Text style={styles.timelineTitle}>Order Placed</Text>
                <Text style={styles.timelineMeta}>Completed</Text>
              </View>
            </View>

            <View style={styles.timelineSegment} />

            <View style={styles.timelinePointRow}>
              <View style={[styles.timelineDot, getDotStyle(1)]}>
                <Ionicons name={getDotIcon(1, "checkbox-outline")} size={12} color={currentStepIndex >= 1 ? "#fff" : "#9CA3AF"} />
              </View>
              <View style={styles.timelineTextBox}>
                <Text style={styles.timelineTitle}>Confirmed</Text>
              </View>
            </View>

            <View style={styles.timelineSegment} />

            <View style={styles.timelinePointRow}>
              <View style={[styles.timelineDot, getDotStyle(2)]}>
                <Ionicons name={getDotIcon(2, "cube")} size={12} color={currentStepIndex >= 2 ? "#fff" : "#9CA3AF"} />
              </View>
              <View style={styles.timelineTextBox}>
                <Text style={styles.timelineTitle}>Processing</Text>
              </View>
            </View>

            <View style={styles.timelineSegment} />

            <View style={styles.timelinePointRow}>
              <View style={[styles.timelineDot, getDotStyle(3)]}>
                <Ionicons name={getDotIcon(3, "airplane-outline")} size={12} color={currentStepIndex >= 3 ? "#fff" : "#9CA3AF"} />
              </View>
              <View style={styles.timelineTextBox}>
                <Text style={styles.timelineTitle}>Shipped</Text>
              </View>
            </View>

            <View style={styles.timelineSegment} />

            <View style={styles.timelinePointRow}>
              <View style={[styles.timelineDot, getDotStyle(4)]}>
                <Ionicons name={getDotIcon(4, "location-outline")} size={12} color={currentStepIndex >= 4 ? "#fff" : "#9CA3AF"} />
              </View>
              <View style={styles.timelineTextBox}>
                <Text style={styles.timelineTitle}>Out for Delivery</Text>
              </View>
            </View>

            <View style={styles.timelineSegment} />

            <View style={styles.timelinePointRow}>
              <View style={[styles.timelineDot, getDotStyle(5)]}>
                <Ionicons name={getDotIcon(5, "checkmark-done-outline")} size={12} color={currentStepIndex >= 5 ? "#fff" : "#9CA3AF"} />
              </View>
              <View style={styles.timelineTextBox}>
                <Text style={styles.timelineTitle}>Delivered</Text>
              </View>
            </View>
          </View>

          <View style={styles.activityCard}>
            <Text style={styles.activityTitle}>Activity Log</Text>
            <View style={styles.activityRow}>
              <View style={styles.activityIcon}>
                <Ionicons name="checkmark-done" size={16} color={colors.purple.DEFAULT} />
              </View>
              <View>
                <Text style={styles.activityText}>
                  {order?.status === "DELIVERED" ? "Delivered successfully." : "Order is in progress."}
                </Text>
                <Text style={styles.activityMeta}>{dateStr}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Delivery Address</Text>
            {address ? (
              <>
                <Text style={styles.infoText}>{address.fullName}</Text>
                <Text style={styles.infoText}>{address.line1}</Text>
                {address.line2 ? <Text style={styles.infoText}>{address.line2}</Text> : null}
                <Text style={styles.infoText}>{address.city}, {address.state} — {address.pincode}</Text>
                <Text style={styles.infoText}>{address.country || "India"}</Text>
                <Text style={styles.infoText}>📞 {address.phone}</Text>
              </>
            ) : (
              <Text style={styles.infoText}>Address details not found.</Text>
            )}
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={styles.infoText}>Method: {paymentMethod}</Text>
            <Text style={[styles.infoText, styles.paymentStatus]}>Status: {paymentStatus}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Price Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>{formatPrice(subtotal)}</Text>
          </View>
          {discount > 0 ? (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Discount</Text>
              <Text style={[styles.priceValue, { color: "#10B981" }]}>-{formatPrice(discount)}</Text>
            </View>
          ) : null}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Shipping</Text>
            <Text style={styles.priceValue}>{shipping === 0 ? "FREE" : formatPrice(shipping)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>GST (18%)</Text>
            <Text style={styles.priceValue}>{formatPrice(gst)}</Text>
          </View>
          <View style={styles.priceRowTotal}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.white },
  page: { padding: 16, paddingBottom: 32, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6", backgroundColor: "#fff" },
  backButton: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  pageTitle: { fontSize: 18, fontWeight: "800", color: colors.purple.dark },
  pageSubtitle: { color: "#6B7280", fontSize: 12, marginTop: 2 },
  statusPill: { alignSelf: "flex-start", backgroundColor: "#F8F0FF", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, marginTop: 12 },
  statusPillText: { color: colors.purple.DEFAULT, fontWeight: "700", fontSize: 12 },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 18, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 12, elevation: 3, gap: 18 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.purple.dark, marginBottom: 10 },
  trackingText: { fontSize: 14, color: "#6B7280" },
  timeline: { gap: 16 },
  timelinePointRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  timelineDot: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  timelineDotComplete: { backgroundColor: colors.purple.DEFAULT },
  timelineDotActive: { backgroundColor: colors.purple.DEFAULT },
  timelineDotEmpty: { backgroundColor: "#E5E7EB" },
  timelineTextBox: { flex: 1 },
  timelineTitle: { fontSize: 14, fontWeight: "700", color: colors.purple.dark },
  timelineMeta: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  timelineStatusBadge: { backgroundColor: "#F8F0FF", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  timelineStatusText: { color: colors.purple.DEFAULT, fontSize: 11, fontWeight: "700" },
  timelineSegment: { width: 2, height: 18, backgroundColor: "#E5E7EB", marginLeft: 15, marginBottom: 0 },
  activityCard: { backgroundColor: "#F8F5FF", borderRadius: 20, padding: 16, marginTop: 10 },
  activityTitle: { fontSize: 14, fontWeight: "700", color: colors.purple.dark, marginBottom: 12 },
  activityRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  activityIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(139,92,246,0.16)", alignItems: "center", justifyContent: "center" },
  activityText: { fontSize: 13, fontWeight: "700", color: colors.purple.DEFAULT },
  activityMeta: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  infoRow: { gap: 16 },
  infoCard: { backgroundColor: "#fff", borderRadius: 24, padding: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 12, elevation: 3 },
  infoLabel: { fontSize: 13, fontWeight: "700", color: colors.purple.dark, marginBottom: 10 },
  infoText: { fontSize: 13, color: "#4B5563", lineHeight: 20 },
  paymentStatus: { color: "#F97316", fontWeight: "800", marginTop: 6 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  priceLabel: { fontSize: 13, color: "#6B7280" },
  priceValue: { fontSize: 13, fontWeight: "700", color: colors.purple.dark },
  priceRowTotal: { flexDirection: "row", justifyContent: "space-between", paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F3F4F6", marginTop: 6 },
  totalLabel: { fontSize: 14, fontWeight: "800", color: colors.purple.dark },
  totalValue: { fontSize: 14, fontWeight: "900", color: colors.purple.DEFAULT },
});
