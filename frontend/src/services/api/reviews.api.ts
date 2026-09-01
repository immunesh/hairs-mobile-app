import { apiClient, unwrap } from "./client";
import type { ApiEnvelope, Review, Testimonial } from "./types";

export async function getTestimonials() {
  const { data } = await apiClient.get<Testimonial[]>("/reviews/testimonials");
  return unwrap(data);
}

type ProductReviewsResponse = ApiEnvelope<Review[]> & {
  stats: { avgRating: number; totalReviews: number };
  pagination: { page: number; limit: number; total: number; pages: number };
};

/** Unlike most endpoints, `stats`/`pagination` sit alongside `data`, not inside it — so this bypasses `unwrap`. */
export async function getProductReviews(productId: string, params?: { page?: number; limit?: number }) {
  const { data } = await apiClient.get<ProductReviewsResponse>(`/reviews/product/${productId}`, {
    params,
  });
  return { reviews: data.data, stats: data.stats, pagination: data.pagination };
}

export async function createReview(payload: {
  productId: string;
  rating: number;
  title?: string;
  body: string;
  images?: string[];
}) {
  const { data } = await apiClient.post<ApiEnvelope<Review>>("/reviews", payload);
  return unwrap(data);
}

export async function getMyReviews() {
  const { data } = await apiClient.get<ApiEnvelope<Review[]>>("/reviews/my");
  return unwrap(data);
}
