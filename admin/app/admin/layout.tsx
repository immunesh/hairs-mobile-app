"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import Toast from "@/components/ui/Toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setCheckingAuth(false);
      return;
    }

    const token =
      localStorage.getItem("accessToken");

    const role =
      localStorage.getItem("role");

    if (!token || role !== "ADMIN") {
      router.replace("/admin/login");
      return;
    }

    setCheckingAuth(false);
  }, [pathname, router]);

  if (checkingAuth) {
    return (
      <div
        className="
        h-screen
        flex
        items-center
        justify-center

        bg-[#0b1020]
        text-white
        "
      >
        Loading...
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
  <div
    className="
    min-h-screen
    flex

    bg-gradient-to-br
    from-[#0b1020]
    via-[#131827]
    to-[#1b1634]
    "
  >
    <Sidebar />

    <div
      className="
      flex-1
      flex
      flex-col
      min-w-0
      "
    >
      <AdminHeader />

      <Toast />

      <main
        className="
        flex-1
        overflow-y-auto
        overflow-x-hidden
        "
      >
        {children}
      </main>
    </div>
  </div>
);
}