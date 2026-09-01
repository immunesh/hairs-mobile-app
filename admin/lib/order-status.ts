export const ORDER_STATUS_FLOW = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

export const ADMIN_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out For Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ADMIN_STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PROCESSING: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  SHIPPED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  OUT_FOR_DELIVERY: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  DELIVERED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

// Statuses reachable through the plain status-update endpoint.
// SHIPPED is deliberately excluded — it can only be reached via the
// shipment modal, which requires an AWB to be assigned first.
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["CANCELLED"],
  SHIPPED: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function getNextStatusOptions(currentStatus: string): string[] {
  return ALLOWED_TRANSITIONS[currentStatus] || [];
}

export function isTerminalStatus(status: string): boolean {
  return getNextStatusOptions(status).length === 0;
}
