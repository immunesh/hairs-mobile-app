'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, Loader2, CheckCircle } from 'lucide-react';

const CONTACT_TOPICS = [
  'Order Enquiry', 'Returns & Refunds', 'Product Information', 'Virtual Try-On Help',
  'Store Consultation Booking', 'Wholesale / B2B', 'Media & PR', 'Other',
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', topic: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((res) => setTimeout(res, 1800));
    setSent(true);
    setSending(false);
  };

  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-14 text-center">
        <div className="container-custom max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Get in Touch</h1>
          <p className="text-white/75 text-lg">
            Our certified hair specialists are here to help — Mon–Sun, 9 AM to 9 PM.
          </p>
        </div>
      </div>

      <div className="container-custom py-14">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Contact form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <h2 className="font-display font-bold text-2xl text-gray-900 mb-6">Send Us a Message</h2>

              {sent ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Received!</h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for reaching out. Our team will respond to your message within 24 hours.
                  </p>
                  <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', topic: '', message: '' }); }} className="btn-primary text-sm py-2.5 px-6">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Priya Sharma"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="9876543210"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic *</label>
                      <select
                        required
                        value={form.topic}
                        onChange={(e) => setForm({ ...form, topic: e.target.value })}
                        className="input-field"
                      >
                        <option value="">Select a topic</option>
                        {CONTACT_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Message *</label>
                    <textarea
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={5}
                      placeholder="Tell us how we can help you..."
                      className="input-field resize-none"
                    />
                  </div>

                  <button type="submit" disabled={sending} className="btn-primary py-3.5 flex items-center gap-2">
                    {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Contact info */}
          <div className="space-y-5">
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-4">Contact Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Phone / WhatsApp</p>
                    <a href="tel:+911800hairsup" className="text-sm text-brand-600 hover:underline block">+91 1800-HAIRSUP (Free)</a>
                    <a href="https://wa.me/918976543210" className="text-sm text-green-600 hover:underline">WhatsApp Chat</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Email</p>
                    <a href="mailto:hello@hairsup.com" className="text-sm text-brand-600 hover:underline block">hello@hairsup.com</a>
                    <a href="mailto:help@hairsup.com" className="text-sm text-brand-600 hover:underline">help@hairsup.com (Support)</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Head Office</p>
                    <p className="text-sm text-gray-600">HairsUp Technologies Pvt. Ltd.</p>
                    <p className="text-sm text-gray-600">Bandra Kurla Complex</p>
                    <p className="text-sm text-gray-600">Mumbai, Maharashtra 400051</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Support Hours</p>
                    <p className="text-sm text-gray-600">Mon–Fri: 9:00 AM – 9:00 PM</p>
                    <p className="text-sm text-gray-600">Sat–Sun: 10:00 AM – 7:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-5 bg-green-50 border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-green-900">Live Chat Available</h3>
              </div>
              <p className="text-sm text-green-700 mb-3">Connect instantly with a hair specialist.</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-xs text-green-600 font-medium">12 specialists online now</p>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Book In-Store Consultation</h3>
              <p className="text-sm text-gray-600 mb-3">Visit any of our 50+ experience centres for a personalised wig fitting and consultation — completely free.</p>
              <a href="/stores" className="btn-secondary text-sm py-2.5 w-full text-center block">Find Nearest Store →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
