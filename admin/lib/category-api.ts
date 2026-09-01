import { api } from "./api";

export async function getCategories() {
  const res = await api.get("/categories");
  return res.data;
}

export async function deleteCategory(id: string) {
  const res = await fetch(
    `http://localhost:4000/api/categories/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete category");
  }

  return res.json();
}