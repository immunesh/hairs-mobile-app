"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditHeroSlideForm({
  heroSlide,
}: {
  heroSlide: any;
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    headline: heroSlide.headline || "",
    subheadline: heroSlide.subheadline || "",
    description: heroSlide.description || "",
    badge: heroSlide.badge || "",
    tag: heroSlide.tag || "",
    cta: heroSlide.cta || "",
    ctaLink: heroSlide.ctaLink || "",
    ctaSecondary: heroSlide.ctaSecondary || "",
    ctaSecondaryLink: heroSlide.ctaSecondaryLink || "",
    accent: heroSlide.accent || "",
    order: heroSlide.order ?? 0,
    isActive: heroSlide.isActive ?? true,
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(heroSlide.image || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      let imageUrl = heroSlide.image || "";

      if (image) {
        const imageFormData = new FormData();
        imageFormData.append("image", image);

        const uploadRes = await fetch(
          "http://localhost:4000/api/upload/image",
          {
            method: "POST",
            body: imageFormData,
          }
        );

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(uploadData.message || "Image upload failed");
        }

        imageUrl = uploadData.url;
      }

      const res = await fetch(
        `http://localhost:4000/api/hero-slides/${heroSlide.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            order: Number(form.order),
            image: imageUrl,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update hero slide");
      }

      router.push("/admin/hero-slides");
      router.refresh();
    } catch (error) {
      alert("Failed to update hero slide");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Headline
        </label>

        <input
          value={form.headline}
          onChange={(e) =>
            setForm({ ...form, headline: e.target.value })
          }
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Subheadline
        </label>

        <input
          value={form.subheadline}
          onChange={(e) =>
            setForm({ ...form, subheadline: e.target.value })
          }
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Description
        </label>

        <textarea
          rows={4}
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Background Image
        </label>

        <input
          type="file"
          accept="image/*"
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (!file) return;

            setImage(file);
            setImagePreview(URL.createObjectURL(file));
          }}
        />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="mt-4 w-full max-w-md h-40 object-cover rounded-2xl border border-white/10"
          />
        )}
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Badge Text
        </label>

        <input
          value={form.badge}
          onChange={(e) =>
            setForm({ ...form, badge: e.target.value })
          }
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Corner Tag
        </label>

        <input
          value={form.tag}
          onChange={(e) =>
            setForm({ ...form, tag: e.target.value })
          }
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">
            Primary CTA Label
          </label>

          <input
            value={form.cta}
            onChange={(e) =>
              setForm({ ...form, cta: e.target.value })
            }
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">
            Primary CTA Link
          </label>

          <input
            value={form.ctaLink}
            onChange={(e) =>
              setForm({ ...form, ctaLink: e.target.value })
            }
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">
            Secondary CTA Label
          </label>

          <input
            value={form.ctaSecondary}
            onChange={(e) =>
              setForm({ ...form, ctaSecondary: e.target.value })
            }
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">
            Secondary CTA Link
          </label>

          <input
            value={form.ctaSecondaryLink}
            onChange={(e) =>
              setForm({ ...form, ctaSecondaryLink: e.target.value })
            }
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Overlay Gradient (Tailwind classes)
        </label>

        <input
          value={form.accent}
          onChange={(e) =>
            setForm({ ...form, accent: e.target.value })
          }
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">
            Display Order
          </label>

          <input
            type="number"
            value={form.order}
            onChange={(e) =>
              setForm({ ...form, order: Number(e.target.value) })
            }
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-3 pt-8">
          <input
            id="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={(e) =>
              setForm({ ...form, isActive: e.target.checked })
            }
            className="w-5 h-5 rounded accent-cyan-500"
          />

          <label
            htmlFor="isActive"
            className="text-sm font-medium text-slate-300"
          >
            Show on homepage
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="
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

        disabled:opacity-50
        disabled:hover:scale-100
        "
      >
        {loading ? "Updating..." : "Update Hero Slide"}
      </button>
    </form>
  );
}
