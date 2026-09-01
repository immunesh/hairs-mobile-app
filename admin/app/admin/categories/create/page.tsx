"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCategoryPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    gender: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = "";

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
          alert(uploadData.message || "Image upload failed");
          return;
        }

        imageUrl = uploadData.url;
      }

      const res = await fetch(
        "http://localhost:4000/api/categories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...form, image: imageUrl }),
        }
      );

      if (!res.ok) {
        const error = await res.text();
        console.error(error);
        alert("Failed to create category");
        return;
      }

      alert("Category created successfully");

      router.push("/admin/categories");
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
        Add Category
      </h1>

      <p className="mt-2 text-slate-400">
        Create a new category for your products
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
      {/* Category Name */}
      <div>
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Category Name
        </label>

        <input
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
          placeholder="Human Hair Wigs"
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
      </div>

      {/* Slug */}
      <div>
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Slug
        </label>

        <input
          value={form.slug}
          onChange={(e) =>
            setForm({
              ...form,
              slug: e.target.value,
            })
          }
          placeholder="human-hair-wigs"
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
      </div>

      {/* Description */}
      <div>
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Description
        </label>

        <textarea
          rows={5}
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
          placeholder="Category description..."
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
      </div>

      {/* Category Image */}
      <div>
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Category Image
        </label>

        <input
          type="file"
          accept="image/*"
          className="
          w-full
          px-4
          py-3
          rounded-2xl
          bg-white/5
          border
          border-white/10
          text-slate-300
          "
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
            className="
            mt-4
            w-40
            h-40
            object-cover
            rounded-2xl
            border
            border-white/10
            "
          />
        )}
      </div>

      {/* Gender */}
      <div>
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Gender
        </label>

        <select
          value={form.gender}
          onChange={(e) =>
            setForm({
              ...form,
              gender: e.target.value,
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

          focus:outline-none
          focus:border-cyan-500/50
          "
        >
          <option value="">
            Select Gender
          </option>

          <option value="MEN">
            MEN
          </option>

          <option value="WOMEN">
            WOMEN
          </option>

          <option value="UNISEX">
            UNISEX
          </option>
        </select>
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
          {submitting ? "Saving..." : "Save Category"}
        </button>
      </div>
    </form>
  </div>
);
}