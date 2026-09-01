import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, CartItem, WishlistItem, Product, Notification } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
    }),
    {
      name: 'hairsup-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string;
  discount: number;
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateItem: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  setCoupon: (code: string, discount: number) => void;
  clearCoupon: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  isOpen: false,
  couponCode: '',
  discount: 0,
  setItems: (items) => set({ items, couponCode: '', discount: 0 }),
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
          couponCode: '',
          discount: 0,
        };
      }
      return { items: [...state.items, item], couponCode: '', discount: 0 };
    }),
  updateItem: (id, quantity) =>
    set((state) => ({
      items: quantity <= 0
        ? state.items.filter((i) => i.id !== id)
        : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
      couponCode: '',
      discount: 0,
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
      couponCode: '',
      discount: 0,
    })),
  clearCart: () => set({ items: [], couponCode: '', discount: 0 }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  closeCart: () => set({ isOpen: false }),
  setCoupon: (couponCode, discount) => set({ couponCode, discount }),
  clearCoupon: () => set({ couponCode: '', discount: 0 }),
  total: () => {
    return get().items.reduce((sum, item) => {
      const price =
        Number(item.product?.salePrice) ||
        Number(item.product?.basePrice) ||
        0;

      return sum + price * item.quantity;
    }, 0);
  },
  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));

interface WishlistState {
  items: WishlistItem[];
  setItems: (items: WishlistItem[]) => void;
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
  isWishlisted: (productId) => get().items.some((i) => i.productId === productId),
}));

interface UIState {
  searchQuery: string;
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  setSearchQuery: (q: string) => void;
  toggleSearch: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  searchQuery: '',
  isSearchOpen: false,
  isMobileMenuOpen: false,
  toast: null,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  showToast: (message, type = 'success') => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
}));

interface NotificationState {
  items: Notification[];
  unreadCount: number;
  isOpen: boolean;
  setItems: (items: Notification[]) => void;
  setUnreadCount: (count: number) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  toggle: () => void;
  close: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  items: [],
  unreadCount: 0,
  isOpen: false,
  setItems: (items) => set({ items }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  markRead: (id) =>
    set((state) => ({
      items: state.items.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unreadCount: state.items.find((n) => n.id === id && !n.isRead)
        ? Math.max(0, state.unreadCount - 1)
        : state.unreadCount,
    })),
  markAllRead: () =>
    set((state) => ({ items: state.items.map((n) => ({ ...n, isRead: true })), unreadCount: 0 })),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
}));

interface CompareState {
  items: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
}

export const useCompareStore = create<CompareState>()((set, get) => ({
  items: [],
  addToCompare: (product) =>
    set((state) => {
      if (state.items.length >= 3) return state;
      if (state.items.find((i) => i.id === product.id)) return state;
      return { items: [...state.items, product] };
    }),
  removeFromCompare: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== productId) })),
  clearCompare: () => set({ items: [] }),
  isInCompare: (productId) => get().items.some((i) => i.id === productId),
}));
