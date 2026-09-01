'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package, MapPin, CreditCard, ArrowLeft,
  CheckCircle, Circle, Truck, ExternalLink,
} from 'lucide-react';
import { Order } from '@/types';
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ordersApi } from '@/lib/api';

const STATUS_TIMELINE = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const formatDateTime = (dateStr: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(new Date(dateStr));

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);

        const { data } =
          await ordersApi.getById(
            params.id as string
          );

        setOrder(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadOrder();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="container-custom py-10">
        Loading...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-custom py-10">
        Order not found
      </div>
    );
  }
  const currentStatusIdx = STATUS_TIMELINE.indexOf(order.status);
  const isShippedOrLater = currentStatusIdx >= STATUS_TIMELINE.indexOf('SHIPPED');

  return (
    <div className="container-custom py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/orders" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Order {order.orderNumber}</h1>
          <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={cn('badge text-sm font-semibold px-3 py-1', ORDER_STATUS_COLORS[order.status])}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>

        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: tracking + items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipment info */}
          {isShippedOrLater ? (
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-600" /> Shipment Details
              </h2>

              <div className="grid sm:grid-cols-3 gap-4 mb-5">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Courier</p>
                  <p className="text-base font-bold text-gray-900 mt-0.5">{order.courier || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tracking Number</p>
                  <p className="text-base font-bold text-gray-900 mt-0.5 break-all">{order.awbNumber || '—'}</p>
                </div>
                {order.estimatedDelivery && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Estimated Delivery</p>
                    <p className="text-base font-bold text-gray-900 mt-0.5">{formatDate(order.estimatedDelivery)}</p>
                  </div>
                )}
              </div>

              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center justify-center gap-2 text-sm py-2.5 px-5"
                >
                  Track Package <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ) : (
            <div className="card p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tracking Number</p>
                <p className="text-base font-semibold text-gray-400 mt-0.5">Not Available Yet</p>
              </div>
              <Truck className="w-8 h-8 text-gray-300" />
            </div>
          )}

          {/* Tracking timeline */}
          {!['CANCELLED', 'RETURNED'].includes(order.status) && (
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-600" /> Order Tracking
              </h2>

              {/* Stepper */}
              <div className="space-y-0 mb-6">
                {STATUS_TIMELINE.map((stageStatus, i) => {
                  const isComplete = i <= currentStatusIdx;
                  const event = order.tracking.find((t) => t.status === stageStatus);
                  const isLast = i === STATUS_TIMELINE.length - 1;

                  return (
                    <div key={stageStatus} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        {isComplete ? (
                          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />
                        )}
                        {!isLast && (
                          <div className={cn('w-0.5 flex-1 min-h-[24px]', isComplete && i < currentStatusIdx ? 'bg-green-400' : 'bg-gray-200')} />
                        )}
                      </div>
                      <div className={cn('flex-1 flex items-center justify-between', !isLast && 'pb-5')}>
                        <p className={cn('font-semibold text-sm', isComplete ? 'text-gray-900' : 'text-gray-400')}>
                          {ORDER_STATUS_LABELS[stageStatus]}
                        </p>
                        {event && (
                          <p className="text-xs text-gray-400">{formatDateTime(event.createdAt)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Activity log */}
              {order.tracking.length > 0 && (
                <div className="border-t border-gray-100 pt-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Activity Log</p>
                  <div className="space-y-4">
                    {order.tracking.map((event, i) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                            i === 0 ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'
                          )}>
                            {i === 0 ? <Truck className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </div>
                          {i < order.tracking.length - 1 && <div className="w-0.5 h-8 bg-gray-200 mt-1" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className={cn('font-semibold text-sm', i === 0 ? 'text-brand-700' : 'text-gray-600')}>
                            {event.message}
                          </p>
                          {event.location && <p className="text-xs text-gray-500 mt-0.5">📍 {event.location}</p>}
                          <p className="text-xs text-gray-400 mt-1">{formatDateTime(event.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Order items */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-600" /> Items Ordered
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                  {item.image && (
                    <div className="relative w-20 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">Quantity: {item.quantity}</p>
                    {item.variant && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Object.entries(item.variant).map(([k, v]) => (
                          <span key={k} className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{k}: {v}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                    <p className="text-xs text-gray-400">{formatPrice(item.price)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: address + payment + summary */}
        <div className="space-y-5">
          {/* Delivery address */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600" /> Delivery Address
            </h3>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-semibold text-gray-900">{order.address.fullName}</p>
              <p>{order.address.line1}</p>
              {order.address.line2 && <p>{order.address.line2}</p>}
              <p>{order.address.city}, {order.address.state}</p>
              <p>{order.address.pincode} — {order.address.country}</p>
              <p className="mt-1">📞 {order.address.phone}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-600" /> Payment
            </h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Method</span>
                <span className="font-medium">{order.paymentMethod || 'UPI'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Status</span>
                <span className={cn('font-semibold', order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-600')}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Price summary */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3">Price Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={order.shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span><span>{formatPrice(order.tax)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-base">
                <span>Total Paid</span><span className="text-brand-600">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {order.status === 'DELIVERED' && (
              <Link href={`/products`} className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5">
                Buy Again
              </Link>
            )}

            <Link href="/contact" className="block text-center text-sm text-brand-600 hover:underline">
              Need help with this order? →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
