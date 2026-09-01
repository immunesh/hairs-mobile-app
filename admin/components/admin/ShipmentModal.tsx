"use client";

import { useState } from "react";
import { X, Truck, Loader2 } from "lucide-react";
import { createShipment, updateShipment } from "@/lib/order-api";
import { useUIStore } from "@/lib/store";

const COURIERS = [
  "Delhivery",
  "Blue Dart",
  "DTDC",
  "Ekart Logistics",
  "XpressBees",
  "FedEx",
  "India Post",
  "Amazon Shipping",
];

interface ShipmentModalProps {
  orderId: string;
  mode: "create" | "edit";
  existing?: {
    courier?: string | null;
    awbNumber?: string | null;
    trackingUrl?: string | null;
    estimatedDelivery?: string | null;
    shipmentNotes?: string | null;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function ShipmentModal({
  orderId,
  mode,
  existing,
  onClose,
  onSuccess,
}: ShipmentModalProps) {
  const { showToast } = useUIStore();

  const isPredefinedCourier =
    !!existing?.courier && COURIERS.includes(existing.courier);

  const [courierSelect, setCourierSelect] = useState(
    isPredefinedCourier ? (existing!.courier as string) : existing?.courier ? "Other" : COURIERS[0]
  );
  const [customCourier, setCustomCourier] = useState(
    isPredefinedCourier ? "" : existing?.courier || ""
  );
  const [awbNumber, setAwbNumber] = useState(existing?.awbNumber || "");
  const [trackingUrl, setTrackingUrl] = useState(existing?.trackingUrl || "");
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    existing?.estimatedDelivery ? existing.estimatedDelivery.slice(0, 10) : ""
  );
  const [notes, setNotes] = useState(existing?.shipmentNotes || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const courier = courierSelect === "Other" ? customCourier.trim() : courierSelect;

  const handleSave = async () => {
    setError("");

    if (!courier) {
      setError("Courier is required.");
      return;
    }
    if (!awbNumber.trim()) {
      setError("AWB / Tracking number is required.");
      return;
    }
    if (!estimatedDelivery) {
      setError("Estimated delivery date is required.");
      return;
    }
    if (trackingUrl.trim() && !/^https?:\/\//i.test(trackingUrl.trim())) {
      setError("Tracking URL must be a valid http/https URL.");
      return;
    }

    const payload = {
      courier,
      awbNumber: awbNumber.trim(),
      trackingUrl: trackingUrl.trim() || undefined,
      estimatedDelivery,
      notes: notes.trim() || undefined,
    };

    try {
      setLoading(true);
      if (mode === "create") {
        await createShipment(orderId, payload);
        showToast("Shipment created — order marked as Shipped.");
      } else {
        await updateShipment(orderId, payload);
        showToast("Shipment details updated.");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to save shipment";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />

      <div
        className="
        relative
        w-full max-w-lg
        rounded-3xl
        border border-white/10
        bg-[#131827]
        shadow-2xl
        overflow-hidden
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Truck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {mode === "create" ? "Ship Order" : "Edit Shipment"}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === "create"
                  ? "Assign a courier and AWB to mark this order as shipped"
                  : "Update the shipment details for this order"}
              </p>
            </div>
          </div>

          <button
            onClick={() => !loading && onClose()}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Courier Company <span className="text-rose-400">*</span>
            </label>
            <select
              value={courierSelect}
              onChange={(e) => setCourierSelect(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/70 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
            >
              {COURIERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>

            {courierSelect === "Other" && (
              <input
                type="text"
                value={customCourier}
                onChange={(e) => setCustomCourier(e.target.value)}
                placeholder="Enter courier name"
                className="mt-2 w-full px-4 py-2.5 rounded-xl bg-slate-900/70 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              AWB / Tracking Number <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={awbNumber}
              onChange={(e) => setAwbNumber(e.target.value)}
              placeholder="e.g. 123456789012345"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/70 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Tracking URL <span className="text-slate-500">(optional)</span>
            </label>
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://tracking.example.com/123"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/70 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Estimated Delivery Date <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/70 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Notes <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any internal notes about this shipment"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/70 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={() => !loading && onClose()}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-all disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Saving..." : "Save Shipment"}
          </button>
        </div>
      </div>
    </div>
  );
}
