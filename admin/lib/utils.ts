import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getDiscountPercent(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(dateStr));
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Order Placed',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
  REFUNDED: 'Refunded',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  RETURNED: 'bg-gray-100 text-gray-700',
  REFUNDED: 'bg-pink-100 text-pink-700',
};

export const DEMO_PRODUCTS = [
  {
    id: '1', name: "Silky Straight Lace Front Wig", slug: "silky-straight-lace-front-wig",
    description: "Premium 100% human hair lace front wig with a natural hairline. Perfect for everyday elegance.",
    shortDesc: "100% human hair, lace front",
    basePrice: 4999, salePrice: 3499, stock: 50, sku: "HU-W-001",
    brand: "HairsUp", material: "100% Human Hair", length: "18 inches", density: "150%",
    texture: "Straight", color: "Natural Black", isActive: true, isFeatured: true,
    isBestSeller: true, isNewArrival: false, rating: 4.8, reviewCount: 284,
    gender: "WOMEN" as const, tags: ["human hair", "lace front", "straight"],
    category: { id: '1', name: "Women's Wigs", slug: "women-wigs" },
    images: [
      { id: '1', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600', isPrimary: true, angle: 0 },
      { id: '2', url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600', isPrimary: false, angle: 90 },
    ],
    createdAt: '2024-01-01',
  },
  {
    id: '2', name: "Bouncy Curl Bob Wig", slug: "bouncy-curl-bob-wig",
    description: "Defined curls, short bob length. Premium heat-resistant synthetic fiber.",
    shortDesc: "Premium synthetic, defined curls",
    basePrice: 2499, salePrice: 1799, stock: 75, sku: "HU-W-002",
    brand: "HairsUp", material: "Heat-resistant Synthetic", length: "12 inches", density: "130%",
    texture: "Curly", color: "Jet Black", isActive: true, isFeatured: true,
    isBestSeller: false, isNewArrival: true, rating: 4.6, reviewCount: 156,
    gender: "WOMEN" as const, tags: ["synthetic", "curly", "bob"],
    category: { id: '1', name: "Women's Wigs", slug: "women-wigs" },
    images: [
      { id: '3', url: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?w=600', isPrimary: true, angle: 0 },
    ],
    createdAt: '2024-01-02',
  },
  {
    id: '3', name: "Men's Natural System Hairpiece", slug: "mens-natural-system-hairpiece",
    description: "Advanced Swiss lace technology for undetectable, seamless integration.",
    shortDesc: "Swiss lace, monofilament base",
    basePrice: 7999, salePrice: 5999, stock: 35, sku: "HU-M-001",
    brand: "HairsUp", material: "100% Human Hair", capSize: "Medium", density: "90%",
    texture: "Straight", color: "Natural Black", isActive: true, isFeatured: true,
    isBestSeller: true, isNewArrival: false, rating: 4.9, reviewCount: 432,
    gender: "MEN" as const, tags: ["hairpiece", "lace", "natural"],
    category: { id: '2', name: "Men's Wigs", slug: "men-wigs" },
    images: [
      { id: '5', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600', isPrimary: true, angle: 0 },
    ],
    createdAt: '2024-01-03',
  },
  {
    id: '4', name: "Goddess Waves Body Wave Wig", slug: "goddess-waves-body-wave-wig",
    description: "Virgin human hair with 13x4 lace frontal. Luxurious waves for a romantic look.",
    shortDesc: "Virgin human hair, 13x4 lace",
    basePrice: 6999, salePrice: 5499, stock: 30, sku: "HU-W-003",
    brand: "HairsUp", material: "Virgin Human Hair", length: "22 inches", density: "180%",
    texture: "Body Wave", color: "Natural Black", isActive: true, isFeatured: true,
    isBestSeller: true, isNewArrival: false, rating: 4.7, reviewCount: 318,
    gender: "WOMEN" as const, tags: ["human hair", "body wave", "lace front"],
    category: { id: '1', name: "Women's Wigs", slug: "women-wigs" },
    images: [
      { id: '7', url: 'https://images.unsplash.com/photo-1519699047748-de8e44489ece?w=600', isPrimary: true, angle: 0 },
    ],
    createdAt: '2024-01-04',
  },
  {
    id: '5', name: "Men's Toupee Crown Cover", slug: "mens-toupee-crown-cover",
    description: "Fine skin base for crown coverage. Invisible integration with side hair.",
    shortDesc: "Crown coverage, skin base",
    basePrice: 4999, salePrice: 3799, stock: 55, sku: "HU-M-002",
    brand: "HairsUp", material: "Human Hair", capSize: "Standard", density: "100%",
    texture: "Straight", color: "Natural Black", isActive: true, isFeatured: true,
    isBestSeller: false, isNewArrival: true, rating: 4.5, reviewCount: 203,
    gender: "MEN" as const, tags: ["toupee", "crown", "coverage"],
    category: { id: '2', name: "Men's Wigs", slug: "men-wigs" },
    images: [
      { id: '9', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600', isPrimary: true, angle: 0 },
    ],
    createdAt: '2024-01-05',
  },
  {
    id: '6', name: "Deep Wave Ombre Wig", slug: "deep-wave-ombre-wig",
    description: "Stunning T1B/27 ombre from natural black roots to honey blonde tips.",
    shortDesc: "Ombre, deep wave, head-turning",
    basePrice: 5499, salePrice: 3999, stock: 45, sku: "HU-W-004",
    brand: "HairsUp", material: "Human Hair Blend", length: "20 inches", density: "150%",
    texture: "Deep Wave", color: "Ombre Black to Blonde", isActive: true, isFeatured: false,
    isBestSeller: false, isNewArrival: true, rating: 4.6, reviewCount: 127,
    gender: "WOMEN" as const, tags: ["ombre", "deep wave", "blonde"],
    category: { id: '1', name: "Women's Wigs", slug: "women-wigs" },
    images: [
      { id: '11', url: 'https://images.unsplash.com/photo-1571512599285-9494e11d9e72?w=600', isPrimary: true, angle: 0 },
    ],
    createdAt: '2024-01-06',
  },
  {
    id: '7', name: "Men's Full Cap Hair System", slug: "mens-full-cap-hair-system",
    description: "Complete scalp coverage with breathable monofilament cap and hand-tied hair.",
    shortDesc: "Full coverage, hand-tied",
    basePrice: 9999, salePrice: 7999, stock: 20, sku: "HU-M-005",
    brand: "HairsUp", material: "100% Human Hair", capSize: "Customizable", density: "110%",
    texture: "Straight", color: "Natural Black", isActive: true, isFeatured: true,
    isBestSeller: true, isNewArrival: false, rating: 4.9, reviewCount: 521,
    gender: "MEN" as const, tags: ["full cap", "complete coverage"],
    category: { id: '2', name: "Men's Wigs", slug: "men-wigs" },
    images: [
      { id: '13', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600', isPrimary: true, angle: 0 },
    ],
    createdAt: '2024-01-07',
  },
  {
    id: '8', name: "Voluminous Afro Kinky Wig", slug: "voluminous-afro-kinky-wig",
    description: "Full, luscious afro celebrating natural beauty. Authentic 4C kinky texture.",
    shortDesc: "4C kinky, full afro, natural",
    basePrice: 3999, salePrice: 2799, stock: 40, sku: "HU-W-006",
    brand: "HairsUp", material: "Kinky Synthetic Fiber", length: "14 inches", density: "200%",
    texture: "Kinky Afro", color: "Natural Black", isActive: true, isFeatured: false,
    isBestSeller: false, isNewArrival: true, rating: 4.7, reviewCount: 94,
    gender: "WOMEN" as const, tags: ["afro", "kinky", "4c", "natural"],
    category: { id: '1', name: "Women's Wigs", slug: "women-wigs" },
    images: [
      { id: '15', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600', isPrimary: true, angle: 0 },
    ],
    createdAt: '2024-01-08',
  },
];
