'use client';

import { useState, useEffect } from 'react';
import { 
  getAllProducts
} from '@/lib/adminApi';
import Image from 'next/image';
import styles from './Reviews.module.css';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [formData, setFormData] = useState({
    reviewer_name: '',
    rating: 5,
    title: '',
    review_text: ''
  });

  useEffect(() => {
    loadData();
  }, [selectedProduct]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadReviews(),
      loadProducts(),
      loadStats()
    ]);
    setLoading(false);
  };

  const loadReviews = async () => {
    try {
      const url = selectedProduct 
        ? `/api/admin/reviews?productId=${selectedProduct}`
        : '/api/admin/reviews';
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success && result.reviews) {
        setReviews(result.reviews);
      } else if (response.status === 401) {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const loadProducts = async () => {
    const result = await getAllProducts();
    if (result.success && result.products) {
      setProducts(result.products);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/reviews?action=stats', {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success && result.stats) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleOpenEditModal = (review: any) => {
    setEditingReview(review);
    setFormData({
      reviewer_name: review.reviewer_name,
      rating: review.rating,
      title: review.title || '',
      review_text: review.review_text
    });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingReview(null);
    setFormData({
      reviewer_name: '',
      rating: 5,
      title: '',
      review_text: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingReview) return;

    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingReview.id,
          action: 'update',
          reviewData: formData
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Review updated successfully!');
        handleCloseModal();
        loadData();
      } else {
        alert('Failed to update review: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/reviews?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Review deleted successfully!');
        loadData();
      } else {
        alert('Failed to delete review: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          action: 'toggleApproval',
          reviewData: {
            is_approved: !currentStatus
          }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        loadData();
      } else {
        alert('Failed to update review status: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error toggling approval:', error);
      alert('Failed to update review status');
    }
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredReviews = reviews.filter(review => {
    if (filterStatus === 'approved') return review.is_approved;
    if (filterStatus === 'pending') return !review.is_approved;
    return true;
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Reviews Management</h1>
          <p className={styles.subtitle}>Manage customer reviews and ratings</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.total}</div>
            <div className={styles.statLabel}>Total Reviews</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.approved}</div>
            <div className={styles.statLabel}>Approved</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.pending}</div>
            <div className={styles.statLabel}>Pending</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.avgRating}</div>
            <div className={styles.statLabel}>Average Rating</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Filter by Product:</label>
          <select 
            value={selectedProduct} 
            onChange={(e) => setSelectedProduct(e.target.value)}
            className={styles.select}
          >
            <option value="">All Products</option>
            {products.map((product) => (
              <option key={product.id} value={product.product_id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Filter by Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Reviews</option>
            <option value="approved">Approved Only</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className={styles.reviewsContainer}>
        {filteredReviews.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No reviews found</p>
          </div>
        ) : (
          <div className={styles.reviewsList}>
            {filteredReviews.map((review) => (
              <div key={review.id} className={styles.reviewCard}>
                {/* Product Info */}
                <div className={styles.reviewProduct}>
                  <div className={styles.productImageSmall}>
                    <Image
                      src={(review.products?.images_json || review.products?.image_url || ['/placeholder-product.svg'])[0]}
                      alt={review.products?.name || 'Product'}
                      fill
                      style={{ objectFit: 'contain' }}
                      unoptimized
                    />
                  </div>
                  <div>
                    <h3>{review.products?.name || 'Unknown Product'}</h3>
                    <p className={styles.productId}>ID: {review.products?.product_id || 'N/A'}</p>
                  </div>
                </div>

                {/* Review Content */}
                <div className={styles.reviewContent}>
                  <div className={styles.reviewHeader}>
                    <div>
                      <div className={styles.reviewerInfo}>
                        <span className={styles.reviewerName}>{review.reviewer_name}</span>
                        {review.is_verified_purchase && (
                          <span className={styles.verifiedBadge}>✓ Verified Purchase</span>
                        )}
                      </div>
                      <div className={styles.stars}>{renderStars(review.rating)}</div>
                      <div className={styles.reviewDate}>{formatDate(review.created_at)}</div>
                    </div>
                    <div className={styles.reviewStatus}>
                      {review.is_approved ? (
                        <span className={styles.statusApproved}>APPROVED</span>
                      ) : (
                        <span className={styles.statusPending}>PENDING</span>
                      )}
                    </div>
                  </div>

                  {review.title && (
                    <h4 className={styles.reviewTitle}>{review.title}</h4>
                  )}
                  
                  <p className={styles.reviewText}>{review.review_text}</p>

                  {review.review_images && review.review_images.length > 0 && (
                    <div className={styles.reviewImages}>
                      {review.review_images.map((img: string, index: number) => (
                        <div key={index} className={styles.reviewImage}>
                          <Image src={img} alt="Review" fill style={{ objectFit: 'cover' }} unoptimized />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className={styles.reviewMeta}>
                    <span>Mobile: {review.reviewer_mobile}</span>
                    {review.reviewer_email && (
                      <span>Email: {review.reviewer_email}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className={styles.reviewActions}>
                  <button
                    className={`${styles.btnAction} ${styles.btnApprove}`}
                    onClick={() => handleToggleApproval(review.id, review.is_approved)}
                    title={review.is_approved ? 'Unapprove' : 'Approve'}
                  >
                    {review.is_approved ? '✕ Unapprove' : '✓ Approve'}
                  </button>
                  <button
                    className={`${styles.btnAction} ${styles.btnEdit}`}
                    onClick={() => handleOpenEditModal(review)}
                    title="Edit"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className={`${styles.btnAction} ${styles.btnDelete}`}
                    onClick={() => handleDelete(review.id)}
                    title="Delete"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingReview && (
        <div className={styles.modal} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Edit Review</h2>
              <button className={styles.closeBtn} onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Reviewer Name *</label>
                <input
                  type="text"
                  name="reviewer_name"
                  value={formData.reviewer_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Rating *</label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  required
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Below Average</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Review Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Optional review title"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Review Text *</label>
                <textarea
                  name="review_text"
                  value={formData.review_text}
                  onChange={handleChange}
                  rows={5}
                  required
                ></textarea>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

