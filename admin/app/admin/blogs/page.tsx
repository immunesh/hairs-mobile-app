"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getAllBlogs,
  deleteBlog,
  publishBlog,
} from "@/lib/blog-admin-api";

export default function BlogsPage() {
  const [blogs, setBlogs] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const res =
        await getAllBlogs();

      setBlogs(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (
    id: string
  ) => {
    if (
      !window.confirm(
        "Delete this blog?"
      )
    )
      return;

    await deleteBlog(id);

    setBlogs((prev) =>
      prev.filter(
        (blog) => blog.id !== id
      )
    );
  };

  const handlePublish = async (
    id: string
  ) => {
    await publishBlog(id);

    loadBlogs();
  };

 if (loading) {
  return (
    <div className="p-8">
      <div
        className="
        rounded-3xl

        bg-white/5
        backdrop-blur-xl

        border
        border-white/10

        p-10

        text-center
        text-slate-400
        "
      >
        Loading blogs...
      </div>
    </div>
  );
}

return (
  <div className="p-4 sm:p-6 lg:p-8">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
          Blog Management
        </h1>

        <p className="text-sm sm:text-base text-slate-400 mt-2">
          Create and manage blog posts
        </p>
      </div>

      <Link
        href="/admin/blogs/create"
        className="
        w-full
        sm:w-auto

        text-center

        px-6
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
        + Create Blog
      </Link>
    </div>

    {/* Table */}
    <div
      className="
      rounded-3xl

      bg-white/5
      backdrop-blur-xl

      border
      border-white/10

      overflow-hidden
      "
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Title
              </th>

              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Author
              </th>

              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Status
              </th>

              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Published
              </th>

              <th className="p-3 sm:p-5 text-left text-slate-300 text-sm">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {blogs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="
                  p-8 sm:p-12
                  text-center
                  text-slate-500
                  "
                >
                  No blogs found
                </td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr
                  key={blog.id}
                  className="
                  border-b
                  border-white/5

                  hover:bg-white/5

                  transition-all
                  duration-300
                  "
                >
                  {/* Title */}
                  <td className="p-3 sm:p-5">
                    <div className="font-medium text-white">
                      {blog.title}
                    </div>
                  </td>

                  {/* Author */}
                  <td className="p-3 sm:p-5 text-slate-300">
                    {blog.author}
                  </td>

                  {/* Status */}
                  <td className="p-3 sm:p-5">
                    {blog.isPublished ? (
                      <span
                        className="
                        px-2 sm:px-3
                        py-1

                        rounded-full

                        text-[10px] sm:text-xs
                        font-semibold

                        bg-emerald-500/20
                        text-emerald-300

                        border
                        border-emerald-500/20
                        "
                      >
                        Published
                      </span>
                    ) : (
                      <span
                        className="
                        px-2 sm:px-3
                        py-1

                        rounded-full

                        text-[10px] sm:text-xs
                        font-semibold

                        bg-orange-500/20
                        text-orange-300

                        border
                        border-orange-500/20
                        "
                      >
                        Draft
                      </span>
                    )}
                  </td>

                  {/* Published Date */}
                  <td className="p-3 sm:p-5 text-slate-400">
                    {blog.publishedAt
                      ? new Date(
                          blog.publishedAt
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  {/* Actions */}
                  <td className="p-3 sm:p-5">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handlePublish(blog.id)
                        }
                        className="
                        px-3 sm:px-4
                        py-2

                        text-sm

                        rounded-xl

                        bg-blue-500/20
                        border
                        border-blue-500/30

                        text-blue-300

                        hover:bg-blue-500/30
                        hover:text-white

                        transition-all
                        duration-300
                        "
                      >
                        Toggle
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(blog.id)
                        }
                        className="
                        px-3 sm:px-4
                        py-2

                        text-sm

                        rounded-xl

                        bg-red-500/20
                        border
                        border-red-500/30

                        text-red-300

                        hover:bg-red-500/30
                        hover:text-white

                        transition-all
                        duration-300
                        "
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
}