import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { colors } from "@/theme/colors";

const paymentOptions = [
  { label: "UPI", subtitle: "Pay via GPay, PhonePe, Paytm", enabled: false },
  { label: "Credit/Debit Card", subtitle: "Visa, Mastercard, RuPay", enabled: false },
  { label: "Net Banking", subtitle: "All major banks", enabled: false },
  { label: "Cash on Delivery", subtitle: "Pay when delivered", enabled: true },
];

export function CheckoutScreen() {
  const navigation = useNavigation();
  const [selectedPayment, setSelectedPayment] = useState("Cash on Delivery");
  const [coupon, setCoupon] = useState("");

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}> 
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.purple.dark} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1. Review Your Order</Text>
          <View style={styles.orderItemCard}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1536305030019-8cc5e24d4dc4?auto=format&fit=crop&w=420&q=80" }}
              style={styles.orderImage}
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>Men's Full Cap Hair System 11</Text>
              <Text style={styles.itemMeta}>Qty: 1</Text>
            </View>
            <Text style={styles.itemPrice}>₹1</Text>
          </View>
          <View style={styles.couponRow}> 
            <TextInput
              placeholder="Coupon Code (optional)"
              placeholderTextColor="#9CA3AF"
              style={styles.couponInput}
              value={coupon}
              onChangeText={setCoupon}
            />
            <TouchableOpacity style={styles.couponButton} activeOpacity={0.85}>
              <Text style={styles.couponButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>2. Delivery Address</Text>
          <View style={styles.addressCardSelected}>
            <View style={styles.addressHeader}>
              <Text style={styles.addressName}>Aditya Aditya</Text>
              <View style={styles.addressTag}>
                <Text style={styles.addressTagText}>HOME</Text>
              </View>
            </View>
            <Text style={styles.addressText}>Testing, Testing</Text>
            <Text style={styles.addressText}>Mathura, UP — 281001</Text>
            <Text style={styles.addressText}>📞 8954274893</Text>
          </View>
          <TouchableOpacity style={styles.addAddressButton} activeOpacity={0.85}>
            <Ionicons name="add" size={18} color={colors.purple.DEFAULT} />
            <Text style={styles.addAddressText}>Add New Address</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}> 
          <Text style={styles.sectionTitle}>3. Payment Method</Text>
          {paymentOptions.map((option) => {
            const selected = selectedPayment === option.label;
            return (
              <TouchableOpacity
                key={option.label}
                style={[styles.paymentCard, selected && styles.paymentCardSelected, !option.enabled && styles.paymentCardDisabled]}
                activeOpacity={option.enabled ? 0.8 : 1}
                onPress={() => option.enabled && setSelectedPayment(option.label)}
              >
                <View style={styles.paymentRow}>
                  <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                    {selected && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.paymentTextContent}>
                    <Text style={[styles.paymentLabel, !option.enabled && styles.paymentLabelDisabled]}>{option.label}</Text>
                    <Text style={[styles.paymentSubtitle, !option.enabled && styles.paymentSubtitleDisabled]}>{option.subtitle}</Text>
                  </View>
                </View>
                {!option.enabled && <Text style={styles.comingSoonText}>Coming Soon</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.orderSummaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}> 
            <Text style={styles.summaryLabel}>Subtotal (1 item)</Text>
            <Text style={styles.summaryValue}>₹1</Text>
          </View>
          <View style={styles.summaryRow}> 
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>₹99</Text>
          </View>
          <View style={styles.summaryRow}> 
            <Text style={styles.summaryLabel}>GST (18%)</Text>
            <Text style={styles.summaryValue}>₹0</Text>
          </View>
          <View style={styles.summaryRowTotal}> 
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹100</Text>
          </View>
          <TouchableOpacity style={styles.placeOrderButton} activeOpacity={0.9} onPress={() => navigation.navigate("OrderConfirmed" as never)}>
            <Text style={styles.placeOrderText}>Place Order — ₹100</Text>
          </TouchableOpacity>
          <View style={styles.secureNote}> 
            <Text style={styles.secureNoteText}>Your payment is 100% secure and encrypted</Text>
          </View>
          <View style={styles.footerNotes}> 
            <Text style={styles.footerNote}>✓ Free delivery on orders above ₹999</Text>
            <Text style={styles.footerNote}>✓ Estimated delivery in 3–5 business days</Text>
            <Text style={styles.footerNote}>✓ 7-day hassle-free returns</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  pageTitle: { fontSize: 20, fontWeight: "800", color: colors.purple.dark },
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 16 },
  sectionCard: { backgroundColor: "#fff", borderRadius: 24, padding: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 10, elevation: 3 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.purple.dark, marginBottom: 14 },
  orderItemCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8F5FF", borderRadius: 20, padding: 12, gap: 12 },
  orderImage: { width: 72, height: 72, borderRadius: 18 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "700", color: colors.purple.dark, marginBottom: 4 },
  itemMeta: { fontSize: 12, color: "#6B7280" },
  itemPrice: { fontSize: 15, fontWeight: "700", color: colors.purple.dark },
  couponRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16 },
  couponInput: { flex: 1, height: 44, borderRadius: 14, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E5E7EB", paddingHorizontal: 14, color: "#111827" },
  couponButton: { backgroundColor: colors.purple.DEFAULT, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14 },
  couponButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  addressCardSelected: { backgroundColor: "#fff", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.purple.DEFAULT },
  addressHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  addressName: { fontSize: 15, fontWeight: "700", color: colors.purple.dark },
  addressTag: { backgroundColor: "#F4EBFF", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  addressTagText: { color: colors.purple.DEFAULT, fontSize: 11, fontWeight: "700" },
  addressText: { fontSize: 13, color: "#4B5563", lineHeight: 20 },
  addAddressButton: { marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: colors.purple.DEFAULT, paddingVertical: 12, borderRadius: 14, backgroundColor: "#FFFFFF" },
  addAddressText: { color: colors.purple.DEFAULT, fontWeight: "700", marginLeft: 6 },
  paymentCard: { padding: 16, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 10 },
  paymentCardSelected: { borderColor: colors.purple.DEFAULT, backgroundColor: "#F8F5FF" },
  paymentCardDisabled: { opacity: 0.6 },
  paymentRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  radioOuter: { width: 20, height: 20, borderRadius: 999, borderWidth: 1, borderColor: "#D1D5DB", alignItems: "center", justifyContent: "center" },
  radioOuterSelected: { borderColor: colors.purple.DEFAULT },
  radioInner: { width: 10, height: 10, borderRadius: 999, backgroundColor: colors.purple.DEFAULT },
  paymentTextContent: { flex: 1 },
  paymentLabel: { fontSize: 14, fontWeight: "700", color: colors.purple.dark },
  paymentLabelDisabled: { color: "#9CA3AF" },
  paymentSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  paymentSubtitleDisabled: { color: "#D1D5DB" },
  comingSoonText: { marginTop: 10, color: "#FB7185", fontSize: 12, fontWeight: "700" },
  orderSummaryCard: { backgroundColor: "#fff", borderRadius: 24, padding: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 10, elevation: 3 },
  summaryTitle: { fontSize: 16, fontWeight: "700", color: colors.purple.dark, marginBottom: 14 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  summaryLabel: { fontSize: 13, color: "#6B7280" },
  summaryValue: { fontSize: 13, color: colors.purple.dark, fontWeight: "700" },
  summaryRowTotal: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  totalLabel: { fontSize: 16, fontWeight: "800", color: colors.purple.dark },
  totalValue: { fontSize: 16, fontWeight: "900", color: colors.purple.DEFAULT },
  placeOrderButton: { backgroundColor: colors.purple.DEFAULT, paddingVertical: 16, borderRadius: 999, alignItems: "center", marginTop: 18 },
  placeOrderText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  secureNote: { marginTop: 14, backgroundColor: "#ECFDF5", borderRadius: 16, padding: 14 },
  secureNoteText: { color: "#065F46", fontSize: 13 },
  footerNotes: { marginTop: 14, gap: 6 },
  footerNote: { fontSize: 12, color: "#6B7280" },
});
