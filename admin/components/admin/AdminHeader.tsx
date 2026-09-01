"use client";

import { useRouter } from "next/navigation";

export default function AdminHeader() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    localStorage.removeItem("token");

    router.replace("/admin/login");
  };

  return (
    <header
      className="
      h-16 sm:h-20
      sticky
      top-0
      z-40

      flex
      items-center
      justify-between

      px-4 sm:px-6

      border-b
      border-white/10

      bg-[#141827]/80
      backdrop-blur-2xl
      "
    >
      {/* Left */}
      <div className="min-w-0">
        <h1
          className="
          text-base
          sm:text-xl
          font-bold

          bg-gradient-to-r
          from-cyan-300
          via-purple-300
          to-pink-300

          bg-clip-text
          text-transparent

          truncate
          "
        >
          HairsUp Admin
        </h1>

        <p className="hidden sm:block text-xs text-slate-400">
          Management Dashboard
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Profile Card */}
        <div
          className="
          flex
          items-center
          gap-2 sm:gap-3

          px-2 sm:px-4
          py-2

          rounded-2xl

          bg-white/5
          border
          border-white/10

          backdrop-blur-xl
          "
        >
          <div
            className="
            w-8
            h-8
            sm:w-10
            sm:h-10

            rounded-full

            bg-gradient-to-br
            from-cyan-400
            via-blue-500
            to-purple-600

            flex
            items-center
            justify-center

            font-semibold
            text-white

            shadow-[0_0_20px_rgba(56,189,248,0.4)]
            "
          >
            A
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">
              Admin
            </p>

            <p className="text-xs text-slate-400">
              Super Admin
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="
          px-3 sm:px-5
          py-2 sm:py-2.5

          text-sm

          rounded-2xl

          bg-red-500/10
          border
          border-red-500/20

          text-red-300
          font-medium

          transition-all
          duration-300

          hover:bg-red-500/20
          hover:border-red-400/40
          hover:text-white
          hover:shadow-[0_0_25px_rgba(239,68,68,0.35)]
          "
        >
          <span className="hidden sm:inline">
            Logout
          </span>

          <span className="sm:hidden">
            Logout
          </span>
        </button>
      </div>
    </header>
  );
}