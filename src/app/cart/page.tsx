'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header/Header';
import styles from './Cart.module.css';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string; discount: number; type: string} | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? (subtotal >= 999 ? 0 : 50) : 0;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = subtotal + shipping - discount;

  // Load persisted coupon on mount
  useEffect(() => {
    const persistedCoupon = localStorage.getItem('vedputra_applied_coupon');
    if (persistedCoupon) {
      const couponData = JSON.parse(persistedCoupon);
      setAppliedCoupon(couponData);
    }
  }, []);

  // Auto-apply coupon from promotion page
  useEffect(() => {
    const autoApplyCoupon = localStorage.getItem('vedputra_auto_apply_coupon');
    if (autoApplyCoupon && subtotal > 0 && !appliedCoupon) {
      const code = autoApplyCoupon.toUpperCase();
      handleApplyCouponWithValidation(code);
      localStorage.removeItem('vedputra_auto_apply_coupon');
    }
  }, [subtotal, appliedCoupon]);

  // Persist coupon whenever it changes
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('vedputra_applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('vedputra_applied_coupon');
    }
  }, [appliedCoupon]);

  const handleApplyCouponWithValidation = async (code: string) => {
    if (!code.trim()) return;

    setIsValidating(true);
    
    try {
      // Import validateCoupon from api
      const { validateCoupon } = await import('@/lib/api');
      const result = await validateCoupon(code, subtotal);
      
      if (result.valid) {
        setAppliedCoupon({ 
          code: code.toUpperCase(), 
          discount: result.discount || 0,
          type: result.type || 'general',
        });
        setCouponCode('');
      } else {
        alert(result.message || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      alert('Error validating coupon. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleApplyCoupon = () => {
    handleApplyCouponWithValidation(couponCode.trim().toUpperCase());
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    localStorage.removeItem('vedputra_applied_coupon');
  };

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <div className={styles.emptyCart}>
          <div className="container">
            <div className={styles.emptyCartContent}>
              <div className={styles.emptyCartIcon}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <h1>Your Cart is Empty</h1>
            <p>Looks like you haven&apos;t added anything to your cart yet.</p>
            <Link href="/#products" className={styles.continueShoppingBtn}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.cartPage}>
      <div className="container">
        <div className={styles.cartHeader}>
          <h1>Shopping Cart</h1>
          <p>{getCartCount()} {getCartCount() === 1 ? 'item' : 'items'}</p>
        </div>

        <div className={styles.cartLayout}>
          <div className={styles.cartItems}>
            {cart.map((item) => (
              <div key={item.productId} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    width={120}
                    height={120}
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                <div className={styles.itemDetails}>
                  <h3>{item.product.name}</h3>
                  <p className={styles.itemWeight}>{item.product.weight}</p>
                  <p className={styles.itemDescription}>{item.product.description}</p>
                  
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.productId)}
                  >
                    Remove
                  </button>
                </div>

                <div className={styles.itemActions}>
                  <div className={styles.quantityControl}>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className={styles.itemPrice}>
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.cartSummary}>
            <div className={styles.summaryCard}>
              <h2>Order Summary</h2>
              
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
              </div>

              {discount > 0 && (
                <div className={styles.summaryRow}>
                  <span>Discount</span>
                  <span style={{color: '#2e7d32'}}>-₹{discount.toFixed(2)}</span>
                </div>
              )}

              {subtotal < 999 && subtotal > 0 && (
                <div className={styles.freeShippingNotice}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <span>Add ₹{(999 - subtotal).toFixed(2)} more for FREE shipping</span>
                </div>
              )}

              {/* Coupon Section */}
              <div className={styles.couponSection}>
                {!appliedCoupon ? (
                  <div className={styles.couponInput}>
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && !isValidating && handleApplyCoupon()}
                      disabled={isValidating}
                    />
                    <button onClick={handleApplyCoupon} disabled={isValidating}>
                      {isValidating ? 'Validating...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className={styles.couponApplied}>
                    <span>🎉 {appliedCoupon.code} applied! Saved ₹{discount.toFixed(2)}</span>
                    <button onClick={handleRemoveCoupon}>Remove</button>
                  </div>
                )}
              </div>

              <div className={styles.summaryDivider}></div>

              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <Link href="/checkout" className={styles.checkoutBtn}>
                Proceed to Checkout
              </Link>

              <Link href="/#products" className={styles.continueShopping}>
                Continue Shopping
              </Link>

              <div className={styles.trustBadges}>
                <div className={styles.trustBadge}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Secure Checkout</span>
                </div>
                <div className={styles.trustBadge}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

