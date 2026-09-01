"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Truck, Pencil, ExternalLink, Loader2 } from "lucide-react";
import { getAdminOrderById } from "@/lib/order-api";
import { ADMIN_STATUS_BADGE, ADMIN_STATUS_LABELS } from "@/lib/order-status";
import UpdateOrderStatus from "@/components/admin/UpdateOrderStatus";
import ShipmentModal from "@/components/admin/ShipmentModal";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shipmentModalOpen, setShipmentModalOpen] = useState(false);

  const loadOrder = useCallback(async () => {
    try {
      const data = await getAdminOrderById(orderId);
      setOrder(data.data);
    } catch (error) {
      console.error(error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) loadOrder();
  }, [orderId, loadOrder]);

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">Order Not Found</h1>
      </div>
    );
  }

  const hasShipment = !!order.awbNumber;
  const shipmentMode: "create" | "edit" = hasShipment ? "edit" : "create";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">Order Details</h1>
          <p className="text-slate-400 mt-2">{order.orderNumber}</p>
        </div>

        <Link
          href="/admin/orders"
          className="
          px-5
          py-3

          rounded-2xl

          bg-white/5
          border
          border-white/10

          text-slate-300

          hover:bg-white/10
          hover:text-white

          transition-all
          duration-300
          "
        >
          ← Back
        </Link>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer */}
        <div
          className="
          rounded-3xl
          bg-white/5
          backdrop-blur-xl
          border
          border-white/10
          p-6
          "
        >
          <h2 className="text-xl font-semibold text-white mb-5">
            Customer Information
          </h2>

          <div className="space-y-3 text-slate-300">
            <p>
              <span className="text-white font-medium">Name:</span>{" "}
              {order.user.firstName} {order.user.lastName}
            </p>

            <p>
              <span className="text-white font-medium">Email:</span>{" "}
              {order.user.email}
            </p>

            <p>
              <span className="text-white font-medium">Phone:</span>{" "}
              {order.user.phone || "-"}
            </p>
          </div>
        </div>

        {/* Shipping */}
        <div
          className="
          rounded-3xl
          bg-white/5
          backdrop-blur-xl
          border
          border-white/10
          p-6
          "
        >
          <h2 className="text-xl font-semibold text-white mb-5">
            Shipping Address
          </h2>

          <div className="space-y-2 text-slate-300">
            <p>{order.address.fullName}</p>
            <p>{order.address.line1}</p>

            {order.address.line2 && <p>{order.address.line2}</p>}

            <p>
              {order.address.city}, {order.address.state}
            </p>

            <p>{order.address.pincode}</p>

            <p>{order.address.country}</p>
          </div>
        </div>
      </div>

      {/* Ordered Products */}
      <div
        className="
        mt-6

        rounded-3xl
        bg-white/5
        backdrop-blur-xl
        border
        border-white/10

        overflow-x-auto
        "
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Ordered Products</h2>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-5 text-slate-300">Product</th>
              <th className="text-left p-5 text-slate-300">Qty</th>
              <th className="text-left p-5 text-slate-300">Price</th>
              <th className="text-left p-5 text-slate-300">Total</th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((item: any) => (
              <tr
                key={item.id}
                className="
                border-b
                border-white/5

                hover:bg-white/5
                "
              >
                <td className="p-5 text-white">{item.name}</td>
                <td className="p-5 text-slate-300">{item.quantity}</td>
                <td className="p-5 text-slate-300">₹{item.price}</td>
                <td className="p-5 font-medium text-emerald-400">
                  ₹{item.price * item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary + Status */}
      <div
        className="
        mt-6

        rounded-3xl
        bg-white/5
        backdrop-blur-xl
        border
        border-white/10

        p-6
        "
      >
        <h2 className="text-xl font-semibold text-white mb-5">Order Summary</h2>

        <div className="space-y-3 text-slate-300">
          <p>
            <span className="font-medium text-white">Subtotal:</span> ₹
            {order.subtotal}
          </p>

          <p>
            <span className="font-medium text-white">Discount:</span> ₹
            {order.discount}
          </p>

          <p>
            <span className="font-medium text-white">Shipping:</span> ₹
            {order.shipping}
          </p>

          <p>
            <span className="font-medium text-white">Tax:</span> ₹{order.tax}
          </p>

          <div className="h-px bg-white/10 my-3" />

          <p className="text-2xl font-bold text-emerald-400">₹{order.total}</p>

          <p>
            <span className="font-medium text-white">Payment Status:</span>{" "}
            <span className="text-cyan-400">{order.paymentStatus}</span>
          </p>

          <p>
            <span className="font-medium text-white">Order Status:</span>{" "}
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                ADMIN_STATUS_BADGE[order.status] ||
                "bg-white/5 text-slate-300 border-white/10"
              }`}
            >
              {ADMIN_STATUS_LABELS[order.status] || order.status}
            </span>
          </p>

          <div className="pt-4">
            <UpdateOrderStatus
              orderId={order.id}
              currentStatus={order.status}
              onUpdated={loadOrder}
            />
          </div>
        </div>
      </div>

      {/* Shipment Details */}
      <div
        className="
        mt-6

        rounded-3xl
        bg-white/5
        backdrop-blur-xl
        border
        border-white/10

        p-6
        "
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-cyan-400" /> Shipment Details
          </h2>

          {hasShipment && (
            <button
              onClick={() => setShipmentModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-purple-400 hover:bg-white/10 transition-all text-sm"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit Shipment
            </button>
          )}
        </div>

        {hasShipment ? (
          <div className="space-y-3 text-slate-300">
            <p>
              <span className="font-medium text-white">Courier:</span>{" "}
              {order.courier}
            </p>

            <p>
              <span className="font-medium text-white">AWB Number:</span>{" "}
              <span className="text-cyan-400">{order.awbNumber}</span>
            </p>

            {order.estimatedDelivery && (
              <p>
                <span className="font-medium text-white">
                  Estimated Delivery:
                </span>{" "}
                {new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}

            {order.shippedAt && (
              <p>
                <span className="font-medium text-white">Shipped At:</span>{" "}
                {new Date(order.shippedAt).toLocaleString()}
              </p>
            )}

            {order.shipmentNotes && (
              <p>
                <span className="font-medium text-white">Notes:</span>{" "}
                {order.shipmentNotes}
              </p>
            )}

            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-all"
              >
                Track Package <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        ) : order.status === "PROCESSING" ? (
          <div>
            <p className="text-slate-400 mb-4">
              This order is ready for dispatch. Assign a courier and AWB to
              mark it as shipped.
            </p>
            <button
              onClick={() => setShipmentModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-all"
            >
              <Truck className="w-4 h-4" /> Ship Order
            </button>
          </div>
        ) : (
          <p className="text-slate-500">Not Assigned</p>
        )}
      </div>

      {/* Tracking */}
      <div
        className="
        mt-6

        rounded-3xl
        bg-white/5
        backdrop-blur-xl
        border
        border-white/10

        p-6
        "
      >
        <h2 className="text-xl font-semibold text-white mb-6">
          Tracking History
        </h2>

        <div className="space-y-5">
          {order.tracking.map((track: any) => (
            <div
              key={track.id}
              className="
              border-l-4
              border-cyan-500

              pl-5
              "
            >
              <p className="font-semibold text-white">
                {ADMIN_STATUS_LABELS[track.status] || track.status}
              </p>

              <p className="text-slate-300 mt-1">{track.message}</p>

              <p className="text-sm text-slate-500 mt-2">
                {new Date(track.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {shipmentModalOpen && (
        <ShipmentModal
          orderId={order.id}
          mode={shipmentMode}
          existing={order}
          onClose={() => setShipmentModalOpen(false)}
          onSuccess={loadOrder}
        />
      )}
    </div>
  );
}
