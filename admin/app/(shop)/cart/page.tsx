'use client';

import {
  useEffect,
  useState
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Gift, Tag, ArrowLeft } from 'lucide-react';
import { useCartStore, useAuthStore } from '@/lib/store';
import {
  cartApi,
  couponApi
} from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const {
    items,
    setItems,
    removeItem,
    updateItem,
    couponCode,
    discount,
    setCoupon,
    clearCoupon
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      cartApi.get().then(({ data }) => setItems(data.data)).catch(() => { });
    }
  }, [isAuthenticated, setItems]);

  useEffect(() => {
    setCouponInput(couponCode || '');
  }, [couponCode]);

  const handleQuantityChange = async (id: string, newQty: number) => {
    try {
      if (newQty <= 0) { await cartApi.remove(id); removeItem(id); }
      else { await cartApi.update(id, newQty); updateItem(id, newQty); }
    } catch { }
  };
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

  const shipping =
    calculatedTotal >= 999 ? 0 : 99;

  const tax =
    Math.max(calculatedTotal - discount, 0) * 0.18;

  const grandTotal =
    Math.max(
      calculatedTotal +
      shipping +
      tax -
      discount,
      0
    );

  console.log("CALCULATED TOTAL", calculatedTotal);
  console.log("CALCULATED COUNT", calculatedItemCount);
  const handleApplyCoupon =
    async () => {
      if (!couponInput.trim()) return;
      try {
        setApplyingCoupon(true);

        const { data } =
          await couponApi.apply(
            couponInput,
            calculatedTotal
          );

        setCoupon(
          couponInput.toUpperCase(),
          data.data.discount
        );

        alert(
          `Coupon Applied! Discount ₹${data.data.discount}`
        );
      } catch (err: any) {
        alert(
          err?.response?.data
            ?.message ||
          "Coupon failed"
        );
      } finally {
        setApplyingCoupon(false);
      }
    };

  if (!isAuthenticated) {
    console.log("CART ITEMS", items);

    return (
      <div className="container-custom py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold mb-3">Please Sign In</h2>
        <p className="text-gray-500 mb-6">Sign in to view your cart and checkout</p>
        <Link href="/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/products" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-display font-bold">
          Your Bag ({calculatedItemCount} items)
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your bag is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven&apos;t added any wigs yet.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/women" className="btn-primary">Shop Women&apos;s</Link>
            <Link href="/men" className="btn-secondary">Shop Men&apos;s</Link>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {calculatedTotal < 999 && (
              <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4">
                <p className="text-sm text-brand-700 font-medium mb-2">
                  Add {formatPrice(999 - calculatedTotal)} more for FREE shipping!
                </p>
                <div className="h-2 bg-brand-200 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-600 rounded-full" style={{ width: `${Math.min((calculatedTotal / 999) * 100, 100)}%` }} />
                </div>
              </div>
            )}
            {calculatedTotal >= 999 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-2">
                <Gift className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-700 font-semibold">You qualify for FREE shipping!</p>
              </div>
            )}

            {items.map((item) => {
              const primaryImg = item.product.images?.find((i) => i.isPrimary) || item.product.images?.[0];
              const price = item.product.salePrice || item.product.basePrice;
              return (
                <div key={item.id} className="card p-5 flex gap-5">
                  {primaryImg && (
                    <Link href={`/products/${item.product.slug}`}>
                      <div className="relative w-28 h-36 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                        <Image src={primaryImg.url} alt={item.product.name} fill className="object-cover" />
                      </div>
                    </Link>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">{item.product.category?.name}</p>
                        <Link href={`/products/${item.product.slug}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-brand-600 transition-colors">{item.product.name}</h3>
                        </Link>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.product.color && <span className="text-xs text-gray-500">{item.product.color}</span>}
                          {item.product.texture && <><span className="text-xs text-gray-300">·</span><span className="text-xs text-gray-500">{item.product.texture}</span></>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleQuantityChange(item.id, 0)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                        <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="p-2 hover:bg-gray-100 rounded-l-xl transition-colors">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-4 font-semibold">{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className="p-2 hover:bg-gray-100 rounded-r-xl transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatPrice(price * item.quantity)}</p>
                        {item.quantity > 1 && <p className="text-xs text-gray-400">{formatPrice(price)} each</p>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            {/* Coupon */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-brand-600" /> Apply Coupon
                </h3>
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
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) =>
                        setCouponInput(
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="Enter coupon code"
                      className="input-field flex-1 text-sm py-2 uppercase"
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
                      className="btn-secondary text-sm py-2 px-4"
                    >
                      {applyingCoupon ? "Applying..." : "Apply"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {['FIRST20', 'HAIRSUP200'].map((code) => (
                      <button
                        key={code}
                        onClick={() => setCouponInput(code)}
                        className="text-xs bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-1 rounded-full font-medium hover:bg-brand-100 transition-colors"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-bold text-green-800 uppercase">{couponCode}</span>
                    <span className="text-xs text-green-600 font-medium">Applied Successfully</span>
                  </div>
                  <span className="font-bold text-green-700">-{formatPrice(discount)}</span>
                </div>
              )}
            </div>

            {/* Price summary */}
            <div className="card p-5 space-y-3">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({calculatedItemCount} items)</span>
                <span>{formatPrice(calculatedTotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon Discount</span>
                  <span>
                    -{formatPrice(discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>GST (18%)</span>
                <span>{formatPrice(tax)}</span>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
              <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 mt-2 py-3.5">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs text-gray-500 text-center">Secure checkout powered by Razorpay</p>
            </div>

            {/* Assurance */}
            <div className="card p-4 space-y-2">
              {['100% Authentic Products', 'Easy 7-Day Returns', 'Secure Payment Gateway', 'Expert Hair Consultants'].map((text) => (
                <div key={text} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-green-500">✓</span> {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
