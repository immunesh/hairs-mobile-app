import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('Admin@123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@hairsup.com' },
    update: {},
    create: {
      email: 'admin@hairsup.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'HairsUp',
      role: 'ADMIN',
    },
  });

  const menCat = await prisma.category.upsert({
    where: { slug: 'men-wigs' },
    update: {},
    create: {
      name: "Men's Wigs",
      slug: 'men-wigs',
      description: 'Premium quality wigs for men',
      gender: 'MEN',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
    },
  });

  const womenCat = await prisma.category.upsert({
    where: { slug: 'women-wigs' },
    update: {},
    create: {
      name: "Women's Wigs",
      slug: 'women-wigs',
      description: 'Elegant and stylish wigs for women',
      gender: 'WOMEN',
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400',
    },
  });

  const humanHairCat = await prisma.category.upsert({
    where: { slug: 'human-hair' },
    update: {},
    create: { name: 'Human Hair', slug: 'human-hair', parentId: womenCat.id },
  });

  const syntheticCat = await prisma.category.upsert({
    where: { slug: 'synthetic' },
    update: {},
    create: { name: 'Synthetic', slug: 'synthetic', parentId: menCat.id },
  });

  const products = [
    {
      name: 'Silky Straight Lace Front Wig',
      slug: 'silky-straight-lace-front-wig',
      description: 'Transform your look with our premium Silky Straight Lace Front Wig. Crafted from 100% human hair, this wig features a transparent lace front that creates an undetectable natural hairline.',
      shortDesc: '100% human hair, lace front, natural hairline',
      categoryId: womenCat.id,
      gender: 'WOMEN',
      basePrice: 4999,
      salePrice: 3499,
      stock: 50,
      sku: 'HU-W-001',
      material: '100% Human Hair',
      length: '18 inches',
      density: '150%',
      texture: 'Straight',
      color: 'Natural Black',
      isFeatured: true,
      isBestSeller: true,
      tags: JSON.stringify(['human hair', 'lace front', 'straight', 'natural']),
      images: [
        { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600', isPrimary: true, angle: 0 },
        { url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600', isPrimary: false, angle: 90 },
        { url: 'https://images.unsplash.com/photo-1519699047748-de8e44489ece?w=600', isPrimary: false, angle: 180 },
        { url: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?w=600', isPrimary: false, angle: 270 },
      ],
    },
    {
      name: 'Bouncy Curl Bob Wig',
      slug: 'bouncy-curl-bob-wig',
      description: 'Make a bold statement with our Bouncy Curl Bob Wig. This stunning short wig features perfectly defined curls that add volume and dimension to your style.',
      shortDesc: 'Premium synthetic, defined curls, bob length',
      categoryId: womenCat.id,
      gender: 'WOMEN',
      basePrice: 2499,
      salePrice: 1799,
      stock: 75,
      sku: 'HU-W-002',
      material: 'Heat-resistant Synthetic',
      length: '12 inches',
      density: '130%',
      texture: 'Curly',
      color: 'Jet Black',
      isFeatured: true,
      isNewArrival: true,
      tags: JSON.stringify(['synthetic', 'curly', 'bob', 'short']),
      images: [
        { url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600', isPrimary: true, angle: 0 },
        { url: 'https://images.unsplash.com/photo-1571512599285-9494e11d9e72?w=600', isPrimary: false, angle: 90 },
      ],
    },
    {
      name: 'Goddess Waves Body Wave Wig',
      slug: 'goddess-waves-body-wave-wig',
      description: 'Channel your inner goddess with this breathtaking Body Wave Wig. The luxurious waves cascade beautifully, creating a romantic, flowing look.',
      shortDesc: 'Virgin human hair, 13x4 lace, versatile styling',
      categoryId: humanHairCat.id,
      gender: 'WOMEN',
      basePrice: 6999,
      salePrice: 5499,
      stock: 30,
      sku: 'HU-W-003',
      material: 'Virgin Human Hair',
      length: '22 inches',
      density: '180%',
      texture: 'Body Wave',
      color: 'Natural Black',
      isFeatured: true,
      isBestSeller: true,
      tags: JSON.stringify(['human hair', 'body wave', 'lace front', 'long']),
      images: [
        { url: 'https://images.unsplash.com/photo-1519699047748-de8e44489ece?w=600', isPrimary: true, angle: 0 },
        { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600', isPrimary: false, angle: 90 },
      ],
    },
    {
      name: 'Deep Wave Ombre Wig',
      slug: 'deep-wave-ombre-wig',
      description: 'Turn heads with our Deep Wave Ombre Wig featuring a stunning T1B/27 color transition from natural black roots to honey blonde tips.',
      shortDesc: 'Ombre T1B/27, deep wave, head-turning color',
      categoryId: humanHairCat.id,
      gender: 'WOMEN',
      basePrice: 5499,
      salePrice: 3999,
      stock: 45,
      sku: 'HU-W-004',
      material: 'Human Hair Blend',
      length: '20 inches',
      density: '150%',
      texture: 'Deep Wave',
      color: 'Ombre Black to Blonde',
      isNewArrival: true,
      tags: JSON.stringify(['ombre', 'deep wave', 'color', 'blonde']),
      images: [
        { url: 'https://images.unsplash.com/photo-1571512599285-9494e11d9e72?w=600', isPrimary: true, angle: 0 },
      ],
    },
    {
      name: 'Sleek Ponytail Wig',
      slug: 'sleek-ponytail-wig',
      description: 'Achieve the perfect sleek ponytail without any effort. This innovative wig features a built-in ponytail that gives you an ultra-polished, sophisticated look.',
      shortDesc: 'Built-in ponytail, sleek finish, wrap-around design',
      categoryId: womenCat.id,
      gender: 'WOMEN',
      basePrice: 3299,
      stock: 60,
      sku: 'HU-W-005',
      material: 'Heat-resistant Synthetic',
      length: '24 inches',
      density: '130%',
      texture: 'Straight',
      color: 'Jet Black',
      isBestSeller: true,
      tags: JSON.stringify(['ponytail', 'sleek', 'synthetic', 'updo']),
      images: [
        { url: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?w=600', isPrimary: true, angle: 0 },
      ],
    },
    {
      name: 'Voluminous Afro Kinky Wig',
      slug: 'voluminous-afro-kinky-wig',
      description: 'Celebrate your natural beauty with our Voluminous Afro Kinky Wig. This statement piece features a full, luscious afro that exudes confidence.',
      shortDesc: '4C kinky texture, full afro, natural look',
      categoryId: womenCat.id,
      gender: 'WOMEN',
      basePrice: 3999,
      salePrice: 2799,
      stock: 40,
      sku: 'HU-W-006',
      material: 'Kinky Synthetic Fiber',
      length: '14 inches',
      density: '200%',
      texture: 'Kinky Afro',
      color: 'Natural Black',
      isNewArrival: true,
      tags: JSON.stringify(['afro', 'kinky', '4c', 'natural']),
      images: [
        { url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600', isPrimary: true, angle: 0 },
      ],
    },
    {
      name: "Men's Natural System Hairpiece",
      slug: 'mens-natural-system-hairpiece',
      description: "Our flagship Men's Natural System is engineered for complete discretion and comfort. Using advanced Swiss lace technology, this hairpiece integrates seamlessly.",
      shortDesc: 'Swiss lace, monofilament base, undetectable',
      categoryId: menCat.id,
      gender: 'MEN',
      basePrice: 7999,
      salePrice: 5999,
      stock: 35,
      sku: 'HU-M-001',
      material: '100% Human Hair',
      capSize: 'Medium (fits 21-23")',
      density: '90%',
      texture: 'Straight',
      color: 'Natural Black',
      isFeatured: true,
      isBestSeller: true,
      tags: JSON.stringify(['hairpiece', 'lace', 'natural', 'men']),
      images: [
        { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600', isPrimary: true, angle: 0 },
        { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600', isPrimary: false, angle: 90 },
      ],
    },
    {
      name: "Men's Toupee Crown Cover",
      slug: 'mens-toupee-crown-cover',
      description: "Specifically designed for crown and top coverage, our Men's Toupee Crown Cover uses a fine skin base that blends invisibly with your scalp.",
      shortDesc: 'Crown coverage, skin base, gradient density',
      categoryId: menCat.id,
      gender: 'MEN',
      basePrice: 4999,
      salePrice: 3799,
      stock: 55,
      sku: 'HU-M-002',
      material: 'Human Hair',
      capSize: 'Standard',
      density: '100%',
      texture: 'Straight',
      color: 'Natural Black',
      isFeatured: true,
      isNewArrival: true,
      tags: JSON.stringify(['toupee', 'crown', 'coverage', 'men']),
      images: [
        { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600', isPrimary: true, angle: 0 },
      ],
    },
    {
      name: "Men's Full Cap Hair System",
      slug: 'mens-full-cap-hair-system',
      description: "Our most comprehensive solution for complete hair loss. The Full Cap Hair System provides 100% scalp coverage using a breathable monofilament cap.",
      shortDesc: 'Full coverage, hand-tied, secure fit',
      categoryId: menCat.id,
      gender: 'MEN',
      basePrice: 9999,
      salePrice: 7999,
      stock: 20,
      sku: 'HU-M-005',
      material: '100% Human Hair',
      capSize: 'Customizable',
      density: '110%',
      texture: 'Straight',
      color: 'Natural Black',
      isFeatured: true,
      isBestSeller: true,
      tags: JSON.stringify(['full cap', 'complete coverage', 'men']),
      images: [
        { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600', isPrimary: true, angle: 0 },
      ],
    },
    {
      name: "Men's Sports Active Wig",
      slug: 'mens-sports-active-wig',
      description: 'Live life without limits with our Sports Active Wig. Engineered for active men with sport-grade adhesive compatibility that withstands sweat and swimming.',
      shortDesc: 'Sport-grade, sweat-resistant, ventilated',
      categoryId: syntheticCat.id,
      gender: 'MEN',
      basePrice: 6499,
      salePrice: 4999,
      stock: 40,
      sku: 'HU-M-006',
      material: 'Human Hair / PU Base',
      capSize: 'Standard',
      density: '100%',
      texture: 'Straight',
      color: 'Natural Black',
      isNewArrival: true,
      tags: JSON.stringify(['sports', 'active', 'sweat-resistant', 'men']),
      images: [
        { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600', isPrimary: true, angle: 0 },
      ],
    },
  ];

  for (const p of products) {
    const { images, tags, ...data } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...data,
        tags,
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 200) + 50,
        images: { create: images },
      },
    });
    console.log(`Created: ${p.name}`);
  }

  await prisma.coupon.upsert({
    where: { code: 'FIRST20' },
    update: {},
    create: { code: 'FIRST20', type: 'PERCENTAGE', value: 20, minOrder: 1000, maxDiscount: 500 },
  });
  await prisma.coupon.upsert({
    where: { code: 'HAIRSUP200' },
    update: {},
    create: { code: 'HAIRSUP200', type: 'FIXED', value: 200, minOrder: 2000 },
  });

  const storeHours = JSON.stringify({ mon: '10:00-21:00', tue: '10:00-21:00', wed: '10:00-21:00', thu: '10:00-21:00', fri: '10:00-22:00', sat: '10:00-22:00', sun: '11:00-20:00' });
  const stores = [
    { name: 'HairsUp Mumbai Flagship', address: 'Ground Floor, Phoenix Palladium, Senapati Bapat Marg', city: 'Mumbai', state: 'Maharashtra', pincode: '400013', phone: '+91 98765 43210', email: 'mumbai@hairsup.com', hours: storeHours, lat: 19.076, lng: 72.8777 },
    { name: 'HairsUp Delhi Select', address: 'Level 2, Select Citywalk, Saket', city: 'New Delhi', state: 'Delhi', pincode: '110017', phone: '+91 98765 43211', email: 'delhi@hairsup.com', hours: storeHours, lat: 28.5274, lng: 77.2193 },
    { name: 'HairsUp Bangalore Forum', address: 'Forum Mall, Hosur Road, Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560095', phone: '+91 98765 43212', email: 'bangalore@hairsup.com', hours: storeHours, lat: 12.9352, lng: 77.6245 },
  ];
  for (const store of stores) {
    await prisma.storeLocation.upsert({
      where: { id: store.name },
      update: {},
      create: store,
    }).catch(() => prisma.storeLocation.create({ data: store }).catch(() => {}));
  }

  await prisma.blogPost.upsert({
    where: { slug: 'ultimate-guide-choosing-first-wig' },
    update: {},
    create: {
      title: 'The Ultimate Guide to Choosing Your First Wig',
      slug: 'ultimate-guide-choosing-first-wig',
      excerpt: 'Everything you need to know before buying your first wig.',
      content: '<h2>Finding Your Perfect Wig</h2><p>Choosing your first wig can feel overwhelming...</p>',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
      author: 'HairsUp Expert Team',
      tags: JSON.stringify(['beginner', 'guide', 'wig care']),
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  // HeroSlide has no natural unique key, so only seed when the table is empty.
  if ((await prisma.heroSlide.count()) === 0) {
    await prisma.heroSlide.createMany({
      data: [
        {
          badge: 'PREMIUM HUMAN HAIR WIGS',
          headline: 'Transform Your Look',
          subheadline: 'Naturally ✨',
          description:
            "India's finest collection of 100% human hair wigs. Look stunning every day, effortlessly.",
          image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=900',
          cta: 'Shop Now',
          ctaLink: '/products',
          ctaSecondary: 'Try On Virtually',
          ctaSecondaryLink: '/try-on',
          accent: '#5B21B6',
          order: 0,
        },
        {
          badge: 'NEW ARRIVALS',
          headline: 'Everyday Styles',
          subheadline: 'Made Effortless 💫',
          description:
            'Lightweight caps, natural hairlines and shades built for Indian skin tones.',
          image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900',
          cta: 'Shop New In',
          ctaLink: '/products?filter=new',
          ctaSecondary: 'Try On Virtually',
          ctaSecondaryLink: '/try-on',
          accent: '#8B5CF6',
          order: 1,
        },
      ],
    });
    console.log('Created: 2 hero slides');
  }

  console.log('Seeding complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
