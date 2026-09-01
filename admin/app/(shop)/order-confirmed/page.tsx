'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, MapPin, Star, ArrowRight, Download } from 'lucide-react';

export default function OrderConfirmedPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || 'HU-ORDER-001';

  const estimatedDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div className="container-custom py-16 max-w-2xl mx-auto">
      {/* Success animation */}
      <div className="text-center mb-10">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <CheckCircle className="w-14 h-14 text-green-500" />
        </div>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-3">Order Confirmed!</h1>
        <p className="text-gray-500 text-lg">
          Thank you for your order. We&apos;re getting it ready for you!
        </p>
      </div>

      {/* Order details card */}
      <div className="card p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Order Number</p>
            <p className="text-2xl font-display font-bold text-brand-600">{orderId}</p>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-brand-600 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> Invoice
          </button>
        </div>

        {/* Tracking steps */}
        <div className="relative">
          <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gray-200" />
          {[
            { icon: CheckCircle, label: 'Order Placed', desc: 'Just now', done: true, active: false },
            { icon: Package, label: 'Processing', desc: 'Within 24 hours', done: false, active: true },
            { icon: Truck, label: 'Shipped', desc: '1–2 business days', done: false, active: false },
            { icon: MapPin, label: 'Out for Delivery', desc: '3–5 business days', done: false, active: false },
            { icon: CheckCircle, label: 'Delivered', desc: `Expected ${estimatedDate}`, done: false, active: false },
          ].map(({ icon: Icon, label, desc, done, active }) => (
            <div key={label} className="flex items-start gap-4 mb-5 last:mb-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${
                done ? 'bg-green-500 text-white' : active ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className={`font-semibold text-sm ${active ? 'text-brand-600' : done ? 'text-green-600' : 'text-gray-500'}`}>{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              {active && (
                <span className="ml-auto text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium animate-pulse-soft">
                  In Progress
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 bg-brand-50 rounded-xl p-4">
          <p className="text-sm text-brand-700">
            <span className="font-semibold">Estimated Delivery:</span> {estimatedDate}
          </p>
          <p className="text-xs text-brand-600 mt-1">
            You will receive an email + SMS with tracking details.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href={`/orders/${orderId}`} className="btn-primary flex items-center justify-center gap-2 py-3">
          <Package className="w-4 h-4" /> Track Order
        </Link>
        <Link href="/products" className="btn-secondary flex items-center justify-center gap-2 py-3">
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Review CTA */}
      <div className="card p-5 text-center">
        <Star className="w-8 h-8 text-amber-400 fill-amber-400 mx-auto mb-2" />
        <h3 className="font-semibold text-gray-900 mb-1">Enjoying your new wig?</h3>
        <p className="text-sm text-gray-500 mb-3">Share your experience and help others find their perfect style.</p>
        <Link href="/profile" className="text-brand-600 text-sm font-semibold hover:underline">
          Write a Review →
        </Link>
      </div>
    </div>
  );
}
