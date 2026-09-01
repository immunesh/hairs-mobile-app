import { api } from "./api";

export const getAllWishlists = async () => {
  const res = await api.get(
    "/wishlist/admin/all"
  );

  return res.data;
};