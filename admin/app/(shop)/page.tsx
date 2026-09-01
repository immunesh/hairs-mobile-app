'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, Star, Sparkles, Shield, Truck, RotateCcw, HeadphonesIcon,
  ChevronLeft, ChevronRight, Zap, Award, Users, Heart
} from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { formatPrice } from '@/lib/utils';
 
import { Category, Product } from '@/types';
import { productsApi, blogApi } from '@/lib/api';
import { getCategories } from '@/lib/category-api';
import { getHeroSlides } from '@/lib/hero-api';
const FALLBACK_CATEGORY_IMAGE = "/women.avif";

const CATEGORY_TILE_STYLES = [
  { color: 'from-pink-900/80 to-brand-900/80' },
  { color: 'from-gray-900/80 to-blue-900/80' },
  { color: 'from-amber-900/80 to-brand-900/80' },
  { color: 'from-brand-950/80 to-purple-900/80' },
];

const GENDER_BADGE: Record<string, string> = {
  WOMEN: "Women's",
  MEN: "Men's",
  UNISEX: 'Unisex',
};

const DEFAULT_HERO_SLIDES = [
  {
    id: 1,
    headline: 'Transform Your Look',
    subheadline: 'with Premium Human Hair Wigs',
    description: "India's finest collection of 100% human hair wigs and hair systems. Look naturally stunning every day.",
    cta: 'Shop Women\'s Collection',
    ctaLink: '/women',
    ctaSecondary: 'Try On Virtually',
    ctaSecondaryLink: '/try-on',
    badge: 'New Season Collection',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80',
    accent: 'from-brand-950 to-brand-700',
    tag: 'WOMEN',
  },
  {
    id: 2,
    headline: "Confidence Starts",
    subheadline: "from the Top — Men's Hair Systems",
    description: 'Advanced Swiss lace hair systems engineered for an undetectable, natural look. Reclaim your confidence.',
    cta: "Shop Men's Collection",
    ctaLink: '/men',
    ctaSecondary: 'Book a Consultation',
    ctaSecondaryLink: '/contact',
    badge: 'Clinically Endorsed',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&q=80',
    accent: 'from-gray-900 to-brand-900',
    tag: 'MEN',
  },
  {
    id: 3,
    headline: 'See It Before',
    subheadline: 'You Buy It — Virtual Try-On',
    description: 'Experience the future of wig shopping. Use our AI-powered virtual try-on to find your perfect match.',
    cta: 'Try On Now — Free',
    ctaLink: '/try-on',
    ctaSecondary: 'How It Works',
    ctaSecondaryLink: '/blog/virtual-try-on',
    badge: 'AI-Powered Technology',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200&q=80',
    accent: 'from-purple-950 to-brand-700',
    tag: 'NEW',
  },
];


const TRUST_FEATURES = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹999', color: 'text-brand-600 bg-brand-50' },
  { icon: RotateCcw, title: '7-Day Returns', desc: 'Hassle-free exchanges', color: 'text-green-600 bg-green-50' },
  { icon: Shield, title: 'Genuine Products', desc: '100% authentic wigs', color: 'text-blue-600 bg-blue-50' },
  { icon: HeadphonesIcon, title: 'Expert Support', desc: 'Certified hair specialists', color: 'text-amber-600 bg-amber-50' },
];

const STATS = [
  { value: '10L+', label: 'Happy Customers', icon: Users },
  { value: '4.8★', label: 'Average Rating', icon: Star },
  { value: '50+', label: 'Stores Pan India', icon: Award },
  { value: '280+', label: 'Wig Styles', icon: Sparkles },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'I was skeptical at first, but HairsUp completely changed my life! The lace front wig looks so natural — nobody can tell! The virtual try-on helped me pick the perfect style.',
    product: 'Silky Straight Lace Front Wig',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
  },
  {
    name: 'Rajesh Kumar',
    location: 'Delhi',
    rating: 5,
    text: "After years of hair loss, I finally found a solution that works. The Swiss lace hairpiece is completely undetectable. My colleagues don't even know! Best investment I've ever made.",
    product: "Men's Natural System Hairpiece",
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
  },
  {
    name: 'Ananya Patel',
    location: 'Bangalore',
    rating: 5,
    text: 'The body wave wig is absolutely stunning! High quality, natural looking, and the 360° view on the website helped me see every detail before buying. Delivery was super fast too!',
    product: 'Goddess Waves Body Wave Wig',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&q=80',
  },
];

 

