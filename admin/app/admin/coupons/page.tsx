"use client";

import { useEffect, useState } from "react";
import {
  getAllCoupons,
  createCoupon,
  toggleCoupon,
  deleteCoupon,
} from "@/lib/coupon-admin-api";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    code: "",
    type: "PERCENTAGE",
    value: "",
    minOrder: "",
    maxDiscount: "",
    usageLimit: "",
    expiresAt: "",
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const res = await getAllCoupons();
      setCoupons(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      await createCoupon({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrder: form.minOrder
          ? Number(form.minOrder)
          : null,
        maxDiscount: form.maxDiscount
          ? Number(form.maxDiscount)
          : null,
        usageLimit: form.usageLimit
          ? Number(form.usageLimit)
          : null,
        expiresAt:
          form.expiresAt || null,
      });

      setForm({
        code: "",
        type: "PERCENTAGE",
        value: "",
        minOrder: "",
        maxDiscount: "",
        usageLimit: "",
        expiresAt: "",
      });

      loadCoupons();
    } catch (error) {
      console.error(error);
      alert("Failed to create coupon");
    }
  };

  const handleToggle = async (
    id: string
  ) => {
    try {
      await toggleCoupon(id);
      loadCoupons();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (
    id: string
  ) => {
    const confirmDelete =
      window.confirm(
        "Delete this coupon?"
      );

    if (!confirmDelete) return;

    try {
      await deleteCoupon(id);

      setCoupons((prev) =>
        prev.filter(
          (coupon) =>
            coupon.id !== id
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

 if (loading) {
  return (
    <div className="p-8">
      <div
        className="
        rounded-3xl

        bg-white/5
        backdrop-blur-xl

        border
        border-white/10

        p-10

        text-center
        text-slate-400
        "
      >
        Loading coupons...
      </div>
    </div>
  );
}

 return (
  <div className="p-4 sm:p-6 lg:p-8">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
          Coupon Management
        </h1>

        <p className="text-sm sm:text-base text-slate-400 mt-2">
          Create and manage discount coupons
        </p>
      </div>

      <div
        className="
        w-full sm:w-auto
        text-center

        px-4 sm:px-5
        py-3

        rounded-2xl

        bg-emerald-500/10
        border
        border-emerald-500/20

        text-emerald-300
        font-medium
        "
      >
        Total Coupons: {coupons.length}
      </div>
    </div>

    {/* Create Coupon */}
    <form
      onSubmit={handleCreate}
      className="
      rounded-3xl

      bg-white/5
      backdrop-blur-xl

      border
      border-white/10

      p-4 sm:p-6 lg:p-8

      mb-8
      "
    >
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
        Create Coupon
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <input
          placeholder="Coupon Code"
          value={form.code}
          onChange={(e) =>
            setForm({
              ...form,
              code: e.target.value,
            })
          }
          required
          className="
          w-full
          px-4
          py-3

          rounded-2xl

          bg-white/5

          border
          border-white/10

          text-white

          placeholder:text-slate-500

          focus:outline-none
          focus:border-cyan-500/50
          "
        />

        <select
          value={form.type}
          onChange={(e) =>
            setForm({
              ...form,
              type: e.target.value,
            })
          }
          className="
          w-full
          px-4
          py-3

          rounded-2xl

          bg-[#131827]

          border
          border-white/10

          text-white
          "
        >
          <option value="PERCENTAGE">
            Percentage
          </option>

          <option value="FIXED">
            Fixed Amount
          </option>
        </select>

        <input
          type="number"
          placeholder="Value"
          value={form.value}
          onChange={(e) =>
            setForm({
              ...form,
              value: e.target.value,
            })
          }
          required
          className="
          w-full
          px-4
          py-3

          rounded-2xl

          bg-white/5

          border
          border-white/10

          text-white
          "
        />

        <input
          type="number"
          placeholder="Minimum Order"
          value={form.minOrder}
          onChange={(e) =>
            setForm({
              ...form,
              minOrder: e.target.value,
            })
          }
          className="
          w-full
          px-4
          py-3

          rounded-2xl

          bg-white/5

          border
          border-white/10

          text-white
          "
        />

        <input
          type="number"
          placeholder="Maximum Discount"
          value={form.maxDiscount}
          onChange={(e) =>
            setForm({
              ...form,
              maxDiscount: e.target.value,
            })
          }
          className="
          w-full
          px-4
          py-3

          rounded-2xl

          bg-white/5

          border
          border-white/10

          text-white
          "
        />

        <input
          type="number"
          placeholder="Usage Limit"
          value={form.usageLimit}
          onChange={(e) =>
            setForm({
              ...form,
              usageLimit: e.target.value,
            })
          }
          className="
          w-full
          px-4
          py-3

          rounded-2xl

          bg-white/5

          border
          border-white/10

          text-white
          "
        />

        <input
          type="date"
          value={form.expiresAt}
          onChange={(e) =>
            setForm({
              ...form,
              expiresAt: e.target.value,
            })
          }
          className="
          md:col-span-2

          w-full
          px-4
          py-3

          rounded-2xl

          bg-[#131827]

          border
          border-white/10

          text-white
          "
        />
      </div>

      <button
        type="submit"
        className="
        mt-6

        w-full
        sm:w-auto

        px-8
        py-3

        rounded-2xl

        bg-gradient-to-r
        from-cyan-500
        to-purple-600

        text-white
        font-medium

        transition-all
        duration-300

        hover:scale-105

        shadow-[0_0_25px_rgba(56,189,248,0.35)]
        "
      >
        Create Coupon
      </button>
    </form>

    {/* Coupons Table */}
    <div
      className="
      rounded-3xl

      bg-white/5
      backdrop-blur-xl

      border
      border-white/10

      overflow-hidden
      "
    >
      <div className="overflow-x-auto">
    <table className="w-full min-w-[950px]">
  <thead>
    <tr className="border-b border-white/10">
      <th className="p-4 text-left text-white">Code</th>
      <th className="p-4 text-left text-white">Type</th>
      <th className="p-4 text-left text-white">Value</th>
      <th className="p-4 text-left text-white">Status</th>
      <th className="p-4 text-left text-white">Actions</th>
    </tr>
  </thead>

  <tbody>
    {coupons.map((coupon) => (
      <tr
        key={coupon.id}
        className="border-b border-white/10"
      >
        <td className="p-4 text-white">
          {coupon.code}
        </td>

        <td className="p-4 text-slate-300">
          {coupon.type}
        </td>

        <td className="p-4 text-slate-300">
          {coupon.value}
        </td>

        <td className="p-4">
          <span
            className={
              coupon.isActive
                ? "text-green-400"
                : "text-red-400"
            }
          >
            {coupon.isActive
              ? "Active"
              : "Inactive"}
          </span>
        </td>

        <td className="p-4 flex gap-2">
          <button
            onClick={() =>
              handleToggle(coupon.id)
            }
            className="px-3 py-1 rounded bg-yellow-600 text-white"
          >
            Toggle
          </button>

          <button
            onClick={() =>
              handleDelete(coupon.id)
            }
            className="px-3 py-1 rounded bg-red-600 text-white"
          >
            Delete
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
      </div>
    </div>
  </div>
);
}