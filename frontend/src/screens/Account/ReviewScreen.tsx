import React from "react";
import { StyleSheet, View, Text, Image, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

import { colors } from "@/theme/colors";
import { getMyReviews } from "@/services/api/reviews.api";
import { queryKeys } from "@/services/query/keys";
import { resolveAssetUrl } from "@/services/api/client";

export function ReviewScreen() {
  const navigation = useNavigation();
  const { data: reviews, isFetching, isError } = useQuery({
    queryKey: queryKeys.myReviews,
    queryFn: getMyReviews,
  });

  const renderReviewCard = (review: any) => {
    const productImg = review.product?.images?.[0]?.url;
    const productImageUri = productImg ? resolveAssetUrl(productImg) : "https://i.pravatar.cc/120?img=55";
    const productName = review.product?.name || "Product";
    const titleText = review.title?.trim() || "Untitled review";
    const bodyText = review.body?.trim() || "No review text provided.";
    const reviewDate = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Recently added";

    return (
      <View key={review.id} style={styles.cardOuter}>
        <View style={styles.cardInner}>
          <Image source={{ uri: productImageUri }} style={styles.productImage} />
          <View style={styles.reviewContent}>
            {review.product?.name ? (
              <Text style={styles.productName}>{productName}</Text>
            ) : null}
            <Text style={styles.productTitle}>{titleText}</Text>
            <Text style={styles.reviewDate}>{reviewDate}</Text>
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Ionicons
                  key={index}
                  name="star"
                  size={14}
                  color={index < review.rating ? "#FBBF24" : "#E5E7EB"}
                  style={{ marginRight: 4 }}
                />
              ))}
            </View>
            <Text style={styles.reviewText}>{bodyText}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color={colors.purple.DEFAULT} />
          </Pressable>
          <Text style={styles.title}>My Reviews</Text>
        </View>

        {isError ? (
          <View style={styles.cardOuter}>
            <Text style={styles.errorText}>Unable to load your reviews.</Text>
          </View>
        ) : isFetching && !reviews ? (
          <View style={styles.cardOuter}>
            <Text style={styles.loadingText}>Loading your reviews...</Text>
          </View>
        ) : !reviews?.length ? (
          <View style={styles.cardOuter}>
            <Text style={styles.emptyText}>You have not written any reviews yet.</Text>
          </View>
        ) : (
          reviews.map((review: any) => renderReviewCard(review))
        )}
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
  cardOuter: { backgroundColor: "#fff", borderRadius: 24, padding: 16, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 20, elevation: 4 },
  cardInner: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  productImage: { width: 68, height: 68, borderRadius: 16, marginRight: 16, backgroundColor: "#F3F4F6" },
  reviewContent: { flex: 1 },
  productName: { fontSize: 12, color: colors.purple.DEFAULT, fontWeight: "600", marginBottom: 2 },
  productTitle: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 6 },
  starsRow: { flexDirection: "row", marginBottom: 8 },
  reviewText: { fontSize: 14, color: "#374151" },
  reviewDate: { fontSize: 12, color: "#9CA3AF", marginBottom: 6 },
  errorText: { color: "#DC2626", fontSize: 14, textAlign: "center", marginVertical: 24 },
  loadingText: { color: "#6B7280", fontSize: 14, textAlign: "center", marginVertical: 24 },
  emptyText: { color: "#6B7280", fontSize: 14, textAlign: "center", marginVertical: 24 },
});
