"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { useUIStore } from "@/lib/store";

export default function DeleteHeroSlideButton({
  id,
  name,
}: {
  id: string;
  name?: string;
}) {
  const router = useRouter();
  const { showToast } = useUIStore();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name || "this hero slide"}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:4000/api/hero-slides/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete hero slide");
      }

      showToast("Hero slide deleted successfully");
      router.refresh();
    } catch (error: any) {
      showToast(error.message || "Failed to delete hero slide", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="
      inline-flex
      items-center
      justify-center
      gap-1.5

      px-3 sm:px-4
      py-2

      text-sm

      rounded-xl

      bg-rose-500/20
      border
      border-rose-500/30

      text-rose-300

      hover:bg-rose-500/30
      hover:text-white

      transition-all
      duration-300

      hover:shadow-[0_0_15px_rgba(244,63,94,0.25)]

      disabled:opacity-50
      "
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
