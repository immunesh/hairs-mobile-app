import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { colors } from "@/theme/colors";
import { useToggleWishlist, useWishlist } from "@/features/products/hooks";
import { resolveAssetUrl } from "@/services/api/client";

export function WishlistScreen() {
  const navigation = useNavigation();
  const wishlist = useWishlist();
  const toggleWishlist = useToggleWishlist();

  const items = wishlist.data ?? [];
  const isLoading = wishlist.isFetching && !items.length;
  const hasError = wishlist.isError;

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.8} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.purple.DEFAULT} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>My Wishlist</Text>
          <Text style={styles.countText}>({items.length} items)</Text>
        </View>
      </View>

      {hasError ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Unable to load your wishlist. Please try again.</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Loading wishlist…</Text>
        </View>
      ) : !items.length ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Your wishlist is empty.</Text>
        </View>
      ) : (
        items.map((item) => {
          const imageUrl = resolveAssetUrl(item.product.images?.[0]?.url) ??
            "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=420&q=80";
          const salePrice = item.product.salePrice ?? item.product.basePrice;
          const originalPrice = item.product.salePrice ? `₹${item.product.basePrice}` : "";

          return (
            <View style={styles.card} key={item.id}>
              <View style={styles.imageWrapper}>
                <Image source={{ uri: imageUrl }} style={styles.image} />
                {item.product.salePrice ? (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{`-${Math.round(
                      ((item.product.basePrice - item.product.salePrice) / item.product.basePrice) * 100
                    )}%`}</Text>
                  </View>
                ) : null}
                <TouchableOpacity
                  style={styles.deleteButton}
                  activeOpacity={0.8}
                  onPress={() => toggleWishlist.toggle(item.productId)}
                  disabled={toggleWishlist.isPending}
                >
                  <Ionicons name="trash" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.productTitle}>{item.product.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{salePrice}</Text>
                  {originalPrice ? <Text style={styles.originalPrice}>{originalPrice}</Text> : null}
                </View>
                <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
                  <Ionicons name="bag-handle" size={16} color="#fff" style={styles.addIcon} />
                  <Text style={styles.addButtonText}>Add to Bag</Text>
                </TouchableOpacity>
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
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  title: { fontSize: 22, fontWeight: "700", color: colors.purple.dark },
  countText: { marginTop: 4, fontSize: 13, color: "#6B7280" },
  emptyState: { backgroundColor: "#fff", borderRadius: 24, padding: 18, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  emptyText: { color: "#6B7280", fontSize: 14, textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: 18, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, marginBottom: 12 },
  imageWrapper: { position: "relative", width: "100%", aspectRatio: 0.9, backgroundColor: "#F8FAFC" },
  image: { width: "100%", height: "100%" },
  discountBadge: { position: "absolute", top: 10, left: 10, backgroundColor: "#FECACA", paddingHorizontal: 7, paddingVertical: 4, borderRadius: 999 },
  discountText: { color: "#B91C1C", fontSize: 10, fontWeight: "700" },
  deleteButton: { position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: 10, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardBody: { padding: 12 },
  productTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 6 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  price: { fontSize: 15, fontWeight: "700", color: colors.purple.dark },
  originalPrice: { fontSize: 12, color: "#9CA3AF", textDecorationLine: "line-through" },
  addButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.purple.DEFAULT, paddingVertical: 10, borderRadius: 999, marginTop: 4 },
  addIcon: { marginRight: 6 },
  addButtonText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
