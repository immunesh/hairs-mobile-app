"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Truck, Eye, Pencil } from "lucide-react";
import {
  getAllOrders,
  updateOrderStatus,
} from "@/lib/order-api";
import {
  ADMIN_STATUS_BADGE,
  ADMIN_STATUS_LABELS,
  getNextStatusOptions,
} from "@/lib/order-status";
import { useUIStore } from "@/lib/store";
import ShipmentModal from "@/components/admin/ShipmentModal";

export default function OrdersPage() {
  const { showToast } = useUIStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [shipmentModal, setShipmentModal] = useState<{
    orderId: string;
    mode: "create" | "edit";
    existing?: any;
  } | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: string
  ) => {
    try {
      setUpdatingId(id);
      await updateOrderStatus(id, status);
      showToast(`Order status updated to ${ADMIN_STATUS_LABELS[status] || status}`);
      loadOrders();
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <p>Loading orders...</p>;
  }

return (
  <div className="p-4 sm:p-6 lg:p-8">
    {/* Header */}
    <div className="mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
        Order Management
      </h1>

      <p className="mt-2 text-sm sm:text-base text-slate-400">
        Manage customer orders and update status
      </p>
    </div>

    {/* Loading */}
    {loading ? (
      <div
        className="
        rounded-3xl
        bg-white/5
        border
        border-white/10
        backdrop-blur-xl
        p-8 sm:p-10
        text-center
        text-slate-400
        "
      >
        Loading orders...
      </div>
    ) : (
      <div
        className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        backdrop-blur-xl
        overflow-hidden
        "
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                  Order No
                </th>

                <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                  Customer
                </th>

                <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                  Email
                </th>

                <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                  Total
                </th>

                <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                  Status
                </th>

                <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                  Shipment
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="
                    text-center
                    p-8 sm:p-10
                    text-slate-500
                    "
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const nextOptions = getNextStatusOptions(order.status);
                  const hasShipment = !!order.awbNumber;

                  return (
                  <tr
                    key={order.id}
                    className="
                    border-b
                    border-white/5
                    hover:bg-white/5
                    transition-all
                    duration-300
                    "
                  >
                    {/* Order Number */}
                    <td className="p-3 sm:p-5">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-white hover:text-cyan-400 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>

                    {/* Customer */}
                    <td className="p-3 sm:p-5 text-white">
                      {order.user?.firstName}{" "}
                      {order.user?.lastName}
                    </td>

                    {/* Email */}
                    <td className="p-3 sm:p-5 text-slate-400">
                      {order.user?.email}
                    </td>

                    {/* Total */}
                    <td className="p-3 sm:p-5">
                      <span className="font-semibold text-emerald-400">
                        ₹{order.total}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3 sm:p-5">
                      <div className="space-y-2 min-w-[150px]">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                            ADMIN_STATUS_BADGE[order.status] ||
                            "bg-white/5 text-slate-300 border-white/10"
                          }`}
                        >
                          {ADMIN_STATUS_LABELS[order.status] || order.status}
                        </span>

                        {nextOptions.length > 0 && (
                          <select
                            value=""
                            disabled={updatingId === order.id}
                            onChange={(e) =>
                              e.target.value &&
                              handleStatusChange(order.id, e.target.value)
                            }
                            className="
                            w-full
                            px-3
                            py-2

                            text-xs

                            rounded-xl

                            bg-[#131827]

                            border
                            border-white/10

                            text-slate-300

                            focus:outline-none
                            focus:border-cyan-500/50
                            disabled:opacity-50
                            "
                          >
                            <option value="">
                              {updatingId === order.id ? "Updating..." : "Move to..."}
                            </option>
                            {nextOptions.map((s) => (
                              <option key={s} value={s}>
                                {ADMIN_STATUS_LABELS[s] || s}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>

                    {/* Shipment */}
                    <td className="p-3 sm:p-5 text-sm">
                      {hasShipment ? (
                        <div className="space-y-1 min-w-[180px]">
                          <p className="text-slate-300">
                            Courier:{" "}
                            <span className="font-medium text-white">
                              {order.courier || "—"}
                            </span>
                          </p>
                          <p className="text-slate-300">
                            AWB:{" "}
                            <span className="font-medium text-white break-all">
                              {order.awbNumber}
                            </span>
                          </p>
                          <div className="flex items-center gap-3 pt-1">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="flex items-center gap-1 text-cyan-400 hover:underline text-xs"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </Link>
                            <button
                              onClick={() =>
                                setShipmentModal({
                                  orderId: order.id,
                                  mode: "edit",
                                  existing: order,
                                })
                              }
                              className="flex items-center gap-1 text-purple-400 hover:underline text-xs"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                          </div>
                        </div>
                      ) : order.status === "PROCESSING" ? (
                        <button
                          onClick={() =>
                            setShipmentModal({ orderId: order.id, mode: "create" })
                          }
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-all"
                        >
                          <Truck className="w-3.5 h-3.5" /> Ship Order
                        </button>
                      ) : (
                        <span className="text-slate-500">Not Assigned</span>
                      )}
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {shipmentModal && (
      <ShipmentModal
        orderId={shipmentModal.orderId}
        mode={shipmentModal.mode}
        existing={shipmentModal.existing}
        onClose={() => setShipmentModal(null)}
        onSuccess={loadOrders}
      />
    )}
  </div>
);
}
