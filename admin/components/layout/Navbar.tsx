'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, ShoppingBag, Heart, User, Menu, X, ChevronDown,
  Phone, MapPin, Sparkles, LogOut, Package, Home,
} from 'lucide-react';
import { useAuthStore, useCartStore, useWishlistStore, useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import NotificationBell from '@/components/ui/NotificationBell';

const NAV_LINKS = [
  {
    label: 'Women',
    href: '/women',
    mega: [
      { label: 'Human Hair Wigs', href: '/women?material=human-hair' },
      { label: 'Synthetic Wigs', href: '/women?material=synthetic' },
      { label: 'Lace Front Wigs', href: '/women?texture=lace-front' },
      { label: 'Body Wave', href: '/women?texture=body-wave' },
      { label: 'Straight Wigs', href: '/women?texture=straight' },
      { label: 'Curly Wigs', href: '/women?texture=curly' },
      { label: 'Ombre Wigs', href: '/women?color=ombre' },
      { label: 'Afro Wigs', href: '/women?texture=afro' },
      { label: 'New Arrivals', href: '/women?newArrival=true' },
      { label: 'Best Sellers', href: '/women?bestSeller=true' },
    ],
  },
  {
    label: 'Men',
    href: '/men',
    mega: [
      { label: 'Hair Systems', href: '/men?category=hair-system' },
      { label: 'Toupees', href: '/men?category=toupee' },
      { label: 'Full Cap Wigs', href: '/men?category=full-cap' },
      { label: 'Crown Cover', href: '/men?category=crown' },
      { label: 'Sports Active', href: '/men?category=sports' },
      { label: 'Salt & Pepper', href: '/men?color=salt-pepper' },
      { label: 'Human Hair', href: '/men?material=human-hair' },
      { label: 'Synthetic', href: '/men?material=synthetic' },
      { label: 'New Arrivals', href: '/men?newArrival=true' },
      { label: 'Best Sellers', href: '/men?bestSeller=true' },
    ],
  },
  { label: 'Virtual Try-On', href: '/try-on' },
  { label: 'Blog', href: '/blog' },
  { label: 'Shop', href: '/shop' },
  { label: 'Stores', href: '/stores' },
];

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const cartStore = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { isSearchOpen, toggleSearch, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen) searchRef.current?.focus();
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      toggleSearch();
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    clearAuth();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUserMenuOpen(false);
    router.push('/');
  };

  const itemCount = cartStore.itemCount();

  return (
    <>
      {/* Top bar */}
      <div className="bg-brand-950 text-white text-xs py-2 hidden md:block">
        <div className="container-custom flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3" /> +91 1800-HairsUp (Free)
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> 50+ Stores across India
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-brand-300">Free shipping above ₹999</span>
            <Link href="/stores" className="hover:text-brand-300 transition-colors">Find a Store</Link>
            <Link href="/blog" className="hover:text-brand-300 transition-colors">Hair Care Tips</Link>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <header className={cn(
        'sticky top-0 z-50 bg-white transition-shadow duration-300',
        scrolled ? 'shadow-lg' : 'shadow-sm border-b border-gray-100'
      )}>
        <div className="container-custom">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2" onClick={closeMobileMenu}>
              <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-800 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-display font-bold text-gradient">HairsUp</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 ml-6 flex-1">
              {NAV_LINKS.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.mega && setActiveMenu(link.label)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      'nav-link flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium',
                      activeMenu === link.label && 'text-brand-600 bg-brand-50'
                    )}
                  >
                    {link.label}
                    {link.mega && <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', activeMenu === link.label && 'rotate-180')} />}
                  </Link>

                  {/* Mega Menu */}
                  {link.mega && activeMenu === link.label && (
                    <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 animate-fade-in">
                      <div className="grid grid-cols-2 gap-1">
                        {link.mega.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="text-sm text-gray-600 hover:text-brand-600 hover:bg-brand-50 px-3 py-2 rounded-lg transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <Link
                          href={link.href}
                          className="text-sm font-semibold text-brand-600 hover:underline"
                        >
                          View All {link.label} →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Search */}
              <button
                onClick={toggleSearch}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-gray-700" />
              </button>

              {/* Wishlist */}
              <Link href="/wishlist" className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative">
                <Heart className="w-5 h-5 text-gray-700" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Notifications */}
              <NotificationBell />

              {/* Cart */}
              <button
                onClick={cartStore.toggleCart}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5 text-gray-700" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* User */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user?.firstName[0]}{user?.lastName[0]}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden sm:block" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 animate-fade-in z-50">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="font-semibold text-sm">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      {[
                        { href: '/profile', icon: User, label: 'My Profile' },
                        { href: '/orders', icon: Package, label: 'My Orders' },
                        { href: '/wishlist', icon: Heart, label: 'Wishlist' },
                      ].map(({ href, icon: Icon, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                        >
                          <Icon className="w-4 h-4" /> {label}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="hidden sm:flex items-center gap-2 btn-primary text-sm py-2 px-4">
                  <User className="w-4 h-4" /> Sign In
                </Link>
              )}

              {/* Mobile menu */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors ml-1"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search overlay */}
        {isSearchOpen && (
          <div className="border-t border-gray-100 bg-white px-4 py-3 animate-fade-in">
            <form onSubmit={handleSearch} className="container-custom">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for wigs, hair systems, styles..."
                  className="w-full pl-12 pr-12 py-3 border-2 border-brand-300 rounded-full focus:outline-none focus:border-brand-500 text-sm"
                />
                <button
                  type="button"
                  onClick={toggleSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2 max-w-2xl mx-auto">
                <span className="text-xs text-gray-500">Popular:</span>
                {['Lace Front', 'Human Hair', "Men's System", 'Curly', 'Ombre'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setSearchQuery(t); router.push(`/search?q=${encodeURIComponent(t)}`); toggleSearch(); }}
                    className="text-xs bg-gray-100 hover:bg-brand-100 hover:text-brand-700 px-3 py-1 rounded-full transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-16 bg-white z-40 overflow-y-auto animate-slide-in-right">
            <div className="p-4">
              {!isAuthenticated ? (
                <div className="flex gap-3 mb-6">
                  <Link href="/login" className="btn-primary flex-1 text-center text-sm py-2.5" onClick={closeMobileMenu}>Sign In</Link>
                  <Link href="/register" className="btn-secondary flex-1 text-center text-sm py-2.5" onClick={closeMobileMenu}>Register</Link>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-brand-50 rounded-2xl mb-6">
                  <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.firstName[0]}{user?.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
              )}

              {NAV_LINKS.map((link) => (
                <div key={link.label} className="mb-2">
                  <Link
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 font-medium text-gray-800"
                  >
                    {link.label}
                  </Link>
                  {link.mega && (
                    <div className="pl-4 grid grid-cols-2 gap-1 mt-1">
                      {link.mega.slice(0, 6).map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={closeMobileMenu}
                          className="text-sm text-gray-600 hover:text-brand-600 px-3 py-2 rounded-lg"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isAuthenticated && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link href="/orders" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                    <Package className="w-5 h-5 text-gray-500" /> My Orders
                  </Link>
                  <Link href="/profile" onClick={closeMobileMenu} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                    <User className="w-5 h-5 text-gray-500" /> Profile
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-xl text-red-600 hover:bg-red-50">
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
