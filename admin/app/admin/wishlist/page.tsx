"use client";

import { useEffect, useState } from "react";
import { getAllWishlists } from "@/lib/wishlist-admin-api";

export default function AdminWishlistPage() {
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlists();
  }, []);

  const loadWishlists = async () => {
    try {
      const res = await getAllWishlists();

      setWishlists(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        Loading wishlist...
      </div>
    );
  }

 return (
  <div className="p-4 sm:p-6 lg:p-8">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
          Wishlist Management
        </h1>

        <p className="text-sm sm:text-base text-slate-400 mt-2">
          Monitor customer wishlist activity
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

        bg-pink-500/10
        border
        border-pink-500/20

        text-pink-300
        font-medium
        "
      >
        Total Items: {wishlists.length}
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
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                User
              </th>

              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Email
              </th>

              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Product
              </th>

              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Quantity
              </th>

              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Added
              </th>
            </tr>
          </thead>

          <tbody>
            {wishlists.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="
                  p-8 sm:p-12
                  text-center
                  text-slate-500
                  "
                >
                  No wishlist items found
                </td>
              </tr>
            ) : (
              wishlists.map((item) => (
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
                  {/* User */}
                  <td className="p-3 sm:p-5">
                    <div className="font-medium text-white">
                      {item.user?.firstName}{" "}
                      {item.user?.lastName}
                    </div>
                  </td>

                  {/* Email */}
                  <td className="p-3 sm:p-5 text-slate-300">
                    {item.user?.email}
                  </td>

                  {/* Product */}
                  <td className="p-3 sm:p-5 text-white">
                    {item.product?.name}
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

                      bg-pink-500/20
                      text-pink-300

                      border
                      border-pink-500/20
                      "
                    >
                      1
                    </span>
                  </td>

                  {/* Date */}
                  <td className="p-3 sm:p-5 text-slate-400">
                    {new Date(
                      item.createdAt
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
}