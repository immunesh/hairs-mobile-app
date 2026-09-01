"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateHeroSlidePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    headline: "",
    subheadline: "",
    description: "",
    badge: "",
    tag: "",
    cta: "",
    ctaLink: "",
    ctaSecondary: "",
    ctaSecondaryLink: "",
    accent: "from-brand-950 to-brand-700",
    order: 0,
    isActive: true,
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!image) {
        alert("Please choose a background image");
        return;
      }

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
        alert(uploadData.message || "Image upload failed");
        return;
      }

      const imageUrl = uploadData.url;

      const res = await fetch(
        "http://localhost:4000/api/hero-slides",
        {
          method: "POST",
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
        const error = await res.text();
        console.error(error);
        alert("Failed to create hero slide");
        return;
      }

      alert("Hero slide created successfully");

      router.push("/admin/hero-slides");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Server error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">
          Add Hero Slide
        </h1>

        <p className="mt-2 text-slate-400">
          Create a new slide for the homepage hero slider
        </p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="
        max-w-4xl

        rounded-3xl

        bg-white/5
        backdrop-blur-xl

        border
        border-white/10

        p-8

        space-y-6
        "
      >
        {/* Headline */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">
            Headline
          </label>

          <input
            value={form.headline}
            onChange={(e) =>
              setForm({ ...form, headline: e.target.value })
            }
            placeholder="Transform Your Look"
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Subheadline */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">
            Subheadline
          </label>

          <input
            value={form.subheadline}
            onChange={(e) =>
              setForm({ ...form, subheadline: e.target.value })
            }
            placeholder="with Premium Human Hair Wigs"
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Description */}
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
            placeholder="Slide description..."
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Background Image */}
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

        {/* Badge */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">
            Badge Text
          </label>

          <input
            value={form.badge}
            onChange={(e) =>
              setForm({ ...form, badge: e.target.value })
            }
            placeholder="New Season Collection"
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Tag */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">
            Corner Tag
          </label>

          <input
            value={form.tag}
            onChange={(e) =>
              setForm({ ...form, tag: e.target.value })
            }
            placeholder="WOMEN"
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* CTA row */}
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
              placeholder="Shop Women's Collection"
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
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
              placeholder="/women"
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
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
              placeholder="Try On Virtually"
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">
              Secondary CTA Link
            </label>

            <input
              value={form.ctaSecondaryLink}
              onChange={(e) =>
                setForm({
                  ...form,
                  ctaSecondaryLink: e.target.value,
                })
              }
              placeholder="/try-on"
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Accent gradient */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">
            Overlay Gradient (Tailwind classes)
          </label>

          <input
            value={form.accent}
            onChange={(e) =>
              setForm({ ...form, accent: e.target.value })
            }
            placeholder="from-brand-950 to-brand-700"
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Order + Active */}
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

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
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
            {submitting ? "Saving..." : "Save Hero Slide"}
          </button>
        </div>
      </form>
    </div>
  );
}
