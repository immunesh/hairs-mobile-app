"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditProductPage() {
const params = useParams();
const router = useRouter();

const [loading, setLoading] = useState(true);
const [categories, setCategories] = useState<any[]>([]);
const [mainImage, setMainImage] = useState<File | null>(null);
const [galleryImages, setGalleryImages] = useState<File[]>([]);

const [mainPreview, setMainPreview] = useState("");
const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

const [existingImages, setExistingImages] = useState<string[]>([]);
const [form, setForm] = useState({
  name: "",
  slug: "",
  categoryId: "",
  basePrice: "",
  salePrice: "",
  stock: "",
  sku: "",
  brand: "",
  gender: "MEN",
  shortDesc: "",
  description: "",
  tags: "",

  material: "",
  capSize: "",
  length: "",
  density: "",
  texture: "",
  color: "",

  rating: "0",

  isFeatured: false,
  isBestSeller: false,
  isNewArrival: false,
});
const [features, setFeatures] = useState([
  {
    title: "",
    subtitle: "",
  },
]);

const [faqs, setFaqs] = useState([
  {
    question: "",
    answer: "",
  },
]);

const [careGuides, setCareGuides] = useState([
  {
    icon: "",
    title: "",
    steps: "",
  },
]);

const [includedItems, setIncludedItems] = useState([
  {
    text: "",
  },
]);

useEffect(() => {
fetchProduct();
fetchCategories();
}, []);

async function fetchCategories() {
try {
const res = await fetch(
"http://localhost:4000/api/categories"
);


  const data = await res.json();

  setCategories(
  Array.isArray(data)
    ? data
    : data.data || []
);
} catch (error) {
  console.error(error);
}


}

async function fetchProduct() {
try {
  
const res = await fetch(
`http://localhost:4000/api/products/${params.id}`
);


  const data = await res.json();
  const product = data.data;
setExistingImages(
  product.images?.map((img: any) => img.url) || []
);

if (product.images?.length) {
  setMainPreview(product.images[0].url);
}
setForm({
  name: product.name || "",
  slug: product.slug || "",
  categoryId: product.categoryId || "",
  basePrice: String(product.basePrice || ""),
  salePrice: String(product.salePrice || ""),
  stock: String(product.stock || ""),
  sku: product.sku || "",
  brand: product.brand || "",
  gender: product.gender || "MEN",
  shortDesc: product.shortDesc || "",
  description: product.description || "",

  tags: Array.isArray(product.tags)
    ? product.tags.join(", ")
    : "",

  material: product.material || "",
  capSize: product.capSize || "",
  length: product.length || "",
  density: product.density || "",
  texture: product.texture || "",
  color: product.color || "",

  rating: String(product.rating || 0),

  isFeatured: product.isFeatured || false,
  isBestSeller: product.isBestSeller || false,
  isNewArrival: product.isNewArrival || false,
});
setFeatures(
  product.features?.length
    ? product.features.map((item: any) => ({
        title: item.title,
        subtitle: item.subtitle,
      }))
    : [{ title: "", subtitle: "" }]
);

setFaqs(
  product.faqs?.length
    ? product.faqs.map((item: any) => ({
        question: item.question,
        answer: item.answer,
      }))
    : [{ question: "", answer: "" }]
);

setCareGuides(
  product.careGuides?.length
    ? product.careGuides.map((item: any) => ({
        icon: item.icon || "",
        title: item.title || "",
        steps: item.steps || "",
      }))
    : [
        {
          icon: "",
          title: "",
          steps: "",
        },
      ]
);

setIncludedItems(
  product.includedItems?.length
    ? product.includedItems.map((item: any) => ({
        text: item.text || "",
      }))
    : [{ text: "" }]
);

} catch (error) {
  console.error(error);
  alert("Failed to load product");
} finally {
  setLoading(false);
}


}

