'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Checkout.module.css';
import { fetchPincodeData, validateMobileNumber, validatePincode } from '@/utils/pincodeApi';
import { ShippingAddress } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, getCartCount } = useCart();
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [pincodeError, setpincodeError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: '',
    mobile: '',
    pincode: '',
    address: '',
    locality: '',
    city: '',
    state: '',
    addressType: 'home',
    whatsappUpdates: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});
  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart');
    }
  }, [cart, router]);

  const subtotal = getCartTotal();
  const shipping = subtotal >= 999 ? 0 : 50;
  const total = subtotal + shipping;

  const handlePincodeChange = async (pincode: string) => {
    setFormData({ ...formData, pincode, city: '', state: '' });
    setpincodeError('');

    if (validatePincode(pincode)) {
      setIsLoadingPincode(true);
      const data = await fetchPincodeData(pincode);
      setIsLoadingPincode(false);

      if (data) {
        setFormData((prev) => ({
          ...prev,
          city: data.city,
          state: data.state,
        }));
      } else {
        setpincodeError('Invalid pincode or service not available');
      }
    }
  };

  const handleInputChange = (field: keyof ShippingAddress, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Required';
    if (!validateMobileNumber(formData.mobile)) newErrors.mobile = 'Invalid';
    if (!validatePincode(formData.pincode)) newErrors.pincode = 'Invalid';
    if (!formData.address.trim()) newErrors.address = 'Required';
    if (!formData.city.trim()) newErrors.city = 'Required';
    if (!formData.state.trim()) newErrors.state = 'Required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    const orderId = 'VED' + Date.now().toString().slice(-8);

    const orderData = {
      orderId,
      items: cart,
      shippingAddress: formData,
      orderSummary: { subtotal, shipping, discount: 0, total },
      paymentMethod,
      orderDate: new Date().toISOString(),
      status: 'pending',
    };

    localStorage.setItem('vedputra_last_order', JSON.stringify(orderData));

    setTimeout(() => {
      router.push(`/order-confirmation?orderId=${orderId}`);
    }, 1000);
  };

  if (cart.length === 0) return null;

  return (
    <div className={styles.checkoutPage}>
      <div className="container">
        <div className={styles.checkoutHeader}>
          <h1>Checkout</h1>
          <div className={styles.securityBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Secure SSL</span>
          </div>
        </div>

        <div className={styles.checkoutLayout}>
          <div className={styles.checkoutForm}>
            <form onSubmit={handlePlaceOrder}>
              {/* Contact Information */}
              <div className={styles.formSection}>
                <h2>Contact Information</h2>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="fullName">Full Name <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Enter your name"
                      className={errors.fullName ? styles.error : ''}
                    />
                    {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="mobile">Mobile <span className={styles.required}>*</span></label>
                    <input
                      type="tel"
                      id="mobile"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      placeholder="10-digit number"
                      maxLength={10}
                      className={errors.mobile ? styles.error : ''}
                    />
                    {errors.mobile && <span className={styles.errorText}>{errors.mobile}</span>}
                  </div>
                </div>

                {formData.mobile.length >= 10 && validateMobileNumber(formData.mobile) && (
                  <div className={styles.whatsappCheckbox}>
                    <input
                      type="checkbox"
                      id="whatsappUpdates"
                      checked={formData.whatsappUpdates}
                      onChange={(e) => handleInputChange('whatsappUpdates', e.target.checked)}
                    />
                    <label htmlFor="whatsappUpdates">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Get updates on WhatsApp
                    </label>
                  </div>
                )}
              </div>

              {/* Shipping Address */}
              <div className={styles.formSection}>
                <h2>Shipping Address</h2>
                
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="pincode">Pincode <span className={styles.required}>*</span></label>
                    <div className={styles.pincodeInput}>
                      <input
                        type="text"
                        id="pincode"
                        value={formData.pincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        placeholder="6-digit"
                        maxLength={6}
                        className={errors.pincode ? styles.error : ''}
                      />
                      {isLoadingPincode && (
                        <div className={styles.loader}>
                          <div className={styles.spinner}></div>
                        </div>
                      )}
                    </div>
                    {errors.pincode && <span className={styles.errorText}>{errors.pincode}</span>}
                    {pincodeError && <span className={styles.errorText}>{pincodeError}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="state">State <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="State"
                      className={errors.state ? styles.error : ''}
                      readOnly={!!formData.state}
                    />
                    {errors.state && <span className={styles.errorText}>{errors.state}</span>}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="address">Address <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="House no., building, street"
                    className={errors.address ? styles.error : ''}
                  />
                  {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="locality">Locality / Town</label>
                    <input
                      type="text"
                      id="locality"
                      value={formData.locality}
                      onChange={(e) => handleInputChange('locality', e.target.value)}
                      placeholder="Locality"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="city">City <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="City"
                      className={errors.city ? styles.error : ''}
                      readOnly={!!formData.city}
                    />
                    {errors.city && <span className={styles.errorText}>{errors.city}</span>}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className={styles.formSection}>
                <h2>Payment Method</h2>
                <div className={styles.paymentMethods}>
                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className={styles.paymentCard}>
                      <div className={styles.paymentIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17" />
                          <path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
                          <path d="m2 16 6 6" />
                          <circle cx="16" cy="9" r="2.9" />
                          <circle cx="6" cy="5" r="3" />
                        </svg>
                      </div>
                      <div className={styles.paymentContent}>
                        <div className={styles.paymentTitle}>Cash on Delivery</div>
                        <div className={styles.paymentBadges}>
                          <span className={styles.paymentBadge}>COD</span>
                        </div>
                      </div>
                    </div>
                  </label>

                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className={styles.paymentCard}>
                      <div className={styles.paymentIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                      </div>
                      <div className={styles.paymentContent}>
                        <div className={styles.paymentTitle}>Online Payment</div>
                        <div className={styles.paymentBadges}>
                          <span className={styles.paymentBadge}>UPI</span>
                          <span className={styles.paymentBadge}>Card</span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <button type="submit" className={styles.placeOrderBtn} disabled={isProcessing}>
                {isProcessing ? (
                  <><div className={styles.btnSpinner}></div>Processing...</>
                ) : (
                  `Place Order - ₹${total.toFixed(2)}`
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className={styles.orderSummary}>
            <div className={styles.summaryCard}>
              <h2>Order Summary</h2>

              <div className={styles.summaryItems}>
                <div className={styles.itemCount}>{getCartCount()} {getCartCount() === 1 ? 'Item' : 'Items'}</div>
                {cart.map((item) => (
                  <div key={item.productId} className={styles.summaryItem}>
                    <div className={styles.summaryItemImage}>
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={50}
                        height={50}
                        style={{ objectFit: 'cover' }}
                      />
                      <span className={styles.itemQty}>{item.quantity}</span>
                    </div>
                    <div className={styles.summaryItemDetails}>
                      <h4>{item.product.name}</h4>
                      <p>{item.product.weight}</p>
                    </div>
                    <div className={styles.summaryItemPrice}>
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.summaryDivider}></div>

              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
              </div>

              <div className={styles.summaryDivider}></div>

              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <Link href="/cart" className={styles.editCartLink}>Edit Cart</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
