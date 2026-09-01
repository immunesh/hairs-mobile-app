"use client";

import { useEffect, useState } from "react";
import { getAllCarts } from "@/lib/cart-api";

export default function AdminCartsPage() {
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCarts();
  }, []);

  const loadCarts = async () => {
    try {
      setLoading(true);

      const response = await getAllCarts();

      setCarts(response.data || []);
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          "Failed to load carts"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        Loading carts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }

return (
  <div className="p-4 sm:p-6 lg:p-8">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
          Cart Management
        </h1>

        <p className="text-sm sm:text-base text-slate-400 mt-2">
          Monitor customer cart activity
        </p>
      </div>

      <div
        className="
        w-full
        sm:w-auto
        text-center

        px-4 sm:px-5
        py-3

        rounded-2xl

        bg-cyan-500/10
        border
        border-cyan-500/20

        text-cyan-300
        font-medium
        "
      >
        Total Cart Items: {carts.length}
      </div>
    </div>

    {/* Table */}
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
        <table className="w-full min-w-[1300px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Image
              </th>

              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Customer
              </th>

              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Email
              </th>

              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Product
              </th>

              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Price
              </th>

              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Qty
              </th>

              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Total
              </th>

              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Variant
              </th>

              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Added
              </th>
            </tr>
          </thead>

          <tbody>
            {carts.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="
                  p-8 sm:p-12
                  text-center
                  text-slate-500
                  "
                >
                  No cart items found
                </td>
              </tr>
            ) : (
              carts.map((item) => {
                const image =
                  item.product?.images?.[0]
                    ?.url;

                const price =
                  item.product?.salePrice ||
                  item.product?.basePrice ||
                  0;

                const total =
                  price * item.quantity;

                return (
                  <tr
                    key={item.id}
                    className="
                    border-b
                    border-white/5

                    hover:bg-white/5

                    transition-all
                    duration-300
                    "
                  >
                    {/* Image */}
                    <td className="p-3 sm:p-5">
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          className="
                          w-14 h-14
                          sm:w-16 sm:h-16

                          object-cover

                          rounded-xl

                          border
                          border-white/10
                          "
                        />
                      ) : (
                        <div
                          className="
                          w-14 h-14
                          sm:w-16 sm:h-16

                          rounded-xl

                          bg-white/5

                          border
                          border-white/10

                          flex
                          items-center
                          justify-center

                          text-xs
                          text-slate-500
                          "
                        >
                          No Image
                        </div>
                      )}
                    </td>

                    {/* Customer */}
                    <td className="p-3 sm:p-5 text-white font-medium">
                      {item.user?.firstName}{" "}
                      {item.user?.lastName}
                    </td>

                    {/* Email */}
                    <td className="p-3 sm:p-5 text-slate-300">
                      {item.user?.email}
                    </td>

                    {/* Product */}
                    <td className="p-3 sm:p-5 text-white">
                      {item.product?.name}
                    </td>

                    {/* Price */}
                    <td className="p-3 sm:p-5 text-cyan-300">
                      ₹{price}
                    </td>

                    {/* Qty */}
                    <td className="p-3 sm:p-5">
                      <span
                        className="
                        px-2 sm:px-3
                        py-1

                        rounded-full

                        text-[10px] sm:text-xs
                        font-semibold

                        bg-purple-500/20
                        text-purple-300

                        border
                        border-purple-500/20
                        "
                      >
                        {item.quantity}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="p-3 sm:p-5">
                      <span className="font-semibold text-emerald-400">
                        ₹{total}
                      </span>
                    </td>

                    {/* Variant */}
                    <td className="p-3 sm:p-5 text-slate-300">
                      {item.variant || "-"}
                    </td>

                    {/* Date */}
                    <td className="p-3 sm:p-5 text-slate-400">
                      {new Date(
                        item.createdAt
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
}