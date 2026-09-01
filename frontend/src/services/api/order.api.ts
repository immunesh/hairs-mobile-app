import { apiClient, unwrap } from "./client";
import type { ApiEnvelope, Order } from "./types";

export async function getOrders() {
  const { data } = await apiClient.get<ApiEnvelope<Order[]>>("/orders");
  return unwrap(data);
}

export async function createOrder(payload: { addressId: string; paymentMethod: string; couponCode?: string; notes?: string }) {
  const { data } = await apiClient.post<ApiEnvelope<Order>>("/orders", payload);
  return unwrap(data);
}

