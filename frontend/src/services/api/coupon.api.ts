import { apiClient, unwrap } from "./client";
import type { ApiEnvelope } from "./types";

export type CouponValidationResponse = {
  isValid: boolean;
  message?: string;
  discountAmount?: number;
  finalTotal?: number;
};

export async function validateCoupon(code: string, subtotal: number) {
  const { data } = await apiClient.post<ApiEnvelope<CouponValidationResponse>>("/coupons/apply", { code, subtotal });
  return unwrap(data);
}
