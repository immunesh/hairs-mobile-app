import { api } from "./api";

export async function getHeroSlides(activeOnly = false) {
  const res = await api.get("/hero-slides", {
    params: activeOnly ? { active: "true" } : undefined,
  });
  return res.data;
}

export async function deleteHeroSlide(id: string) {
  const res = await fetch(
    `http://localhost:4000/api/hero-slides/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete hero slide");
  }

  return res.json();
}
