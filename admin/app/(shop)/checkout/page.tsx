'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronRight, Plus, MapPin, CreditCard, Truck, Shield, Check, Loader2, Tag, ShoppingBag, X } from 'lucide-react';
import { useCartStore, useAuthStore, useUIStore } from '@/lib/store';
import {
  ordersApi,
  userApi,
  couponApi
} from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Address } from '@/types';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: '📱', desc: 'Pay via GPay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦', desc: 'All major banks' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when delivered' },
  { id: 'emi', label: 'EMI', icon: '📅', desc: 'No-cost EMI on credit cards' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, couponCode, discount, setCoupon, clearCoupon } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const { showToast } = useUIStore();

  const [addresses, setAddresses] = useState<Address[]>([]);

  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    type: 'HOME' as 'HOME' | 'OFFICE' | 'OTHER',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });



  const total = items.reduce(
    (sum, item) => {
      const price = item.product.salePrice || item.product.basePrice;
      return sum + price * item.quantity;
    },
    0
  );

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    userApi.getAddresses().then(({ data }) => {
      setAddresses(data.data);
      const list = data.data;
      const def = list.find((a: Address) => a.isDefault) || list[0];
      if (def) setSelectedAddress(def.id);
    }).catch(() => { });
  }, [isAuthenticated, router]);

  const resetAddressForm = () => setAddressForm({
    firstName: '', lastName: '', phone: '', type: 'HOME',
    line1: '', line2: '', city: '', state: '', pincode: '',
  });

  const handleSaveAddress = async () => {
    if (!addressForm.firstName.trim() || !addressForm.lastName.trim() ||
      !addressForm.phone.trim() || !addressForm.line1.trim() ||
      !addressForm.city.trim() || !addressForm.state.trim() ||
      !addressForm.pincode.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setSavingAddress(true);
    try {
      const payload = {
        fullName: `${addressForm.firstName.trim()} ${addressForm.lastName.trim()}`,
        phone: addressForm.phone.trim(),
        type: addressForm.type,
        line1: addressForm.line1.trim(),
        line2: addressForm.line2.trim() || undefined,
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        pincode: addressForm.pincode.trim(),
        country: 'India',
      };
      const { data } = await userApi.addAddress(payload);
      const newAddr: Address = data.data;
      setAddresses((prev) => [...prev, newAddr]);
      setSelectedAddress(newAddr.id);
      setShowAddressModal(false);
      resetAddressForm();
      showToast('Address added successfully!');
    } catch {
      showToast('Failed to save address', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  useEffect(() => {
    setCouponInput(couponCode || '');
  }, [couponCode]);

  const shipping = total >= 999 ? 0 : 99;
  const tax = Math.max(total - discount, 0) * 0.18;
  const grandTotal = Math.max(total + shipping + tax - discount, 0);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      setApplyingCoupon(true);
      const { data } = await couponApi.apply(couponInput, total);
      setCoupon(couponInput.toUpperCase(), data.data.discount);
      showToast(`Coupon Applied! ₹${data.data.discount} off`, "success");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Invalid coupon", "error");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { showToast('Please select a delivery address', 'error'); return; }
    if (!paymentMethod) { showToast('Please select a payment method', 'error'); return; }
    setPlacing(true);
    try {
      const { data } = await ordersApi.create({
        addressId: selectedAddress,
        paymentMethod,
        couponCode: discount > 0 ? couponCode : undefined,
      });
      clearCart();
      router.push(`/order-confirmed?id=${data.data.orderNumber}`);
    } catch {
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setPlacing(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="container-custom py-10">
      <h1 className="text-2xl font-display font-bold mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Main Column: Unified Form (Review Order -> Address -> Payment Method) */}
        <div className="lg:col-span-2 lg:pr-4 space-y-6">
          <div className="card p-6 md:p-8 space-y-8">

            {/* Section 1: Review Your Order */}
            <div>
              <h2 className="font-bold text-lg mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
                <ShoppingBag className="w-5 h-5 text-brand-600" /> 1. Review Your Order
              </h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => {
                  const img = item.product.images?.find((i) => i.isPrimary) || item.product.images?.[0];
                  const price = item.product.salePrice || item.product.basePrice;
                  return (
                    <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                      {img && <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0"><Image src={img.url} alt={item.product.name} fill className="object-cover" /></div>}
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold">{formatPrice(price * item.quantity)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Code section inside review section */}
              <div className="mb-4 space-y-2 max-w-md">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Coupon Code (optional)</label>
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
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="e.g. FIRST20"
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
                      className="btn-secondary text-sm py-2 px-4 whitespace-nowrap"
                    >
                      {applyingCoupon ? "Applying..." : "Apply"}
                    </button>
                  </div>
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
            </div>

            <hr className="border-gray-100" />

            {/* Section 2: Delivery Address */}
            <div>
              <h2 className="font-bold text-lg mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
                <MapPin className="w-5 h-5 text-brand-600" /> 2. Delivery Address
              </h2>
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label key={addr.id} className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddress === addr.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'
                    }`}>
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)}
                      className="mt-1 text-brand-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{addr.fullName}</span>
                        <span className="badge bg-gray-100 text-gray-600 text-xs">{addr.type}</span>
                        {addr.isDefault && <span className="badge bg-green-100 text-green-700 text-xs">Default</span>}
                      </div>
                      <p className="text-sm text-gray-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                      <p className="text-sm text-gray-600">{addr.city}, {addr.state} — {addr.pincode}</p>
                      <p className="text-sm text-gray-500 mt-1">📞 {addr.phone}</p>
                    </div>
                  </label>
                ))}
                <button
                  onClick={() => { resetAddressForm(); setShowAddressModal(true); }}
                  className="flex items-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-brand-600 hover:border-brand-400 hover:bg-brand-50 transition-all font-medium w-fit"
                >
                  <Plus className="w-4 h-4" /> Add New Address
                </button>
              </div>
            </div>

            {/* Section 3: Payment Method (Only visible if address selected) */}
            {selectedAddress && (
              <>
                <hr className="border-gray-100 animate-fade-in" />
                <div className="animate-fade-in space-y-4">
                  <h2 className="font-bold text-lg mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <CreditCard className="w-5 h-5 text-brand-600" /> 3. Payment Method
                  </h2>
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((method) => {
                      const isDisabled = method.id !== "cod";

                      return (
                        <label
                          key={method.id}
                          className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${paymentMethod === method.id
                            ? "border-brand-500 bg-brand-50"
                            : "border-gray-200"
                            } ${isDisabled
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer hover:border-brand-300"
                            }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            disabled={isDisabled}
                            onChange={() => setPaymentMethod(method.id)}
                            className="text-brand-600"
                          />

                          <span className="text-xl">{method.icon}</span>

                          <div className="flex-1">
                            <p className="font-semibold text-sm">
                              {method.label}
                            </p>
                            <p className="text-xs text-gray-500">
                              {method.desc}
                            </p>

                            {isDisabled && (
                              <p className="text-xs text-red-500 mt-1">
                                Coming Soon
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Sticky Right Column: Order Summary & Place Order Button */}
        <div className="space-y-4 lg:sticky lg:top-24 h-fit">
          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Order Summary</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal ({itemCount} items)</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
              <div className="flex justify-between text-gray-600"><span>GST (18%)</span><span>{formatPrice(tax)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium animate-fade-in">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-gray-900">
              <span>Total</span><span className="text-brand-600">{formatPrice(grandTotal)}</span>
            </div>

            {/* Place Order Button right in the summary card */}
            <button
              onClick={handlePlaceOrder}
              disabled={placing || !selectedAddress || !paymentMethod}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {placing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Placing Order...
                </>
              ) : (
                <>Place Order — {formatPrice(grandTotal)}</>
              )}
            </button>

            {!selectedAddress && (
              <p className="text-xs text-red-500 text-center font-medium">Please select a delivery address to complete your order</p>
            )}
            {selectedAddress && !paymentMethod && (
              <p className="text-xs text-red-500 text-center font-medium">Please select a payment method to complete your order</p>
            )}

            <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-2 text-xs text-green-700 font-medium">
              <Shield className="w-4 h-4 flex-shrink-0" /> Your payment is 100% secure and encrypted
            </div>

            <div className="text-[11px] text-gray-400 space-y-1.5 pt-2 border-t border-gray-50">
              <p>✓ Free delivery on orders above ₹999</p>
              <p>✓ Estimated delivery in 3–5 business days</p>
              <p>✓ 7-day hassle-free returns</p>
            </div>
          </div>
        </div>

      </div>

      {/* Add New Address Modal */}
      {showAddressModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowAddressModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg pointer-events-auto shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-display font-bold text-gray-900">Add New Address</h3>
                <button onClick={() => setShowAddressModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name *</label>
                    <input
                      value={addressForm.firstName}
                      onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                      placeholder="John"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name *</label>
                    <input
                      value={addressForm.lastName}
                      onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                      placeholder="Doe"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                  <input
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Type</label>
                  <div className="flex gap-2">
                    {(['HOME', 'OFFICE', 'OTHER'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAddressForm({ ...addressForm, type: t })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${addressForm.type === t
                          ? 'border-brand-500 bg-brand-50 text-brand-600'
                          : 'border-gray-200 text-gray-600 hover:border-brand-300'
                          }`}
                      >
                        {t === 'HOME' ? '🏠 Home' : t === 'OFFICE' ? '🏢 Work' : '📍 Other'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 1 *</label>
                  <input
                    value={addressForm.line1}
                    onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                    placeholder="House no., Building, Street"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 2</label>
                  <input
                    value={addressForm.line2}
                    onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                    placeholder="Landmark, Area (optional)"
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                    <input
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      placeholder="City"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">State *</label>
                    <input
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      placeholder="State"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode *</label>
                    <input
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '') })}
                      placeholder="6-digit"
                      maxLength={6}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAddress}
                  disabled={savingAddress}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {savingAddress ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Check className="w-4 h-4" /> Save Address</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