async function handleUpdate(
e: React.FormEvent
) {
e.preventDefault();


try {
  let imageUrls = [...existingImages];
  // Upload main image
if (mainImage) {
  const fd = new FormData();

  fd.append("image", mainImage);

  const uploadRes = await fetch(
    "http://localhost:4000/api/upload/image",
    {
      method: "POST",
      body: fd,
    }
  );

  const uploadData = await uploadRes.json();

  if (uploadRes.ok) {
    imageUrls = [uploadData.url];
  }
}
// Upload gallery images
for (const image of galleryImages) {
  const fd = new FormData();

  fd.append("image", image);

  const uploadRes = await fetch(
    "http://localhost:4000/api/upload/image",
    {
      method: "POST",
      body: fd,
    }
  );

  const uploadData = await uploadRes.json();

  if (uploadRes.ok) {
    imageUrls.push(uploadData.url);
  }
}
  const res = await fetch(
    `http://localhost:4000/api/products/${params.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json",
      },
     body: JSON.stringify({
  ...form,
  basePrice: Number(form.basePrice),
  salePrice: form.salePrice
    ? Number(form.salePrice)
    : null,
  stock: Number(form.stock),
  tags: form.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean),

 images: imageUrls,

features,
faqs,
careGuides,
includedItems,
}),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    alert(
      data.message ||
        "Failed to update product"
    );
    return;
  }

  alert("Product updated successfully");

  router.push("/admin/products");
  router.refresh();
} catch (error) {
  console.error(error);
  alert("Failed to update product");
}


}

if (loading) {
  return (
    <div className="flex items-center justify-center h-full text-white text-lg">
      Loading Product...
    </div>
  );
}

return (
  <div className="p-8">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold text-white">
          Edit Product
        </h1>

        <p className="text-slate-400 mt-2">
          Update product information
        </p>
      </div>

      <Link
        href="/admin/products"
        className="
        px-5 py-3
        rounded-2xl
        bg-white/5
        border border-white/10
        text-slate-300
        hover:bg-white/10
        hover:text-white
        transition-all
        "
      >
        ← Back
      </Link>
    </div>

    <form
      onSubmit={handleUpdate}
      className="
      rounded-3xl
      bg-white/5
      backdrop-blur-xl
      border border-white/10
      p-8
      "
    >
      <div className="grid md:grid-cols-2 gap-6">

        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">
            Product Name
          </label>

          <input
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>

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
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">
            Category
          </label>

          <select
            value={form.categoryId}
            onChange={(e) =>
              setForm({
                ...form,
                categoryId: e.target.value,
              })
            }
            className="w-full px-4 py-3 rounded-2xl bg-[#131827] border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
          >
            <option value="">
              Select Category
            </option>

            {categories.map((category: any) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

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
            className="w-full px-4 py-3 rounded-2xl bg-[#131827] border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
          >
            <option value="MEN">MEN</option>
            <option value="WOMEN">WOMEN</option>
            <option value="UNISEX">UNISEX</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">
            SKU
          </label>

          <input
            value={form.sku}
            onChange={(e) =>
              setForm({
                ...form,
                sku: e.target.value,
              })
            }
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">
            Brand
          </label>

          <input
            value={form.brand}
            onChange={(e) =>
              setForm({
                ...form,
                brand: e.target.value,
              })
            }
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">
            Base Price
          </label>

          <input
            type="number"
            value={form.basePrice}
            onChange={(e) =>
              setForm({
                ...form,
                basePrice: e.target.value,
              })
            }
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">
            Sale Price
          </label>

          <input
            type="number"
            value={form.salePrice}
            onChange={(e) =>
              setForm({
                ...form,
                salePrice: e.target.value,
              })
            }
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">
            Stock
          </label>

          <input
            type="number"
            value={form.stock}
            onChange={(e) =>
              setForm({
                ...form,
                stock: e.target.value,
              })
            }
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>
<div className="grid md:grid-cols-3 gap-6 mt-6">

  <div>
    <label className="block mb-2 text-sm text-slate-300">
      Material
    </label>

    <input
      type="text"
      value={form.material}
      onChange={(e) =>
        setForm({
          ...form,
          material: e.target.value,
        })
      }
      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white"
    />
  </div>

  <div>
    <label className="block mb-2 text-sm text-slate-300">
      Length
    </label>

    <input
      type="text"
      value={form.length}
      onChange={(e) =>
        setForm({
          ...form,
          length: e.target.value,
        })
      }
      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white"
    />
  </div>

  <div>
    <label className="block mb-2 text-sm text-slate-300">
      Density
    </label>

    <input
      type="text"
      value={form.density}
      onChange={(e) =>
        setForm({
          ...form,
          density: e.target.value,
        })
      }
      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white"
    />
  </div>

  <div>
    <label className="block mb-2 text-sm text-slate-300">
      Texture
    </label>

    <input
      type="text"
      value={form.texture}
      onChange={(e) =>
        setForm({
          ...form,
          texture: e.target.value,
        })
      }
      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white"
    />
  </div>

  <div>
    <label className="block mb-2 text-sm text-slate-300">
      Color
    </label>

    <input
      type="text"
      value={form.color}
      onChange={(e) =>
        setForm({
          ...form,
          color: e.target.value,
        })
      }
      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white"
    />
  </div>

  <div>
    <label className="block mb-2 text-sm text-slate-300">
      Cap Size
    </label>

    <input
      type="text"
      value={form.capSize}
      onChange={(e) =>
        setForm({
          ...form,
          capSize: e.target.value,
        })
      }
      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white"
    />
  </div>

</div>
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Short Description
        </label>

        <textarea
          rows={3}
          value={form.shortDesc}
          onChange={(e) =>
            setForm({
              ...form,
              shortDesc: e.target.value,
            })
          }
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Full Description
        </label>

        <textarea
          rows={6}
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Tags
        </label>

        <input
          value={form.tags}
          onChange={(e) =>
            setForm({
              ...form,
              tags: e.target.value,
            })
          }
          placeholder="hair, wig, premium"
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
        />
      </div>
      {/* Product Features */}

<div className="mt-6 border border-white/10 rounded-2xl p-6">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold text-white">
      Product Features
    </h2>

    <button
      type="button"
      onClick={() =>
        setFeatures([
          ...features,
          {
            title: "",
            subtitle: "",
          },
        ])
      }
      className="px-4 py-2 bg-cyan-500 rounded-xl text-white"
    >
      + Add Feature
    </button>
  </div>

  {features.map((feature, index) => (
    <div
      key={index}
      className="grid md:grid-cols-3 gap-4 mb-4"
    >
      <input
        type="text"
        placeholder="Title"
        value={feature.title}
        onChange={(e) => {
          const copy = [...features];
          copy[index].title =
            e.target.value;
          setFeatures(copy);
        }}
        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white"
      />

      <input
        type="text"
        placeholder="Subtitle"
        value={feature.subtitle}
        onChange={(e) => {
          const copy = [...features];
          copy[index].subtitle =
            e.target.value;
          setFeatures(copy);
        }}
        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white"
      />

      <button
        type="button"
        onClick={() =>
          setFeatures(
            features.filter(
              (_, i) => i !== index
            )
          )
        }
        className="bg-red-500 rounded-xl text-white"
      >
        Remove
      </button>
    </div>
  ))}
</div>
{/* Product FAQ */}

<div className="mt-6 border border-white/10 rounded-2xl p-6">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold text-white">
      Product FAQ
    </h2>

    <button
      type="button"
      onClick={() =>
        setFaqs([
          ...faqs,
          {
            question: "",
            answer: "",
          },
        ])
      }
      className="px-4 py-2 bg-cyan-500 rounded-xl text-white"
    >
      + Add FAQ
    </button>
  </div>

  {faqs.map((faq, index) => (
    <div
      key={index}
      className="space-y-3 mb-4"
    >
      <input
        type="text"
        placeholder="Question"
        value={faq.question}
        onChange={(e) => {
          const copy = [...faqs];
          copy[index].question =
            e.target.value;
          setFaqs(copy);
        }}
        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white"
      />

      <textarea
        value={faq.answer}
        placeholder="Answer"
        onChange={(e) => {
          const copy = [...faqs];
          copy[index].answer =
            e.target.value;
          setFaqs(copy);
        }}
        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white"
      />

      <button
        type="button"
        onClick={() =>
          setFaqs(
            faqs.filter(
              (_, i) => i !== index
            )
          )
        }
        className="px-4 py-2 bg-red-500 rounded-xl text-white"
      >
        Remove
      </button>
    </div>
  ))}
</div>
{/* Care Guide */}

<div className="mt-6 border border-white/10 rounded-2xl p-6">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold text-white">
      Care Guide
    </h2>

    <button
      type="button"
      onClick={() =>
        setCareGuides([
          ...careGuides,
          {
            icon: "",
            title: "",
            steps: "",
          },
        ])
      }
      className="px-4 py-2 bg-cyan-500 rounded-xl text-white"
    >
      + Add Guide
    </button>
  </div>

  {careGuides.map((guide, index) => (
    <div
      key={index}
      className="grid md:grid-cols-4 gap-4 mb-4"
    >
      <input
        type="text"
        placeholder="Icon"
        value={guide.icon}
        onChange={(e) => {
          const copy = [...careGuides];
          copy[index].icon = e.target.value;
          setCareGuides(copy);
        }}
        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white"
      />

      <input
        type="text"
        placeholder="Title"
        value={guide.title}
        onChange={(e) => {
          const copy = [...careGuides];
          copy[index].title = e.target.value;
          setCareGuides(copy);
        }}
        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white"
      />

      <input
        type="text"
        placeholder="Steps"
        value={guide.steps}
        onChange={(e) => {
          const copy = [...careGuides];
          copy[index].steps = e.target.value;
          setCareGuides(copy);
        }}
        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white"
      />

      <button
        type="button"
        onClick={() =>
          setCareGuides(
            careGuides.filter(
              (_, i) => i !== index
            )
          )
        }
        className="bg-red-500 rounded-xl text-white"
      >
        Remove
      </button>
    </div>
  ))}
</div>
{/* Included Items */}

<div className="mt-6 border border-white/10 rounded-2xl p-6">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold text-white">
      Included Items
    </h2>

    <button
      type="button"
      onClick={() =>
        setIncludedItems([
          ...includedItems,
          {
            text: "",
          },
        ])
      }
      className="px-4 py-2 bg-cyan-500 rounded-xl text-white"
    >
      + Add Item
    </button>
  </div>

  {includedItems.map((item, index) => (
    <div
      key={index}
      className="flex gap-4 mb-4"
    >
      <input
        type="text"
        placeholder="Item Name"
        value={item.text}
        onChange={(e) => {
          const copy = [...includedItems];
          copy[index].text =
            e.target.value;
          setIncludedItems(copy);
        }}
        className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white"
      />

      <button
        type="button"
        onClick={() =>
          setIncludedItems(
            includedItems.filter(
              (_, i) => i !== index
            )
          )
        }
        className="px-4 bg-red-500 rounded-xl text-white"
      >
        Remove
      </button>
    </div>
  ))}
</div>
{/* Main Image */}
<div className="mt-6">
  <label className="block mb-2 text-sm font-medium text-slate-300">
    Main Product Image
  </label>

  <input
    type="file"
    accept="image/*"
    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300"
    onChange={(e) => {
      const file = e.target.files?.[0];

      if (!file) return;

      setMainImage(file);
      setMainPreview(URL.createObjectURL(file));
    }}
  />

  {mainPreview && (
    <img
      src={mainPreview}
      alt="Preview"
      className="mt-4 w-40 h-40 object-cover rounded-2xl border border-white/10"
    />
  )}
</div>

{/* Gallery Images */}
<div className="mt-6">
  <label className="block mb-2 text-sm font-medium text-slate-300">
    Gallery Images
  </label>

  <input
    type="file"
    multiple
    accept="image/*"
    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300"
    onChange={(e) => {
      const files = Array.from(e.target.files || []);

      setGalleryImages(files);

      setGalleryPreviews(
        files.map((file) =>
          URL.createObjectURL(file)
        )
      );
    }}
  />

  {galleryPreviews.length > 0 && (
    <div className="grid grid-cols-4 gap-4 mt-4">
      {galleryPreviews.map((img, index) => (
        <img
          key={index}
          src={img}
          className="w-28 h-28 object-cover rounded-2xl border border-white/10"
        />
      ))}
    </div>
  )}
</div>
      <button
        type="submit"
        className="
        mt-8
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
        Update Product
      </button>
    </form>
  </div>
);}