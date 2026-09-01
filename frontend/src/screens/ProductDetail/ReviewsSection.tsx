import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";
import { getApiErrorMessage } from "@/services/api/client";
import type { Review } from "@/services/api/types";
import { useAuth } from "@/features/auth/hooks";
import { useCreateReview, useProductReviews } from "@/features/products/hooks";
import { RatingStars } from "@/screens/Home/ProductCard";

function timeAgo(dateString: string) {
  const days = Math.floor((Date.now() - new Date(dateString).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

function reviewerName(review: Review) {
  return `${review.user.firstName} ${review.user.lastName}`.trim();
}

function StarInput({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  return (
    <View style={styles.starInputRow}>
      {[1, 2, 3, 4, 5].map((position) => (
        <Pressable key={position} onPress={() => onChange(position)} hitSlop={6}>
          <Ionicons
            name={value >= position ? "star" : "star-outline"}
            size={28}
            color="#F5B301"
          />
        </Pressable>
      ))}
    </View>
  );
}

type Props = {
  productId: string;
  onRequireLogin: () => void;
};

export function ReviewsSection({ productId, onRequireLogin }: Props) {
  const { isAuthenticated } = useAuth();
  const reviewsQuery = useProductReviews(productId);
  const createReview = useCreateReview(productId);

  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");

  const reviews = reviewsQuery.data?.reviews ?? [];
  const stats = reviewsQuery.data?.stats;
  const verifiedCount = reviews.filter((review) => review.isVerified).length;

  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((review) => review.rating === star).length;
    const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, percent };
  });

  const handleSubmit = () => {
    if (rating === 0 || body.trim().length === 0) return;
    createReview.mutate(
      { rating, body: body.trim() },
      {
        onSuccess: () => {
          setRating(0);
          setBody("");
        },
      }
    );
  };

  if (reviewsQuery.isPending) {
    return (
      <View style={styles.statusBox}>
        <ActivityIndicator color={colors.purple.DEFAULT} />
      </View>
    );
  }

  if (reviewsQuery.isError) {
    return (
      <View style={styles.statusBox}>
        <Text style={styles.statusText}>
          {getApiErrorMessage(reviewsQuery.error, "Could not load reviews.")}
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.summaryRow}>
        <View style={styles.summaryLeft}>
          <Text style={styles.avgRating}>{(stats?.avgRating ?? 0).toFixed(1)}</Text>
          <RatingStars rating={stats?.avgRating ?? 0} />
          <Text style={styles.verifiedCount}>{verifiedCount} verified reviews</Text>
        </View>

        <View style={styles.summaryRight}>
          {breakdown.map(({ star, percent }) => (
            <View key={star} style={styles.barRow}>
              <Text style={styles.barLabel}>{star}</Text>
              <Ionicons name="star" size={11} color="#F5B301" />
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${percent}%` }]} />
              </View>
              <Text style={styles.barPercent}>{Math.round(percent)}%</Text>
            </View>
          ))}
        </View>
      </View>

      {reviews.length === 0 ? (
        <Text style={styles.emptyText}>No reviews yet — be the first to share your experience.</Text>
      ) : (
        <View style={styles.reviewList}>
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>{reviewerName(review).charAt(0) || "?"}</Text>
                </View>
                <View style={styles.reviewHeaderText}>
                  <Text style={styles.reviewerName}>{reviewerName(review) || "Anonymous"}</Text>
                  <Text style={styles.reviewDate}>{timeAgo(review.createdAt)}</Text>
                </View>
                <RatingStars rating={review.rating} />
              </View>
              {review.title ? <Text style={styles.reviewTitle}>{review.title}</Text> : null}
              <Text style={styles.reviewBody}>{review.body}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.writeReviewBox}>
        <Text style={styles.writeReviewTitle}>Write a Review</Text>

        {isAuthenticated ? (
          <>
            <Text style={styles.fieldLabel}>Your Rating</Text>
            <StarInput value={rating} onChange={setRating} />

            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Share your experience with this product..."
              placeholderTextColor="#9CA3AF"
              multiline
              style={styles.textArea}
            />

            {createReview.isError ? (
              <Text style={styles.statusText}>
                {getApiErrorMessage(createReview.error, "Could not submit your review.")}
              </Text>
            ) : null}

            <Pressable
              onPress={handleSubmit}
              disabled={createReview.isPending || rating === 0 || body.trim().length === 0}
              style={({ pressed }) => [
                styles.submitButton,
                (pressed || createReview.isPending || rating === 0 || body.trim().length === 0) &&
                  styles.submitButtonDisabled,
              ]}
            >
              {createReview.isPending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Submit Review</Text>
              )}
            </Pressable>
          </>
        ) : (
          <Pressable onPress={onRequireLogin} style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Log in to write a review</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statusBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  statusText: {
    fontSize: 13,
    color: "#5A4C6B",
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  summaryLeft: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    width: 110,
  },
  avgRating: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1F1233",
  },
  verifiedCount: {
    fontSize: 11,
    color: "#8A7B99",
    textAlign: "center",
    marginTop: 2,
  },
  summaryRight: {
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  barLabel: {
    fontSize: 11,
    color: "#5A4C6B",
    width: 8,
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#EDE4F6",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#F5B301",
    borderRadius: 999,
  },
  barPercent: {
    fontSize: 11,
    color: "#8A7B99",
    width: 30,
    textAlign: "right",
  },
  emptyText: {
    fontSize: 13,
    color: "#8A7B99",
    marginBottom: 20,
  },
  reviewList: {
    gap: 14,
    marginBottom: 20,
  },
  reviewCard: {
    backgroundColor: "#F8F6FC",
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.purple.light,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 14,
  },
  reviewHeaderText: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F1233",
  },
  reviewDate: {
    fontSize: 11,
    color: "#8A7B99",
  },
  reviewTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F1233",
  },
  reviewBody: {
    fontSize: 13,
    lineHeight: 19,
    color: "#5A4C6B",
  },
  writeReviewBox: {
    backgroundColor: "#F8F0FF",
    borderRadius: 16,
    padding: 16,
  },
  writeReviewTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F1233",
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5A4C6B",
    marginBottom: 6,
  },
  starInputRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  textArea: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    minHeight: 90,
    textAlignVertical: "top",
    fontSize: 13,
    color: "#1F1233",
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: colors.purple.DEFAULT,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  loginPrompt: {
    borderWidth: 1.5,
    borderColor: colors.purple.light,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  loginPromptText: {
    color: colors.purple.DEFAULT,
    fontSize: 14,
    fontWeight: "700",
  },
});
