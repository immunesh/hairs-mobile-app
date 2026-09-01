'use client';

import { useState } from 'react';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterGroup {
  label: string;
  key: string;
  options: FilterOption[];
  type?: 'checkbox' | 'radio' | 'range';
}

interface FilterSidebarProps {
  filters: Record<string, string | string[] | number | boolean | undefined>;
  onChange: (key: string, value: string | string[] | undefined) => void;
  onClear: () => void;
}

const FILTER_GROUPS: FilterGroup[] = [
  {
    label: 'Price Range',
    key: 'price',
    type: 'radio',
    options: [
      { label: 'Under ₹2,000', value: '0-2000' },
      { label: '₹2,000 - ₹4,000', value: '2000-4000' },
      { label: '₹4,000 - ₹7,000', value: '4000-7000' },
      { label: 'Above ₹7,000', value: '7000-100000' },
    ],
  },
  {
    label: 'Hair Type',
    key: 'texture',
    type: 'checkbox',
    options: [
      { label: 'Straight', value: 'straight' },
      { label: 'Curly', value: 'curly' },
      { label: 'Body Wave', value: 'body-wave' },
      { label: 'Deep Wave', value: 'deep-wave' },
      { label: 'Kinky Afro', value: 'afro' },
      { label: 'Wavy', value: 'wavy' },
    ],
  },
  {
    label: 'Material',
    key: 'material',
    type: 'radio',
    options: [
      { label: 'Human Hair', value: 'human-hair' },
      { label: 'Synthetic', value: 'synthetic' },
      { label: 'Human Hair Blend', value: 'blend' },
    ],
  },
  {
    label: 'Length',
    key: 'length',
    type: 'radio',
    options: [
      { label: 'Short (under 12")', value: 'short' },
      { label: 'Medium (12-18")', value: 'medium' },
      { label: 'Long (18-24")', value: 'long' },
      { label: 'Extra Long (24"+)', value: 'extra-long' },
    ],
  },
  {
    label: 'Cap Type',
    key: 'capType',
    type: 'checkbox',
    options: [
      { label: 'Lace Front', value: 'lace-front' },
      { label: 'Full Lace', value: 'full-lace' },
      { label: 'Monofilament', value: 'monofilament' },
      { label: 'Basic Cap', value: 'basic' },
    ],
  },
  {
    label: 'Collection',
    key: 'collection',
    type: 'checkbox',
    options: [
      { label: 'New Arrivals', value: 'new' },
      { label: 'Best Sellers', value: 'best' },
      { label: 'Featured', value: 'featured' },
      { label: 'Sale Items', value: 'sale' },
    ],
  },
];

function FilterSection({ group, filters, onChange }: {
  group: FilterGroup;
  filters: Record<string, string | string[] | number | boolean | undefined>;
  onChange: (key: string, value: string | string[] | undefined) => void;
}) {
  const [open, setOpen] = useState(true);
  const currentValues = filters[group.key];
  const selectedArr = Array.isArray(currentValues)
    ? currentValues
    : currentValues ? [String(currentValues)] : [];

  const handleChange = (value: string) => {
    if (group.type === 'radio') {
      onChange(group.key, selectedArr[0] === value ? undefined : value);
    } else {
      const next = selectedArr.includes(value)
        ? selectedArr.filter((v) => v !== value)
        : [...selectedArr, value];
      onChange(group.key, next.length ? next : undefined);
    }
  };

  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <span className="font-semibold text-gray-900 text-sm">{group.label}</span>
        <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="space-y-2">
          {group.options.map((opt) => {
            const checked = selectedArr.includes(opt.value);
            return (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                <div className={cn(
                  'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                  group.type === 'radio' ? 'rounded-full' : 'rounded',
                  checked ? 'bg-brand-600 border-brand-600' : 'border-gray-300 group-hover:border-brand-400'
                )}>
                  {checked && <div className={cn('bg-white', group.type === 'radio' ? 'w-1.5 h-1.5 rounded-full' : 'w-2 h-1.5')} />}
                  <input
                    type={group.type === 'radio' ? 'radio' : 'checkbox'}
                    checked={checked}
                    onChange={() => handleChange(opt.value)}
                    className="sr-only"
                  />
                </div>
                <span className={cn(
                  'text-sm transition-colors',
                  checked ? 'text-brand-600 font-medium' : 'text-gray-600 group-hover:text-gray-900'
                )}>
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FilterSidebar({ filters, onChange, onClear }: FilterSidebarProps) {
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-24">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brand-600" />
          <h3 className="font-bold text-gray-900">Filters</h3>
          {activeCount > 0 && (
            <span className="w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-brand-600 hover:underline font-medium"
          >
            <X className="w-3 h-3" /> Clear All
          </button>
        )}
      </div>

      {FILTER_GROUPS.map((group) => (
        <FilterSection key={group.key} group={group} filters={filters} onChange={onChange} />
      ))}
    </div>
  );
}
