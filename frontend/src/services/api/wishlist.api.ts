import { apiClient, unwrap } from "./client";
import type { ApiEnvelope, WishlistItem } from "./types";

export async function getWishlist() {
  const { data } = await apiClient.get<ApiEnvelope<WishlistItem[]>>("/wishlist");
  return unwrap(data);
}

export async function addToWishlist(productId: string) {
  const { data } = await apiClient.post<ApiEnvelope<WishlistItem>>("/wishlist", { productId });
  return unwrap(data);
}

export async function removeFromWishlist(productId: string) {
  const { data } = await apiClient.delete<ApiEnvelope<null>>(`/wishlist/${productId}`);
  return unwrap(data);
}
