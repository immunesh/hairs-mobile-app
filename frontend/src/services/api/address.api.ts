import { apiClient, unwrap } from "./client";
import type { ApiEnvelope } from "./types";

export type AddressPayload = {
  type?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
};

export type Address = {
  id: string;
  type: string | null;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function getAddresses() {
  const { data } = await apiClient.get<ApiEnvelope<Address[]>>("/users/addresses");
  return unwrap(data);
}

export async function addAddress(payload: AddressPayload) {
  const { data } = await apiClient.post<ApiEnvelope<Address>>("/users/addresses", payload);
  return unwrap(data);
}

export async function updateAddress(id: string, payload: Partial<AddressPayload>) {
  const { data } = await apiClient.put<ApiEnvelope<Address>>(`/users/addresses/${id}`, payload);
  return unwrap(data);
}

export async function deleteAddress(id: string) {
  const { data } = await apiClient.delete<ApiEnvelope<{ message: string }>>(`/users/addresses/${id}`);
  return unwrap(data);
}
