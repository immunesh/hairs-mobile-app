import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, User } from 'lucide-react';
import { getAllBlogs } from "@/lib/blog-api";
export const metadata: Metadata = {
  title: 'Hair Care Blog & Style Guides | HairsUp',
  description: 'Expert hair care tips, styling guides, and inspiration from the HairsUp team. Everything you need to know about wigs and hair systems.',
};

 

const TAG_COLORS: Record<string, string> = {
  'Beginner Guide': 'bg-green-100 text-green-700',
  'Care Tips': 'bg-blue-100 text-blue-700',
  "Men's Hair": 'bg-gray-100 text-gray-700',
  'Style Guide': 'bg-pink-100 text-pink-700',
  'Buying Guide': 'bg-amber-100 text-amber-700',
  'Medical': 'bg-red-100 text-red-700',
};

const CATEGORIES = ['All', 'Beginner Guide', 'Care Tips', "Men's Hair", 'Style Guide', 'Buying Guide', 'Medical'];

export default async function BlogPage() {
  const blogs = await getAllBlogs();

  const featured = blogs.slice(0, 2);
  const rest = blogs.slice(2);

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-16 text-center">
        <div className="container-custom max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Hair Care Blog & Style Guides
          </h1>

          <p className="text-white/75 text-lg">
            Expert tips, styling guides, and inspiration from our certified
            trichologists and style directors.
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Featured */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {featured.map((post: any, i: number) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group card overflow-hidden"
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-white font-display font-bold text-xl leading-tight">
                    {post.title}
                  </h2>
                </div>

                {i === 0 && (
                  <div className="absolute top-3 right-3 bg-brand-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Featured
                  </div>
                )}
              </div>

              <div className="p-5">
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author}
                    </span>
                  </div>

                  <span className="text-brand-600 text-sm font-semibold flex items-center gap-1">
                    Read
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* More Articles */}
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
          More Articles
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {rest.map((post: any) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group card overflow-hidden"
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-4">
                <h3 className="font-display font-bold text-gray-900 mb-2 leading-tight group-hover:text-brand-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-sm text-gray-500 line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
