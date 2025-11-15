'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import ProductCard from '@/components/Products/ProductCard';
import { getProductByProductId, getProductReviews, getReviewStats, createProductReview, CreateReviewData, getActiveProducts, getPublishedBlogs, PublicBlog } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import styles from './ProductDetail.module.css';

interface ProductDetail {
  id: string;
  product_id: string;
  name: string;
  description: string;
  long_description?: string;
  price: number;
  weight: string;
  rating: number;
  reviews: number;
  badge?: string;
  image: string;
  images: string[];
  stock_quantity?: number;
  benefits?: string[];
  ingredients?: string;
  how_to_use?: string;
  storage_instructions?: string;
  shelf_life?: string;
  certifications?: string[];
  faq?: Array<{ question: string; answer: string }>;
  suitable_for?: string[];
}

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  title?: string;
  review_text: string;
  review_images?: string[];
  is_verified_purchase: boolean;
  created_at: string;
  published_at?: string;
  helpful_count?: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;
  
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'faq'>('description');
  const { addToCart } = useCart();
  
  // Check if product is out of stock
  const isOutOfStock = product?.stock_quantity !== undefined && product.stock_quantity <= 0;
  
  // Trending products state
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<PublicBlog[]>([]);
  
  // Read More states
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllFAQ, setShowAllFAQ] = useState(false);

  // Review form state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    mobile: '',
    rating: 5,
    review: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadProduct();
    loadReviews();
    loadReviewStats();
    loadTrendingProducts();
    loadBlogs();
  }, [productId]);

  const loadTrendingProducts = async () => {
    const result = await getActiveProducts();
    if (result.success && result.products) {
      // Get 3 random products excluding current one
      const filtered = result.products.filter((p: Product) => p.id !== productId);
      const shuffled = filtered.sort(() => 0.5 - Math.random());
      setTrendingProducts(shuffled.slice(0, 3));
    }
  };

  const loadBlogs = async () => {
    const result = await getPublishedBlogs(3);
    if (result.success && result.blogs) {
      setBlogs(result.blogs);
    }
  };

  const loadProduct = async () => {
    setLoading(true);
    const result = await getProductByProductId(productId);
    if (result.success && result.product) {
      setProduct(result.product as ProductDetail);
    } else {
      // Product not found
      alert('Product not found');
      router.push('/');
    }
    setLoading(false);
  };

  const loadReviews = async () => {
    const result = await getProductReviews(productId);
    if (result.success && result.reviews) {
      setReviews(result.reviews);
    }
  };

  const loadReviewStats = async () => {
    const result = await getReviewStats(productId);
    if (result.success) {
      setReviewStats(result.stats);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Check if product is out of stock
    if (product.stock_quantity !== undefined && product.stock_quantity <= 0) {
      alert('This product is currently out of stock.');
      return;
    }
    
    // Check if quantity exceeds available stock
    if (product.stock_quantity !== undefined && quantity > product.stock_quantity) {
      alert(`Only ${product.stock_quantity} items available in stock.`);
      return;
    }
    
    addToCart(
      {
        id: product.product_id,
        name: product.name,
        price: product.price,
        image: product.image,
        weight: product.weight,
        rating: product.rating,
        reviews: product.reviews,
        description: product.description,
        stock_quantity: product.stock_quantity
      },
      quantity
    );
    alert(`${quantity} x ${product.name} added to cart!`);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) return;

    // Extract name from mobile (will be overridden by verified name from orders)
    const reviewerName = 'Customer'; // Placeholder, will be replaced by actual name from order

    setSubmittingReview(true);

    const reviewData: CreateReviewData = {
      product_id: product.id, // UUID
      product_string_id: product.product_id, // String ID (e.g., "3")
      reviewer_name: reviewerName,
      reviewer_mobile: reviewForm.mobile,
      rating: reviewForm.rating,
      review_text: reviewForm.review
    };

    const result = await createProductReview(reviewData);

    if (result.success) {
      setShowReviewModal(false);
      setReviewForm({
        mobile: '',
        rating: 5,
        review: ''
      });
      // Reload reviews and stats immediately
      await loadReviews();
      await loadReviewStats();
      await loadProduct(); // Reload product to get updated ratings
      alert('✅ Thank you! Your review has been posted successfully!');
    } else {
      alert('❌ ' + (result.error || 'Failed to submit review'));
    }

    setSubmittingReview(false);
  };

  const renderStars = (rating: number, size: 'small' | 'medium' | 'large' = 'medium') => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const sizeClass = size === 'small' ? styles.starsSmall : size === 'large' ? styles.starsLarge : styles.starsMedium;
    
    return (
      <div className={`${styles.stars} ${sizeClass}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= fullStars ? styles.starFilled : styles.starEmpty}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading product...</p>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className={styles.notFound}>
          <h1>Product Not Found</h1>
          <button onClick={() => router.push('/')} className={styles.btnPrimary}>
            Go to Homepage
          </button>
        </div>
      </>
    );
  }

  // Calculate priceValidUntil (1 year from now)
  const priceValidUntil = new Date();
  priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);
  const priceValidUntilISO = priceValidUntil.toISOString().split('T')[0];

  // Format reviews for structured data (limit to 10 most recent)
  const reviewSchema = reviews && reviews.length > 0
    ? reviews.slice(0, 10).map((review) => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.reviewer_name,
        },
        datePublished: review.published_at || review.created_at,
        reviewBody: review.review_text,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: '5',
          worstRating: '1',
        },
        ...(review.title && { name: review.title }),
      }))
    : [];

  // Build product schema, removing undefined fields
  const productSchema = product
    ? (() => {
        const schema: any = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image],
          sku: product.product_id || product.id,
          brand: {
            '@type': 'Brand',
            name: 'VedPutra Organics',
          },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: product.price.toString(),
            availability:
              product.stock_quantity !== undefined && product.stock_quantity > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            url: `https://www.vedputra.store/product/${product.product_id || product.id}`,
            priceValidUntil: priceValidUntilISO,
          },
          manufacturer: {
            '@type': 'Organization',
            name: 'VedPutra Organics',
            email: 'rohitgunthal1819@gmail.com',
          },
        };

        // Add aggregateRating only if reviews exist
        if (product.reviews > 0) {
          schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: product.rating.toString(),
            reviewCount: product.reviews.toString(),
            bestRating: '5',
            worstRating: '1',
          };
        }

        // Add review array only if reviews exist
        if (reviewSchema.length > 0) {
          schema.review = reviewSchema;
        }

        return schema;
      })()
    : null;

  return (
    <>
      {productSchema && (
        <Script
          id="product-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <Header />
      <div className={styles.productDetailPage}>
        <div className="container">
          {/* Breadcrumb */}
          <div className={styles.breadcrumb}>
            <a href="/">Home</a>
            <span>/</span>
            <a href="/#products">Products</a>
            <span>/</span>
            <span>{product.name}</span>
          </div>

          {/* Product Main Section */}
          <div className={styles.productMain}>
            {/* Image Gallery */}
            <div className={styles.productGallery}>
              <div className={styles.mainImage}>
                <Image
                  src={product.images[selectedImage] || product.image}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'contain' }}
                  unoptimized
                  priority
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className={styles.thumbnails}>
                  {product.images.map((img, index) => (
                    <div
                      key={index}
                      className={`${styles.thumbnail} ${selectedImage === index ? styles.thumbnailActive : ''}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        style={{ objectFit: 'contain' }}
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className={styles.productInfo}>
              {isOutOfStock && (
                <div className={styles.outOfStockBadge}>
                  OUT OF STOCK
                </div>
              )}
              
              {product.badge && !isOutOfStock && (
                <div className={styles.badge}>{product.badge}</div>
              )}
              
              <h1 className={styles.productTitle}>{product.name}</h1>
              
              <div className={styles.productRating}>
                {renderStars(product.rating, 'medium')}
                <span className={styles.ratingText}>
                  {product.rating.toFixed(1)} ({product.reviews} reviews)
                </span>
              </div>

              <p className={styles.productShortDesc}>{product.description}</p>

              <div className={styles.priceSection}>
                <div className={styles.price}>₹{product.price}</div>
                <div className={styles.weight}>{product.weight}</div>
              </div>

              {/* Certifications */}
              {product.certifications && product.certifications.length > 0 && (
                <div className={styles.certifications}>
                  {product.certifications.map((cert, index) => (
                    <span key={index} className={styles.certBadge}>{cert}</span>
                  ))}
                </div>
              )}

              {/* Suitable For */}
              {product.suitable_for && product.suitable_for.length > 0 && (
                <div className={styles.suitableFor}>
                  <strong>Suitable for:</strong>
                  {product.suitable_for.map((item, index) => (
                    <span key={index} className={styles.suitableTag}>{item}</span>
                  ))}
                </div>
              )}

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className={styles.quantitySection}>
                  <label>Quantity:</label>
                  <div className={styles.quantitySelector}>
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span>{quantity}</span>
                    <button 
                      onClick={() => {
                        const maxQty = Math.min(99, product.stock_quantity || 99);
                        setQuantity(Math.min(maxQty, quantity + 1));
                      }}
                      disabled={quantity >= Math.min(99, product.stock_quantity || 99)}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              {isOutOfStock ? (
                <button className={styles.btnOutOfStock} disabled>
                  Out of Stock
                </button>
              ) : (
                <button 
                  className={styles.btnAddToCart} 
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  Add to Cart
                </button>
              )}

              {/* Stock Status */}
              {product.stock_quantity !== undefined && (
                <div className={styles.stock}>
                  {product.stock_quantity > 0 ? (
                    <span className={styles.inStock}>✓ In Stock ({product.stock_quantity} available)</span>
                  ) : (
                    <span className={styles.outOfStock}>Out of Stock</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tabs Section */}
          <div className={styles.tabsSection}>
            <div className={styles.tabs}>
              <button
                className={activeTab === 'description' ? styles.tabActive : ''}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={activeTab === 'reviews' ? styles.tabActive : ''}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({product.reviews})
              </button>
              {product.faq && product.faq.length > 0 && (
                <button
                  className={activeTab === 'faq' ? styles.tabActive : ''}
                  onClick={() => setActiveTab('faq')}
                >
                  FAQ
                </button>
              )}
            </div>

            <div className={styles.tabContent}>
              {/* Description Tab */}
              {activeTab === 'description' && (
                <div className={styles.descriptionTab}>
                  <div className={showFullDescription ? styles.fullContent : styles.limitedContent}>
                    {product.long_description && (
                      <div className={styles.section}>
                        <h2>About This Product</h2>
                        <p>{product.long_description}</p>
                      </div>
                    )}

                    {product.benefits && product.benefits.length > 0 && (
                      <div className={styles.section}>
                        <h2>Key Benefits</h2>
                        <ul className={styles.benefitsList}>
                          {product.benefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {product.ingredients && (
                      <div className={styles.section}>
                        <h2>Ingredients</h2>
                        <p>{product.ingredients}</p>
                      </div>
                    )}

                    {product.how_to_use && (
                      <div className={styles.section}>
                        <h2>How to Use</h2>
                        <p>{product.how_to_use}</p>
                      </div>
                    )}

                    {product.storage_instructions && (
                      <div className={styles.section}>
                        <h2>Storage Instructions</h2>
                        <p>{product.storage_instructions}</p>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    className={styles.btnReadMore}
                    onClick={() => setShowFullDescription(!showFullDescription)}
                  >
                    {showFullDescription ? '▲ Show Less' : '▼ Read More'}
                  </button>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className={styles.reviewsTab}>
                  {/* Review Summary */}
                  {reviewStats && (
                    <div className={styles.reviewSummary}>
                      <div className={styles.ratingOverview}>
                        <div className={styles.avgRating}>
                          {reviewStats.average.toFixed(1)}
                        </div>
                        {renderStars(reviewStats.average, 'large')}
                        <p>{reviewStats.total} reviews</p>
                      </div>
                      <div className={styles.ratingDistribution}>
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div key={star} className={styles.ratingBar}>
                            <span>{star} ★</span>
                            <div className={styles.barContainer}>
                              <div
                                className={styles.barFill}
                                style={{
                                  width: `${reviewStats.total > 0 ? (reviewStats.distribution[star] / reviewStats.total) * 100 : 0}%`
                                }}
                              ></div>
                            </div>
                            <span>{reviewStats.distribution[star]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Write Review Button */}
                  <div className={styles.reviewActions}>
                    <button
                      className={styles.btnWriteReview}
                      onClick={() => setShowReviewModal(true)}
                    >
                      ✍️ Write a Review
                    </button>
                  </div>

                  {/* Reviews List */}
                  <div className={styles.reviewsList}>
                    <div className={showAllReviews ? styles.fullContent : styles.limitedContent}>
                      {reviews.length > 0 ? (
                        reviews.slice(0, showAllReviews ? reviews.length : 3).map((review) => (
                          <div key={review.id} className={styles.reviewCard}>
                            <div className={styles.reviewHeader}>
                              <div>
                                <div className={styles.reviewerName}>
                                  {review.reviewer_name}
                                  {review.is_verified_purchase && (
                                    <span className={styles.verifiedBadge}>✓ Verified</span>
                                  )}
                                </div>
                                {renderStars(review.rating, 'small')}
                              </div>
                              <div className={styles.reviewDate}>
                                {formatDate(review.published_at || review.created_at)}
                              </div>
                            </div>
                            {review.title && (
                              <h4 className={styles.reviewTitle}>{review.title}</h4>
                            )}
                            <p className={styles.reviewText}>{review.review_text}</p>
                            {review.review_images && review.review_images.length > 0 && (
                              <div className={styles.reviewImages}>
                                {review.review_images.map((img, index) => (
                                  <div key={index} className={styles.reviewImage}>
                                    <Image src={img} alt="Review" fill style={{ objectFit: 'cover' }} unoptimized />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className={styles.noReviews}>No reviews yet. Be the first to review this product!</p>
                      )}
                    </div>
                    
                    {reviews.length > 3 && (
                      <button 
                        className={styles.btnReadMore}
                        onClick={() => setShowAllReviews(!showAllReviews)}
                      >
                        {showAllReviews ? '▲ Show Less Reviews' : `▼ Read More Reviews (${reviews.length - 3} more)`}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* FAQ Tab */}
              {activeTab === 'faq' && product.faq && (
                <div className={styles.faqTab}>
                  <div className={showAllFAQ ? styles.fullContent : styles.limitedContent}>
                    {product.faq.slice(0, showAllFAQ ? product.faq.length : 3).map((item, index) => (
                      <div key={index} className={styles.faqItem}>
                        <h3>{item.question}</h3>
                        <p>{item.answer}</p>
                      </div>
                    ))}
                  </div>
                  
                  {product.faq.length > 3 && (
                    <button 
                      className={styles.btnReadMore}
                      onClick={() => setShowAllFAQ(!showAllFAQ)}
                    >
                      {showAllFAQ ? '▲ Show Less' : `▼ Read More FAQs (${product.faq.length - 3} more)`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trending Products Section */}
      {trendingProducts.length > 0 && (
        <div className={styles.trendingSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Trending Products</h2>
              <p>Discover our most popular organic products</p>
            </div>
            <div className={styles.trendingGrid}>
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Related Blogs Section */}
      {blogs.length > 0 && (
        <div className={styles.blogsSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Related Articles</h2>
              <p>Learn more about health and wellness</p>
            </div>
            <div className={styles.blogsGrid}>
              {blogs.map((blog) => {
                const formatDate = (dateString: string | null) => {
                  if (!dateString) return 'Recently';
                  const date = new Date(dateString);
                  return date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  });
                };

                return (
                  <article key={blog.id} className={styles.blogCard}>
                    <div className={styles.blogImageContainer}>
                      {blog.featured_image && (
                        <Image
                          src={blog.featured_image}
                          alt={blog.title}
                          fill
                          style={{ objectFit: 'cover' }}
                          unoptimized
                        />
                      )}
                      <div className={styles.blogGradient} />
                      <span className={styles.blogCategory}>{blog.category || 'Article'}</span>
                    </div>
                    <div className={styles.blogContent}>
                      <div className={styles.blogMeta}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span>{formatDate(blog.published_at)}</span>
                        <span className={styles.dot}>•</span>
                        <span>{blog.read_time_minutes || 5} min read</span>
                      </div>
                      <h3>{blog.title}</h3>
                      <p>{blog.excerpt || 'Read more to discover...'}</p>
                      <Link href={`/blog/${blog.slug}`} className={styles.blogReadMore}>
                        Read Article →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

      {/* Review Modal */}
      {showReviewModal && (
        <div className={styles.modalOverlay} onClick={() => setShowReviewModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowReviewModal(false)}>
              ×
            </button>
            <h3>Write Your Review</h3>
            <p className={styles.modalNote}>Only verified buyers can review</p>
            
            <form onSubmit={handleReviewSubmit}>
              <div className={styles.modalFormGroup}>
                <label>Mobile Number*</label>
                <input
                  type="tel"
                  value={reviewForm.mobile}
                  onChange={(e) => setReviewForm({ ...reviewForm, mobile: e.target.value })}
                  placeholder="Enter your mobile"
                  maxLength={10}
                  required
                />
                <p className={styles.modalPrivacyNote}>
                  🔒 Your mobile number is kept private and only used to verify you're a verified buyer
                </p>
              </div>

              <div className={styles.modalFormGroup}>
                <label>Rating*</label>
                <div className={styles.modalRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={star <= reviewForm.rating ? styles.modalStarSelected : ''}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.modalFormGroup}>
                <label>Your Review*</label>
                <textarea
                  value={reviewForm.review}
                  onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                  rows={4}
                  placeholder="Share your experience..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className={styles.modalSubmit}
                disabled={submittingReview}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

