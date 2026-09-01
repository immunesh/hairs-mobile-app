'use client';

import Link from 'next/link';
import { Sparkles, Instagram, Facebook, Youtube, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const FOOTER_LINKS = {
  'Hair Collections': [
    { label: "Women's Wigs", href: '/women' },
    { label: "Men's Hair Systems", href: '/men' },
    { label: 'Human Hair Wigs', href: '/women?material=human-hair' },
    { label: 'Synthetic Wigs', href: '/women?material=synthetic' },
    { label: 'Lace Front Wigs', href: '/women?texture=lace-front' },
    { label: 'Best Sellers', href: '/women?bestSeller=true' },
    { label: 'New Arrivals', href: '/women?newArrival=true' },
  ],
  'Customer Care': [
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Track Your Order', href: '/orders' },
    { label: 'Returns & Exchanges', href: '/faq#returns' },
    { label: 'Shipping Policy', href: '/faq#shipping' },
    { label: 'Wig Care Guide', href: '/blog/how-to-maintain-human-hair-wig' },
    { label: 'Virtual Try-On', href: '/try-on' },
  ],
  'Company': [
    { label: 'About HairsUp', href: '/about' },
    { label: 'Our Stores', href: '/stores' },
    { label: 'Blog & Tips', href: '/blog' },
    { label: 'Careers', href: '/about#careers' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Affiliate Program', href: '/affiliate' },
  ],
};

const SOCIAL_LINKS = [
  { Icon: Instagram, href: '#', label: 'Instagram' },
  { Icon: Facebook, href: '#', label: 'Facebook' },
  { Icon: Youtube, href: '#', label: 'YouTube' },
  { Icon: Twitter, href: '#', label: 'Twitter' },
];

const FEATURES = [
  { icon: '🚚', title: 'Free Shipping', desc: 'On orders above ₹999' },
  { icon: '↩️', title: 'Easy Returns', desc: '7-day hassle-free returns' },
  { icon: '🔒', title: 'Secure Payment', desc: '100% encrypted & safe' },
  { icon: '💬', title: '24/7 Support', desc: 'Expert help anytime' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* Feature strip */}
      <div className="border-b border-gray-800">
        <div className="container-custom py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="font-semibold text-white text-sm">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="container-custom py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-display font-bold text-white">HairsUp</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              India&apos;s most trusted hair wig brand. We craft premium wigs and hair systems
              that restore confidence and transform lives — for men and women alike.
            </p>
            <div className="space-y-2 text-sm">
              <a href="tel:+911800hairsup" className="flex items-center gap-2 hover:text-brand-400 transition-colors">
                <Phone className="w-4 h-4 text-brand-500" /> +91 1800-HAIRSUP (Free)
              </a>
              <a href="mailto:hello@hairsup.com" className="flex items-center gap-2 hover:text-brand-400 transition-colors">
                <Mail className="w-4 h-4 text-brand-500" /> hello@hairsup.com
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">HairsUp HQ, Bandra Kurla Complex, Mumbai 400051</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-gray-800 hover:bg-brand-600 rounded-full flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-white mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-gray-400 hover:text-brand-400 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-semibold text-white">Get Style Inspiration + Exclusive Offers</h4>
              <p className="text-sm text-gray-500 mt-1">Join 2 lakh+ subscribers. Unsubscribe anytime.</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-72 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-full text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
              />
              <button type="submit" className="btn-primary py-2.5 px-6 whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} HairsUp Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-2">
            {['Visa', 'Mastercard', 'UPI', 'Razorpay', 'EMI'].map((pay) => (
              <span key={pay} className="bg-gray-800 px-2 py-1 rounded text-gray-400">{pay}</span>
            ))}
          </div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <Link href="/sitemap" className="hover:text-gray-300 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
