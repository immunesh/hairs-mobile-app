'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Grid, List, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import FilterSidebar from '@/components/ui/FilterSidebar';
import { DEMO_PRODUCTS } from '@/lib/utils';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'createdAt-desc' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Best Rating', value: 'rating-desc' },
  { label: 'Most Popular', value: 'reviews-desc' },
];

const SUBCATEGORIES = [
  { label: 'All', value: '', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80' },
  { label: 'Human Hair', value: 'human-hair', image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=200&q=80' },
  { label: 'Synthetic', value: 'synthetic', image: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?w=200&q=80' },
  { label: 'Lace Front', value: 'lace-front', image: 'https://images.unsplash.com/photo-1519699047748-de8e44489ece?w=200&q=80' },
  { label: 'Curly', value: 'curly', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80' },
  { label: 'Straight', value: 'straight', image: 'https://images.unsplash.com/photo-1571512599285-9494e11d9e72?w=200&q=80' },
];

export default function WomenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Record<string, string | string[] | number | boolean | undefined>>({});
  const [sort, setSort] = useState('createdAt-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activeSubcat, setActiveSubcat] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await productsApi.getAll();
        let list = (res.data.data || []) as Product[];
       console.log(
  list.map((p) => ({
    name: p.name,
    gender: p.gender,
    category: p.category?.name,
  }))
);
list = list.filter((p) => {
  const gender =
    String(p.gender || "")
      .trim()
      .toUpperCase();

  const category =
    String(p.category?.name || "")
      .toLowerCase();

  return (
    gender === "WOMEN" ||
    category.includes("women")
  );
});
     // filter women FIRST
list = list.filter(
  (p) =>
    String(p.gender || "")
      .trim()
      .toUpperCase() === "WOMEN"
);

console.log(
  "Women Products After Filter",
  list
);

        // apply active subcategory heuristics
        if (activeSubcat) {
          const val = activeSubcat;
          if (val === 'human-hair') list = list.filter((p) => String(p.material || '').toLowerCase().includes('human'));
          else if (val === 'synthetic') list = list.filter((p) => String(p.material || '').toLowerCase().includes('synthetic'));
          else if (val === 'lace-front') list = list.filter((p) => String(p.name || '').toLowerCase().includes('lace') || String(p.description || '').toLowerCase().includes('lace'));
          else if (val === 'curly') list = list.filter((p) => String(p.texture || '').toLowerCase().includes('curly'));
          else if (val === 'straight') list = list.filter((p) => String(p.texture || '').toLowerCase().includes('straight'));
        }
  if (filters.material) {
  const materialMap: Record<string, string> = {
    "human-hair": "human hair",
    "synthetic": "synthetic",
    "blend": "blend",
  };

  const target =
    materialMap[String(filters.material)];

  list = list.filter((p) =>
    String(p.material || "")
      .toLowerCase()
      .includes(target)
  );
}

if (filters.texture) {
  const selected = Array.isArray(filters.texture)
    ? filters.texture
    : [filters.texture];

  list = list.filter((p) =>
    selected.some((t) =>
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
  list = list.filter((p) => {
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
console.log(
  list.map((p) => ({
    name: p.name,
    length: p.length,
  }))
);
if (filters.price) {
  const [min, max] = String(filters.price)
    .split("-")
    .map(Number);

  list = list.filter((p) => {
    const price =
      p.salePrice || p.basePrice;

    return price >= min && price <= max;
  });
}
if (filters.collection) {
  const selected = Array.isArray(filters.collection)
    ? filters.collection
    : [filters.collection];

  list = list.filter((p) => {
    if (
      selected.includes("featured") &&
      p.isFeatured
    )
      return true;

    if (
      selected.includes("best") &&
      p.isBestSeller
    )
      return true;

    if (
      selected.includes("new") &&
      p.isNewArrival
    )
      return true;

    if (
      selected.includes("sale") &&
      p.salePrice
    )
      return true;

    return false;
  });
}

if (filters.color) {
  list = list.filter((p) =>
    String(p.color || "")
      .toLowerCase()
      .includes(
        String(filters.color)
          .toLowerCase()
      )
  );
}

        if (mounted) setProducts(list);
      } catch (e) {
        // fallback to demo products
        const womenProducts = DEMO_PRODUCTS.filter((p) => p.gender === 'WOMEN') as unknown as Product[];
        if (mounted) setProducts(womenProducts);
      }
    };
    load();
    return () => { mounted = false; };
 }, [activeSubcat, filters]);

  const handleFilterChange = (key: string, value: string | string[] | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setActiveSubcat('');
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
let sortedProducts = [...products];

switch (sort) {
  case "price-asc":
    sortedProducts.sort(
      (a, b) =>
        (a.salePrice || a.basePrice) -
        (b.salePrice || b.basePrice)
    );
    break;

  case "price-desc":
    sortedProducts.sort(
      (a, b) =>
        (b.salePrice || b.basePrice) -
        (a.salePrice || a.basePrice)
    );
    break;

  case "rating-desc":
    sortedProducts.sort(
      (a, b) => b.rating - a.rating
    );
    break;

  case "reviews-desc":
    sortedProducts.sort(
      (a, b) => b.reviewCount - a.reviewCount
    );
    break;

  case "createdAt-desc":
  default:
    sortedProducts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
    break;
}
  return (
    <div>
      {/* Hero banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1519699047748-de8e44489ece?w=1400&q=80"
          alt="Women's Wigs"
          fill className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/85 to-brand-700/60" />
        <div className="relative container-custom h-full flex flex-col justify-center text-white">
          <div className="flex items-center gap-2 text-brand-300 text-sm mb-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span>Women&apos;s Wigs</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">Women&apos;s Wigs</h1>
          <p className="text-white/75 text-lg max-w-lg">
            Premium hair wigs for every occasion — from everyday elegance to glamorous special events.
          </p>
          <div className="flex gap-3 mt-4 flex-wrap text-sm">
            <span className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">Human Hair</span>
            <span className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">Synthetic</span>
            <span className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">Lace Front</span>
            <span className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">200+ Styles</span>
          </div>
        </div>
      </div>

      {/* Subcategory pills */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="container-custom py-3 flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {SUBCATEGORIES.map((sub) => (
            <button
              key={sub.value}
              onClick={() => setActiveSubcat(sub.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 border ${
                activeSubcat === sub.value
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-brand-400 hover:text-brand-600'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex gap-8">
          {/* Desktop filter sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar filters={filters} onChange={handleFilterChange} onClear={clearFilters} />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <p className="text-sm text-gray-500 mr-auto">
                Showing <span className="font-semibold text-gray-900">{products.length}</span> women&apos;s wigs
              </p>

              {/* Mobile filter button */}
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium hover:border-brand-400"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters {activeFilterCount > 0 && <span className="bg-brand-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>}
              </button>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none border border-gray-200 rounded-xl px-4 py-2 pr-8 text-sm font-medium focus:outline-none focus:border-brand-400 bg-white cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>

              {/* View toggle */}
              <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active filters */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-sm text-gray-500">Active:</span>
                {Object.entries(filters).map(([key, val]) => val && (
                  <span key={key} className="flex items-center gap-1 bg-brand-50 text-brand-700 text-xs font-medium px-3 py-1 rounded-full border border-brand-200">
                    {Array.isArray(val) ? val.join(', ') : String(val)}
                    <button onClick={() => handleFilterChange(key, undefined)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button onClick={clearFilters} className="text-xs text-brand-600 hover:underline">Clear all</button>
              </div>
            )}

            {/* Products */}
            <div className={`grid gap-4 md:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
        {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowFilters(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Filters</h3>
              <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
            </div>
            <FilterSidebar filters={filters} onChange={handleFilterChange} onClear={clearFilters} />
            <button onClick={() => setShowFilters(false)} className="btn-primary w-full mt-4">Apply Filters</button>
          </div>
        </>
      )}
    </div>
  );
}