export default function HomePage() {
  const [heroSlides, setHeroSlides] = useState<any[]>(DEFAULT_HERO_SLIDES);
  const [heroSlide, setHeroSlide] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    const loadHeroSlides = async () => {
      try {
        const data = await getHeroSlides(true);
        if (Array.isArray(data) && data.length > 0) {
          setHeroSlides(data);
          setHeroSlide(0);
        }
      } catch (error) {
        console.error('Homepage hero slides error:', error);
      }
    };

    loadHeroSlides();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSliding(true);
      setTimeout(() => { setHeroSlide((s) => (s + 1) % heroSlides.length); setIsSliding(false); }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const goSlide = (dir: number) => {
    setIsSliding(true);
    setTimeout(() => {
      setHeroSlide((s) => ((s + dir + heroSlides.length) % heroSlides.length));
      setIsSliding(false);
    }, 200);
  };

  const slide = heroSlides[heroSlide] || heroSlides[0];
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data || []);
      } catch (error) {
        console.error('Homepage categories error:', error);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

useEffect(() => {
  const loadProducts = async () => {
    
    try {
      const res = await productsApi.getAll();

      const list =
        res?.data?.data || [];

      console.log(
        "HOME PRODUCTS",
        list
      );

      setFeaturedProducts(
        list
          .filter(
            (p: Product) =>
              p.isFeatured
          )
          .slice(0, 8)
      );

      setNewArrivals(
        list
          .filter(
            (p: Product) =>
              p.isNewArrival
          )
          .slice(0, 4)
      );

      setBestSellers(
        list
          .filter(
            (p: Product) =>
              p.isBestSeller
          )
          .slice(0, 4)
      );
      
    } catch (error) {
      console.error(
        "Homepage products error:",
        error
      );

      setFeaturedProducts([]);
      setNewArrivals([]);
      setBestSellers([]);
    }
  };

  loadProducts();
}, []);
console.log(
  "FEATURED",
  featuredProducts
);

console.log(
  "NEW",
  newArrivals
);

console.log(
  "BEST",
  bestSellers
);
useEffect(() => {
  const loadBlogs = async () => {
    try {
      const res = await blogApi.getAll();

      console.log("BLOG RESPONSE", res.data);

      const blogList =
        res.data?.data ||
        res.data?.blogs ||
        [];

      setBlogs(blogList);
    } catch (error) {
      console.error("Blog fetch error", error);
      setBlogs([]);
    }
  };

  loadBlogs();
}, []);
  return (
    <div>
      {/* ─── HERO SLIDER ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[560px] md:min-h-[640px] lg:min-h-[700px]">
        {/* Background image */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${isSliding ? 'opacity-0' : 'opacity-100'}`}>
          <Image
            src={slide.image}
            alt={slide.headline}
            fill
            className="object-cover"
            priority
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.accent || 'from-brand-950 to-brand-700'} opacity-85`} />
        </div>

        {/* Content */}
        <div className="relative container-custom flex items-center min-h-[560px] md:min-h-[640px] lg:min-h-[700px] py-20">
          <div className={`max-w-2xl text-white transition-all duration-500 ${isSliding ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            {slide.badge && (
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
                <Sparkles className="w-4 h-4 text-brand-300" />
                {slide.badge}
              </div>
            )}

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-4">
              {slide.headline}
              <br />
              <span className="text-brand-300">{slide.subheadline}</span>
            </h1>

            <p className="text-lg text-white/80 mb-8 max-w-lg leading-relaxed">
              {slide.description}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {slide.cta && slide.ctaLink && (
                <Link href={slide.ctaLink} className="btn-primary bg-white text-brand-700 hover:bg-brand-50 text-base py-3.5 px-8 flex items-center gap-2">
                  {slide.cta} <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              {slide.ctaSecondary && slide.ctaSecondaryLink && (
                <Link href={slide.ctaSecondaryLink} className="flex items-center gap-2 text-white font-semibold border border-white/40 hover:border-white rounded-full px-6 py-3.5 transition-all hover:bg-white/10 text-base">
                  <Zap className="w-4 h-4" /> {slide.ctaSecondary}
                </Link>
              )}
            </div>

            {/* Mini stats */}
            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/20">
              {['10L+ Customers', '4.8★ Rating', '50+ Stores'].map((stat) => (
                <div key={stat} className="text-sm text-white/70 font-medium">{stat}</div>
              ))}
            </div>
          </div>

          {/* Tag badge */}
          {slide.tag && (
            <div className="absolute top-8 right-8 hidden lg:block">
              <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-white text-center">
                <div className="text-xs font-semibold text-brand-300 mb-1">COLLECTION</div>
                <div className="text-2xl font-display font-bold">{slide.tag}</div>
              </div>
            </div>
          )}
        </div>

        {/* Slider controls */}
        <button
          onClick={() => goSlide(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => goSlide(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              className={`transition-all duration-300 rounded-full ${i === heroSlide ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
      </section>

      {/* ─── TRUST STRIP ────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="container-custom py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST_FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CATEGORIES ──────────────────────────────────────────────── */}
     <section className="py-16 container-custom">
  <div className="text-center mb-10">
    <h2 className="section-title">Shop by Category</h2>
    <p className="section-subtitle">
      Find the perfect wig for your lifestyle and personality
    </p>
  </div>

  {categories.length > 0 && (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {categories.slice(0, 8).map((cat, i) => {
      const productCount = cat._count?.products ?? 0;
      const badge = (cat.gender && GENDER_BADGE[cat.gender]) || 'Shop Now';
      const style = CATEGORY_TILE_STYLES[i % CATEGORY_TILE_STYLES.length];

      return (
      <Link
        key={cat.id}
        href={`/products?category=${cat.slug}`}
        className="group relative overflow-hidden rounded-2xl aspect-[3/4]"
      >
        <Image
          src={cat.image || FALLBACK_CATEGORY_IMAGE}
          alt={cat.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <div
          className={`absolute inset-0 bg-gradient-to-t ${style.color} transition-opacity group-hover:opacity-90`}
        />

        <div className="absolute inset-0 p-4 flex flex-col justify-between">
          <span className="inline-flex self-start bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {badge}
          </span>

          <div>
            <p className="text-white/70 text-xs mb-1">
              {productCount} {productCount === 1 ? 'style' : 'styles'}
            </p>

            <h3 className="text-white font-display font-bold text-lg leading-tight">
              {cat.name}
            </h3>

            {cat.description && (
              <p className="text-white/70 text-xs mt-1 hidden sm:block line-clamp-2">
                {cat.description}
              </p>
            )}

            <div className="flex items-center gap-1 mt-2 text-white/80 text-xs font-medium">
              Shop Now
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
      );
    })}
  </div>
  )}
</section>

      {/* ─── FEATURED PRODUCTS ──────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title">Featured Collection</h2>
              <p className="text-gray-500">Handpicked by our style experts</p>
            </div>
            <Link href="/products" className="btn-secondary text-sm py-2 px-5 hidden sm:flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link href="/products" className="btn-secondary inline-flex items-center gap-2">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PROMO BANNER (Try On) ───────────────────────────────── */}
      <section className="py-16">
        <div className="container-custom">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-950 via-brand-800 to-purple-700 text-white p-8 md:p-14">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-20 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1.5 text-sm font-semibold mb-4">
                  <Zap className="w-4 h-4 text-yellow-300" /> AI-Powered Feature
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
                  Try Before You Buy
                </h2>
                <p className="text-white/75 text-lg mb-6 max-w-md">
                  Our revolutionary virtual try-on uses AI to overlay any wig on your live camera feed.
                  See exactly how you&apos;ll look before adding to your bag.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/try-on" className="bg-white text-brand-700 font-bold px-6 py-3 rounded-full hover:bg-brand-50 transition-colors flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Try On Free Now
                  </Link>
                  <Link href="/blog" className="border border-white/40 hover:border-white text-white px-6 py-3 rounded-full transition-all hover:bg-white/10 flex items-center gap-2">
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-52 h-52 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <div className="text-center">
                    <div className="text-5xl font-display font-bold text-white mb-1">360°</div>
                    <div className="text-brand-300 text-sm font-medium">Product View</div>
                    <div className="text-white/50 text-xs mt-2">Drag to rotate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── NEW ARRIVALS ────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title">New Arrivals</h2>
              <p className="text-gray-500">Fresh styles just landed</p>
            </div>
            <Link href="/products" className="btn-secondary text-sm py-2 px-5 hidden sm:flex items-center gap-1">
              See All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ─── GENDER SPLIT BANNER ──────────────────────────────────── */}
      <section className="py-16 container-custom">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Women */}
          <Link href="/women" className="group relative overflow-hidden rounded-3xl min-h-[360px] cursor-pointer">
            <Image
              src='https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80'
              alt="Women's Wigs"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-900/80 via-brand-900/60 to-transparent" />
            <div className="absolute inset-0 p-10 flex flex-col justify-end">
              <span className="badge bg-white/20 text-white mb-3 self-start backdrop-blur-sm">For Her</span>
              <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">Women&apos;s Wigs</h3>
              <p className="text-white/75 mb-5 max-w-xs">From silky straight to glamorous curls — express every side of you.</p>
              <span className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-5 py-2.5 rounded-full self-start group-hover:bg-brand-50 transition-colors">
                Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>

          {/* Men */}
          <Link href="/men" className="group relative overflow-hidden rounded-3xl min-h-[360px] cursor-pointer">
            <Image
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80"
              alt="Men's Hair Systems"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/85 via-brand-950/60 to-transparent" />
            <div className="absolute inset-0 p-10 flex flex-col justify-end">
              <span className="badge bg-white/20 text-white mb-3 self-start backdrop-blur-sm">For Him</span>
              <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">Men&apos;s Hair Systems</h3>
              <p className="text-white/75 mb-5 max-w-xs">Undetectable Swiss lace hair systems. Natural look, zero compromise.</p>
              <span className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-5 py-2.5 rounded-full self-start group-hover:bg-brand-50 transition-colors">
                Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ─── BEST SELLERS ────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title">Best Sellers</h2>
              <p className="text-gray-500">Customer favourites, tried and loved</p>
            </div>
            <Link href="/products" className="btn-secondary text-sm py-2 px-5 hidden sm:flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ─── STATS ──────────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-brand-950 via-brand-900 to-brand-800 text-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
              India&apos;s Most Trusted Hair Brand
            </h2>
            <p className="text-white/65 text-lg">Numbers that speak for themselves</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-brand-300" />
                </div>
                <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1">{value}</div>
                <div className="text-white/60 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ────────────────────────────────────────── */}
      <section className="py-16 container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Real Stories. Real Confidence.</h2>
          <p className="section-subtitle">See what our customers say about HairsUp</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="card p-6 hover:shadow-product-hover transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 star-filled" />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <Image src={t.image} alt={t.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.location} · {t.product}</p>
                </div>
                <Heart className="ml-auto w-4 h-4 text-red-400 fill-red-400" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── BLOG ───────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title">Hair Care Tips & Style Guides</h2>
              <p className="text-gray-500">Expert advice from our team</p>
            </div>
            <Link href="/blog" className="btn-secondary text-sm py-2 px-5 hidden sm:flex items-center gap-1">
              All Articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
     {blogs.map((post: any) => (
  <Link
    key={post.id}
    href={`/blog/${post.slug}`}
    className="card group overflow-hidden"
  >
    <div className="relative h-48 overflow-hidden">
      <Image
        src={
          post.featuredImage ||
          post.image ||
          "/placeholder-blog.jpg"
        }
        alt={post.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <div className="absolute top-3 left-3">
        <span className="badge bg-brand-600 text-white text-xs">
          {post.category || "Blog"}
        </span>
      </div>
    </div>

    <div className="p-5">
      <p className="text-xs text-gray-400 mb-2">
        {post.createdAt
          ? new Date(post.createdAt).toLocaleDateString()
          : "Latest Article"}
      </p>

      <h3 className="font-display font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors leading-snug">
        {post.title}
      </h3>

      <p className="text-sm text-gray-500 line-clamp-2">
        {post.excerpt ||
          post.shortDescription ||
          post.content?.slice(0, 120)}
      </p>

      <div className="flex items-center gap-1 mt-4 text-brand-600 text-sm font-semibold">
        Read More
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </Link>
))}
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ──────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-brand-50 to-purple-50 rounded-3xl p-10 md:p-16 text-center border border-brand-100">
            <Sparkles className="w-10 h-10 text-brand-600 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-3">
              Get Exclusive Offers & Style Tips
            </h2>
            <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
              Join 2 lakh+ subscribers. Get first access to new arrivals, styling tips, and exclusive discounts.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 input-field"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe Free
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-3">No spam. Unsubscribe anytime. We respect your privacy.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
