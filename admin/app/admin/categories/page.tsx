import Link from "next/link";
import DeleteCategoryButton from "@/components/admin/DeleteCategoryButton";

async function getCategories() {
  const res = await fetch(
    "http://localhost:4000/api/categories",
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  return res.json();
}

export default async function CategoriesPage() {
  const categories = await getCategories();

return (
  <div className="p-4 sm:p-6 lg:p-8">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
          Categories
        </h1>

        <p className="text-slate-400 mt-2 text-sm sm:text-base">
          Manage product categories
        </p>
      </div>

      <Link
        href="/admin/categories/create"
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
        + Add Category
      </Link>
    </div>

    {/* Categories Card */}
    <div
      className="
      rounded-3xl
      border
      border-white/10
      bg-white/5
      backdrop-blur-xl
      overflow-hidden
      "
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                Image
              </th>

              <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                Name
              </th>

              <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                Slug
              </th>

              <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                Gender
              </th>

              <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                Products
              </th>

              <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="
                  p-8 sm:p-12
                  text-center
                  text-slate-500
                  "
                >
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((category: any) => (
                <tr
                  key={category.id}
                  className="
                  border-b
                  border-white/5

                  hover:bg-white/5

                  transition-all
                  duration-300
                  "
                >
                  {/* Image */}
                  <td className="p-3 sm:p-5">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-12 h-12 rounded-xl object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 text-xs">
                        —
                      </div>
                    )}
                  </td>

                  {/* Name */}
                  <td className="p-3 sm:p-5">
                    <div className="font-medium text-white">
                      {category.name}
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="p-3 sm:p-5 text-slate-400">
                    {category.slug}
                  </td>

                  {/* Gender */}
                  <td className="p-3 sm:p-5">
                    {category.gender ? (
                      <span
                        className="
                        inline-flex
                        items-center

                        px-2 sm:px-3
                        py-1

                        rounded-full

                        text-[10px] sm:text-xs
                        font-semibold

                        bg-purple-500/20
                        text-purple-300

                        border
                        border-purple-500/20
                        "
                      >
                        {category.gender}
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        —
                      </span>
                    )}
                  </td>

                  {/* Product Count */}
                  <td className="p-3 sm:p-5">
                    <span
                      className="
                      inline-flex
                      items-center

                      px-2 sm:px-3
                      py-1

                      rounded-full

                      text-[10px] sm:text-xs
                      font-semibold

                      bg-cyan-500/20
                      text-cyan-300

                      border
                      border-cyan-500/20
                      "
                    >
                      {category._count?.products ?? 0}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-3 sm:p-5">
                    <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/categories/edit/${category.id}`}
                      className="
                      inline-flex
                      items-center
                      justify-center

                      px-3 sm:px-4
                      py-2

                      text-sm

                      rounded-xl

                      bg-cyan-500/20
                      border
                      border-cyan-500/30

                      text-cyan-300

                      hover:bg-cyan-500/30
                      hover:text-white

                      transition-all
                      duration-300

                      hover:shadow-[0_0_15px_rgba(34,211,238,0.25)]
                      "
                    >
                      Edit
                    </Link>

                    <DeleteCategoryButton
                      id={category.id}
                      name={category.name}
                    />
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