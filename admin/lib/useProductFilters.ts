'use client';

import { useState, useEffect, useMemo } from 'react';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';

/* ─── types ─── */
export type GenderFilter = 'WOMEN' | 'MEN' | undefined; // undefined = all
export type Filters = Record<string, string | string[] | number | boolean | undefined>;

export interface UseProductFiltersOptions {
  /** Lock to one gender (Women / Men pages) or leave undefined for "Shop All" */
  gender?: GenderFilter;
}

export interface UseProductFiltersReturn {
  products: Product[];
  sortedProducts: Product[];
  filters: Filters;
  sort: string;
  activeSubcat: string;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  setSort: React.Dispatch<React.SetStateAction<string>>;
  setActiveSubcat: React.Dispatch<React.SetStateAction<string>>;
  handleFilterChange: (key: string, value: string | string[] | undefined) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

/* ─── shared filter helpers ─── */
function applyGenderFilter(list: Product[], gender: GenderFilter): Product[] {
  if (!gender) return list;
  return list.filter(
    (p) => String(p.gender || '').trim().toUpperCase() === gender
  );
}

function applySubcatFilter(list: Product[], subcat: string): Product[] {
  if (!subcat) return list;

  switch (subcat) {
    case 'human-hair':
      return list.filter((p) =>
        String(p.material || '').toLowerCase().includes('human')
      );
    case 'synthetic':
      return list.filter((p) =>
        String(p.material || '').toLowerCase().includes('synthetic')
      );
    case 'lace-front':
      return list.filter(
        (p) =>
          String(p.name || '').toLowerCase().includes('lace') ||
          String(p.description || '').toLowerCase().includes('lace')
      );
    case 'curly':
      return list.filter((p) =>
        String(p.texture || '').toLowerCase().includes('curly')
      );
    case 'straight':
      return list.filter((p) =>
        String(p.texture || '').toLowerCase().includes('straight')
      );
    case 'hair-system':
      return list.filter(
        (p) =>
          String(p.name || '').toLowerCase().includes('system') ||
          String(p.description || '').toLowerCase().includes('system')
      );
    case 'toupee':
      return list.filter((p) =>
        String(p.name || '').toLowerCase().includes('toupee')
      );
    case 'full-cap':
      return list.filter((p) =>
        String(p.name || '').toLowerCase().includes('full')
      );
    case 'crown':
      return list.filter((p) =>
        String(p.name || '').toLowerCase().includes('crown')
      );
    default:
      return list;
  }
}

function applyFilters(list: Product[], filters: Filters): Product[] {
  let result = [...list];

  // Material
  if (filters.material) {
    const materialMap: Record<string, string> = {
      'human-hair': 'human hair',
      synthetic: 'synthetic',
      blend: 'blend',
    };
    const target = materialMap[String(filters.material)];
    if (target) {
      result = result.filter((p) =>
        String(p.material || '').toLowerCase().includes(target)
      );
    }
  }

  // Texture
  if (filters.texture) {
    const selected = Array.isArray(filters.texture)
      ? filters.texture
      : [filters.texture];
    result = result.filter((p) =>
      selected.some((t) =>
        String(p.texture || '')
          .toLowerCase()
          .includes(String(t).replace('-', ' ').toLowerCase())
      )
    );
  }

  // Length
  if (filters.length) {
    result = result.filter((p) => {
      const inches = parseInt(String(p.length || '').replace(/\D/g, ''));
      if (isNaN(inches)) return false;
      switch (filters.length) {
        case 'short':
          return inches < 12;
        case 'medium':
          return inches >= 12 && inches <= 18;
        case 'long':
          return inches > 18 && inches <= 24;
        case 'extra-long':
          return inches > 24;
        default:
          return true;
      }
    });
  }

  // Price
  if (filters.price) {
    const [min, max] = String(filters.price).split('-').map(Number);
    result = result.filter((p) => {
      const price = p.salePrice || p.basePrice;
      return price >= min && price <= max;
    });
  }

  // Collection (featured / best / new / sale)
  if (filters.collection) {
    const selected = Array.isArray(filters.collection)
      ? filters.collection
      : [filters.collection];
    result = result.filter((p) => {
      if (selected.includes('featured') && p.isFeatured) return true;
      if (selected.includes('best') && p.isBestSeller) return true;
      if (selected.includes('new') && p.isNewArrival) return true;
      if (selected.includes('sale') && p.salePrice) return true;
      return false;
    });
  }

  // Color
  if (filters.color) {
    result = result.filter((p) =>
      String(p.color || '')
        .toLowerCase()
        .includes(String(filters.color).toLowerCase())
    );
  }

  // Gender (runtime filter for Shop All page)
  if (filters.gender) {
    const g = String(filters.gender).toUpperCase();
    if (g === 'WOMEN' || g === 'MEN') {
      result = result.filter(
        (p) => String(p.gender || '').trim().toUpperCase() === g
      );
    }
  }

  return result;
}

function applySorting(list: Product[], sort: string): Product[] {
  const sorted = [...list];
  switch (sort) {
    case 'price-asc':
      sorted.sort(
        (a, b) => (a.salePrice || a.basePrice) - (b.salePrice || b.basePrice)
      );
      break;
    case 'price-desc':
      sorted.sort(
        (a, b) => (b.salePrice || b.basePrice) - (a.salePrice || a.basePrice)
      );
      break;
    case 'rating-desc':
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case 'reviews-desc':
      sorted.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case 'createdAt-desc':
    default:
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
  }
  return sorted;
}

/* ─── hook ─── */
export function useProductFilters(
  options: UseProductFiltersOptions = {}
): UseProductFiltersReturn {
  const { gender: genderLock } = options;

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [sort, setSort] = useState('createdAt-desc');
  const [activeSubcat, setActiveSubcat] = useState('');

  // Fetch once, apply hard gender lock (for Women / Men pages)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await productsApi.getAll();
        let list = (res.data.data || []) as Product[];
        list = applyGenderFilter(list, genderLock);
        if (mounted) setAllProducts(list);
      } catch {
        if (mounted) setAllProducts([]);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [genderLock]);

  // Derived filtered + sorted products
  const products = useMemo(() => {
    let list = applySubcatFilter(allProducts, activeSubcat);
    list = applyFilters(list, filters);
    return list;
  }, [allProducts, activeSubcat, filters]);

  const sortedProducts = useMemo(
    () => applySorting(products, sort),
    [products, sort]
  );

  const handleFilterChange = (
    key: string,
    value: string | string[] | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setActiveSubcat('');
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return {
    products,
    sortedProducts,
    filters,
    sort,
    activeSubcat,
    setFilters,
    setSort,
    setActiveSubcat,
    handleFilterChange,
    clearFilters,
    activeFilterCount,
  };
}
