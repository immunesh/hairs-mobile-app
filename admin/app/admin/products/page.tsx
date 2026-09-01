import Link from "next/link";
import DeleteProductButton from "@/components/DeleteProductButton";

async function getProducts() {
  const res = await fetch(
    "http://localhost:4000/api/products",
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = await res.json();

  return data.data || [];
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="h-full p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Products
          </h1>

          <p className="text-slate-400 mt-2">
            Manage all products
          </p>
        </div>

        <Link
          href="/admin/products/create"
          className="
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
          + Add Product
        </Link>
      </div>

      {/* Table */}
      <div
        className="
        rounded-3xl
        border
        border-white/10

        bg-white/5
        backdrop-blur-xl

        overflow-x-auto 
        "
      >
        <table className="w-full min-w-[2600px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left p-5 text-slate-300">
                Image
              </th>

              <th className="text-left p-5 text-slate-300">
                Product Name
              </th>

              <th className="text-left p-5 text-slate-300">
                Slug
              </th>

              <th className="text-left p-5 text-slate-300">
                Category
              </th>

              <th className="text-left p-5 text-slate-300">
                Base Price
              </th>

              <th className="text-left p-5 text-slate-300">
                Sale Price
              </th>

              <th className="text-left p-5 text-slate-300">
                Stock
              </th>
              <th className="text-left p-5 text-slate-300">
                Material
              </th>

              <th className="text-left p-5 text-slate-300">
                Length
              </th>

              <th className="text-left p-5 text-slate-300">
                Density
              </th>

              <th className="text-left p-5 text-slate-300">
                Texture
              </th>

              <th className="text-left p-5 text-slate-300">
                Color
              </th>

              <th className="text-left p-5 text-slate-300">
                Rating
              </th>

              <th className="text-left p-5 text-slate-300">
                Featured
              </th>

              <th className="text-left p-5 text-slate-300">
                Best Seller
              </th>

              <th className="text-left p-5 text-slate-300">
                New Arrival
              </th>
              <th className="text-left p-5 text-slate-300">
                Short Description
              </th>

              <th className="text-left p-5 text-slate-300">
                Full Description
              </th>

              <th className="text-left p-5 text-slate-300">
                Tags
              </th>
              <th className="text-left p-5 text-slate-300">
                Features
              </th>

              <th className="text-left p-5 text-slate-300">
                FAQs
              </th>

              <th className="text-left p-5 text-slate-300">
                Care Guides
              </th>

              <th className="text-left p-5 text-slate-300">
                Included Items
              </th>
              <th className="text-left p-5 text-slate-300">
                Actions
              </th>

            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={24}
                  className="
                  text-center
                  p-10
                  text-slate-500
                  "
                >
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product: any) => (
                <tr
                  key={product.id}
                  className="
                  border-b
                  border-white/5

                  hover:bg-white/5

                  transition-all
                  duration-300
                  "
                >
                  {/* Image */}
                  <td className="p-5">
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="
                        w-16
                        h-16
                        rounded-xl
                        object-cover

                        border
                        border-white/10
                        "
                      />
                    ) : (
                      <div
                        className="
                        w-16
                        h-16

                        rounded-xl

                        bg-white/5
                        border
                        border-white/10

                        flex
                        items-center
                        justify-center

                        text-xs
                        text-slate-500
                        "
                      >
                        No Image
                      </div>
                    )}
                  </td>

                  {/* Name */}
                  <td className="p-5 text-white font-medium">
                    {product.name}
                  </td>

                  {/* Slug */}
                  <td className="p-5 text-slate-300">
                    {product.slug || "-"}
                  </td>

                  {/* Category */}
                  <td className="p-5 text-slate-300">
                    {product.category?.name || "-"}
                  </td>

                  {/* Base Price */}
                  <td className="p-5 text-white">
                    ₹{product.basePrice}
                  </td>

                  {/* Sale Price */}
                  <td className="p-5 text-cyan-300">
                    ₹{product.salePrice || "-"}
                  </td>

                  {/* Stock */}
                  <td className="p-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${product.stock > 0
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                        }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  {/* Material */}
                  <td className="p-5 text-slate-300">
                    {product.material || "-"}
                  </td>

                  {/* Length */}
                  <td className="p-5 text-slate-300">
                    {product.length || "-"}
                  </td>

                  {/* Density */}
                  <td className="p-5 text-slate-300">
                    {product.density || "-"}
                  </td>

                  {/* Texture */}
                  <td className="p-5 text-slate-300">
                    {product.texture || "-"}
                  </td>

                  {/* Color */}
                  <td className="p-5 text-slate-300">
                    {product.color || "-"}
                  </td>

                  {/* Rating */}
                  <td className="p-5 text-yellow-400">
                    ⭐ {product.rating || 0}
                  </td>

                  {/* Featured */}
                  <td className="p-5">
                    {product.isFeatured ? "✅" : "❌"}
                  </td>

                  {/* Best Seller */}
                  <td className="p-5">
                    {product.isBestSeller ? "✅" : "❌"}
                  </td>

                  {/* New Arrival */}
                  <td className="p-5">
                    {product.isNewArrival ? "✅" : "❌"}
                  </td>
                  {/* Short Desc */}
                  <td
                    className="
                    p-5
                    text-slate-300
                    max-w-[220px]
                    truncate
                    "
                  >
                    {product.shortDesc || "-"}
                  </td>

                  {/* Description */}
                  <td
                    className="
                    p-5
                    text-slate-300
                    max-w-[300px]
                    truncate
                    "
                  >
                    {product.description || "-"}
                  </td>

                  {/* Tags */}
                  <td
                    className="
                    p-5
                    text-slate-300
                    max-w-[200px]
                    "
                  >
                    {Array.isArray(product.tags)
                      ? product.tags.join(", ")
                      : product.tags || "-"}
                  </td>
                  {/* Features */}
                  <td className="p-5 text-slate-300 max-w-[250px]">
                    {product.features?.length
                      ? product.features
                        .map((f: any) => f.title)
                        .join(", ")
                      : "-"}
                  </td>

                  {/* FAQs */}
                  <td className="p-5 text-slate-300">
                    {product.faqs?.length || 0}
                  </td>

                  {/* Care Guides */}
                  <td className="p-5 text-slate-300">
                    {product.careGuides?.length || 0}
                  </td>

                  {/* Included Items */}
                  <td className="p-5 text-slate-300 max-w-[250px]">
                    {product.includedItems?.length
                      ? product.includedItems
                        .map((i: any) => i.text)
                        .join(", ")
                      : "-"}
                  </td>
                  {/* Actions */}
                  <td className="p-5">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="
                        px-4
                        py-2

                        rounded-xl

                        bg-cyan-500/20
                        border
                        border-cyan-500/30

                        text-cyan-300

                        hover:bg-cyan-500/30

                        transition-all
                        "
                      >
                        Edit
                      </Link>

                      <DeleteProductButton
                        id={product.id}
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
  );
}