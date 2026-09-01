import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageCircle, Phone, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions | HairsUp',
  description: 'Find answers to common questions about HairsUp wigs, orders, shipping, returns, and virtual try-on.',
};

const FAQ_SECTIONS = [
  {
    title: 'Products & Quality',
    icon: '💎',
    faqs: [
      { q: 'What types of wigs does HairsUp sell?', a: "We carry 280+ styles across two main categories: Women's Wigs (lace front, full lace, human hair, synthetic, curly, straight, bob, ombre, and more) and Men's Hair Systems (Swiss lace hairpieces, toupees, crown covers, full cap systems, and sports-active systems)." },
      { q: 'Are your wigs made from real human hair?', a: "Many of our wigs are made from 100% human hair or premium human hair blends. Each product page clearly states the material. Our human hair wigs can be washed, dyed, and heat-styled just like your natural hair." },
      { q: 'What is the difference between a lace front and a full lace wig?', a: "A lace front wig has lace only along the front hairline, creating a natural-looking hairline. A full lace wig has lace across the entire cap, allowing you to part the hair anywhere and style it up completely. Full lace wigs are more versatile but also more expensive." },
      { q: 'How long will my wig last?', a: "Human hair wigs last 12–24 months with proper care. Synthetic wigs typically last 4–6 months. Proper washing, storage on a wig stand, and avoiding excessive heat will significantly extend the lifespan." },
      { q: 'Are HairsUp products safe for sensitive scalps?', a: "Yes. All our products are dermatologically tested and free from harsh chemicals. We offer a range of wigs designed specifically for sensitive scalps, including those undergoing chemotherapy or dealing with alopecia." },
    ],
  },
  {
    title: 'Sizing & Fit',
    icon: '📏',
    faqs: [
      { q: 'How do I measure my head for the right cap size?', a: "Use a soft measuring tape. Measure the circumference of your head starting at your natural hairline at the forehead, going around the back of your head, and returning to the start. The average adult head measures 53–58cm. Our wigs include adjustable straps for a secure fit." },
      { q: 'What if the wig doesn\'t fit perfectly?', a: "All our wigs have adjustable velcro straps that allow you to tighten or loosen the cap. If you're still unhappy with the fit within 7 days of delivery (unworn), contact us for an exchange. We also offer custom-sized wigs — contact our team for a consultation." },
      { q: 'Do you offer custom wigs?', a: "Yes! We offer custom-made wigs tailored to your exact measurements, hair colour, density, and texture. This service is available in-store at all 50+ HairsUp experience centres. Contact us to book a custom wig consultation." },
    ],
  },
  {
    title: 'Orders & Shipping',
    icon: '🚚',
    faqs: [
      { q: 'How long does delivery take?', a: "Standard delivery takes 3–5 business days across India. Express delivery (1–2 business days) is available for an additional fee. Metro cities (Mumbai, Delhi, Bangalore, Chennai, Hyderabad) typically receive orders within 2–3 days." },
      { q: 'Is shipping free?', a: "Shipping is free on all orders above ₹999. Orders below ₹999 incur a ₹99 shipping fee. We offer free express shipping on orders above ₹3,999." },
      { q: 'Can I track my order?', a: "Yes! You will receive an SMS and email with your tracking link as soon as your order is dispatched. You can also track your order in the 'My Orders' section of your HairsUp account." },
      { q: 'Do you ship internationally?', a: "We currently ship to UAE, Singapore, and the United Kingdom. International orders typically take 7–12 business days. Customs duties and taxes are the buyer's responsibility." },
    ],
  },
  {
    title: 'Returns & Exchanges',
    icon: '↩️',
    faqs: [
      { q: 'What is your return policy?', a: "We accept returns within 7 days of delivery for unused wigs in their original condition with all tags attached and in original packaging. Worn wigs cannot be returned for hygiene reasons. Custom-sized wigs are non-returnable." },
      { q: 'How do I initiate a return?', a: "Log in to your account, go to 'My Orders', select the order, and click 'Return/Exchange'. Our team will arrange a free pickup within 24–48 hours. Refunds are processed within 5–7 business days to your original payment method." },
      { q: 'What if I receive a damaged or wrong product?', a: "We sincerely apologise! Please contact us within 48 hours of delivery with photographs of the issue. We will arrange an immediate replacement or full refund at no cost to you." },
    ],
  },
  {
    title: 'Virtual Try-On',
    icon: '✨',
    faqs: [
      { q: 'How does the virtual try-on work?', a: "Our AI-powered virtual try-on uses your device's camera to detect your face and overlay selected wig styles in real time. It works in any modern web browser — no app download needed. You can also upload a selfie instead of using your live camera." },
      { q: 'Is my camera feed stored or shared?', a: "Never. Your camera feed is processed entirely on your device and is never uploaded to our servers. We are committed to your privacy." },
      { q: 'How accurate is the virtual try-on?', a: "Our AI provides a realistic approximation of how a wig will look. It accurately represents the wig's style, length, and colour. For the most accurate representation, ensure good lighting and look directly at the camera." },
    ],
  },
  {
    title: 'Payments',
    icon: '💳',
    faqs: [
      { q: 'What payment methods are accepted?', a: "We accept UPI (GPay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay, Amex), Net Banking (all major banks), and Cash on Delivery. EMI options are available on credit cards for orders above ₹3,000." },
      { q: 'Is my payment information secure?', a: "Absolutely. All payments are processed through Razorpay, a PCI-DSS compliant payment gateway. We never store your card details on our servers. All transactions are 256-bit SSL encrypted." },
      { q: 'Can I use a coupon code?', a: "Yes! Enter your coupon code at checkout. Common codes include FIRST20 (20% off your first order) and HAIRSUP200 (₹200 off orders above ₹2,000). Check our social media and email newsletter for latest offers." },
    ],
  },
];

