'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlistStore, useCartStore, useAuthStore, useUIStore } from '@/lib/store';
import { wishlistApi, cartApi } from '@/lib/api';
import { formatPrice, getDiscountPercent } from '@/lib/utils';

export default function WishlistPage() {
  const { items, setItems, removeItem } = useWishlistStore();
  const [loading, setLoading] = useState(true);
  const { addItem: addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { showToast } = useUIStore();

 useEffect(() => {
  if (isAuthenticated) {
    setLoading(true);

    wishlistApi
      .get()
      .then(({ data }) => {
        setItems(data.data);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  } else {
    setLoading(false);
  }
}, [isAuthenticated, setItems]);

  const handleRemove = async (productId: string) => {
    try {
      await wishlistApi.remove(productId);
      removeItem(productId);
      showToast('Removed from wishlist');
    } catch { showToast('Failed to remove', 'error'); }
  };

  const handleMoveToCart = async (productId: string) => {
    if (!isAuthenticated) { showToast('Please sign in', 'error'); return; }
    try {
      const { data } = await cartApi.add(productId, 1);
      addToCart(data.data);
      await wishlistApi.remove(productId);
      removeItem(productId);
      showToast('Moved to cart!');
    } catch { showToast('Failed to move to cart', 'error'); }
  };
  const handleMoveAllToCart = async () => {
  try {
    for (const item of items) {
      await handleMoveToCart(item.productId);
    }

    showToast('All items moved to cart!');
  } catch {
    showToast('Failed to move all items', 'error');
  }
};

  if (loading) {
  return (
    <div className="container-custom py-20 text-center">
      <h2 className="text-xl font-semibold">
        Loading Wishlist...
      </h2>
    </div>
  );
}

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-20 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-3">Sign In to View Wishlist</h2>
        <Link href="/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" /> My Wishlist
          {items.length > 0 && <span className="text-lg font-normal text-gray-500">({items.length} items)</span>}
        </h1>
        {items.length > 0 && (
        <button
  onClick={handleMoveAllToCart}
  className="btn-primary text-sm py-2 flex items-center gap-2"
>
  <ShoppingBag className="w-4 h-4" />
  Move All to Bag
</button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-red-300" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8">Save your favourite wigs by clicking the heart icon on any product.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/women" className="btn-primary">Shop Women&apos;s</Link>
            <Link href="/men" className="btn-secondary">Shop Men&apos;s</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map(({ productId, product }) => {
            if (!product) return null;
            const primaryImg = product.images?.find((i) => i.isPrimary) || product.images?.[0];
            const price = product.salePrice || product.basePrice;
            const discount = product.salePrice ? getDiscountPercent(product.basePrice, product.salePrice) : 0;

            return (
              <div key={productId} className="card group overflow-hidden">
                <div className="relative aspect-product bg-gray-50 overflow-hidden">
                  {primaryImg && (
                    <Link href={`/products/${product.slug}`}>
                      <Image src={primaryImg.url} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    </Link>
                  )}
                  {discount > 0 && <span className="absolute top-2 left-2 badge-sale text-xs font-bold">-{discount}%</span>}
                  <button
                    onClick={() => handleRemove(productId)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-sm transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-3">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 hover:text-brand-600 transition-colors mb-1">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="font-bold text-gray-900">{formatPrice(price)}</span>
                    {product.salePrice && <span className="text-xs text-gray-400 line-through">{formatPrice(product.basePrice)}</span>}
                  </div>
                  <button
                    onClick={() => handleMoveToCart(productId)}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Add to Bag
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
