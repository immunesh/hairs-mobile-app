import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Users, Heart, Sparkles, ArrowRight, Target, Eye, Leaf } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About HairsUp — Our Story & Mission',
  description: "Learn about HairsUp — India's most trusted premium hair wig brand. Our story, mission, and the team dedicated to restoring confidence.",
};

const TIMELINE = [
  { year: '2015', event: 'Founded in Mumbai', desc: "Dr. Anita Sharma and Vikram Patel launch HairsUp from a small studio in Bandra, driven by personal experience with hair loss in the family." },
  { year: '2017', event: 'First 1,000 customers', desc: "Word of mouth spreads the brand across Maharashtra. We open our first experience centre in Andheri West." },
  { year: '2019', event: 'Pan-India Expansion', desc: "HairsUp enters Delhi, Bangalore, Chennai, and Hyderabad. Partnership with 200+ certified hair specialists nationwide." },
  { year: '2021', event: 'Virtual Try-On Launch', desc: "We launch India's first AI-powered virtual wig try-on technology. 5 lakh try-on sessions in the first year." },
  { year: '2023', event: '10 Lakh Customers', desc: "Milestone: 10 lakh satisfied customers. 50+ experience centres. Recognised by Forbes India as a leading healthtech-meets-beauty brand." },
  { year: '2025', event: 'HairsUp 2.0', desc: "Launching next-gen Swiss lace technology, in-home consultation services, and our global expansion to UAE and Singapore." },
];

const TEAM = [
  {
    name: 'Dr. Anita Sharma',
    role: 'Co-Founder & Chief Trichologist',
    bio: 'AIIMS-trained trichologist with 18 years of clinical experience in hair loss treatment. Her personal journey with alopecia inspired HairsUp.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=300&q=80',
  },
  {
    name: 'Vikram Patel',
    role: 'Co-Founder & CEO',
    bio: 'IIM Ahmedabad alumnus and serial entrepreneur. Former VP at Nykaa. Passionate about making premium hair solutions accessible to every Indian.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
  },
  {
    name: 'Priya Mehta',
    role: 'Creative Director',
    bio: '15 years in luxury beauty and fashion. Former stylist for Vogue India. Leads our product design, colour matching, and style innovation.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80',
  },
  {
    name: 'Arjun Nair',
    role: 'Head of Technology',
    bio: 'AI researcher and ex-Google engineer. Built our proprietary virtual try-on engine. Believer in technology as a force for human confidence.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
  },
];

const VALUES = [
  { icon: Heart, title: 'Empathy First', desc: "Every product we create starts with deeply understanding the emotional journey of hair loss. We don't just sell wigs — we restore confidence." },
  { icon: Award, title: 'Uncompromising Quality', desc: "From Swiss lace to 100% human hair, every material is sourced ethically and tested rigorously. We accept nothing less than extraordinary." },
  { icon: Leaf, title: 'Sustainability', desc: "Responsible sourcing, eco-friendly packaging, and carbon-neutral shipping. Beauty shouldn't cost the planet." },
  { icon: Target, title: 'Inclusivity', desc: "Hair loss doesn't discriminate. Neither do we. Our collections serve every gender, age, hair type, and skin tone." },
  { icon: Eye, title: 'Transparency', desc: "No hidden costs, no false promises. We show you 360° product views and virtual try-on so you know exactly what you're getting." },
  { icon: Users, title: 'Community', desc: "10 lakh+ customers and growing. Our support groups, expert consultations, and blog create a community where everyone belongs." },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&q=80"
            alt="HairsUp Story"
            fill className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950/92 via-brand-900/80 to-transparent" />
        </div>
        <div className="relative container-custom max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-6 text-white">
            <Sparkles className="w-4 h-4 text-brand-300" /> Our Story
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
            We Believe<br />
            <span className="text-brand-300">Hair is Identity.</span>
          </h1>
          <p className="text-white/75 text-xl max-w-2xl leading-relaxed">
            HairsUp was born from a personal story of loss and renewal. A trichologist who watched her mother
            struggle with alopecia. An entrepreneur who saw an industry failing millions of Indians.
            Together, they built something extraordinary.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 container-custom">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-brand-50 to-purple-50 rounded-3xl p-8 border border-brand-100">
            <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-brand-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To make premium, natural-looking hair solutions accessible to every Indian — regardless of gender, age,
              or the reason for their hair loss. We believe that confidence is a fundamental human right, not a luxury.
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-brand-50 rounded-3xl p-8 border border-gray-100">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-gray-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To be South Asia&apos;s most trusted hair wellness brand — where technology meets craftsmanship,
              where science meets style, and where every customer walks away feeling like the best version of themselves.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-950 text-white">
        <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '10L+', label: 'Lives Transformed' },
            { value: '50+', label: 'Experience Centres' },
            { value: '280+', label: 'Wig Styles' },
            { value: '4.8★', label: 'Customer Rating' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-4xl font-display font-bold text-brand-400 mb-1">{value}</div>
              <div className="text-gray-400 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-16 container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">What We Stand For</h2>
          <p className="section-subtitle">The principles that guide every decision we make</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 hover:shadow-product-hover transition-shadow">
              <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="font-display font-bold text-gray-900 text-lg mb-2">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="section-title">Our Journey</h2>
            <p className="section-subtitle">From a Mumbai studio to India&apos;s #1 hair brand</p>
          </div>
          <div className="relative">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-brand-200 -translate-x-px" />
            <div className="space-y-8">
              {TIMELINE.map(({ year, event, desc }, i) => (
                <div key={year} className={`relative flex gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-brand-600 rounded-full -translate-x-1/2 top-5 ring-4 ring-brand-100" />
                  <div className={`ml-16 md:ml-0 flex-1 ${i % 2 === 0 ? 'md:text-right md:pr-10' : 'md:pl-10'}`}>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 inline-block text-left w-full">
                      <span className="text-brand-600 font-bold text-sm">{year}</span>
                      <h3 className="font-display font-bold text-gray-900 text-lg mb-1">{event}</h3>
                      <p className="text-gray-600 text-sm">{desc}</p>
                    </div>
                  </div>
                  <div className="hidden md:block flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Meet the Team</h2>
          <p className="section-subtitle">The people behind HairsUp&apos;s mission</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map(({ name, role, bio, image }) => (
            <div key={name} className="card overflow-hidden group">
              <div className="relative h-60 overflow-hidden">
                <Image src={image} alt={name} fill className="object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-white text-xs">{bio}</p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold text-gray-900">{name}</h3>
                <p className="text-xs text-brand-600 font-medium">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-brand-950 to-brand-800 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to Start Your Transformation?</h2>
          <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">Join 10 lakh+ Indians who have rediscovered confidence with HairsUp.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/women" className="bg-white text-brand-700 font-bold px-8 py-3.5 rounded-full hover:bg-brand-50 transition-colors flex items-center gap-2">
              Shop Collection <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="border border-white/40 hover:border-white text-white px-8 py-3.5 rounded-full transition-all hover:bg-white/10">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
