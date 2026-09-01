'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { DEMO_PRODUCTS } from '@/lib/utils';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';

const SUGGESTIONS = ['Lace Front', 'Human Hair', "Men's System", 'Curly Wig', 'Ombre', 'Body Wave', 'Synthetic', 'Short Bob', 'Afro', 'Straight'];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [localQuery, setLocalQuery] = useState(query);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalQuery(query);
    if (!query) { setResults([]); return; }
    let mounted = true;
    setLoading(true);
    const load = async () => {
      try {
        const res = await productsApi.getAll();
        const list = (res.data.data || []) as Product[];
        const q = query.toLowerCase();
        const matched = list.filter((p) =>
          String(p.name || '').toLowerCase().includes(q) ||
          String(p.description || '').toLowerCase().includes(q) ||
          String(p.texture || '').toLowerCase().includes(q) ||
          String(p.material || '').toLowerCase().includes(q) ||
          (p.tags || []).some((t: string) => t.toLowerCase().includes(q))
        ) as unknown as Product[];
        if (mounted) setResults(matched);
      } catch (e) {
        // fallback to demo search
        const q = query.toLowerCase();
        const matched = DEMO_PRODUCTS.filter((p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.texture?.toLowerCase().includes(q) ||
          p.material?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        ) as unknown as Product[];
        if (mounted) setResults(matched);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    const t = setTimeout(load, 200);
    return () => { mounted = false; clearTimeout(t); };
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) router.push(`/search?q=${encodeURIComponent(localQuery.trim())}`);
  };

  return (
    <div className="container-custom py-10">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search for wigs, hair systems, styles..."
            className="w-full pl-14 pr-14 py-4 border-2 border-gray-200 focus:border-brand-500 rounded-full text-base outline-none transition-colors bg-gray-50 focus:bg-white"
          />
          {localQuery && (
            <button type="button" onClick={() => setLocalQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
        {/* Suggestions */}
        <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
          <span className="text-xs text-gray-500">Try:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setLocalQuery(s); router.push(`/search?q=${encodeURIComponent(s)}`); }}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${query === s ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </form>

      {!query && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Search HairsUp</h2>
          <p className="text-gray-500">Find the perfect wig or hair system for you</p>
        </div>
      )}

      {query && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-500 text-sm">
                {loading ? 'Searching…' : `${results.length} results for`}
              </p>
              {!loading && query && <h2 className="text-xl font-bold text-gray-900">&ldquo;{query}&rdquo;</h2>}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-product rounded-2xl mb-3" />
                  <div className="bg-gray-200 h-4 rounded mb-2" />
                  <div className="bg-gray-200 h-4 w-2/3 rounded" />
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 mb-6">Try different keywords or explore our categories.</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={() => { setLocalQuery('Human Hair'); router.push('/search?q=Human+Hair'); }} className="btn-primary text-sm py-2 px-5">Human Hair Wigs</button>
                <button onClick={() => { setLocalQuery("Men's"); router.push('/search?q=Men'); }} className="btn-secondary text-sm py-2 px-5">Men&apos;s Hair Systems</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {results.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
