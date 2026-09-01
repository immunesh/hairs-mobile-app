'use client';

import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';

/**
 * Non-dismissable modal shown on the try-on page when no product ID
 * is present in the URL. Blocks all interaction until the user navigates
 * to the shop.
 */
export default function TryOnNoProductModal() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-xl">
        {/* Icon */}
        <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <ShoppingBag className="w-8 h-8 text-brand-600" />
        </div>

        {/* Message */}
        <h2 className="text-xl font-display font-bold text-gray-900 mb-2">
          Please choose a product to try on
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Browse our collection and tap &quot;Try On&quot; on any product to see how it looks on you.
        </p>

        {/* CTA */}
        <button
          onClick={() => router.push('/shop')}
          className="btn-primary w-full"
        >
          Shop Now
        </button>
      </div>
    </div>
  );
}
