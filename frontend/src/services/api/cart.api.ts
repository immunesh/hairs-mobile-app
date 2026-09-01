import { apiClient, unwrap } from "./client";
import type { ApiEnvelope, CartItem } from "./types";

export async function getCart() {
  const { data } = await apiClient.get<ApiEnvelope<CartItem[]>>("/cart");
  return unwrap(data);
}

export async function addToCart(payload: { productId: string; quantity?: number; variant?: unknown }) {
  const { data } = await apiClient.post<ApiEnvelope<CartItem>>("/cart", payload);
  return unwrap(data);
}

export async function updateCartItem(id: string, quantity: number) {
  const { data } = await apiClient.put<ApiEnvelope<CartItem>>(`/cart/${id}`, { quantity });
  return unwrap(data);
}

export async function removeFromCart(id: string) {
  const { data } = await apiClient.delete<ApiEnvelope<{ message: string }>>(`/cart/${id}`);
  return unwrap(data);
}

export async function clearCart() {
  const { data } = await apiClient.delete<ApiEnvelope<{ message: string }>>("/cart/clear");
  return unwrap(data);
}

