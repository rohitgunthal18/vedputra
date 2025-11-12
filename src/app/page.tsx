'use client';

import Script from 'next/script';
import Header from '@/components/Header/Header';
import Hero from '@/components/Hero/Hero';
import Products from '@/components/Products/Products';
import WhyChoose from '@/components/WhyChoose/WhyChoose';
import Process from '@/components/Process/Process';
import Blog from '@/components/Blog/Blog';
import Newsletter from '@/components/Newsletter/Newsletter';
import Footer from '@/components/Footer/Footer';
import ScrollToTop from '@/components/ScrollToTop/ScrollToTop';

const siteUrl = 'https://www.vedputra.store';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'VedPutra Organics',
  alternateName: 'VedPutra',
  url: siteUrl,
  logo: `${siteUrl}/favicon.ico`,
  image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
  description:
    'VedPutra Organics delivers farm to home moringa, beetroot, and roasted soyabean powders from Maharashtra.',
  foundingDate: '2021',
  foundingLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Pune',
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Shivkrupa Heights, 102, Mokarwadi',
    addressLocality: 'Pune',
    addressRegion: 'Maharashtra',
    postalCode: '411001',
    addressCountry: 'IN',
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'info@vedputra.com',
      telephone: '+91-72186-16190',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
    },
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'info@vedputra.com',
      telephone: '+91-72186-16190',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
    },
  ],
  sameAs: [
    'https://www.facebook.com/vedputra',
    'https://www.instagram.com/vedputra.in',
    'https://twitter.com/vedputra',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '127',
    bestRating: '5',
    worstRating: '1',
  },
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Credit Card, Debit Card, UPI, Net Banking, Cash on Delivery',
  areaServed: {
    '@type': 'Country',
    name: 'India',
  },
  knowsAbout: [
    'Organic Superfoods',
    'Moringa Powder',
    'Beetroot Powder',
    'Plant Protein',
    'Farm to Home Products',
    'Maharashtra Organic Farming',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'VedPutra Organics',
  url: siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

const productCollectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'VedPutra Organics Superfoods',
  itemListOrder: 'https://schema.org/ItemListOrderAscending',
  numberOfItems: 3,
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Product',
        name: 'VedPutra Organics Moringa Leaf Powder',
        description:
          'Shade-dried moringa leaf powder with iron, chlorophyll, and antioxidants for daily immunity.',
        image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=80',
        sku: 'VPO-MOR-200',
        brand: {
          '@type': 'Brand',
          name: 'VedPutra Organics',
        },
        offers: {
          '@type': 'Offer',
          price: '449',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          url: `${siteUrl}/product/moringa-leaf-powder`,
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'Product',
        name: 'VedPutra Organics Beetroot Vitality Powder',
        description:
          'Nitrate-rich beetroot powder for stamina, glowing skin, and natural hemoglobin support.',
        image: 'https://images.unsplash.com/photo-1615485290382-67d4eaca2c99?auto=format&fit=crop&w=1200&q=80',
        sku: 'VPO-BEET-150',
        brand: {
          '@type': 'Brand',
          name: 'VedPutra Organics',
        },
        offers: {
          '@type': 'Offer',
          price: '399',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          url: `${siteUrl}/product/beetroot-stamina-powder`,
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'Product',
        name: 'VedPutra Organics Roasted Soyabean Protein Powder',
        description:
          'Slow-roasted soyabean protein powder delivering 45% plant protein for families and athletes.',
        image: 'https://images.unsplash.com/photo-1584270354954-0c24ba2ae310?auto=format&fit=crop&w=1200&q=80',
        sku: 'VPO-SOY-500',
        brand: {
          '@type': 'Brand',
          name: 'VedPutra Organics',
        },
        offers: {
          '@type': 'Offer',
          price: '529',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          url: `${siteUrl}/product/roasted-soyabean-protein`,
        },
      },
    },
  ],
};

// Breadcrumb Schema for Homepage
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteUrl,
    },
  ],
};

// FAQ Schema for Homepage
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is VedPutra Organics?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'VedPutra Organics is a farm-to-home organic superfood company based in Maharashtra, India. We deliver shade-dried moringa leaf powder, beetroot vitality powder, and roasted soyabean protein powder directly from our farms to your home within 10-14 days, ensuring maximum freshness and nutrient retention.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you ship all over India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, VedPutra Organics ships to all states across India. We offer free shipping on orders above ₹999 and deliver within 3-7 business days depending on your location. Track your order easily through our website.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are VedPutra Organics products really organic?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! VedPutra Organics grows all products on our own organic farms in Maharashtra using regenerative farming practices with zero pesticides or chemical fertilizers. Every batch undergoes third-party lab testing for heavy metals, pesticides, and purity. Request lab certificates by emailing info@vedputra.com.',
      },
    },
    {
      '@type': 'Question',
      name: 'What makes VedPutra Organics different from other brands?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'VedPutra Organics controls the entire supply chain from farm to your home. We harvest at optimal times (moringa at sunrise), process within 4 hours using low-temperature methods (shade drying below 40°C, vacuum dehydration below 50°C), and deliver within 10-14 days. This ensures 2-3x higher nutrient retention compared to commercial brands that take 30-90 days.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I contact VedPutra Organics customer support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Contact VedPutra Organics at info@vedputra.com or call +91-72186-16190. Our customer support team responds within 24 hours for product inquiries, order tracking, and personalized nutrition guidance.',
      },
    },
  ],
};

// Local Business Schema
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${siteUrl}/#localbusiness`,
  name: 'VedPutra Organics',
  image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
  telephone: '+91-72186-16190',
  email: 'info@vedputra.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Shivkrupa Heights, 102, Mokarwadi',
    addressLocality: 'Pune',
    addressRegion: 'Maharashtra',
    postalCode: '411001',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '18.5204',
    longitude: '73.8567',
  },
  url: siteUrl,
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '09:00',
      closes: '14:00',
    },
  ],
  priceRange: '₹₹',
  servesCuisine: 'Organic Superfoods',
  acceptsReservations: 'False',
};

export default function Home() {
  return (
    <>
      <Script
        id="vedputra-organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="vedputra-website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Script
        id="vedputra-product-list-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productCollectionSchema) }}
      />
      <Script
        id="vedputra-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="vedputra-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="vedputra-local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <Header />
      <main>
        <Hero />
        <Products />
        <WhyChoose />
        <Process />
        <Blog />
        <Newsletter />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
