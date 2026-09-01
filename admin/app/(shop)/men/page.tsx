'use client';

import { useState, useEffect } from 'react';
import { Grid, List, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import FilterSidebar from '@/components/ui/FilterSidebar';
 
import { productsApi } from '@/lib/api';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'createdAt-desc' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Best Rating', value: 'rating-desc' },
];

const SUBCATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Hair Systems', value: 'hair-system' },
  { label: 'Toupees', value: 'toupee' },
  { label: 'Full Cap', value: 'full-cap' },
  { label: 'Crown Cover', value: 'crown' },
  { label: 'Sports Active', value: 'sports' },
  { label: 'Human Hair', value: 'human-hair' },
];

const WHY_HAIRSUP_MEN = [
  { icon: '🔬', title: 'Swiss Lace Technology', desc: 'Ultra-thin lace that disappears on your scalp' },
  { icon: '💧', title: 'Sweat & Water Resistant', desc: 'Live an active life without worry' },
  { icon: '🎨', title: 'Custom Color Matching', desc: 'Match your exact natural hair colour' },
  { icon: '🤝', title: 'Professional Fitting', desc: 'Expert stylists at 50+ stores nationwide' },
];

export default function MenPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Record<string, string | string[] | number | boolean | undefined>>({});
  const [sort, setSort] = useState('createdAt-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activeSubcat, setActiveSubcat] = useState('');

 useEffect(() => {
  const loadProducts = async () => {
    try {
      const res = await productsApi.getAll();

      let list = res.data.data || [];

      console.log(
        "ALL PRODUCTS",
        list.map((p: any) => ({
          name: p.name,
          gender: p.gender,
          category: p.category?.name,
        }))
      );

      // MEN PRODUCTS
      list = list.filter(
        (p: any) =>
          String(p.gender || "").toUpperCase() === "MEN"
      );

      // SUB CATEGORY FILTERS
    // SUB CATEGORY FILTERS
if (activeSubcat === "human-hair") {
  list = list.filter((p: any) =>
    String(p.material || "")
      .toLowerCase()
      .includes("human")
  );
}

if (activeSubcat === "hair-system") {
  list = list.filter(
    (p: any) =>
      String(p.name || "")
        .toLowerCase()
        .includes("system") ||
      String(p.description || "")
        .toLowerCase()
        .includes("system")
  );
}

if (activeSubcat === "toupee") {
  list = list.filter((p: any) =>
    String(p.name || "")
      .toLowerCase()
      .includes("toupee")
  );
}

if (activeSubcat === "full-cap") {
  list = list.filter((p: any) =>
    String(p.name || "")
      .toLowerCase()
      .includes("full")
  );
}

if (activeSubcat === "crown") {
  list = list.filter((p: any) =>
    String(p.name || "")
      .toLowerCase()
      .includes("crown")
  );
}

// PRICE FILTER
if (filters.price) {
  const [min, max] = String(filters.price)
    .split("-")
    .map(Number);

  list = list.filter((p: any) => {
    const price = p.salePrice || p.basePrice;
    return price >= min && price <= max;
  });
}

// MATERIAL FILTER
if (filters.material) {
  const material = String(filters.material);

  if (material === "human-hair") {
    list = list.filter((p: any) =>
      String(p.material || "")
        .toLowerCase()
        .includes("human")
    );
  }

  if (material === "synthetic") {
    list = list.filter((p: any) =>
      String(p.material || "")
        .toLowerCase()
        .includes("synthetic")
    );
  }

  if (material === "blend") {
    list = list.filter((p: any) =>
      String(p.material || "")
        .toLowerCase()
        .includes("blend")
    );
  }
}

// TEXTURE FILTER
if (filters.texture) {
  const textures = Array.isArray(filters.texture)
    ? filters.texture
    : [filters.texture];

  list = list.filter((p: any) =>
    textures.some((t) =>
      String(p.texture || "")
        .toLowerCase()
        .includes(
          String(t)
            .replace("-", " ")
            .toLowerCase()
        )
    )
  );
}
if (filters.length) {
  list = list.filter((p: any) => {
    const inches = parseInt(
      String(p.length || "").replace(/\D/g, "")
    );

    if (isNaN(inches)) return false;

    switch (filters.length) {
      case "short":
        return inches < 12;

      case "medium":
        return inches >= 12 && inches <= 18;

      case "long":
        return inches > 18 && inches <= 24;

      case "extra-long":
        return inches > 24;

      default:
        return true;
    }
  });
}
// COLLECTION FILTER
if (filters.collection) {
  const collections = Array.isArray(filters.collection)
    ? filters.collection
    : [filters.collection];

  list = list.filter((p: any) => {
    if (collections.includes("featured") && p.isFeatured)
      return true;

    if (collections.includes("best") && p.isBestSeller)
      return true;

    if (collections.includes("new") && p.isNewArrival)
      return true;

    if (collections.includes("sale") && p.salePrice)
      return true;

    return false;
  });
} 

if (sort === "price-desc") {
  list.sort(
    (a: any, b: any) =>
      (b.salePrice || b.basePrice) -
      (a.salePrice || a.basePrice)
  );
}

if (sort === "rating-desc") {
  list.sort(
    (a: any, b: any) =>
      (b.rating || 0) -
      (a.rating || 0)
  );
}
console.log("FILTERS", filters);
console.log("RESULTS", list);
      setProducts(list);
    } catch (error) {
      console.error(error);
      setProducts([]);
    }
  };

  loadProducts();
}, [activeSubcat, filters, sort]);

  const handleFilterChange = (key: string, value: string | string[] | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => { setFilters({}); setActiveSubcat(''); };
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div>
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1400&q=80"
          alt="Men's Hair Systems"
          fill className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-900/70 to-brand-950/50" />
        <div className="relative container-custom h-full flex flex-col justify-center text-white">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span>Men&apos;s Hair Systems</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">Men&apos;s Hair Systems</h1>
          <p className="text-white/70 text-lg max-w-lg">
            Advanced hair systems engineered for discretion, comfort, and natural appearance.
            Designed for modern men who refuse to compromise.
          </p>
          <div className="flex gap-3 mt-4 flex-wrap text-sm">
            <span className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">Swiss Lace</span>
            <span className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">100% Human Hair</span>
            <span className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">Undetectable</span>
            <span className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">80+ Styles</span>
          </div>
        </div>
      </div>

      {/* Why HairsUp for Men */}
      <div className="bg-gray-950 text-white py-8">
        <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-6">
          {WHY_HAIRSUP_MEN.map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="font-semibold text-sm text-white mb-0.5">{title}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subcategories */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="container-custom py-3 flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {SUBCATEGORIES.map((sub) => (
            <button
              key={sub.value}
              onClick={() => setActiveSubcat(sub.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 border ${
                activeSubcat === sub.value
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex gap-8">
          <div className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar filters={filters} onChange={handleFilterChange} onClear={clearFilters} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <p className="text-sm text-gray-500 mr-auto">
                Showing <span className="font-semibold text-gray-900">{products.length}</span> men&apos;s hair systems
              </p>
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none border border-gray-200 rounded-xl px-4 py-2 pr-8 text-sm focus:outline-none focus:border-gray-400 bg-white cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>
              <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                  <Grid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className={`grid gap-4 md:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </div>
      </div>

      {showFilters && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowFilters(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Filters</h3>
              <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
            </div>
            <FilterSidebar filters={filters} onChange={handleFilterChange} onClear={clearFilters} />
            <button onClick={() => setShowFilters(false)} className="w-full mt-4 bg-gray-900 text-white font-semibold py-3 rounded-full">Apply Filters</button>
          </div>
        </>
      )}
    </div>
  );
}
