'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Gift, Tag } from 'lucide-react';
import { useCartStore, useAuthStore } from '@/lib/store';
import { cartApi, couponApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function CartSidebar() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateItem,
    couponCode,
    discount,
    setCoupon,
    clearCoupon
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  const calculatedTotal = items.reduce((sum, item) => {
    const price =
      Number(item.product?.salePrice) ||
      Number(item.product?.basePrice) ||
      0;

    return sum + price * item.quantity;
  }, 0);

  const calculatedItemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    setCouponInput(couponCode || '');
    if (!couponCode) {
      setCouponError('');
    }
  }, [couponCode]);

  useEffect(() => {
    if (isAuthenticated) {
      cartApi.get().then(({ data }) => {
        useCartStore.getState().setItems(data.data);
      }).catch(() => { });
    }
  }, [isAuthenticated]);

  const handleQuantityChange = async (id: string, newQty: number) => {
    try {
      if (newQty <= 0) {
        await cartApi.remove(id);
        removeItem(id);
      } else {
        await cartApi.update(id, newQty);
        updateItem(id, newQty);
      }
    } catch { }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      setApplyingCoupon(true);
      setCouponError('');
      const { data } = await couponApi.apply(couponInput, calculatedTotal);
      setCoupon(couponInput.toUpperCase(), data.data.discount);
    } catch (err: any) {
      setCouponError(err?.response?.data?.message || "Invalid coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const shipping = calculatedTotal >= 999 ? 0 : 99;
  const grandTotal = Math.max(calculatedTotal + shipping - discount, 0);
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-bold">Your Bag ({calculatedItemCount})</h2>
          </div>
          <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free shipping progress */}
        {items.length > 0 && calculatedTotal < 999 && (
          <div className="px-6 py-3 bg-brand-50">
            <p className="text-xs text-brand-700 font-medium mb-1.5">
              Add {formatPrice(999 - calculatedTotal)} more for FREE shipping!
            </p>
            <div className="h-1.5 bg-brand-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((calculatedTotal / 999) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        {items.length > 0 && calculatedTotal >= 999 && (
          <div className="px-6 py-3 bg-green-50">
            <p className="text-xs text-green-700 font-semibold flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5" /> Yay! You qualify for FREE shipping!
            </p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Your bag is empty</h3>
              <p className="text-sm text-gray-500 mb-6">Looks like you haven&apos;t added any wigs yet.</p>
              <Link href="/shop" onClick={closeCart} className="btn-primary">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const primaryImg = item.product.images?.find((i) => i.isPrimary) || item.product.images?.[0];
                const price = item.product.salePrice || item.product.basePrice;
                return (
                  <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-2xl">
                    {primaryImg && (
                      <Link href={`/products/${item.product.slug}`} onClick={closeCart}>
                        <div className="relative w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white">
                          <Image src={primaryImg.url} alt={item.product.name} fill className="object-cover" />
                        </div>
                      </Link>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product.slug}`} onClick={closeCart}>
                        <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 hover:text-brand-600 transition-colors">
                          {item.product.name}
                        </h4>
                      </Link>
                      {item.product.color && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.product.color}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-gray-100 rounded-l-lg transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-gray-100 rounded-r-lg transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm">{formatPrice(price * item.quantity)}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, 0)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 space-y-4">
            {/* Coupon Section */}
            <div className="space-y-2 border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-600" /> Apply Coupon
                </span>
                {couponCode && (
                  <button
                    onClick={clearCoupon}
                    className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              {!couponCode ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 bg-gray-55/50 uppercase"
                      disabled={applyingCoupon}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleApplyCoupon();
                        }
                      }}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponInput.trim()}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors"
                    >
                      {applyingCoupon ? "Applying..." : "Apply"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[10px] text-red-500 font-medium">{couponError}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['FIRST20', 'HAIRSUP200'].map((code) => (
                      <button
                        key={code}
                        onClick={() => {
                          setCouponInput(code);
                          setCouponError('');
                        }}
                        className="text-[10px] bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full font-medium hover:bg-brand-100 transition-colors"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50/80 border border-green-100 rounded-xl p-2 px-3 animate-fade-in">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-xs font-bold text-green-800 uppercase">{couponCode}</span>
                    <span className="text-[10px] text-green-600 font-medium">applied</span>
                  </div>
                  <span className="text-xs font-bold text-green-700">-{formatPrice(discount)}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(calculatedTotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium animate-fade-in">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3.5"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>

          </div>
        )}
      </div>
    </>
  );
}
