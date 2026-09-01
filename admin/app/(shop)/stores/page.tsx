import type { Metadata } from 'next';
type Store = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email?: string | null;
  hours: string;
  lat?: number | null;
  lng?: number | null;
  isActive: boolean;
};
import StoresClient from "./StoresClient";
import { getAllStores } from "@/lib/store-api";
import { MapPin, Phone, Mail, Clock, Navigation } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Find a HairsUp Store Near You',
  description: '50+ HairsUp experience centres across India. Book a free in-store consultation with our certified hair specialists.',
};

 
 
export default async function StoresPage() {
 const stores: Store[] = await getAllStores();
  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-14 text-center">
        <div className="container-custom max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Find a HairsUp Store
          </h1>
          <p className="text-white/75 text-lg mb-6">
            Visit any of our 50+ experience centres for a personalised wig consultation — completely free.
          </p>
          <div className="flex items-center justify-center gap-6 text-white/60 text-sm">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> 50+ Cities</span>
            <span>·</span>
            <span>Free Consultations</span>
            <span>·</span>
            <span>Expert Specialists</span>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* City filter */}
       <StoresClient stores={stores} />

        {/* Flagship stores */}
       

        {/* Other stores */}
         
        {/* Consultation CTA */}
        <div className="mt-12 bg-brand-50 rounded-3xl p-10 text-center border border-brand-100">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">Book a Free In-Store Consultation</h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Our certified trichologists will assess your hair type, recommend the best wig or hair system,
            and help you with a professional fitting — all completely free.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="tel:+911800hairsup" className="btn-primary flex items-center gap-2">
              <Phone className="w-4 h-4" /> Call to Book
            </a>
            <a href="mailto:hello@hairsup.com" className="btn-secondary flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
