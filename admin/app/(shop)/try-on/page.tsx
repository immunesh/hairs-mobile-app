import type { Metadata } from 'next';
import VirtualTryOn from '@/components/features/VirtualTryOn';
import { Zap, Camera, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import { API_URL } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Virtual Try-On — See How Any Wig Looks on You',
  description: 'Use HairsUp AI-powered virtual try-on to see how any wig looks on your face in real time — completely free. No download needed.',
};

const HOW_IT_WORKS = [
  { step: '01', icon: Camera, title: 'Enable Camera', desc: 'Allow camera access for real-time try-on, or upload a selfie from your gallery.' },
  { step: '02', icon: Sparkles, title: 'Pick a Style', desc: 'Browse through our wig styles and colours on the right panel.' },
  { step: '03', icon: Zap, title: 'See It Instantly', desc: 'Watch as the selected wig is overlaid on your face in real time with AI precision.' },
  { step: '04', icon: Star, title: 'Capture & Share', desc: 'Capture your look, download it, or add directly to your cart.' },
];


export default async function TryOnPage({
  searchParams,
}: {
  searchParams: Promise<{ wig?: string }>;
}) {
  const { wig } = await searchParams;

  let selectedProduct = null;

  if (wig) {
    const res = await fetch(
      `${API_URL}/products/${wig}`,
      {
        cache: "no-store",
      }
    );

    const data = await res.json();

    selectedProduct = data.data;
  }

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-12 text-center">
        <div className="container-custom max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-4 text-white">
            <Zap className="w-4 h-4 text-yellow-300" /> AI-Powered Virtual Try-On
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            See It On You Before You Buy
          </h1>
          <p className="text-white/75 text-lg max-w-xl mx-auto mb-6">
            Try on any HairsUp wig in real time using your camera. Our AI technology places the wig
            on your head instantly — no app download required.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-white/60">
            <span className="flex items-center gap-1.5"><Camera className="w-4 h-4" /> Camera or upload</span>
            <span>·</span>
            <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Multiple styles</span>
            <span>·</span>
            <span>100% free</span>
          </div>
        </div>
      </div>

      {/* Main try-on tool */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
      <VirtualTryOn selectedProductId={wig} selectedProduct={selectedProduct} />
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 container-custom">
        <h2 className="section-title text-center mb-3">How It Works</h2>
        <p className="section-subtitle text-center mb-12">Get your perfect look in 4 simple steps</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center">
                  <Icon className="w-7 h-7 text-brand-600" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-brand-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {step.slice(1)}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-brand-50 border-t border-brand-100">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">Found Your Perfect Match?</h2>
          <p className="text-gray-500 mb-6">Shop the style you just tried on and have it delivered to your door.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/women" className="btn-primary">Shop Women&apos;s Wigs</Link>
            <Link href="/men" className="btn-secondary">Shop Men&apos;s Hair Systems</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
