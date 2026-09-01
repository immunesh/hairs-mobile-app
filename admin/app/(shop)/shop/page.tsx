'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Grid, List, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import FilterSidebar from '@/components/ui/FilterSidebar';
import { useProductFilters } from '@/lib/useProductFilters';
import Image from 'next/image';
import Link from 'next/link';

/* ─── constants ─── */
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'createdAt-desc' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Best Rating', value: 'rating-desc' },
  { label: 'Most Popular', value: 'reviews-desc' },
];

const SUBCATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Human Hair', value: 'human-hair' },
  { label: 'Synthetic', value: 'synthetic' },
  { label: 'Lace Front', value: 'lace-front' },
  { label: 'Curly', value: 'curly' },
  { label: 'Straight', value: 'straight' },
];

const GENDER_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Women', value: 'WOMEN' },
  { label: 'Men', value: 'MEN' },
];

/* ─── page ─── */
export default function ShopAllPage() {
  const searchParams = useSearchParams();

  // No gender lock → fetch ALL products
  const {
    sortedProducts,
    products,
    filters,
    sort,
    activeSubcat,
    setSort,
    setActiveSubcat,
    handleFilterChange,
    clearFilters,
    activeFilterCount,
    setFilters,
  } = useProductFilters(); // no gender lock

  // Sync ?gender= query param on mount
  useEffect(() => {
    const genderParam = searchParams.get('gender');
    if (genderParam) {
      const normalised = genderParam.trim().toUpperCase();
      if (normalised === 'WOMEN' || normalised === 'MEN') {
        handleFilterChange('gender', normalised);
      }
    }

    // Also honour other params the Women page supports
    const materialParam = searchParams.get('material');
    if (materialParam) handleFilterChange('material', materialParam);

    const textureParam = searchParams.get('texture');
    if (textureParam) handleFilterChange('texture', textureParam);

    const colorParam = searchParams.get('color');
    if (colorParam) handleFilterChange('color', colorParam);

    const priceParam = searchParams.get('price');
    if (priceParam) handleFilterChange('price', priceParam);

    const collectionParam = searchParams.get('collection');
    if (collectionParam) handleFilterChange('collection', collectionParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── local UI state ─── */
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const currentGender = String(filters.gender || '').toUpperCase();

  return (
    <div>
      {/* Hero banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=80"
          alt="Shop All Wigs & Hair Systems"
          fill
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/85 to-brand-700/60" />
        <div className="relative container-custom h-full flex flex-col justify-center text-white">
          <div className="flex items-center gap-2 text-brand-300 text-sm mb-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span>Shop All</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">Shop All</h1>
          <p className="text-white/75 text-lg max-w-lg">
            Browse our complete collection — wigs, hair systems, and toppers for women &amp; men.
          </p>
          <div className="flex gap-3 mt-4 flex-wrap text-sm">
            <span className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">Human Hair</span>
            <span className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">Synthetic</span>
            <span className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">Lace Front</span>
            <span className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full">All Genders</span>
          </div>
        </div>
      </div>

      {/* Gender + Subcategory pills */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="container-custom py-3 flex items-center gap-4 overflow-x-auto scrollbar-hide">
          {/* Gender pills */}
          <div className="flex items-center gap-2 flex-shrink-0 border-r border-gray-200 pr-4">
            {GENDER_OPTIONS.map((g) => (
              <button
                key={g.value}
                onClick={() => handleFilterChange('gender', g.value || undefined)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 border ${
                  currentGender === g.value || (!currentGender && !g.value)
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-brand-400 hover:text-brand-600'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Subcategory pills */}
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
                Showing <span className="font-semibold text-gray-900">{products.length}</span> products
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
                    {key === 'gender'
                      ? `Gender: ${String(val).charAt(0) + String(val).slice(1).toLowerCase()}`
                      : Array.isArray(val) ? val.join(', ') : String(val)
                    }
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

