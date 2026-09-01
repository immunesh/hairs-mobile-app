import { api } from "./api";

export const getAllBlogs = async () => {
  const res = await api.get("/blogs");
  return res.data;
};

export const getBlogById = async (
  id: string
) => {
  const res = await api.get(
    `/blogs/${id}`
  );

  return res.data;
};

export const createBlog = async (
  data: any
) => {
  const res = await api.post(
    "/blogs",
    data
  );

  return res.data;
};

export const updateBlog = async (
  id: string,
  data: any
) => {
  const res = await api.put(
    `/blogs/${id}`,
    data
  );

  return res.data;
};

export const deleteBlog = async (
  id: string
) => {
  const res = await api.delete(
    `/blogs/${id}`
  );

  return res.data;
};

export const publishBlog = async (
  id: string
) => {
  const res = await api.patch(
    `/blogs/${id}/publish`
  );

  return res.data;
};