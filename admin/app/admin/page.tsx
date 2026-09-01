"use client";

import { useEffect, useState } from "react";

interface DashboardStats {
  products: number;
  users: number;
  orders: number;
  revenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  processingOrders: number;
  cancelledOrders: number;
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className="
      rounded-3xl
      border
      border-white/10
      bg-white/5
      backdrop-blur-xl
      p-4 sm:p-6
      transition-all
      duration-300
      hover:-translate-y-1
      hover:border-white/20
      hover:shadow-2xl
      "
    >
      <p className="text-xs sm:text-sm text-slate-400">
        {title}
      </p>

      <h2 className="mt-3 sm:mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white break-words">
        {value}
      </h2>

      <div
        className={`mt-4 sm:mt-5 h-1 w-16 rounded-full ${color}`}
      />
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] =
    useState(true);

  const [stats, setStats] =
    useState<DashboardStats>({
      products: 0,
      users: 0,
      orders: 0,
      revenue: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      processingOrders: 0,
      cancelledOrders: 0,
    });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token =
        localStorage.getItem(
          "accessToken"
        );

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        productsRes,
        usersRes,
        ordersRes,
      ] = await Promise.all([
        fetch(
          "http://localhost:4000/api/products",
          {
            cache: "no-store",
          }
        ),

        fetch(
          "http://localhost:4000/api/users/admin/all",
          {
            headers,
            cache: "no-store",
          }
        ),

        fetch(
          "http://localhost:4000/api/orders/admin/all",
          {
            headers,
            cache: "no-store",
          }
        ),
      ]);

      const productsData =
        await productsRes.json();

      const usersData =
        await usersRes.json();

      const ordersData =
        await ordersRes.json();

      const products =
        productsData.data || [];

      const users =
        usersData.data || [];

      const orders =
        ordersData.data || [];

      const revenue = orders.reduce(
        (
          sum: number,
          order: any
        ) =>
          sum +
          Number(
            order.total || 0
          ),
        0
      );

      const pendingOrders =
        orders.filter(
          (order: any) =>
            order.status ===
            "PENDING"
        ).length;

      const deliveredOrders =
        orders.filter(
          (order: any) =>
            order.status ===
            "DELIVERED"
        ).length;

      const processingOrders =
        orders.filter(
          (order: any) =>
            order.status ===
            "PROCESSING"
        ).length;

      const cancelledOrders =
        orders.filter(
          (order: any) =>
            order.status ===
            "CANCELLED"
        ).length;

      setStats({
        products:
          products.length,
        users: users.length,
        orders: orders.length,
        revenue,
        pendingOrders,
        deliveredOrders,
        processingOrders,
        cancelledOrders,
      });
    } catch (error) {
      console.error(
        "Dashboard Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-white text-xl">
        Loading Dashboard...
      </div>
    );
  }

  return (
  <div
    className="
    min-h-screen
    p-4 sm:p-6 lg:p-8
    bg-gradient-to-br
    from-[#0b1020]
    via-[#131827]
    to-[#1b1634]
    "
  >
    <div className="mb-8 sm:mb-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-white">
        Dashboard
      </h1>

      <p className="mt-2 text-sm sm:text-base text-slate-400">
        Welcome back, Admin 👋
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
      <StatCard
        title="Products"
        value={stats.products}
        color="bg-cyan-400"
      />

      <StatCard
        title="Orders"
        value={stats.orders}
        color="bg-purple-400"
      />

      <StatCard
        title="Users"
        value={stats.users}
        color="bg-pink-400"
      />

      <StatCard
        title="Revenue"
        value={`₹${stats.revenue.toLocaleString()}`}
        color="bg-emerald-400"
      />

      <StatCard
        title="Pending Orders"
        value={stats.pendingOrders}
        color="bg-yellow-400"
      />

      <StatCard
        title="Processing"
        value={stats.processingOrders}
        color="bg-orange-400"
      />

      <StatCard
        title="Delivered"
        value={stats.deliveredOrders}
        color="bg-green-400"
      />

      <StatCard
        title="Cancelled"
        value={stats.cancelledOrders}
        color="bg-red-400"
      />
    </div>

    <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div
        className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        backdrop-blur-xl
        p-4 sm:p-6
        "
      >
        <h3 className="text-base sm:text-lg font-semibold text-white">
          Revenue Analytics
        </h3>

        <div className="mt-4 sm:mt-6 flex h-52 sm:h-64 items-center justify-center text-center text-sm sm:text-base text-slate-500">
          Revenue Chart Coming Soon
        </div>
      </div>

      <div
        className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        backdrop-blur-xl
        p-4 sm:p-6
        "
      >
        <h3 className="text-base sm:text-lg font-semibold text-white">
          Order Analytics
        </h3>

        <div className="mt-4 sm:mt-6 flex h-52 sm:h-64 items-center justify-center text-center text-sm sm:text-base text-slate-500">
          Orders Chart Coming Soon
        </div>
      </div>
    </div>
  </div>
);
}