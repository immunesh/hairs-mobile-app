/**
 * Shapes returned by the HairsUp backend (see backend/prisma/schema.prisma).
 *
 * The API is not consistent about envelopes: auth/cart/wishlist reply with
 * `{ success, data }` while categories/hero-slides reply with a bare array.
 * `unwrap` in ./client.ts normalises both, so the types below describe the
 * payload *after* unwrapping.
 */

export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatar?: string | null;
  role: string;
  createdAt?: string;
};

export type AuthSession = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type RefreshedTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  gender: string | null;
  parentId: string | null;
  _count?: {
    products: number;
  };
};

export type HeroSlide = {
  id: string;
  headline: string;
  subheadline: string | null;
  description: string | null;
  image: string;
  badge: string | null;
  tag: string | null;
  cta: string | null;
  ctaLink: string | null;
  ctaSecondary: string | null;
  ctaSecondaryLink: string | null;
  accent: string | null;
  order: number;
  isActive: boolean;
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  angle?: number;
  isTryOn?: boolean;
};

export type ProductSummary = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  stock: number;
  images: ProductImage[];
};

export type FeaturedProduct = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  stock: number;
  gender: string;
  texture: string | null;
  length: string | null;
  rating: number;
  reviewCount: number;
  isNewArrival: boolean;
  isBestSeller: boolean;
  images: ProductImage[];
  category: {
    name: string;
    gender: string | null;
  } | null;
};

export type Testimonial = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  isVerified: boolean;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    avatar: string | null;
    city: string | null;
  };
  product: {
    name: string;
    slug: string;
  } | null;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string | null;
  author: string;
  publishedAt: string | null;
  createdAt: string;
};

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  variant: string | null;
  product: ProductSummary;
};

export type WishlistItem = {
  id: string;
  productId: string;
  createdAt: string;
  product: ProductSummary;
};

export type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  images: string[];
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
};

export type OrderAddress = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string | null;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  image: string | null;
  quantity: number;
  price: number;
  variant: string | null;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode: string | null;
  notes: string | null;
  estimatedDelivery: string | null;
  deliveredAt: string | null;
  awbNumber: string | null;
  courier: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  createdAt: string;
  address: OrderAddress;
  items: OrderItem[];
};

export type ProductFAQ = {
  id: string;
  question: string;
  answer: string;
};

export type CareGuide = {
  id: string;
  icon: string;
  title: string;
  steps: string;
};

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  gender: string;
  basePrice: number;
  salePrice: number | null;
  stock: number;
  sku: string;
  brand: string;
  material: string | null;
  capSize: string | null;
  length: string | null;
  density: string | null;
  texture: string | null;
  color: string | null;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  images: ProductImage[];
  category: {
    id: string;
    name: string;
    gender: string | null;
  } | null;
  includedItems: { id: string; text: string }[];
  faqs: ProductFAQ[];
  careGuides: CareGuide[];
  features: { id: string; title: string; subtitle: string }[];
  highlights: { id: string; text: string }[];
  reviews: Review[];
};
