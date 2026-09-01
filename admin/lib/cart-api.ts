import { api } from "./api";

export const getAllCarts = async () => {
  const res = await api.get("/cart/admin/all");
  return res.data;
};