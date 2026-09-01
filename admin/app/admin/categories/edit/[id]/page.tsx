import Link from "next/link";
import EditCategoryForm from "@/components/admin/EditCategoryForm";

async function getCategory(id: string) {
  const res = await fetch(
    `http://localhost:4000/api/categories/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(
      "Failed to fetch category"
    );
  }

  return res.json();
}

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const category = await getCategory(
    params.id
  );

 return (
  <div className="p-8">
    {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold text-white">
          Edit Category
        </h1>

        <p className="text-slate-400 mt-2">
          Update category information
        </p>
      </div>

      <Link
        href="/admin/categories"
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
      </Link>
    </div>

    {/* Form Card */}
    <div
      className="
      rounded-3xl

      bg-white/5
      backdrop-blur-xl

      border
      border-white/10

      p-8
      "
    >
      <EditCategoryForm
        category={category}
      />
    </div>
  </div>
);
}