import { ActivityIndicator, StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";

import { colors } from "@/theme/colors";
import { useCart, useRemoveFromCart, useUpdateCartItem } from "@/features/products/hooks";
import { resolveAssetUrl } from "@/services/api/client";
import { validateCoupon } from "@/services/api/coupon.api";

export function CartScreen() {
  const navigation = useNavigation<any>();
  const { data: cartItems = [], isPending, isError } = useCart();
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();

  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string; discountAmount: number} | null>(null);

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product.salePrice ?? item.product.basePrice;
    return acc + price * item.quantity;
  }, 0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    try {
      const res = await validateCoupon(couponCode, subtotal);
      if (res.isValid && res.discountAmount) {
        setAppliedCoupon({ code: couponCode.trim(), discountAmount: res.discountAmount });
        if (Platform.OS === 'web') window.alert("Coupon applied successfully!");
      } else {
        if (Platform.OS === 'web') window.alert(res.message || "Invalid coupon");
        else Alert.alert("Error", res.message || "Invalid coupon");
        setAppliedCoupon(null);
      }
    } catch (error: any) {
      if (Platform.OS === 'web') window.alert(error?.message || "Failed to apply coupon");
      else Alert.alert("Error", error?.message || "Failed to apply coupon");
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleUpdateQuantity = (id: string, currentQty: number, delta: number) => {
    const nextQty = currentQty + delta;
    if (nextQty <= 0) {
      removeFromCartMutation.mutate(id);
    } else {
      updateCartItemMutation.mutate({ id, quantity: nextQty });
    }
  };

  const handleRemoveItem = (id: string) => {
    removeFromCartMutation.mutate(id);
  };

  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
  const total = Math.max(0, subtotal - discount + shipping);

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (isPending) {
    return (
      <View style={[styles.wrapper, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.purple.DEFAULT} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.topBar}>
        <View style={styles.titleRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="bag-handle" size={20} color={colors.purple.DEFAULT} />
          </View>
          <Text style={styles.headerTitle}>Your Bag</Text>
          <Text style={styles.headerCount}>({totalCount})</Text>
        </View>
      </View>

      {subtotal < 999 && subtotal > 0 ? (
        <View style={styles.shippingBanner}>
          <Text style={styles.shippingBannerText}>
            Add ₹{999 - subtotal} more for FREE shipping!
          </Text>
        </View>
      ) : subtotal >= 999 ? (
        <View style={[styles.shippingBanner, { backgroundColor: "#DCFCE7" }]}>
          <Text style={[styles.shippingBannerText, { color: "#15803D" }]}>
            🎉 You qualify for FREE shipping!
          </Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {cartItems.length === 0 ? (
          <View style={{ alignItems: "center", marginVertical: 60, gap: 12 }}>
            <Ionicons name="basket-outline" size={60} color="#9CA3AF" />
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#4B5563" }}>Your bag is empty</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Categories" as never)}
              style={{ backgroundColor: colors.purple.DEFAULT, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 }}
            >
              <Text style={{ color: "#FFF", fontWeight: "700" }}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          cartItems.map((item) => {
            const itemPrice = item.product.salePrice ?? item.product.basePrice;
            const thumbUrl = item.product.images?.[0]?.url 
              ? resolveAssetUrl(item.product.images[0].url)
              : "https://images.unsplash.com/photo-1536305030019-8cc5e24d4dc4?auto=format&fit=crop&w=420&q=80";

            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemImageWrapper}>
                  <Image source={{ uri: thumbUrl }} style={styles.itemImage} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.product.name}</Text>
                  <Text style={styles.itemSubtitle}>Premium Quality</Text>
                  <View style={styles.quantityRow}>
                    <TouchableOpacity
                      onPress={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                      style={styles.qtyButton}
                    >
                      <Text style={styles.qtyButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                      style={styles.qtyButton}
                    >
                      <Text style={styles.qtyButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.priceSection}>
                  <Text style={styles.itemPrice}>₹{itemPrice * item.quantity}</Text>
                  <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={styles.removeIcon}>
                    <Ionicons name="trash-outline" size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {cartItems.length > 0 && (
          <>
            <View style={styles.couponCard}>
              <Text style={styles.sectionLabel}>Apply Coupon</Text>
              <View style={styles.couponRow}>
                <TextInput 
                  placeholder="ENTER COUPON CODE" 
                  placeholderTextColor="#9CA3AF" 
                  style={styles.couponInput} 
                  value={couponCode}
                  onChangeText={setCouponCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity 
                  style={styles.couponButton}
                  onPress={handleApplyCoupon}
                  disabled={isApplyingCoupon}
                >
                  {isApplyingCoupon ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.couponButtonText}>Apply</Text>
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.tagRow}>
                <TouchableOpacity style={styles.couponTag} onPress={() => setCouponCode("FIRST20")}>
                  <Text style={styles.couponTagText}>FIRST20</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.couponTag} onPress={() => setCouponCode("HAIRSUP200")}>
                  <Text style={styles.couponTagText}>HAIRSUP200</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹{subtotal}</Text>
              </View>
              {discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount ({appliedCoupon?.code})</Text>
                  <Text style={[styles.summaryValue, { color: "#10B981" }]}>-₹{discount}</Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>{shipping === 0 ? "FREE" : `₹${shipping}`}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{total}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <TouchableOpacity style={styles.checkoutButton} activeOpacity={0.9} onPress={() => navigation.navigate("Checkout", { appliedCoupon: appliedCoupon?.code } as never)}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={styles.checkoutIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.white },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBadge: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(139,92,246,0.12)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: colors.purple.dark },
  headerCount: { fontSize: 14, color: "#6B7280" },
  closeButton: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  shippingBanner: { backgroundColor: "#F8F0FF", paddingVertical: 12, paddingHorizontal: 16, marginHorizontal: 16, borderRadius: 16, marginTop: 12, marginBottom: 6 },
  shippingBannerText: { color: colors.purple.DEFAULT, fontSize: 13, fontWeight: "700" },
  content: { paddingHorizontal: 16, paddingBottom: 20, gap: 16 },
  itemCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 20, padding: 14, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 10, elevation: 3 },
  itemImageWrapper: { width: 82, height: 82, borderRadius: 18, overflow: "hidden", backgroundColor: "#F8FAFC", marginRight: 12 },
  itemImage: { width: "100%", height: "100%" },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: "700", color: colors.purple.dark, marginBottom: 4 },
  itemSubtitle: { fontSize: 12, color: "#6B7280", marginBottom: 10 },
  quantityRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 999, overflow: "hidden", width: 96 },
  qtyButton: { width: 32, height: 32, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" },
  qtyButtonText: { fontSize: 16, fontWeight: "700", color: colors.purple.dark },
  qtyText: { flex: 1, textAlign: "center", fontSize: 14, color: colors.purple.dark },
  priceSection: { alignItems: "flex-end", justifyContent: "space-between", height: 82 },
  itemPrice: { fontSize: 16, fontWeight: "700", color: colors.purple.dark },
  removeIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: "#F9FAFB", alignItems: "center", justifyContent: "center" },
  couponCard: { backgroundColor: "#fff", borderRadius: 20, padding: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 10, elevation: 3 },
  sectionLabel: { fontSize: 14, fontWeight: "700", color: colors.purple.dark, marginBottom: 12 },
  couponRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  couponInput: { flex: 1, height: 44, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 14, paddingHorizontal: 14, color: "#111827", fontSize: 13, backgroundColor: "#F8FAFC" },
  couponButton: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14, backgroundColor: colors.purple.DEFAULT },
  couponButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  couponTag: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: "#F4EBFF" },
  couponTagText: { color: colors.purple.dark, fontSize: 12, fontWeight: "700" },
  summaryCard: { backgroundColor: "#fff", borderRadius: 20, padding: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 10, elevation: 3 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  totalRow: { marginTop: 6, borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingTop: 12, marginBottom: 0 },
  summaryLabel: { fontSize: 14, color: "#6B7280" },
  summaryValue: { fontSize: 14, fontWeight: "700", color: colors.purple.dark },
  totalLabel: { fontSize: 16, fontWeight: "700", color: colors.purple.dark },
  totalValue: { fontSize: 16, fontWeight: "900", color: colors.purple.dark },
  checkoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.purple.DEFAULT, borderRadius: 999, margin: 16, paddingVertical: 16, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 20, elevation: 4 },
  checkoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  checkoutIcon: { marginLeft: 8 },
});
