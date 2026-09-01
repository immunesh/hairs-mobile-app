'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Grid, List, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import FilterSidebar from '@/components/ui/FilterSidebar';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';
import Link from 'next/link';

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'createdAt-desc' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Best Rating', value: 'rating-desc' },
  { label: 'Most Reviewed', value: 'reviews-desc' },
];

export default function AllProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Record<string, string | string[] | number | boolean | undefined>>(() => {
    const category = searchParams.get('category');
    return category ? { category } : {};
  });
  const [sort, setSort] = useState('createdAt-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activeGender, setActiveGender] = useState<'ALL' | 'WOMEN' | 'MEN'>('ALL');
const loadProducts = async () => {
  try {
    const { data } = await productsApi.getAll();

    console.log("Products API:", data);
let filtered: Product[] = data.data || [];

// Gender filter
if (activeGender !== "ALL") {
  filtered = filtered.filter(
    (p: Product) =>
      String(p.gender || "")
        .trim()
        .toUpperCase() === activeGender
  );
}

// Category filter
if (filters.category) {
  filtered = filtered.filter(
    (p: Product) => p.category?.slug === filters.category
  );
}

// Material filter
if (filters.material) {
  const materialMap: Record<string, string> = {
    "human-hair": "human hair",
    synthetic: "synthetic",
    blend: "blend",
  };

 const target =
  materialMap[String(filters.material)];

if (target) {
  filtered = filtered.filter((p) =>
    String(p.material || "")
      .toLowerCase()
      .includes(target)
  );
}
}

// Texture filter
if (filters.texture) {
  const selected = Array.isArray(filters.texture)
    ? filters.texture
    : [filters.texture];

  filtered = filtered.filter((p) =>
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
console.log(
  "Length Values",
  filtered.map((p) => ({
    name: p.name,
    length: p.length,
  }))
);
// Length filter
if (filters.length) {
  filtered = filtered.filter((p: Product) => {
    const inches = parseInt(
      String(p.length || "0")
    );

    switch (filters.length) {
      case "short":
        return inches <= 12;

      case "medium":
        return inches > 12 && inches <= 18;

      case "long":
        return inches > 18 && inches <= 24;

      case "extra-long":
        return inches > 24;

      default:
        return true;
    }
  });
}
if (filters.price) {
  const [min, max] = String(filters.price)
    .split("-")
    .map(Number);

  filtered = filtered.filter((p) => {
    const price =
      p.salePrice || p.basePrice;

    return (
      price >= min &&
      price <= max
    );
  });
}
if (filters.color) {
  filtered = filtered.filter((p) =>
    String(p.color || "")
      .toLowerCase()
      .includes(
        String(filters.color)
          .toLowerCase()
      )
  );
}

if (filters.collection) {
  const selected = Array.isArray(
    filters.collection
  )
    ? filters.collection
    : [filters.collection];

  filtered = filtered.filter((p) => {
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


console.log(filtered[0]);
    setProducts(filtered);
  } catch (error) {
    console.error(error);
  }
};
useEffect(() => {
  loadProducts();
}, [activeGender, filters]);

const handleFilterChange = (
  key: string,
  value: string | string[] | undefined
) => {

  console.log("Filter Changed:", key, value);

  setFilters((prev) => ({
    ...prev,
    [key]: value,
  }));
};


  const clearFilters = () => { setFilters({}); };
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
      (a, b) =>
      (b.rating || 0) - (a.rating || 0)
    );
    break;

  case "reviews-desc":
    sortedProducts.sort(
      (a, b) =>
       (b.reviewCount || 0) - (a.reviewCount || 0)
    );
    break;

  default:
    sortedProducts.sort(
      (a, b) =>
        new Date(
          b.createdAt
        ).getTime() -
        new Date(
          a.createdAt
        ).getTime()
    );
}

  const GENDER_TABS = [
    { label: 'All Wigs', value: 'ALL' },
    { label: "Women's Wigs", value: 'WOMEN' },
    { label: "Men's Hair Systems", value: 'MEN' },
  ] as const;

  return (
    <div>
      {/* Page header */}
      <div className="page-hero py-10 text-center">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">All Wigs & Hair Systems</h1>
          <p className="text-white/70">Premium quality wigs for men and women</p>
        </div>
      </div>

      {/* Gender tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="container-custom flex gap-1 py-1 overflow-x-auto scrollbar-hide">
          {GENDER_TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveGender(value)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${activeGender === value ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
            >
              {label}
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
                <span className="font-semibold text-gray-900">{products.length}</span> products
              </p>
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
                {activeFilterCount > 0 && <span className="bg-brand-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>}
              </button>
              <div className="relative">
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="appearance-none border border-gray-200 rounded-xl px-4 py-2 pr-8 text-sm focus:outline-none bg-white cursor-pointer">
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>
              <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}><Grid className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}><List className="w-4 h-4" /></button>
              </div>
            </div>

            <div className={`grid gap-4 md:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
              {sortedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>

            {products.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <button onClick={clearFilters} className="btn-primary mt-4">Clear Filters</button>
              </div>
            )}
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
            <button onClick={() => setShowFilters(false)} className="btn-primary w-full mt-4">Apply Filters</button>
          </div>
        </>
      )}
    </div>
  );
}