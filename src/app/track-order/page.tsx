'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header/Header';
import styles from './TrackOrder.module.css';
import { getOrderByOrderId, getOrdersByMobile } from '@/lib/api';

interface OrderData {
  id: string;
  order_id: string;
  customer_name: string;
  customer_mobile: string;
  customer_email: string | null;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  subtotal: number;
  shipping_charge: number;
  discount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
  order_items: any[];
}

export default function TrackOrderPage() {
  const [searchType, setSearchType] = useState<'orderId' | 'mobile'>('orderId');
  const [searchValue, setSearchValue] = useState('');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [ordersList, setOrdersList] = useState<OrderData[]>([]);
  const [showOrdersList, setShowOrdersList] = useState(false);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setOrdersList([]);
    setShowOrdersList(false);
    setIsSearching(true);

    try {
      const trimmedValue = searchValue.trim();
      
      if (!trimmedValue) {
        setError('Please enter a valid Order ID or Mobile Number');
        setIsSearching(false);
        return;
      }

      if (searchType === 'orderId') {
        // Search by Order ID
        const result = await getOrderByOrderId(trimmedValue.toUpperCase());
        
        if (result.success && result.order) {
          setOrder(result.order);
        } else {
          setError('Order not found. Please check your Order ID and try again.');
        }
      } else {
        // Search by Mobile Number
        const cleanMobile = trimmedValue.replace(/\D/g, '');
        
        if (cleanMobile.length < 10) {
          setError('Please enter a valid 10-digit mobile number');
          setIsSearching(false);
          return;
        }
        
        const result = await getOrdersByMobile(cleanMobile);
        
        if (result.success && result.orders && result.orders.length > 0) {
          if (result.orders.length === 1) {
            // Only one order, show it directly
            setOrder(result.orders[0]);
          } else {
            // Multiple orders, show selection list
            setOrdersList(result.orders);
            setShowOrdersList(true);
          }
        } else {
          setError('No orders found for this mobile number. Please check and try again.');
        }
      }
    } catch (err) {
      console.error('Error searching for order:', err);
      setError('Failed to search for order. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleOrderSelect = (selectedOrder: OrderData) => {
    setOrder(selectedOrder);
    setShowOrdersList(false);
    setOrdersList([]);
  };

  const getOrderStatusInfo = () => {
    if (!order) return null;

    const status = order.order_status.toLowerCase();
    
    const statusMap: Record<string, { step: number; message: string; color: string }> = {
      'pending': { step: 1, message: 'Order Placed', color: 'confirmed' },
      'confirmed': { step: 1, message: 'Order Confirmed', color: 'confirmed' },
      'processing': { step: 2, message: 'Processing', color: 'processing' },
      'shipped': { step: 3, message: 'Shipped', color: 'shipped' },
      'out_for_delivery': { step: 3, message: 'Out for Delivery', color: 'shipped' },
      'delivered': { step: 4, message: 'Delivered', color: 'delivered' },
      'cancelled': { step: 0, message: 'Cancelled', color: 'cancelled' },
    };

    return statusMap[status] || { step: 1, message: 'Order Placed', color: 'confirmed' };
  };

  const orderStatus = order ? getOrderStatusInfo() : null;

  return (
    <>
      <Header />
      <div className={styles.trackOrderPage}>
        <div className="container">
        <div className={styles.pageHeader}>
          <h1>Track Your Order</h1>
          <p>Enter your Order ID or Mobile Number to track your order status</p>
        </div>

        {/* Search Form */}
        <div className={styles.searchCard}>
          <div className={styles.searchTypeToggle}>
            <button
              type="button"
              className={searchType === 'orderId' ? styles.active : ''}
              onClick={() => {
                setSearchType('orderId');
                setSearchValue('');
                setError('');
                setOrder(null);
              }}
            >
              Order ID
            </button>
            <button
              type="button"
              className={searchType === 'mobile' ? styles.active : ''}
              onClick={() => {
                setSearchType('mobile');
                setSearchValue('');
                setError('');
                setOrder(null);
              }}
            >
              Mobile Number
            </button>
          </div>

          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                id="searchValue"
                name="searchValue"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={searchType === 'orderId' ? 'Enter Order ID (e.g., VED12345678)' : 'Enter 10-digit Mobile Number'}
                maxLength={searchType === 'orderId' ? 11 : 10}
                required
                suppressHydrationWarning
                autoComplete="off"
              />
              <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <button type="submit" className={styles.searchBtn} disabled={isSearching}>
              {isSearching ? (
                <>
                  <div className={styles.btnSpinner}></div>
                  Searching...
                </>
              ) : (
                'Track Order'
              )}
            </button>
          </form>

          {error && (
            <div className={styles.errorMessage}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Orders List (when multiple orders found by mobile) */}
        {showOrdersList && ordersList.length > 0 && (
          <div className={styles.ordersListContainer}>
            <h3 className={styles.ordersListTitle}>
              {ordersList.length} order{ordersList.length > 1 ? 's' : ''} found for this mobile number
            </h3>
            <p className={styles.ordersListSubtitle}>Select an order to track</p>
            <div className={styles.ordersList}>
              {ordersList.map((orderItem) => (
                <div 
                  key={orderItem.id}
                  className={styles.orderListItem}
                  onClick={() => handleOrderSelect(orderItem)}
                >
                  <div className={styles.orderListItemHeader}>
                    <div>
                      <h4>Order #{orderItem.order_id}</h4>
                      <p className={styles.orderListItemDate}>
                        {new Date(orderItem.created_at).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <span className={`${styles.orderListStatus} ${styles[orderItem.order_status.toLowerCase()]}`}>
                      {orderItem.order_status}
                    </span>
                  </div>
                  <div className={styles.orderListItemDetails}>
                    <div className={styles.orderListItemInfo}>
                      <span className={styles.orderListLabel}>Items:</span>
                      <span>{orderItem.order_items?.length || 0} item(s)</span>
                    </div>
                    <div className={styles.orderListItemInfo}>
                      <span className={styles.orderListLabel}>Total:</span>
                      <span className={styles.orderListAmount}>₹{orderItem.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className={styles.orderListItemAction}>
                    <span>View Details</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Tracking Results */}
        {order && orderStatus && (
          <div className={styles.trackingResults}>
            {/* Order Header */}
            <div className={styles.orderHeader}>
              <div className={styles.orderHeaderLeft}>
                <h2>Order #{order.order_id}</h2>
                <p>Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className={styles.orderHeaderRight}>
                <span className={`${styles.statusBadge} ${styles[orderStatus.color]}`}>
                  {orderStatus.message}
                </span>
              </div>
            </div>

            {/* Order Timeline */}
            <div className={styles.timeline}>
              <div className={`${styles.timelineStep} ${orderStatus.step >= 1 ? styles.completed : ''}`}>
                <div className={styles.timelineIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className={styles.timelineContent}>
                  <h4>Order Confirmed</h4>
                  <p>Your order has been received</p>
                </div>
              </div>

              <div className={`${styles.timelineStep} ${orderStatus.step >= 2 ? styles.completed : ''}`}>
                <div className={styles.timelineIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <div className={styles.timelineContent}>
                  <h4>Processing</h4>
                  <p>We're preparing your order</p>
                </div>
              </div>

              <div className={`${styles.timelineStep} ${orderStatus.step >= 3 ? styles.completed : ''}`}>
                <div className={styles.timelineIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <div className={styles.timelineContent}>
                  <h4>Shipped</h4>
                  <p>Your order is on the way</p>
                </div>
              </div>

              <div className={`${styles.timelineStep} ${orderStatus.step >= 4 ? styles.completed : ''}`}>
                <div className={styles.timelineIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div className={styles.timelineContent}>
                  <h4>Delivered</h4>
                  <p>Order has been delivered</p>
                </div>
              </div>
            </div>

            {/* Order Details Grid */}
            <div className={styles.orderDetailsGrid}>
              {/* Shipping Address */}
              <div className={styles.detailCard}>
                <h3>Shipping Address</h3>
                <div className={styles.addressDetails}>
                  <p className={styles.addressName}>{order.customer_name}</p>
                  <p>{order.shipping_address}</p>
                  <p>{order.shipping_city}, {order.shipping_state}</p>
                  <p>PIN: {order.shipping_pincode}</p>
                  <p className={styles.addressPhone}>📱 {order.customer_mobile}</p>
                  {order.customer_email && <p>✉️ {order.customer_email}</p>}
                </div>
              </div>

              {/* Payment Info */}
              <div className={styles.detailCard}>
                <h3>Payment Details</h3>
                <div className={styles.paymentDetails}>
                  <p className={styles.paymentMethod}>
                    {order.payment_method === 'cod' ? '💵 Cash on Delivery' : '💳 ' + order.payment_method.toUpperCase()}
                  </p>
                  <p className={`${styles.paymentStatus} ${styles[order.payment_status]}`}>
                    Status: {order.payment_status}
                  </p>
                  <div className={styles.amountBreakdown}>
                    <div className={styles.amountRow}>
                      <span>Subtotal</span>
                      <span>₹{order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className={styles.amountRow}>
                      <span>Shipping</span>
                      <span>{order.shipping_charge === 0 ? 'FREE' : `₹${order.shipping_charge.toFixed(2)}`}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className={styles.amountRow}>
                        <span>Discount</span>
                        <span className={styles.discountText}>-₹{order.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className={styles.amountTotal}>
                      <span>Total</span>
                      <span>₹{order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className={styles.orderItems}>
              <h3>Order Items ({order.order_items?.length || 0})</h3>
              <div className={styles.itemsList}>
                {order.order_items && order.order_items.map((item: any) => (
                  <div key={item.id} className={styles.orderItem}>
                    <div className={styles.itemImage}>
                      <Image
                        src={item.product_image || '/images/placeholder.jpg'}
                        alt={item.product_name}
                        width={60}
                        height={60}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className={styles.itemDetails}>
                      <h4>{item.product_name}</h4>
                      <span className={styles.itemQty}>Qty: {item.quantity}</span>
                    </div>
                    <div className={styles.itemPrice}>
                      ₹{(item.unit_price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <Link href="/#products" className={styles.primaryBtn}>
                Continue Shopping
              </Link>
              <button onClick={() => window.print()} className={styles.secondaryBtn}>
                Print Details
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className={styles.helpSection}>
          <h3>Need Help?</h3>
          <p>If you're having trouble tracking your order, please contact our support team.</p>
          <Link href="/#contact" className={styles.contactLink}>
            Contact Support
          </Link>
        </div>
        </div>
      </div>
    </>
  );
}

