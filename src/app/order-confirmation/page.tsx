'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header/Header';
import styles from './OrderConfirmation.module.css';
import { Order } from '@/types';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    console.log('🔍 Order confirmation page loaded with orderId:', orderId);
    
    if (!orderId) {
      console.error('❌ No orderId found in URL');
      router.push('/');
      return;
    }

    // Try localStorage first for instant display, then fallback to database
    const loadOrder = async () => {
      try {
        // First, try localStorage for instant display
        const localData = localStorage.getItem('vedputra_last_order');
        console.log('📦 localStorage data:', localData);
        
        if (localData) {
          const parsed = JSON.parse(localData);
          console.log('📋 Parsed order data:', parsed);
          
          if (parsed.orderId === orderId) {
            console.log('✅ Order loaded from localStorage');
            setOrder(parsed);
            clearCart();
            return; // Success! No need to fetch from database
          } else {
            console.warn('⚠️ Order ID mismatch:', { localStorage: parsed.orderId, url: orderId });
          }
        } else {
          console.log('ℹ️ No localStorage data found');
        }
        
        // If localStorage fails, fetch from database
        console.log('📦 Fetching order details from database:', orderId);
        
        const { getOrderByOrderId } = await import('@/lib/api');
        const result = await getOrderByOrderId(orderId);
        
        if (result.success && result.order) {
          console.log('✅ Order fetched from database');
          
          // Transform database order to match component format
          const transformedOrder: any = {
            orderId: result.order.order_id,
            orderDate: result.order.created_at,
            status: result.order.order_status,
            paymentMethod: result.order.payment_method,
            shippingAddress: {
              fullName: result.order.customer_name,
              mobile: result.order.customer_mobile,
              address: result.order.shipping_address,
              locality: result.order.shipping_locality || '',
              city: result.order.shipping_city,
              state: result.order.shipping_state,
              pincode: result.order.shipping_pincode,
              addressType: result.order.address_type || 'home',
              whatsappUpdates: result.order.whatsapp_updates || false,
            },
            orderSummary: {
              subtotal: parseFloat(result.order.subtotal),
              shipping: parseFloat(result.order.shipping_charge || '0'),
              discount: parseFloat(result.order.discount || '0'),
              total: parseFloat(result.order.total_amount),
            },
            items: result.order.order_items?.map((item: any) => ({
              productId: item.product_id,
              quantity: item.quantity,
              product: {
                name: item.product_name,
                price: parseFloat(item.unit_price),
                weight: item.product_weight || '',
                image: item.product_image || '/placeholder-product.svg',
                description: item.product_description || '',
              },
            })) || [],
            couponCode: result.order.coupon_code,
            paymentId: result.order.payment_transaction_id,
          };
          
          setOrder(transformedOrder);
          clearCart();
        } else {
          console.error('❌ Order not found in database');
          router.push('/');
        }
      } catch (error) {
        console.error('❌ Error loading order:', error);
        router.push('/');
      }
    };

    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const copyOrderId = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!order) {
    return (
      <>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
        </div>
      </>
    );
  }

  // Generate barcode URL using a free barcode API
  const barcodeUrl = `https://barcode.tec-it.com/barcode.ashx?data=${order.orderId}&code=Code128&translate-esc=on&dpi=96&imagetype=Gif&rotation=0&color=%23000000&bgcolor=%23ffffff&qunit=Mm&quiet=0`;

  return (
    <>
      <Header />
      <div className={styles.confirmationPage}>
        <div className="container">
          <div className={styles.confirmationCard}>
          {/* Success Header */}
          <div className={styles.successHeader}>
            <div className={styles.successIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#4A6741" />
                <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1>Order Placed Successfully!</h1>
          </div>

          {/* Order ID with Copy & Barcode */}
          <div className={styles.orderIdSection}>
            <div className={styles.orderIdBox}>
              <span className={styles.orderIdLabel}>Order ID:</span>
              <span className={styles.orderId}>{order.orderId}</span>
              <button onClick={copyOrderId} className={styles.copyBtn} title="Copy Order ID">
                {copied ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>
            <p className={styles.orderNote}>Copy this Order ID to track your order later</p>
            <div className={styles.barcodeContainer}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={barcodeUrl} alt={`Barcode for ${order.orderId}`} style={{height: '50px'}} />
            </div>
          </div>

          {/* Invoice - Two Column Layout */}
          <div className={styles.invoice}>
            <div className={styles.invoiceHeader}>
              <div className={styles.brand}>
                <h2>VEDPUTRA ORGANICS</h2>
                <p>Premium Organic Farm Products | Farm to Home</p>
              </div>
              <div className={styles.invoiceMeta}>
                <p><strong>Invoice Date:</strong> {new Date(order.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                <p><strong>Order ID:</strong> {order.orderId}</p>
              </div>
            </div>

            {/* Two Column Content */}
            <div className={styles.invoiceContent}>
              {/* Shipping Address */}
              <div className={styles.addressSection}>
                <h3>Ship To</h3>
                <p className={styles.addressName}>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                {order.shippingAddress.locality && <p>{order.shippingAddress.locality}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>PIN: {order.shippingAddress.pincode}</p>
                <p className={styles.addressPhone}>📱 {order.shippingAddress.mobile}</p>
              </div>

              {/* Order Meta */}
              <div className={styles.orderMeta}>
                <h3>Payment Details</h3>
                <p><strong>Payment Method:</strong></p>
                <p>{order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment'}</p>
                <p style={{marginTop: '8px'}}><strong>Order Status:</strong></p>
                <p style={{color: '#4A6741', fontWeight: 600}}>Confirmed</p>
              </div>
            </div>

            {/* Order Items */}
            <div className={styles.itemsSection}>
              <h3>Order Items ({order.items.length})</h3>
              <div className={styles.itemsList}>
                {order.items.map((item) => (
                  <div key={item.productId} className={styles.invoiceItem}>
                    <div className={styles.itemLeft}>
                      <div className={styles.itemImage}>
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={40}
                          height={40}
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div className={styles.itemInfo}>
                        <h4>{item.product.name}</h4>
                        <p>{item.product.weight}</p>
                      </div>
                    </div>
                    <div className={styles.itemRight}>
                      <div className={styles.itemQtyPrice}>
                        <span className={styles.itemQty}>Qty: {item.quantity}</span>
                        <span className={styles.itemUnitPrice}>@ ₹{item.product.price}</span>
                      </div>
                      <div className={styles.itemTotal}>₹{(item.product.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className={styles.summarySection}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>₹{order.orderSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping Charges</span>
                <span>{order.orderSummary.shipping === 0 ? 'FREE' : `₹${order.orderSummary.shipping.toFixed(2)}`}</span>
              </div>
              {order.orderSummary.discount > 0 && (
                <div className={styles.summaryRow}>
                  <span>Discount {(order as any).couponCode ? `(${(order as any).couponCode})` : ''}</span>
                  <span style={{color: '#2e7d32'}}>-₹{order.orderSummary.discount.toFixed(2)}</span>
                </div>
              )}
              <div className={styles.summaryTotal}>
                <span>Total Amount</span>
                <span>₹{order.orderSummary.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <Link href="/#products" className={styles.primaryBtn}>
              Continue Shopping
            </Link>
            <button
              onClick={() => window.print()}
              className={styles.secondaryBtn}
            >
              Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
        </div>
      </>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
