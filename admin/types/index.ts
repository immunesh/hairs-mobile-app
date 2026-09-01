export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'STAFF';
  createdAt: string;
}

export interface Address {
  id: string;
  type: 'HOME' | 'OFFICE' | 'OTHER';
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  gender?: 'MEN' | 'WOMEN' | 'UNISEX';
  children?: Category[];
  _count?: { products: number };
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  angle: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price?: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc?: string;
  category: Category;
  gender: 'MEN' | 'WOMEN' | 'UNISEX';
  basePrice: number;
  salePrice?: number;
  stock: number;
  sku: string;
  brand: string;
  material?: string;
  capSize?: string;
  length?: string;
  density?: string;
  texture?: string;
  color?: string;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  images: ProductImage[];
  variants?: ProductVariant[];
  reviews?: Review[];
  createdAt: string;
  includedItems?: {
  id: string;
  text: string;
}[];
  faqs?: {
    id: string;
    question: string;
    answer: string;
  }[];
  careGuides?: CareGuide[];
  features?: {
  id: string;
  title: string;
  subtitle: string;
}[];
highlights?: {
  id: string;
  text: string;
}[];
}
export interface CareGuide {
  id: string;
  icon: string;
  title: string;
  steps: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  variant?: Record<string, string>;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  title?: string;
  body: string;
  images: string[];
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  variant?: Record<string, string>;
}

export interface OrderTracking {
  id: string;
  status: string;
  message: string;
  location?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod?: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  awbNumber?: string;
  courier?: string;
  trackingUrl?: string;
  shippedAt?: string;
  shipmentNotes?: string;
  items: OrderItem[];
  address: Address;
  tracking: OrderTracking[];
  createdAt: string;
}

export interface ShipmentPayload {
  courier: string;
  awbNumber: string;
  trackingUrl?: string;
  estimatedDelivery: string;
  notes?: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  author: string;
  tags: string[];
  publishedAt?: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email?: string;
  hours: Record<string, string>;
  lat?: number;
  lng?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Notification {
  id: string;
  orderId?: string;
  title: string;
  message: string;
  status?: OrderStatus;
  isRead: boolean;
  createdAt: string;
}

export interface ProductFilters {
  gender?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: string;
  search?: string;
  tags?: string;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
}
