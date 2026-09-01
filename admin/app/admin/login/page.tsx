"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await authApi.login(
        email,
        password
      );

      const {
        accessToken,
        refreshToken,
        user,
      } = response.data.data;

      if (user.role !== "ADMIN") {
        setError(
          "You are not an administrator"
        );
        return;
      }

      localStorage.setItem(
        "accessToken",
        accessToken
      );

      localStorage.setItem(
        "refreshToken",
        refreshToken
      );

      localStorage.setItem(
        "role",
        user.role
      );

      localStorage.setItem(
        "userId",
        user.id
      );

      router.replace("/admin");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
    min-h-screen

    flex
    items-center
    justify-center

    bg-gradient-to-br
    from-slate-950
    via-slate-900
    to-black

    p-6
    "
    >
      <div
        className="
      w-full
      max-w-md

      rounded-3xl

      bg-white/5
      backdrop-blur-xl

      border
      border-white/10

      p-8

      shadow-2xl
      "
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="
          text-4xl
          font-bold

          bg-gradient-to-r
          from-cyan-400
          via-purple-400
          to-pink-400

          bg-clip-text
          text-transparent
          "
          >
            HairsUp Admin
          </h1>

          <p className="text-slate-400 mt-3">
            Sign in to access dashboard
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="
          mb-5

          p-4

          rounded-2xl

          bg-red-500/10

          border
          border-red-500/20

          text-red-300
          "
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          {/* Email */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Email Address
            </label>

            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
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

            placeholder:text-slate-500

            focus:outline-none
            focus:border-cyan-500/50
            focus:ring-2
            focus:ring-cyan-500/20

            transition-all
            "
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
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

            placeholder:text-slate-500

            focus:outline-none
            focus:border-cyan-500/50
            focus:ring-2
            focus:ring-cyan-500/20

            transition-all
            "
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="
          w-full

          py-3

          rounded-2xl

          bg-gradient-to-r
          from-cyan-500
          to-purple-600

          text-white
          font-semibold

          transition-all
          duration-300

          hover:scale-[1.02]

          disabled:opacity-50
          disabled:cursor-not-allowed

          shadow-[0_0_25px_rgba(56,189,248,0.35)]
          "
          >
            {loading
              ? "Logging in..."
              : "Login to Dashboard"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            HairsUp Administration Panel
          </p>
        </div>
      </div>
    </div>
  );
}