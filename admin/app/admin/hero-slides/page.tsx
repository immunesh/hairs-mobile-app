import Link from "next/link";
import DeleteHeroSlideButton from "@/components/admin/DeleteHeroSlideButton";

async function getHeroSlides() {
  const res = await fetch(
    "http://localhost:4000/api/hero-slides",
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch hero slides");
  }

  return res.json();
}

export default async function HeroSlidesPage() {
  const heroSlides = await getHeroSlides();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Hero Slides
          </h1>

          <p className="text-slate-400 mt-2 text-sm sm:text-base">
            Manage the homepage hero slider
          </p>
        </div>

        <Link
          href="/admin/hero-slides/create"
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
          + Add Hero Slide
        </Link>
      </div>

      {/* Hero Slides Card */}
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
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                  Image
                </th>

                <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                  Headline
                </th>

                <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                  Tag
                </th>

                <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                  Order
                </th>

                <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                  Status
                </th>

                <th className="text-left p-3 sm:p-5 text-slate-300 text-sm">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {heroSlides.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="
                    p-8 sm:p-12
                    text-center
                    text-slate-500
                    "
                  >
                    No hero slides found
                  </td>
                </tr>
              ) : (
                heroSlides.map((slide: any) => (
                  <tr
                    key={slide.id}
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
                      {slide.image ? (
                        <img
                          src={slide.image}
                          alt={slide.headline}
                          className="w-16 h-12 rounded-xl object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-16 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 text-xs">
                          —
                        </div>
                      )}
                    </td>

                    {/* Headline */}
                    <td className="p-3 sm:p-5">
                      <div className="font-medium text-white">
                        {slide.headline}
                      </div>
                      {slide.subheadline && (
                        <div className="text-slate-400 text-xs mt-1">
                          {slide.subheadline}
                        </div>
                      )}
                    </td>

                    {/* Tag */}
                    <td className="p-3 sm:p-5">
                      {slide.tag ? (
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
                          {slide.tag}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    {/* Order */}
                    <td className="p-3 sm:p-5 text-slate-400">
                      {slide.order}
                    </td>

                    {/* Status */}
                    <td className="p-3 sm:p-5">
                      <span
                        className={`
                        inline-flex
                        items-center

                        px-2 sm:px-3
                        py-1

                        rounded-full

                        text-[10px] sm:text-xs
                        font-semibold

                        border
                        ${
                          slide.isActive
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/20"
                            : "bg-slate-500/20 text-slate-400 border-slate-500/20"
                        }
                        `}
                      >
                        {slide.isActive ? "Active" : "Hidden"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3 sm:p-5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/hero-slides/edit/${slide.id}`}
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

                        <DeleteHeroSlideButton
                          id={slide.id}
                          name={slide.headline}
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
