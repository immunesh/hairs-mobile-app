import { apiClient, unwrap } from "./client";
import type { Category, FeaturedProduct, HeroSlide, ProductDetail } from "./types";

export async function getHeroSlides() {
  const { data } = await apiClient.get<HeroSlide[]>("/hero-slides", {
    params: { active: "true" },
  });
  return unwrap(data);
}

export async function getCategories() {
  const { data } = await apiClient.get<Category[]>("/categories");
  return unwrap(data);
}

export async function getFeaturedProducts() {
  const { data } = await apiClient.get<FeaturedProduct[]>("/products/featured");
  return unwrap(data);
}

export async function getNewArrivals() {
  const { data } = await apiClient.get<FeaturedProduct[]>("/products", {
    params: { newArrival: "true", limit: "4" },
  });
  return unwrap(data);
}

export async function getBestSellers() {
  const { data } = await apiClient.get<FeaturedProduct[]>("/products", {
    params: { bestSeller: "true", limit: "4" },
  });
  return unwrap(data);
}

/** `id` may be a product's id or slug — the backend looks up either. */
export async function getProductBySlugOrId(id: string) {
  const { data } = await apiClient.get<ProductDetail>(`/products/${id}`);
  return unwrap(data);
}

export type ProductListParams = {
  page?: number;
  limit?: number;
  category?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: "asc" | "desc";
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  sale?: boolean;
  texture?: string[];
  search?: string;
};

type ProductListResponse = {
  success: boolean;
  data: FeaturedProduct[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

/** `pagination` sits alongside `data`, not inside it — so this bypasses `unwrap`. */
export async function getProducts(params: ProductListParams) {
  const { data } = await apiClient.get<ProductListResponse>("/products", {
    params: { ...params, texture: params.texture?.length ? params.texture.join(",") : undefined },
  });
  return { products: data.data, pagination: data.pagination };
}
