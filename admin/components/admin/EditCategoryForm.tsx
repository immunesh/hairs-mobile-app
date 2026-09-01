"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditCategoryForm({
  category,
}: {
  category: any;
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: category.name || "",
    slug: category.slug || "",
    gender: category.gender || "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(category.image || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      let imageUrl = category.image || "";

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
        `http://localhost:4000/api/categories/${category.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({ ...form, image: imageUrl }),
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to update category"
        );
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      alert("Failed to update category");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block mb-2 font-medium">
          Name
        </label>

        <input
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
          className="w-full border p-3 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">
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
          className="w-full border p-3 rounded"
        />
      </div>

      <div className="mb-6">
        <label className="block mb-2 font-medium">
          Category Image
        </label>

        <input
          type="file"
          accept="image/*"
          className="w-full border p-3 rounded"
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
            className="mt-4 w-40 h-40 object-cover rounded-2xl border"
          />
        )}
      </div>

      <div className="mb-6">
        <label className="block mb-2 font-medium">
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
          className="w-full border p-3 rounded"
        >
          <option value="">
            Select Gender
          </option>
          <option value="MEN">MEN</option>
          <option value="WOMEN">
            WOMEN
          </option>
          <option value="UNISEX">
            UNISEX
          </option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-purple-600 text-white px-6 py-3 rounded-xl"
      >
        {loading
          ? "Updating..."
          : "Update Category"}
      </button>
    </form>
  );
}