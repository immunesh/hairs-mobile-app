import { api } from "./api";

export const getAllStores = async () => {
  const res = await api.get("/stores");
  return res.data;
};

export const createStore = async (
  data: any
) => {
  const res = await api.post(
    "/stores",
    data
  );

  return res.data;
};

export const deleteStore = async (
  id: string
) => {
  const res = await api.delete(
    `/stores/${id}`
  );

  return res.data;
};