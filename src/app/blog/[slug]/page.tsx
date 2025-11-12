'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { getBlogBySlug } from '@/lib/api';
import { getActiveProducts } from '@/lib/api';
import styles from './BlogDetail.module.css';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  image_alt: string | null;
  category: string | null;
  published_at: string | null;
  read_time_minutes: number | null;
  views_count: number;
  author_name: string | null;
  related_product_ids: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  updated_at?: string | null;
}

interface Product {
  id: string;
  product_id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  image_url: string;
  images_json: string[];
  rating: number;
  stock_quantity?: number;
  weight?: string;
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadBlog();
    }
  }, [slug]);

  const loadBlog = async () => {
    const result = await getBlogBySlug(slug);
    if (result.success && result.blog) {
      setBlog(result.blog);
      
      // Load related products if available
      if (result.blog.related_product_ids && result.blog.related_product_ids.length > 0) {
        loadRelatedProducts(result.blog.related_product_ids);
      }
    } else {
      // Blog not found
      router.push('/');
    }
    setLoading(false);
  };

  const loadRelatedProducts = async (productIds: string[]) => {
    const productsResult = await getActiveProducts();
    if (productsResult.success && productsResult.products) {
      // Filter products that match the related_product_ids
      const filtered = productsResult.products.filter(p => 
        productIds.includes(p.product_id)
      ).slice(0, 3); // Show max 3 products in sidebar
      setRelatedProducts(filtered);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`}>★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half">⯨</span>);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className={styles.emptyStar}>★</span>);
    }
    return stars;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading article...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <Header />
        <div className={styles.loading}>
          <p>Blog not found.</p>
        </div>
        <Footer />
      </>
    );
  }

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.meta_title || blog.title,
    description: blog.meta_description || blog.excerpt || '',
    image: blog.featured_image || undefined,
    author: {
      '@type': 'Person',
      name: blog.author_name || 'VedPutra Organics Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'VedPutra Organics',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.vedputra.store/favicon.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.vedputra.store/blog/${blog.slug}`,
    },
    datePublished: blog.published_at,
    dateModified: blog.updated_at || blog.published_at,
  };

  return (
    <>
      <Script
        id="vedputra-blog-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <Header />
      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/blogs">Blog</Link>
          <span>/</span>
          <span>{blog.category || 'Article'}</span>
        </div>

        {/* 2-Column Layout: Article + Sidebar */}
        <div className={styles.blogLayout}>
          {/* Left Column - Article Content */}
          <article className={styles.articleColumn}>
            {/* Article Header */}
            <header className={styles.header}>
              <span className={styles.category}>{blog.category || 'Article'}</span>
              <h1 className={styles.title}>{blog.title}</h1>
              
              <div className={styles.meta}>
                <div className={styles.metaItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>{blog.author_name || 'VedPutra Team'}</span>
                </div>
                <div className={styles.metaItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>{formatDate(blog.published_at)}</span>
                </div>
                <div className={styles.metaItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>{blog.read_time_minutes || 5} min read</span>
                </div>
                <div className={styles.metaItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span>{blog.views_count} views</span>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {blog.featured_image && (
              <div className={styles.featuredImage}>
                <Image
                  src={blog.featured_image}
                  alt={blog.image_alt || blog.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized
                  priority
                />
              </div>
            )}

            {/* Article Content */}
            <div className={styles.content}>
              <div 
                className={styles.prose}
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>

            {/* In-Content Promotional Banner - Horizontal Slim */}
            <div className={styles.inContentPromo}>
              <div className={styles.inContentPromoInner}>
                {/* Left: Logo & Brand */}
                <div className={styles.promoLogo}>
                  <div className={styles.logoCircle}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                  </div>
                  <span className={styles.brandName}>VEDPUTRA</span>
                </div>

                {/* Center: Content */}
                <div className={styles.inContentPromoContent}>
                  <div className={styles.promoTextSection}>
                    <div className={styles.promoStarburst}>
                      <span className={styles.starburstText}>EXCLUSIVE</span>
                    </div>
                    <h3 className={styles.inContentPromoTitle}>
                      🎉 Special Offer: 10% Discount for Blog Readers!
                    </h3>
                    <p className={styles.inContentPromoText}>
                      Get <strong>exclusive 10% OFF</strong> on your first order. No minimum purchase required!
                    </p>
                    <div className={styles.promoBenefits}>
                      <div className={styles.benefit}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>30 days validity</span>
                      </div>
                      <div className={styles.benefit}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>No minimum order</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: CTA Button */}
                  <Link href="/promotion" className={styles.inContentPromoBtn}>
                    <span>CLAIM NOW</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Share & Back */}
            <div className={styles.articleFooter}>
              <Link href="/blogs" className={styles.backBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to All Articles
              </Link>
              
              <div className={styles.shareButtons}>
                <span>Share:</span>
                <button 
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${window.location.href}`, '_blank')}
                  className={styles.shareBtn}
                  aria-label="Share on Twitter"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                  </svg>
                </button>
                <button 
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
                  className={styles.shareBtn}
                  aria-label="Share on Facebook"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </button>
                <button 
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(blog.title + ' ' + window.location.href)}`, '_blank')}
                  className={styles.shareBtn}
                  aria-label="Share on WhatsApp"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </button>
              </div>
            </div>
          </article>

          {/* Right Column - Sidebar with Products & Promo */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarSticky}>
              {/* Promotional Banner - Exclusive for Blog Readers */}
              <div className={styles.promoBanner}>
                <div className={styles.promoIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <div className={styles.promoContent}>
                  <div className={styles.promoLabel}>EXCLUSIVE FOR YOU! 🎉</div>
                  <h3 className={styles.promoTitle}>Claim Your 10% Discount</h3>
                  <p className={styles.promoText}>
                    Limited time offer for our blog readers! Get instant 10% OFF on your first order.
                  </p>
                  <Link href="/promotion" className={styles.promoBtn}>
                    <span>CLAIM COUPON NOW</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                  <div className={styles.promoFooter}>
                    ⏰ Valid for 30 days • No minimum order
                  </div>
                </div>
              </div>

              {/* Related Products */}
              {relatedProducts.length > 0 && (
                <div className={styles.sidebarProducts}>
                  <div className={styles.sidebarTitle}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    <span>FEATURED PRODUCTS</span>
                  </div>
                  
                  <div className={styles.productsStack}>
                    {relatedProducts.map((product) => (
                      <Link 
                        key={product.id} 
                        href={`/product/${product.product_id}`}
                        className={styles.sidebarProductCard}
                      >
                        <div className={styles.sidebarProductImage}>
                          <Image
                            src={product.images_json?.[0] || product.image_url}
                            alt={product.name}
                            fill
                            style={{ objectFit: 'contain' }}
                            unoptimized
                          />
                        </div>
                        <div className={styles.sidebarProductInfo}>
                          <h4 className={styles.sidebarProductName}>{product.name}</h4>
                          <div className={styles.sidebarProductRating}>
                            <div className={styles.stars}>
                              {renderStars(product.rating || 0)}
                            </div>
                            <span className={styles.ratingText}>
                              {(product.rating || 0).toFixed(1)}
                            </span>
                          </div>
                          <div className={styles.sidebarProductPrice}>
                            {product.discount_price && product.discount_price < product.price ? (
                              <>
                                <span className={styles.discountPrice}>₹{product.discount_price}</span>
                                <span className={styles.originalPrice}>₹{product.price}</span>
                              </>
                            ) : (
                              <span className={styles.price}>₹{product.price}</span>
                            )}
                          </div>
                          <button className={styles.sidebarProductBtn}>
                            VIEW PRODUCT
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                          </button>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}

