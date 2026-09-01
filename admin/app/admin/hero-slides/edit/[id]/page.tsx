import Link from "next/link";
import EditHeroSlideForm from "@/components/admin/EditHeroSlideForm";

async function getHeroSlide(id: string) {
  const res = await fetch(
    `http://localhost:4000/api/hero-slides/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch hero slide");
  }

  return res.json();
}

export default async function EditHeroSlidePage({
  params,
}: {
  params: { id: string };
}) {
  const heroSlide = await getHeroSlide(params.id);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Edit Hero Slide
          </h1>

          <p className="text-slate-400 mt-2">
            Update slide content and background image
          </p>
        </div>

        <Link
          href="/admin/hero-slides"
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
        <EditHeroSlideForm heroSlide={heroSlide} />
      </div>
    </div>
  );
}
