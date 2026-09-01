'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Star, Eye, Zap } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import { useCartStore, useWishlistStore, useAuthStore, useUIStore } from '@/lib/store';
import { cartApi, wishlistApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { addItem: addToCart } = useCartStore();
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { showToast } = useUIStore();
console.log("CARD", {
  name: product.name,
  images: product.images,
});
 const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:4000";

const primaryImage =
  product.images?.find((img) => img.isPrimary) ||
  product.images?.[0];

const hoverImage =
  product.images?.find((img) => !img.isPrimary) ||
  primaryImage;

const imageUrl = primaryImage?.url
  ? primaryImage.url.startsWith("http")
    ? primaryImage.url
    : `${API_BASE}${primaryImage.url}`
  : "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800";

const hoverUrl = hoverImage?.url
  ? hoverImage.url.startsWith("http")
    ? hoverImage.url
    : `${API_BASE}${hoverImage.url}`
  : imageUrl;
    const isWishlisted = wishlistItems.some((i) => i.productId === product.id);
  const discountPct = product.salePrice ? getDiscountPercent(product.basePrice, product.salePrice) : 0;

 const handleAddToCart = async (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
    if (!isAuthenticated) { showToast('Please sign in to add to cart', 'error'); return; }
    setAddingToCart(true);
   try {
  console.log("ADDING PRODUCT", product.id);

  const { data } = await cartApi.add(product.id, 1);

  console.log("CART RESPONSE", data);
      addToCart(data.data);
      showToast('Added to cart!', 'success');
   } catch (error: any) {
  console.error("ADD CART ERROR", error);
  console.error("RESPONSE", error?.response?.data);

  showToast(
    error?.response?.data?.message ||
    "Failed to add to cart",
    "error"
  );
}finally {
      setAddingToCart(false);
    }
  };

const handleWishlist = async (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
    if (!isAuthenticated) { showToast('Please sign in to save items', 'error'); return; }
    try {
      if (isWishlisted) {
        await wishlistApi.remove(product.id);
        removeFromWishlist(product.id);
        showToast('Removed from wishlist');
      } else {
        const { data } = await wishlistApi.add(product.id);
        addToWishlist(data.data);
        showToast('Added to wishlist!');
      }
    } catch {
      showToast('Something went wrong', 'error');
    }
  };
console.log("CARD", {
  name: product.name,
  imageUrl,
});
  return (
    <Link href={`/products/${product.slug}`}>
      <div
        className={cn('card group cursor-pointer overflow-hidden', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image container */}
        <div className="relative aspect-product bg-gray-50 overflow-hidden">
          {primaryImage && (
            <Image
  src={
    primaryImage?.url ||
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800"
  }
  alt={product.name}
  fill
  className="object-cover transition-transform duration-500 group-hover:scale-105"
  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
/>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPct > 0 && (
              <span className="badge-sale text-xs font-bold">-{discountPct}%</span>
            )}
            {product.isNewArrival && (
              <span className="badge-new text-xs">New</span>
            )}
            {product.isBestSeller && (
              <span className="badge-best text-xs">Best Seller</span>
            )}
          </div>

          {/* Gender badge */}
          <div className="absolute top-2 right-2">
            <span className={cn(
              'badge text-xs',
              product.gender === 'WOMEN' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
            )}>
              {product.gender === 'WOMEN' ? 'Women' : 'Men'}
            </span>
          </div>

          {/* Action buttons on hover */}
          <div className={cn(
            'absolute inset-x-2 bottom-2 flex gap-2 transition-all duration-300',
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}>
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
              className="flex-1 bg-white/95 hover:bg-brand-600 hover:text-white text-gray-800 text-xs font-semibold py-2 px-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {product.stock === 0 ? 'Out of Stock' : (
                <><ShoppingBag className="w-3.5 h-3.5" /> {addingToCart ? 'Adding…' : 'Add to Bag'}</>
              )}
            </button>
            <button
              onClick={handleWishlist}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-all duration-200',
                isWishlisted
                  ? 'bg-red-500 text-white'
                  : 'bg-white/95 hover:bg-red-500 hover:text-white text-gray-600'
              )}
            >
              <Heart className={cn('w-4 h-4', isWishlisted && 'fill-current')} />
            </button>
          </div>

          {/* Quick View */}
          {isHovered && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Quick View
              </div>
            </div>
          )}

          {/* Low stock warning */}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute bottom-14 left-2 right-2 bg-orange-500 text-white text-xs text-center py-1 rounded-lg font-medium">
              Only {product.stock} left!
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="p-3">
          <p className="text-xs text-gray-400 mb-0.5 font-medium uppercase tracking-wide">
            {product.category?.name}
          </p>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>

          {/* Specs */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            {product.texture && <span>{product.texture}</span>}
            {product.length && <><span>·</span><span>{product.length}</span></>}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={cn('w-3 h-3', s <= Math.round(product.rating) ? 'star-filled' : 'star-empty')}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-center flex-wrap gap-1">
            <span className="font-bold text-gray-900">
              {formatPrice(product.salePrice || product.basePrice)}
            </span>
            {product.salePrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.basePrice)}
              </span>
            )}
            {discountPct > 0 && (
              <span className="text-xs font-semibold text-green-600">
                {discountPct}% off
              </span>
            )}
          </div>

          {/* Try-on hint */}
          <div className="flex items-center gap-1 mt-2 text-xs text-brand-600 font-medium">
            <Zap className="w-3 h-3" />
            <span>Try it virtually</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
