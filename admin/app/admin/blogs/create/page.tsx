"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBlog } from "@/lib/blog-admin-api";

export default function CreateBlogPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [author, setAuthor] = useState("Admin");

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      await createBlog({
        title,
        slug,
        excerpt,
        content,
        image,
        author,
      });

      alert("Blog created");

      router.push("/admin/blogs");
    } catch (error) {
      console.error(error);
      alert("Failed to create blog");
    }
  };

return (
  <div className="p-8">
    {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold text-white">
          Create Blog
        </h1>

        <p className="text-slate-400 mt-2">
          Create and publish a new blog post
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          router.push("/admin/blogs")
        }
        className="
        px-5
        py-3

        rounded-2xl

        bg-white/5
        border
        border-white/10

        text-slate-300

        hover:bg-white/10
        hover:text-white

        transition-all
        duration-300
        "
      >
        ← Back
      </button>
    </div>

    {/* Form */}
    <form
      onSubmit={handleSubmit}
      className="
      rounded-3xl

      bg-white/5
      backdrop-blur-xl

      border
      border-white/10

      p-8

      space-y-6
      "
    >
      {/* Title */}
      <div>
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Blog Title
        </label>

        <input
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          placeholder="Blog Title"
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
          value={slug}
          onChange={(e) =>
            setSlug(e.target.value)
          }
          placeholder="blog-slug"
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

      {/* Author */}
      <div>
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Author
        </label>

        <input
          value={author}
          onChange={(e) =>
            setAuthor(e.target.value)
          }
          placeholder="Admin"
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

      {/* Image */}
      <div>
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Image URL
        </label>

        <input
          value={image}
          onChange={(e) =>
            setImage(e.target.value)
          }
          placeholder="https://example.com/image.jpg"
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

      {/* Excerpt */}
      <div>
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Excerpt
        </label>

        <textarea
          rows={4}
          value={excerpt}
          onChange={(e) =>
            setExcerpt(e.target.value)
          }
          placeholder="Short description of blog..."
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

      {/* Content */}
      <div>
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Blog Content
        </label>

        <textarea
          rows={14}
          value={content}
          onChange={(e) =>
            setContent(e.target.value)
          }
          placeholder="Write blog content..."
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

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
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
          "
        >
          Create Blog
        </button>

        <button
          type="button"
          onClick={() =>
            router.push("/admin/blogs")
          }
          className="
          px-6
          py-3

          rounded-2xl

          border
          border-white/10

          bg-white/5

          text-slate-300

          hover:bg-white/10
          hover:text-white

          transition-all
          duration-300
          "
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
);
}