export default function FAQPage() {
  return (
    <div>
      {/* Hero */}
      <div className="page-hero py-14 text-center">
        <div className="container-custom max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-white/75 text-lg">
            Everything you need to know about HairsUp, our products, and how we work.
          </p>
        </div>
      </div>

      <div className="container-custom py-14">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* FAQ Sections */}
          <div className="lg:col-span-2 space-y-10">
            {FAQ_SECTIONS.map(({ title, icon, faqs }) => (
              <div key={title} id={title.toLowerCase().replace(/\s+&?\s*/g, '-')}>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-5 flex items-center gap-3">
                  <span className="text-2xl">{icon}</span> {title}
                </h2>
                <div className="space-y-3">
                  {faqs.map(({ q, a }) => (
                    <details key={q} className="group card">
                      <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                        <h3 className="font-semibold text-gray-900 pr-4 text-sm md:text-base">{q}</h3>
                        <div className="w-6 h-6 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center flex-shrink-0 group-open:bg-brand-600 group-open:border-brand-600 transition-colors">
                          <span className="text-brand-600 group-open:text-white font-bold text-sm leading-none group-open:content-['−'] transition-all">+</span>
                        </div>
                      </summary>
                      <div className="px-5 pb-5">
                        <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">{a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-5 lg:pt-0">
            <div className="bg-white sticky top-24 space-y-5">
              {/* Quick nav */}
              <div className="card p-5">
                <h3 className="font-bold text-gray-900 mb-4">Jump to Section</h3>
                <div className="space-y-2">
                  {FAQ_SECTIONS.map(({ title, icon }) => (
                    <a
                      key={title}
                      href={`#${title.toLowerCase().replace(/\s+&?\s*/g, '-')}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600 transition-colors py-1"
                    >
                      <span>{icon}</span> {title}
                    </a>
                  ))}
                </div>
              </div>

              {/* Still need help */}
              <div className="card p-5 bg-brand-50 border-brand-100">
                <h3 className="font-bold text-gray-900 mb-2">Still need help?</h3>
                <p className="text-sm text-gray-600 mb-4">Our hair specialists are available 7 days a week.</p>
                <div className="space-y-2">
                  <a href="tel:+911800hairsup" className="flex items-center gap-2 text-sm text-brand-700 font-medium">
                    <Phone className="w-4 h-4" /> +91 1800-HAIRSUP (Free)
                  </a>
                  <a href="mailto:help@hairsup.com" className="flex items-center gap-2 text-sm text-brand-700 font-medium">
                    <Mail className="w-4 h-4" /> help@hairsup.com
                  </a>
                  <Link href="/contact" className="flex items-center gap-2 text-sm text-brand-700 font-medium">
                    <MessageCircle className="w-4 h-4" /> Live Chat
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
