'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header/Header';
import styles from './Promotion.module.css';
import { createPromotionCoupon } from '@/lib/api';

interface ClaimedCoupon {
  mobile: string;
  code: string;
  discount: number;
  maxDiscount: number;
  claimedAt: string;
  expiresAt: string;
}

export default function PromotionPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [isValidMobile, setIsValidMobile] = useState(true);
  const [coupon, setCoupon] = useState<ClaimedCoupon | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);

  useEffect(() => {
    // Check if user already claimed a coupon
    const claimed = localStorage.getItem('vedputra_promo_claimed');
    if (claimed) {
      const couponData = JSON.parse(claimed);
      setCoupon(couponData);
      setAlreadyClaimed(true);
    }
  }, []);

  const generateCouponCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `VED10-${randomNum}`;
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setMobile(value);
    if (value.length === 10) {
      setIsValidMobile(true);
    }
  };

  const handleClaimCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate mobile number
    if (mobile.length !== 10) {
      setIsValidMobile(false);
      return;
    }

    // Generate coupon
    setIsRevealing(true);

    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); // 30 days validity

      const couponCode = generateCouponCode();

      // Save to Supabase
      const result = await createPromotionCoupon({
        mobile: mobile,
        couponCode: couponCode,
        discountPercentage: 10,
        maxDiscount: 100,
        expiresAt: expiryDate.toISOString(),
      });

      if (result.success) {
        const newCoupon: ClaimedCoupon = {
          mobile: mobile,
          code: result.alreadyExists ? result.coupon.coupon_code : couponCode,
          discount: 10,
          maxDiscount: 100,
          claimedAt: result.coupon.created_at,
          expiresAt: result.coupon.expires_at,
        };

        // Save to localStorage for quick access
        localStorage.setItem('vedputra_promo_claimed', JSON.stringify(newCoupon));

        setCoupon(newCoupon);
        setAlreadyClaimed(result.alreadyExists || false);
      } else {
        alert('Failed to claim coupon. Please try again.');
      }
    } catch (error) {
      console.error('Error claiming coupon:', error);
      alert('Failed to claim coupon. Please try again.');
    } finally {
      setIsRevealing(false);
    }
  };

  const handleCopyCoupon = () => {
    if (coupon) {
      navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShopNow = () => {
    if (coupon) {
      // Save coupon to be auto-applied in cart
      localStorage.setItem('vedputra_auto_apply_coupon', coupon.code);
      router.push('/#products');
    }
  };

  const getDaysRemaining = () => {
    if (!coupon) return 0;
    const now = new Date();
    const expiry = new Date(coupon.expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      <div className={styles.promotionOverlay}>
        <div className={styles.promotionPopup}>
          
          {!coupon ? (
            // Claim Form
            <>
              <div className={styles.popupHeader}>
                <div className={styles.giftIcon}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 12 20 22 4 22 4 12" />
                    <rect x="2" y="7" width="20" height="5" />
                    <line x1="12" y1="22" x2="12" y2="7" />
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                  </svg>
                </div>
                <h1 className={styles.title}>Exclusive Offer!</h1>
                <p className={styles.subtitle}>Get Your Special Discount</p>
              </div>

              <div className={styles.offerBadge}>
                <span className={styles.percentage}>10% OFF</span>
                <span className={styles.maxDiscount}>Up to ₹100</span>
              </div>

              <form onSubmit={handleClaimCoupon} className={styles.claimForm}>
                <div className={styles.inputGroup}>
                  <label htmlFor="mobile">Enter Mobile Number</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.countryCode}>+91</span>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={mobile}
                      onChange={handleMobileChange}
                      placeholder="9876543210"
                      maxLength={10}
                      className={!isValidMobile ? styles.invalid : ''}
                      required
                      autoComplete="off"
                    />
                  </div>
                  {!isValidMobile && (
                    <span className={styles.errorText}>Enter valid 10-digit number</span>
                  )}
                </div>

                <button 
                  type="submit" 
                  className={styles.claimBtn}
                  disabled={isRevealing}
                >
                  {isRevealing ? (
                    <>
                      <div className={styles.spinner}></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    'Claim Discount'
                  )}
                </button>
              </form>

              <div className={styles.trustNote}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Secure • One-time offer • WhatsApp updates</span>
              </div>
            </>
          ) : (
            // Coupon Revealed
            <>
              <div className={styles.successIcon}>
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>

              <h2 className={styles.successTitle}>
                {alreadyClaimed ? 'Welcome Back!' : 'Success!'}
              </h2>
              <p className={styles.successSubtitle}>Your discount is ready</p>

              <div className={styles.couponBox}>
                <div className={styles.couponLabel}>COUPON CODE</div>
                <div className={styles.couponCode}>{coupon.code}</div>
                <button onClick={handleCopyCoupon} className={styles.copyBtn}>
                  {copied ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>

              <div className={styles.offerDetails}>
                <span>{coupon.discount}% OFF</span>
                <span>•</span>
                <span>Max ₹{coupon.maxDiscount}</span>
                <span>•</span>
                <span>{getDaysRemaining()} Days</span>
              </div>

              <button onClick={handleShopNow} className={styles.shopNowBtn}>
                Start Shopping
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              <div className={styles.whatsappNote}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>WhatsApp reminder enabled</span>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}

