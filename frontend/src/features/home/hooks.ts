import { useQuery } from "@tanstack/react-query";

import { getCart } from "@/services/api/cart.api";
import {
  getBestSellers,
  getCategories,
  getFeaturedProducts,
  getHeroSlides,
  getNewArrivals,
} from "@/services/api/catalog.api";
import { getPublishedBlogPosts, getBlogPost } from "@/services/api/blog.api";
import { getTestimonials } from "@/services/api/reviews.api";
import { queryKeys } from "@/services/query/keys";
import { useAuth } from "@/features/auth/hooks";

export function useHeroSlides() {
  return useQuery({
    queryKey: queryKeys.heroSlides,
    queryFn: getHeroSlides,
  });
}

export function useHomeCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: queryKeys.featuredProducts,
    queryFn: getFeaturedProducts,
  });
}

export function useNewArrivals() {
  return useQuery({
    queryKey: queryKeys.newArrivals,
    queryFn: getNewArrivals,
  });
}

export function useBestSellers() {
  return useQuery({
    queryKey: queryKeys.bestSellers,
    queryFn: getBestSellers,
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: queryKeys.testimonials,
    queryFn: getTestimonials,
  });
}

export function useBlogPosts() {
  return useQuery({
    queryKey: queryKeys.blogPosts,
    queryFn: getPublishedBlogPosts,
  });
}

export function useBlogPost(id: string) {
  return useQuery({
    queryKey: queryKeys.blogPost(id),
    queryFn: () => getBlogPost(id),
    enabled: !!id,
  });
}

export function useCartItemCount() {
  const { isAuthenticated } = useAuth();

  const { data } = useQuery({
    queryKey: queryKeys.cart,
    queryFn: getCart,
    enabled: isAuthenticated,
    select: (items) => items.reduce((total, item) => total + item.quantity, 0),
  });

  return isAuthenticated ? data ?? 0 : 0;
}
