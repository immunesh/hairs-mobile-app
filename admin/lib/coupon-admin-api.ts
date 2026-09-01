import { api } from "./api";

export const getAllCoupons =
  async () => {
    const res = await api.get(
      "/coupons"
    );

    return res.data;
  };

export const createCoupon =
  async (data: any) => {
    const res = await api.post(
      "/coupons",
      data
    );

    return res.data;
  };

export const toggleCoupon =
  async (id: string) => {
    const res = await api.patch(
      `/coupons/${id}/toggle`
    );

    return res.data;
  };

export const deleteCoupon =
  async (id: string) => {
    const res = await api.delete(
      `/coupons/${id}`
    );

    return res.data;
  };