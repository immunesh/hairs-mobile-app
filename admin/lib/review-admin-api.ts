import { api } from "./api";

export const getAllReviews = async () => {
  const res = await api.get(
    "/reviews/admin/all"
  );

  return res.data;
};

export const deleteReview = async (
  id: string
) => {
  const res = await api.delete(
    `/reviews/admin/${id}`
  );

  return res.data;
};