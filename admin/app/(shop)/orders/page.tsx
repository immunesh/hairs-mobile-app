'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ChevronRight, Search, Filter, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { ordersApi } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils';
import { cn } from '@/lib/utils';

const MOCK_ORDERS: Order[] = [
  {
    id: '1', orderNumber: 'HU-DEMO-001', status: 'DELIVERED', paymentStatus: 'PAID',
    subtotal: 3499, discount: 0, shipping: 0, tax: 629, total: 4128,
    items: [{ id: '1', productId: '1', name: 'Silky Straight Lace Front Wig', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200', quantity: 1, price: 3499 }],
    address: { id: '1', type: 'HOME', fullName: 'Priya Sharma', phone: '9876543210', line1: '123 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India', isDefault: true },
    tracking: [], createdAt: '2024-01-15',
  },
  {
    id: '2', orderNumber: 'HU-DEMO-002', status: 'SHIPPED', paymentStatus: 'PAID',
    subtotal: 5999, discount: 0, shipping: 0, tax: 1079, total: 7078,
    items: [{ id: '2', productId: '3', name: "Men's Natural System Hairpiece", image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', quantity: 1, price: 5999 }],
    address: { id: '1', type: 'HOME', fullName: 'Rajesh Kumar', phone: '9876543211', line1: '456 Saket', city: 'New Delhi', state: 'Delhi', pincode: '110017', country: 'India', isDefault: true },
    tracking: [], createdAt: '2024-01-22',
  },
  {
    id: '3', orderNumber: 'HU-DEMO-003', status: 'PROCESSING', paymentStatus: 'PAID',
    subtotal: 2799, discount: 200, shipping: 99, tax: 467, total: 3165,
    items: [{ id: '3', productId: '8', name: 'Voluminous Afro Kinky Wig', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200', quantity: 1, price: 2799 }],
    address: { id: '1', type: 'HOME', fullName: 'Ananya Patel', phone: '9876543212', line1: '789 Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560095', country: 'India', isDefault: true },
    tracking: [], createdAt: '2024-01-28',
  },
];

export default function OrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      ordersApi.getAll().then(({ data }) => {
        if (data.data.length > 0) setOrders(data.data);
      }).catch(() => { }).finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-20 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-3">Sign In to View Orders</h2>
        <Link href="/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  const STATUS_FILTERS = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  const SHIPPED_OR_LATER = ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const filtered = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

  const handleCancelOrder = async (
    orderId: string
  ) => {
    try {
      await ordersApi.cancel(orderId);

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
              ...order,
              status: "CANCELLED",
            }
            : order
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container-custom py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold">My Orders</h1>
        <Link href="/profile" className="text-sm text-brand-600 hover:underline">My Account →</Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all',
              filter === s ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
            )}
          >
            {s === 'ALL' ? 'All Orders' : ORDER_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
          <Link href="/products" className="btn-primary">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order.id} className="card p-5">
              <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-bold text-gray-900">{order.orderNumber}</p>
                    <span className={cn('badge text-xs font-semibold', ORDER_STATUS_COLORS[order.status])}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                  {SHIPPED_OR_LATER.includes(order.status) && order.awbNumber && (
                    <p className="text-xs text-gray-500 mt-1">AWB: <span className="font-semibold text-gray-700">{order.awbNumber}</span></p>
                  )}
                </div>
                <Link
                  href={`/orders/${order.orderNumber}`}
                  className="flex items-center gap-1 text-sm text-brand-600 font-semibold hover:underline"
                >
                  View Details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Order items */}
              <div className="flex gap-3 flex-wrap mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 flex-1 min-w-48">
                    {item.image && (
                      <div className="relative w-14 h-18 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} · {formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Total: <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
                </p>
                <div className="flex gap-2">
                 

                  <Link href={`/orders/${order.orderNumber}`} className="text-xs btn-primary py-1.5 px-4">
                    {SHIPPED_OR_LATER.includes(order.status) ? 'Track' : 'Details'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
