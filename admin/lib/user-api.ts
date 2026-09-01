import { api } from "./api";

export const getAllUsers = async () => {
  const res = await api.get("/users/admin/all");
  return res.data;
};

export const updateUserRole = async (
  id: string,
  role: string
) => {
  const res = await api.put(
    `/users/admin/${id}/role`,
    { role }
  );

  return res.data;
};

export const deleteUser = async (
  id: string
) => {
  const res = await api.delete(
    `/users/admin/${id}`
  );

  return res.data;
};