import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getProductBySlugOrId, getProducts, type ProductListParams } from "@/services/api/catalog.api";
import { addToCart, getCart, updateCartItem, removeFromCart, clearCart } from "@/services/api/cart.api";
import { createOrder } from "@/services/api/order.api";
import { createReview, getProductReviews } from "@/services/api/reviews.api";
import { addToWishlist, getWishlist, removeFromWishlist } from "@/services/api/wishlist.api";
import { queryKeys } from "@/services/query/keys";
import { useAuth } from "@/features/auth/hooks";


export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => getProductBySlugOrId(id),
    enabled: Boolean(id),
  });
}

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: queryKeys.products(params),
    queryFn: () => getProducts(params),
    placeholderData: keepPreviousData,
  });
}

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: queryKeys.productReviews(productId),
    queryFn: () => getProductReviews(productId, { limit: 50 }),
    enabled: Boolean(productId),
  });
}

export function useCart() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: getCart,
    enabled: isAuthenticated,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart }),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => updateCartItem(id, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart }),
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeFromCart(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart }),
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart }),
  });
}

export function useWishlist() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.wishlist,
    queryFn: getWishlist,
    enabled: isAuthenticated,
  });
}

/** Bundles the wishlist query with an add/remove toggle keyed by product id. */
export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const wishlistQuery = useWishlist();

  const isWishlisted = (productId: string) =>
    (wishlistQuery.data ?? []).some((item) => item.productId === productId);

  const mutation = useMutation({
    mutationFn: (productId: string) =>
      isWishlisted(productId) ? removeFromWishlist(productId) : addToWishlist(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.wishlist }),
  });

  return { isWishlisted, toggle: mutation.mutate, isPending: mutation.isPending };
}

export function useCreateReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { rating: number; title?: string; body: string }) =>
      createReview({ productId, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productReviews(productId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.product(productId) });
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}

