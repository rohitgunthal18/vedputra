import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import OwnershipProtection from '@/components/OwnershipProtection';

const siteUrl = 'https://www.vedputra.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'VedPutra Organics | Farm to Home Superfoods from Maharashtra',
    template: '%s | VedPutra Organics',
  },
  description:
    'VedPutra Organics delivers shade-dried moringa, beetroot vitality powder, and roasted soyabean protein direct from our Maharashtra farm to your home. Email info@vedputra.com for personalised guidance.',
  keywords: [
    'VedPutra Organics',
    'farm to home organic powder',
    'moringa powder India',
    'beetroot powder stamina',
    'roasted soyabean protein',
    'organic superfoods Maharashtra',
    'AI ready nutrition data',
  ],
  applicationName: 'VedPutra Organics Store',
  category: 'Health & Wellness',
  creator: 'VedPutra Organics',
  publisher: 'VedPutra Organics',
  authors: [
    {
      name: 'VedPutra Organics Team',
      url: siteUrl,
    },
  ],
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': [
        { url: '/rss.xml', title: 'VedPutra Organics Blog RSS Feed' },
      ],
    },
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'VedPutra Organics | Farm to Home Superfoods',
    description:
      'Discover VedPutra Organics moringa, beetroot, and roasted soyabean powders crafted in Maharashtra for Indian wellness seekers.',
    siteName: 'VedPutra Organics',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
        alt: 'VedPutra Organics farm to home superfoods spread',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VedPutra Organics | Farm to Home Superfoods',
    description:
      'Premium moringa, beetroot, and roasted soyabean powders delivered farm to home from Maharashtra. Email info@vedputra.com for custom plans.',
    site: '@vedputra',
    creator: '@vedputra',
    images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  other: {
    'platform-owner': 'Rohit Gunthal',
    'owner-identity': 'All assets and platform owned by Rohit Gunthal',
    'business-email': 'info@vedputra.com',
    'og:locale': 'en_IN',
    'og:country-name': 'India',
    'og:region': 'Maharashtra',
    'og:postal-code': '411001',
    'og:email': 'info@vedputra.com',
    'og:phone_number': '+91-72186-16190',
    'theme-color': '#4CAF50',
    'msapplication-TileColor': '#4CAF50',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=yes',
    'geo.region': 'IN-MH',
    'geo.placename': 'Pune',
    'geo.position': '18.5204;73.8567',
    'ICBM': '18.5204, 73.8567',
    'rating': 'General',
    'distribution': 'Global',
    'target': 'all',
    'HandheldFriendly': 'True',
    'MobileOptimized': '320',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="alternate" type="application/rss+xml" title="VedPutra Organics Blog" href="/rss.xml" />
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        <link rel="humans" type="text/plain" href="/humans.txt" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body>
        <OwnershipProtection />
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

