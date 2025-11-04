'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { exportOrdersToCSV } from '@/lib/adminApi';
import styles from './Orders.module.css';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    setLoading(true);
    
    try {
      const url = filter !== 'all' 
        ? `/api/admin/orders?filter=${filter}`
        : '/api/admin/orders';
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success && result.orders) {
        setOrders(result.orders);
      } else if (response.status === 401) {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderUuid: string, newStatus: string) => {
    // SECURITY: Validate inputs
    if (!orderUuid || typeof orderUuid !== 'string') {
      alert('Invalid order ID');
      return;
    }
    
    if (!newStatus || typeof newStatus !== 'string') {
      alert('Invalid status');
      return;
    }

    const currentOrder = orders.find(o => o.id === orderUuid);
    if (!currentOrder) {
      alert('Order not found');
      return;
    }
    
    const oldStatus = currentOrder.order_status;
    
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: orderUuid, // Use UUID (id field), not order_id
          action: 'updateStatus',
          orderData: {
            oldStatus,
            newStatus
          }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        loadOrders();
        alert('Order status updated successfully');
      } else {
        alert('Failed to update order status: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      order.order_id.toLowerCase().includes(search) ||
      order.customer_name.toLowerCase().includes(search) ||
      order.customer_mobile.includes(search)
    );
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: '#1976D2',
      pending: '#EF6C00',
      processing: '#7B1FA2',
      shipped: '#00897B',
      delivered: '#2E7D32',
      cancelled: '#C62828',
    };
    return colors[status] || '#666';
  };

  return (
    <div className={styles.ordersPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Orders Management</h1>
          <p className={styles.pageSubtitle}>Manage and track all customer orders</p>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.exportBtn} 
            onClick={() => {
              const result = exportOrdersToCSV(filteredOrders);
              if (result.success) {
                alert('Orders exported successfully!');
              } else {
                alert('Failed to export orders');
              }
            }}
            disabled={filteredOrders.length === 0}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export CSV</span>
          </button>
          <button className={styles.refreshBtn} onClick={loadOrders}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{orders.length}</span>
          <span className={styles.statLabel}>Total Orders</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>
            {orders.filter(o => o.order_status === 'confirmed' || o.order_status === 'pending').length}
          </span>
          <span className={styles.statLabel}>Pending</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>
            {orders.filter(o => o.order_status === 'shipped').length}
          </span>
          <span className={styles.statLabel}>Shipped</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>
            {orders.filter(o => o.order_status === 'delivered').length}
          </span>
          <span className={styles.statLabel}>Delivered</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className={styles.controls}>
        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.filterActive : ''}`}
            onClick={() => setFilter('all')}
          >
            All Orders
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'confirmed' ? styles.filterActive : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            Confirmed
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'processing' ? styles.filterActive : ''}`}
            onClick={() => setFilter('processing')}
          >
            Processing
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'shipped' ? styles.filterActive : ''}`}
            onClick={() => setFilter('shipped')}
          >
            Shipped
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'delivered' ? styles.filterActive : ''}`}
            onClick={() => setFilter('delivered')}
          >
            Delivered
          </button>
        </div>

        <div className={styles.searchBox}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by Order ID, Name, or Mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading orders...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Mobile</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.order_id}</strong>
                  </td>
                  <td>{order.customer_name}</td>
                  <td>{order.customer_mobile}</td>
                  <td>{order.order_items?.length || 0} items</td>
                  <td className={styles.amount}>₹{parseFloat(order.total_amount).toFixed(2)}</td>
                  <td>
                    <span className={styles.paymentBadge}>
                      {order.payment_method.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <select
                      value={order.order_status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className={styles.statusSelect}
                      style={{ borderColor: getStatusColor(order.order_status) }}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => setSelectedOrder(order)}
                        title="View Order Details"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        View
                      </button>
                      <button
                        className={`${styles.labelBtn} ${order.label_printed ? styles.labelPrinted : ''}`}
                        onClick={() => router.push(`/admin/orders/label/${order.order_id}`)}
                        title={order.label_printed ? "View Shipping Label (Already Printed)" : "View Shipping Label"}
                      >
                        {order.label_printed ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                          </svg>
                        )}
                        {order.label_printed ? 'Printed' : 'Label'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <h3>No Orders Found</h3>
          <p>There are no orders matching your filters.</p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className={styles.modal} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Order Details</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.orderInfo}>
                <h3>Order #{selectedOrder.order_id}</h3>
                <p>Placed on {new Date(selectedOrder.created_at).toLocaleString()}</p>
                <div className={styles.trackingSection}>
                  <label htmlFor="trackingNumber">Tracking Number:</label>
                  <div className={styles.trackingInput}>
                    <input
                      id="trackingNumber"
                      type="text"
                      placeholder="Enter tracking number..."
                      defaultValue={selectedOrder.tracking_number || ''}
                      onBlur={async (e) => {
                        const newTracking = e.target.value.trim();
                        if (newTracking !== selectedOrder.tracking_number) {
                          try {
                            const response = await fetch('/api/admin/orders', {
                              method: 'PATCH',
                              credentials: 'include',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                id: selectedOrder.id,
                                action: 'updateTracking',
                                orderData: {
                                  tracking_number: newTracking
                                }
                              }),
                            });

                            const result = await response.json();
                            
                            if (result.success) {
                              alert('Tracking number updated successfully!');
                              loadOrders();
                            } else {
                              alert('Failed to update tracking number: ' + (result.error || 'Unknown error'));
                            }
                          } catch (error) {
                            console.error('Error updating tracking number:', error);
                            alert('Failed to update tracking number');
                          }
                        }
                      }}
                    />
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                <p><strong>Mobile:</strong> {selectedOrder.customer_mobile}</p>
                <p><strong>Email:</strong> {selectedOrder.customer_email || 'N/A'}</p>
              </div>

              <div className={styles.section}>
                <h4>Shipping Address</h4>
                <p>{selectedOrder.shipping_address}</p>
                {selectedOrder.shipping_locality && <p>{selectedOrder.shipping_locality}</p>}
                <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state}</p>
                <p>PIN: {selectedOrder.shipping_pincode}</p>
              </div>

              <div className={styles.section}>
                <h4>Order Items</h4>
                {selectedOrder.order_items?.map((item: any, index: number) => (
                  <div key={index} className={styles.orderItem}>
                    <span>{item.product_name} ({item.product_weight})</span>
                    <span>x{item.quantity}</span>
                    <span>₹{parseFloat(item.total_price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className={styles.section}>
                <h4>Payment Details</h4>
                <div className={styles.orderItem}>
                  <span>Subtotal</span>
                  <span>₹{parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className={styles.orderItem}>
                  <span>Shipping</span>
                  <span>{selectedOrder.shipping_charge === 0 ? 'FREE' : `₹${parseFloat(selectedOrder.shipping_charge).toFixed(2)}`}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className={`${styles.orderItem} ${styles.discount}`}>
                    <span>
                      Discount
                      {selectedOrder.coupon_code && (
                        <span className={styles.couponCode}> ({selectedOrder.coupon_code})</span>
                      )}
                    </span>
                    <span className={styles.discountAmount}>-₹{parseFloat(selectedOrder.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className={`${styles.orderItem} ${styles.total}`}>
                  <span><strong>Total</strong></span>
                  <span><strong>₹{parseFloat(selectedOrder.total_amount).toFixed(2)}</strong></span>
                </div>
                <div className={styles.orderItem}>
                  <span>Payment Method</span>
                  <span className={styles.paymentMethodBadge}>{selectedOrder.payment_method.toUpperCase()}</span>
                </div>
                <div className={styles.orderItem}>
                  <span>Payment Status</span>
                  <span className={`${styles.statusBadge} ${styles[selectedOrder.payment_status || 'pending']}`}>
                    {(selectedOrder.payment_status || 'pending').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

