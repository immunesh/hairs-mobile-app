"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { updateOrderStatus } from "@/lib/order-api";
import { ADMIN_STATUS_LABELS, getNextStatusOptions } from "@/lib/order-status";
import { useUIStore } from "@/lib/store";

export default function UpdateOrderStatus({
  orderId,
  currentStatus,
  onUpdated,
}: {
  orderId: string;
  currentStatus: string;
  onUpdated: () => void;
}) {
  const { showToast } = useUIStore();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nextOptions = getNextStatusOptions(currentStatus);

  async function handleUpdate() {
    if (!status) return;
    setError("");

    try {
      setLoading(true);
      await updateOrderStatus(orderId, status);
      showToast(`Order status updated to ${ADMIN_STATUS_LABELS[status] || status}`);
      setStatus("");
      onUpdated();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to update status";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  if (nextOptions.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No further status changes are available for this order.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <label className="flex-1 text-sm text-slate-300">
          <span className="mb-2 block">Move Order To</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-white/10 bg-slate-900/70 text-white p-2 rounded-xl focus:outline-none focus:border-cyan-500/50"
          >
            <option value="">Select next status...</option>
            {nextOptions.map((s) => (
              <option key={s} value={s}>
                {ADMIN_STATUS_LABELS[s] || s}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={handleUpdate}
          disabled={loading || !status}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Updating..." : "Update"}
        </button>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}
    </div>
  );
}
