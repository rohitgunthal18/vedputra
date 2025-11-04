'use client';

import { useEffect, useState } from 'react';
import { CreateCouponData } from '@/lib/adminApi';
import styles from './Coupons.module.css';

export default function AdminCouponsPage() {
  const [promoCoupons, setPromoCoupons] = useState<any[]>([]);
  const [generalCoupons, setGeneralCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [formData, setFormData] = useState<CreateCouponData>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 10,
    max_discount: 100,
    min_order_value: 0,
    usage_limit: undefined,
    expires_at: '',
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    
    try {
      // Load promotion coupons
      const promoResponse = await fetch('/api/admin/coupons?type=promotion', {
        method: 'GET',
        credentials: 'include',
      });
      const promoResult = await promoResponse.json();
      if (promoResult.success) {
        setPromoCoupons(promoResult.coupons || []);
      } else if (promoResponse.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      
      // Load general coupons
      const generalResponse = await fetch('/api/admin/coupons', {
        method: 'GET',
        credentials: 'include',
      });
      const generalResult = await generalResponse.json();
      if (generalResult.success) {
        setGeneralCoupons(generalResult.coupons || []);
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRemainingDays = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isExpired = (expiresAt: string) => {
    return calculateRemainingDays(expiresAt) <= 0;
  };

  const handleWhatsAppReminder = (coupon: any) => {
    const remainingDays = calculateRemainingDays(coupon.expires_at);
    const cleanPhone = coupon.mobile.replace(/[^0-9]/g, '');
    
    let message = '';
    if (remainingDays <= 0) {
      message = `Hi! Your Vedputra coupon ${coupon.coupon_code} has expired. Visit our store for fresh deals! 🌿`;
    } else if (remainingDays <= 3) {
      message = `⏰ URGENT! Your ${coupon.discount_percentage}% discount coupon ${coupon.coupon_code} expires in ${remainingDays} day(s)! Claim before it's gone! 🎁 Shop now: http://localhost:3000`;
    } else if (remainingDays <= 7) {
      message = `Hi! Just a reminder - Your ${coupon.discount_percentage}% discount coupon ${coupon.coupon_code} expires in ${remainingDays} days. Don't miss out! 🌿 Use code at checkout.`;
    } else {
      message = `Hello! You have an exclusive ${coupon.discount_percentage}% discount coupon ${coupon.coupon_code} valid for ${remainingDays} more days (Max ₹${coupon.max_discount} off). Shop organic powders now! 🎁`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/91${cleanPhone}?text=${encodedMessage}`, '_blank');
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const couponData: CreateCouponData = {
      ...formData,
      expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : undefined,
    };

    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(couponData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Custom coupon created successfully!');
        setShowCreateModal(false);
        loadCoupons();
        // Reset form
        setFormData({
          code: '',
          description: '',
          discount_type: 'percentage',
          discount_value: 10,
          max_discount: 100,
          min_order_value: 0,
          usage_limit: undefined,
          expires_at: '',
        });
      } else {
        alert(result.error || 'Failed to create coupon');
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert('Failed to create coupon');
    }
  };

  const handleDeleteGeneralCoupon = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    
    try {
      const response = await fetch(`/api/admin/coupons?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Coupon deleted successfully!');
        loadCoupons();
      } else {
        alert('Failed to delete coupon: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Failed to delete coupon');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          action: 'toggleStatus',
          couponData: {
            is_active: !currentStatus
          }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        loadCoupons();
      } else {
        alert('Failed to toggle coupon status: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to toggle coupon status');
    }
  };

  const filteredCoupons = promoCoupons.filter(coupon => {
    if (filter === 'all') return true;
    if (filter === 'active') return !coupon.is_used && !isExpired(coupon.expires_at);
    if (filter === 'used') return coupon.is_used;
    if (filter === 'expired') return isExpired(coupon.expires_at);
    return true;
  });

  const getRemainingDaysColor = (days: number) => {
    if (days <= 0) return '#C62828';
    if (days <= 3) return '#EF6C00';
    if (days <= 7) return '#F9A825';
    return '#2E7D32';
  };

  return (
    <div className={styles.couponsPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Promotion Coupons</h1>
          <p className={styles.pageSubtitle}>Manage coupons claimed through promotion page</p>
        </div>
        <div style={{display: 'flex', gap: '10px'}}>
          <button className={styles.createCustomBtn} onClick={() => setShowCreateModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Create Custom Coupon</span>
          </button>
          <button className={styles.refreshBtn} onClick={loadCoupons}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* General/Custom Coupons Section */}
      {generalCoupons.length > 0 && (
        <div className={styles.customCouponsSection}>
          <h2 className={styles.sectionTitle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            Custom Discount Coupons ({generalCoupons.length})
          </h2>
          <div className={styles.customCouponsGrid}>
            {generalCoupons.map((coupon) => {
              const expired = coupon.expires_at ? isExpired(coupon.expires_at) : false;
              const remainingDays = coupon.expires_at ? calculateRemainingDays(coupon.expires_at) : null;
              
              return (
                <div key={coupon.id} className={`${styles.customCouponCard} ${!coupon.is_active || expired ? styles.inactive : ''}`}>
                  <div className={styles.couponHeader}>
                    <div className={styles.couponCode}>
                      <strong>{coupon.code}</strong>
                    </div>
                    {!coupon.is_active ? (
                      <span className={styles.inactiveBadge}>INACTIVE</span>
                    ) : expired ? (
                      <span className={styles.expiredBadge}>EXPIRED</span>
                    ) : (
                      <span className={styles.activeBadge}>ACTIVE</span>
                    )}
                  </div>
                  
                  {coupon.description && (
                    <p className={styles.description}>{coupon.description}</p>
                  )}
                  
                  <div className={styles.discountInfo}>
                    {coupon.discount_type === 'percentage' 
                      ? `${coupon.discount_value}% OFF` 
                      : `₹${coupon.discount_value} OFF`}
                    {coupon.max_discount && coupon.discount_type === 'percentage' && (
                      <span> (Max ₹{coupon.max_discount})</span>
                    )}
                  </div>
                  
                  <div className={styles.couponDetails}>
                    {coupon.min_order_value > 0 && (
                      <div>Min Order: ₹{coupon.min_order_value}</div>
                    )}
                    {coupon.usage_limit && (
                      <div>Usage: {coupon.usage_count || 0} / {coupon.usage_limit}</div>
                    )}
                    {remainingDays !== null && (
                      <div style={{color: getRemainingDaysColor(remainingDays)}}>
                        {remainingDays <= 0 ? 'Expired' : `${remainingDays} days remaining`}
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.customCouponActions}>
                    <button
                      className={styles.toggleBtn}
                      onClick={() => handleToggleStatus(coupon.id, coupon.is_active)}
                    >
                      {coupon.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDeleteGeneralCoupon(coupon.id, coupon.code)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{promoCoupons.length}</span>
          <span className={styles.statLabel}>Total Coupons</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {promoCoupons.filter(c => !c.is_used && !isExpired(c.expires_at)).length}
          </span>
          <span className={styles.statLabel}>Active</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{promoCoupons.filter(c => c.is_used).length}</span>
          <span className={styles.statLabel}>Used</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {promoCoupons.filter(c => isExpired(c.expires_at) && !c.is_used).length}
          </span>
          <span className={styles.statLabel}>Expired</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {promoCoupons.length > 0 ? Math.round((promoCoupons.filter(c => c.is_used).length / promoCoupons.length) * 100) : 0}%
          </span>
          <span className={styles.statLabel}>Conversion Rate</span>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${filter === 'all' ? styles.filterActive : ''}`}
          onClick={() => setFilter('all')}
        >
          All Coupons
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'active' ? styles.filterActive : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'used' ? styles.filterActive : ''}`}
          onClick={() => setFilter('used')}
        >
          Used
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'expired' ? styles.filterActive : ''}`}
          onClick={() => setFilter('expired')}
        >
          Expired
        </button>
      </div>

      {/* Promotion Coupons Grid */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading coupons...</p>
        </div>
      ) : filteredCoupons.length > 0 ? (
        <div className={styles.couponsGrid}>
          {filteredCoupons.map((coupon) => {
            const remainingDays = calculateRemainingDays(coupon.expires_at);
            const expired = remainingDays <= 0;
            const urgent = remainingDays <= 3 && remainingDays > 0;
            
            return (
              <div key={coupon.id} className={`${styles.couponCard} ${expired ? styles.expired : ''} ${urgent ? styles.urgent : ''}`}>
                {/* Coupon Header */}
                <div className={styles.couponHeader}>
                  <div className={styles.couponCode}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    <span>{coupon.coupon_code}</span>
                  </div>
                  {coupon.is_used ? (
                    <span className={styles.usedBadge}>USED</span>
                  ) : expired ? (
                    <span className={styles.expiredBadge}>EXPIRED</span>
                  ) : urgent ? (
                    <span className={styles.urgentBadge}>URGENT</span>
                  ) : (
                    <span className={styles.activeBadge}>ACTIVE</span>
                  )}
                </div>

                {/* Customer Info */}
                <div className={styles.couponBody}>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Mobile:</span>
                    <span className={styles.value}>{coupon.mobile}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Discount:</span>
                    <span className={styles.value}>{coupon.discount_percentage}% (Max ₹{coupon.max_discount})</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Created:</span>
                    <span className={styles.value}>{new Date(coupon.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Expires:</span>
                    <span className={styles.value}>{new Date(coupon.expires_at).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Remaining Time */}
                  <div className={styles.remainingTime}>
                    <div 
                      className={styles.timeBar}
                      style={{
                        width: `${Math.max(0, Math.min(100, (remainingDays / 30) * 100))}%`,
                        background: getRemainingDaysColor(remainingDays)
                      }}
                    ></div>
                    <span 
                      className={styles.timeText}
                      style={{ color: getRemainingDaysColor(remainingDays) }}
                    >
                      {expired ? 'Expired' : `${remainingDays} days remaining`}
                    </span>
                  </div>

                  {coupon.is_used && coupon.used_at && (
                    <div className={styles.usedInfo}>
                      <span>Used on {new Date(coupon.used_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* WhatsApp Reminder Button */}
                <div className={styles.couponActions}>
                  <button
                    className={styles.whatsappBtn}
                    onClick={() => handleWhatsAppReminder(coupon)}
                    title="Send WhatsApp Reminder"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    <span>
                      {expired ? 'Notify Expiry' : urgent ? 'Urgent Reminder' : 'Send Reminder'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <h3>No Coupons Found</h3>
          <p>No coupons have been claimed yet through the promotion page.</p>
        </div>
      )}

      {/* Create Custom Coupon Modal */}
      {showCreateModal && (
        <div className={styles.modal} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create Custom Coupon</h2>
              <button className={styles.closeBtn} onClick={() => setShowCreateModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Coupon Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  required
                  placeholder="e.g., SUMMER25"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={2}
                  placeholder="Brief description"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Discount Type *</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({...formData, discount_type: e.target.value as 'percentage' | 'flat'})}
                    required
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({...formData, discount_value: parseFloat(e.target.value)})}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Max Discount (₹)</label>
                  <input
                    type="number"
                    value={formData.max_discount || ''}
                    onChange={(e) => setFormData({...formData, max_discount: e.target.value ? parseFloat(e.target.value) : undefined})}
                    min="0"
                    placeholder="100"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Min Order (₹)</label>
                  <input
                    type="number"
                    value={formData.min_order_value}
                    onChange={(e) => setFormData({...formData, min_order_value: parseFloat(e.target.value) || 0})}
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usage_limit || ''}
                    onChange={(e) => setFormData({...formData, usage_limit: e.target.value ? parseInt(e.target.value) : undefined})}
                    min="1"
                    placeholder="Unlimited"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Expires At</label>
                  <input
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
