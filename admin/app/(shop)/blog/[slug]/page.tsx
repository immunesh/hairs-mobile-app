import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, User, ArrowLeft, Share2, Heart, Tag } from 'lucide-react';

const BLOG_CONTENT: Record<string, { title: string; author: string; date: string; readTime: string; tag: string; image: string; content: string }> = {
  'ultimate-guide-choosing-first-wig': {
    title: 'The Ultimate Guide to Choosing Your First Wig',
    author: 'Dr. Anita Sharma, Chief Trichologist',
    date: 'January 28, 2025',
    readTime: '8 min read',
    tag: 'Beginner Guide',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80',
    content: `
      <h2>Finding Your Perfect Wig</h2>
      <p>Choosing your first wig is an exciting but sometimes overwhelming experience. Whether you're experiencing hair loss due to medical reasons, wanting to switch up your style, or simply curious about wigs — this guide will walk you through everything you need to know.</p>

      <h3>Step 1: Know Your Reason</h3>
      <p>Understanding why you want a wig helps you choose the right type. Are you dealing with alopecia or chemotherapy-related hair loss? You'll want a soft, gentle cap with a breathable base. Want to experiment with styles? A synthetic wig with pre-styled curls is perfect and low-maintenance.</p>

      <h3>Step 2: Understand Cap Construction</h3>
      <p><strong>Lace Front Wigs:</strong> The lace extends across the front of the wig, creating a realistic-looking hairline. Perfect for wearing hair pulled back or in half-up styles.</p>
      <p><strong>Full Lace Wigs:</strong> The entire cap is made of lace, allowing you to part the hair in any direction and style it up completely. The most versatile option.</p>
      <p><strong>Monofilament Caps:</strong> Each hair strand is hand-tied to a mesh base, allowing it to move naturally. Ideal for sensitive scalps.</p>
      <p><strong>Basic/Machine-made Caps:</strong> The most affordable option, with hair sewn onto wefts. Less natural movement but durable and budget-friendly.</p>

      <h3>Step 3: Choose Your Hair Type</h3>
      <p><strong>Human Hair Wigs</strong> are the gold standard. They look, feel, and move like your natural hair. You can wash, colour, and heat-style them. They last 1–2 years with proper care. However, they require more maintenance and cost more.</p>
      <p><strong>Synthetic Wigs</strong> come pre-styled and are easier to maintain. They hold their style even after washing, making them great for busy lifestyles. Most can't be heat-styled unless labelled heat-resistant. They last 4–6 months.</p>

      <h3>Step 4: Get the Right Size</h3>
      <p>Measure the circumference of your head: starting at your forehead hairline, go around your head, and back to the start. The average head circumference is 53–58cm. Most wigs have adjustable straps to help achieve a snug fit.</p>

      <h3>Step 5: Use Virtual Try-On</h3>
      <p>HairsUp's free virtual try-on technology lets you see exactly how any wig looks on your face before you buy. Visit our Try-On page and use your device's camera — no app download needed!</p>

      <h2>Common Mistakes to Avoid</h2>
      <ul>
        <li>Don't skip the cap size measurement — a poorly fitting wig is uncomfortable and looks unnatural</li>
        <li>Don't wash a human hair wig more than once every 8–10 wears</li>
        <li>Don't apply heat to synthetic wigs unless they're labelled as heat-resistant</li>
        <li>Don't store your wig without a wig stand — this helps maintain the shape</li>
      </ul>

      <h2>Ready to Take the Next Step?</h2>
      <p>Browse our collection of 280+ wigs for men and women, filter by your preferences, and use our 360° product viewer to see every angle before you buy. Our expert team is also available for a free virtual or in-store consultation.</p>
    `,
  },
  'how-to-maintain-human-hair-wig': {
    title: 'How to Maintain Your Human Hair Wig',
    author: 'Priya Mehta, Creative Director',
    date: 'January 20, 2025',
    readTime: '6 min read',
    tag: 'Care Tips',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1200&q=80',
    content: `
      <h2>The Foundation of Wig Longevity</h2>
      <p>A premium human hair wig is an investment. With proper care, it can last 12–24 months and maintain its beauty throughout. Neglect it, and even the finest wig will dull and tangle within weeks. Here's the expert guide to keeping your wig flawless.</p>

      <h3>How Often Should You Wash?</h3>
      <p>Wash your human hair wig every 8–10 wears, or when you notice product buildup. Over-washing strips the hair of its natural oils, leading to dryness and breakage. Under-washing causes product buildup and odour.</p>

      <h3>The Right Way to Wash</h3>
      <ol>
        <li>Gently detangle with a wide-tooth comb before washing, starting from the tips and working up to the roots</li>
        <li>Fill a basin with cool to lukewarm water — never hot</li>
        <li>Add a sulphate-free, moisturising shampoo</li>
        <li>Submerge the wig and gently swish — do not scrub or wring</li>
        <li>Rinse thoroughly under running cool water</li>
        <li>Apply a deep conditioning mask from mid-lengths to ends, leave for 10–15 minutes</li>
        <li>Rinse out completely</li>
      </ol>

      <h3>Drying Your Wig</h3>
      <p>Pat gently with a microfibre towel — never rub. Place on a wig stand and allow to air dry completely. If you must blow dry, use the lowest heat setting with a diffuser attachment and a heat protectant spray. Never blow dry on high heat.</p>

      <h3>Styling Tips</h3>
      <p>Always use heat protectant before any heat styling. For human hair wigs, keep your flat iron or curling wand below 180°C. Avoid the roots and lace when applying heat. Deep condition after any heat styling session to restore moisture.</p>

      <h3>Daily Care Routine</h3>
      <p>Each morning, gently detangle with a wide-tooth comb or paddle brush. Spritz with a wig-specific leave-in conditioner for shine and moisture. When not wearing, store on a wig stand away from sunlight and humidity.</p>
    `,
  },
  'mens-hair-systems-breaking-stigma': {
    title: "Men's Hair Systems: Breaking the Stigma",
    author: 'Vikram Patel, Co-Founder & CEO',
    date: 'January 15, 2025',
    readTime: '5 min read',
    tag: "Men's Hair",
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&q=80',
    content: `
      <h2>The Conversation We've Been Avoiding</h2>
      <p>Hair loss affects approximately 50% of Indian men by the age of 50. Yet, in a culture where a man's appearance is intrinsically linked to his confidence and professional image, we barely talk about it. And when we do, the conversation is often filled with shame, silence, or bad jokes.</p>
      <p>It's time to change that narrative.</p>

      <h3>Modern Hair Systems Are Nothing Like Your Grandfather's Toupee</h3>
      <p>The word "toupee" conjures images of obvious, unconvincing hairpieces — the butt of countless jokes. But today's hair systems bear no resemblance to those relics. Swiss lace technology, pioneered in the high-end theatre industry and refined for everyday wear, creates a base so thin it becomes invisible on your scalp.</p>
      <p>At HairsUp, our flagship Swiss Lace Hair System uses a base that is 0.03mm thick — thinner than a human hair. The hair is individually hand-tied using the same method as professional hair extensions, creating movement that is completely indistinguishable from natural hair growth.</p>

      <h3>Who Wears Hair Systems?</h3>
      <p>The reality might surprise you. Actors, executives, athletes, teachers, and doctors — men from every walk of life are using hair systems to present their best selves. Our customers include a Supreme Court judge, three IPL cricketers, and several prominent Bollywood actors.</p>
      <p>The difference? They chose to keep it private — because a great hair system means nobody knows.</p>

      <h3>The Confidence Multiplier</h3>
      <p>A study published in the British Journal of Dermatology found that hair loss significantly impacts men's self-esteem, social confidence, and professional performance. Many men report avoiding networking events, dates, and photographs due to hair loss anxiety.</p>
      <p>Our customer surveys show that 94% of men report a measurable improvement in confidence within 30 days of starting a hair system. 78% report better professional performance. 86% say their social life improved.</p>

      <h3>The HairsUp Approach</h3>
      <p>We don't just sell a hairpiece. We offer a comprehensive consultation where our trichologists analyse your hair loss pattern, natural hair colour, texture, and scalp characteristics to recommend the perfect system and colour match. We then teach you the proper attachment technique and ongoing care routine.</p>
      <p>The result is a hair system that moves with you, survives workouts, swimming, and intimacy — and that nobody will detect unless you choose to tell them.</p>
    `,
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = BLOG_CONTENT[params.slug];
  return {
    title: post ? `${post.title} | HairsUp Blog` : 'Blog Post | HairsUp',
    description: post ? `${post.author} — ${post.readTime}` : '',
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = BLOG_CONTENT[params.slug] || BLOG_CONTENT['ultimate-guide-choosing-first-wig'];

  const relatedPosts = Object.entries(BLOG_CONTENT)
    .filter(([slug]) => slug !== params.slug)
    .slice(0, 2);

  return (
    <div>
      {/* Hero */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        <Image src={post.image} alt={post.title} fill className="object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-900/50 to-transparent" />
        <div className="relative container-custom h-full flex flex-col justify-end pb-8 text-white">
          <Link href="/blog" className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <span className="badge bg-brand-600 text-white text-xs mb-3">{post.tag}</span>
          <h1 className="text-3xl md:text-4xl font-display font-bold max-w-3xl leading-tight">{post.title}</h1>
          <div className="flex items-center gap-4 mt-4 text-white/70 text-sm flex-wrap">
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{post.author}</span>
            <span>·</span>
            <span>{post.date}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Article */}
          <article className="lg:col-span-2">
            <div
              className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-a:text-brand-600 prose-h2:text-2xl prose-h3:text-xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Share */}
            <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className={`badge text-xs ${post.tag === 'Care Tips' ? 'bg-blue-100 text-blue-700' : 'bg-brand-100 text-brand-700'}`}>{post.tag}</span>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-500 transition-colors"><Heart className="w-4 h-4" /> Save</button>
                <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-600 transition-colors"><Share2 className="w-4 h-4" /> Share</button>
              </div>
            </div>

            {/* Author */}
            <div className="mt-8 bg-brand-50 rounded-2xl p-6 border border-brand-100">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-brand-200 rounded-full flex items-center justify-center text-brand-800 font-bold text-lg flex-shrink-0">
                  {post.author[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{post.author}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Expert contributor at HairsUp. All articles are reviewed by our certified trichologist team.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-4">More Articles</h3>
              <div className="space-y-4">
                {relatedPosts.map(([slug, p]) => (
                  <Link key={slug} href={`/blog/${slug}`} className="flex gap-3 group">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={p.image} alt={p.title} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors">{p.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{p.readTime}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="card p-5 bg-gradient-to-br from-brand-50 to-purple-50 border-brand-100">
              <h3 className="font-bold text-gray-900 mb-2">Try On Any Wig — Free</h3>
              <p className="text-sm text-gray-600 mb-4">See how any HairsUp wig looks on you using our AI-powered virtual try-on tool.</p>
              <Link href="/try-on" className="btn-primary text-sm py-2.5 w-full text-center block">Launch Try-On</Link>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-2">Get Expert Advice</h3>
              <p className="text-sm text-gray-600 mb-4">Not sure which wig is right for you? Book a free consultation with our certified hair specialists.</p>
              <Link href="/contact" className="btn-secondary text-sm py-2.5 w-full text-center block">Book Consultation</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
