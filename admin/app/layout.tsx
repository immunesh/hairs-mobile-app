import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/ui/CartSidebar';
import Toast from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: {
    default: 'HairsUp — Premium Hair Wigs for Men & Women',
    template: '%s | HairsUp',
  },
  description:
    "India's #1 hair wig brand. Shop premium human hair wigs, synthetic wigs, and hair systems for men and women. Virtual try-on available. Free shipping above ₹999.",
  keywords: [
    'hair wigs', 'human hair wigs', 'synthetic wigs', "men's hair system",
    "women's wigs", 'lace front wigs', 'HairsUp', 'buy wigs online India',
  ],
  authors: [{ name: 'HairsUp' }],
  metadataBase: new URL('http://localhost:3000'),
  creator: 'HairsUp Technologies',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'HairsUp',
    title: 'HairsUp — Premium Hair Wigs for Men & Women',
    description: "India's #1 hair wig brand — premium human hair wigs & systems with virtual try-on.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HairsUp — Premium Hair Wigs',
    description: "India's #1 hair wig brand.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#c855f5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
<body>
  {children}
</body>
    </html>
  );
}
