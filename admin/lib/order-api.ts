import { api } from "./api";
import { ShipmentPayload } from "@/types";

export const getAllOrders = async () => {
  const res = await api.get("/orders/admin/all");
  return res.data;
};

export const getAdminOrderById = async (id: string) => {
  const res = await api.get(`/orders/admin/${id}`);
  return res.data;
};

export const updateOrderStatus = async (
  id: string,
  status: string
) => {
  const res = await api.put(
    `/orders/admin/${id}/status`,
    { status }
  );

  return res.data;
};

export const createShipment = async (
  id: string,
  payload: ShipmentPayload
) => {
  const res = await api.post(`/orders/admin/${id}/shipment`, payload);
  return res.data;
};

export const updateShipment = async (
  id: string,
  payload: ShipmentPayload
) => {
  const res = await api.put(`/orders/admin/${id}/shipment`, payload);
  return res.data;
};
