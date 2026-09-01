import React, { useState, useMemo } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

import { colors } from "@/theme/colors";
import { getOrders } from "@/services/api/order.api";
import { queryKeys } from "@/services/query/keys";
import { resolveAssetUrl } from "@/services/api/client";
import type { Order } from "@/services/api/types";

const ORDER_FILTERS = [
  { label: "All Orders", value: "ALL" },
  { label: "Order Placed", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Order Placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<string, { backgroundColor: string; textColor: string }> = {
  PENDING: { backgroundColor: "rgba(59,130,246,0.12)", textColor: "#2563EB" },
  CONFIRMED: { backgroundColor: "rgba(16,185,129,0.12)", textColor: "#10B981" },
  PROCESSING: { backgroundColor: "rgba(234,179,8,0.12)", textColor: "#D97706" },
  SHIPPED: { backgroundColor: "rgba(14,165,233,0.12)", textColor: "#0EA5E9" },
  OUT_FOR_DELIVERY: { backgroundColor: "rgba(34,197,94,0.12)", textColor: "#16A34A" },
  DELIVERED: { backgroundColor: "rgba(34,197,94,0.12)", textColor: "#16A34A" },
  CANCELLED: { backgroundColor: "rgba(220,38,38,0.12)", textColor: "#DC2626" },
};

export function OrderScreen() {
  const navigation = useNavigation();
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const { data: orders, isFetching, isError } = useQuery<Order[]>({
    queryKey: queryKeys.orders,
    queryFn: getOrders,
  });

  const filteredOrders = useMemo(
    () =>
      orders?.filter((order) => selectedStatus === "ALL" || order.status === selectedStatus) ?? [],
    [orders, selectedStatus]
  );

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.8} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.purple.DEFAULT} />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {ORDER_FILTERS.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[styles.filterChip, selectedStatus === item.value && styles.filterChipActive]}
            onPress={() => setSelectedStatus(item.value)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, selectedStatus === item.value && styles.filterTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isError ? (
        <View style={styles.emptyStateCard}>
          <Text style={styles.emptyStateText}>Unable to load your orders. Please try again.</Text>
        </View>
      ) : isFetching ? (
        <View style={styles.emptyStateCard}>
          <Text style={styles.emptyStateText}>No orders yet.</Text>
        </View>
      ) : !filteredOrders.length ? (
        <View style={styles.emptyStateCard}>
          <Text style={styles.emptyStateText}>No orders match this filter yet.</Text>
        </View>
      ) : (
        filteredOrders.map((order) => {
          const imageUrl = resolveAssetUrl(order.items?.[0]?.image) ??
            "https://images.unsplash.com/photo-1536305030019-8cc5e24d4dc4?auto=format&fit=crop&w=120&q=80";
          const statusInfo = STATUS_COLORS[order.status] ?? STATUS_COLORS.PENDING;

          return (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.rowTop}>
                <View style={styles.imageBox}>
                  <Image source={{ uri: imageUrl }} style={styles.productImage} />
                </View>
                <View style={styles.orderContent}>
                  <Text style={styles.productName}>{order.items[0]?.name ?? "Order item"}</Text>
                  <Text style={styles.orderMeta}>{order.orderNumber}</Text>
                  <Text style={styles.orderMeta}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>

              <View style={styles.orderRow}>
                <Text style={styles.label}>Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor }]}> 
                  <Text style={[styles.statusText, { color: statusInfo.textColor }]}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </Text>
                </View>
              </View>

              <View style={styles.orderRow}>
                <Text style={styles.label}>Total</Text>
                <Text style={styles.price}>₹{order.total.toFixed(0)}</Text>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.white },
  content: { padding: 16, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 10, elevation: 3, marginRight: 12 },
  title: { fontSize: 20, fontWeight: "700", color: colors.purple.dark },
  orderCard: { backgroundColor: "#fff", borderRadius: 18, padding: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  rowTop: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  imageBox: { width: 60, height: 60, borderRadius: 16, overflow: "hidden", backgroundColor: "#F8FAFC", marginRight: 12 },
  productImage: { width: "100%", height: "100%" },
  orderContent: { flex: 1 },
  productName: { fontSize: 15, fontWeight: "700", color: colors.purple.dark, marginBottom: 4 },
  orderMeta: { fontSize: 13, color: "#6B7280" },
  subtitle: { color: "#4B5563", fontSize: 14, lineHeight: 20, marginBottom: 16 },
  filterRow: { paddingBottom: 4, gap: 10 },
  filterChip: { backgroundColor: "#F8FAFC", borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, marginRight: 10, borderWidth: 1, borderColor: "#E5E7EB" },
  filterChipActive: { backgroundColor: colors.purple.DEFAULT, borderColor: colors.purple.DEFAULT },
  filterText: { color: "#374151", fontSize: 12, fontWeight: "600" },
  filterTextActive: { color: "#fff" },
  orderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  label: { fontSize: 13, color: "#6B7280" },
  statusBadge: { backgroundColor: "rgba(34,197,94,0.08)", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  statusText: { color: "#16A34A", fontSize: 13, fontWeight: "600" },
  price: { fontSize: 15, fontWeight: "700", color: colors.purple.dark },
  emptyStateCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  emptyStateText: { color: "#6B7280", fontSize: 14, textAlign: "center" },
});
