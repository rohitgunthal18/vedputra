'use client';

import { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const [statsResponse, ordersResponse, messagesResponse] = await Promise.all([
        fetch('/api/admin/dashboard?action=stats', { method: 'GET', credentials: 'include' }),
        fetch('/api/admin/dashboard?action=recentOrders', { method: 'GET', credentials: 'include' }),
        fetch('/api/admin/dashboard?action=recentMessages', { method: 'GET', credentials: 'include' }),
      ]);

      // Check for authentication errors
      if (statsResponse.status === 401 || ordersResponse.status === 401 || messagesResponse.status === 401) {
        window.location.href = '/admin/login';
        return;
      }

      const statsResult = await statsResponse.json();
      const ordersResult = await ordersResponse.json();
      const messagesResult = await messagesResponse.json();

      // Handle errors gracefully
      if (!statsResult.success) {
        setError('Failed to load statistics. Please try again.');
        console.error('Stats API error:', statsResult.error);
      } else {
        setStats(statsResult.stats);
      }

      if (!ordersResult.success) {
        console.error('Orders API error:', ordersResult.error);
      } else {
        setRecentOrders(ordersResult.orders || []);
      }

      if (!messagesResult.success) {
        console.error('Messages API error:', messagesResult.error);
      } else {
        setRecentMessages(messagesResult.messages || []);
      }
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Format date consistently
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>Welcome back! Here's what's happening with your store.</p>
        </div>
        <button 
          className={styles.refreshBtn} 
          onClick={() => loadDashboardData(true)}
          disabled={refreshing || loading}
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className={refreshing ? styles.spinning : ''}
            style={refreshing ? { animation: 'spin 0.8s linear infinite' } : {}}
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Error Message */}
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

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {/* Total Orders */}
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{background: '#E3F2FD'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1976D2" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Orders</p>
            <h3 className={styles.statValue}>{stats?.totalOrders || 0}</h3>
            <p className={styles.statChange}>
              <span className={styles.changePositive}>+{stats?.todayOrders || 0}</span> today
            </p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{background: '#E8F5E9'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Revenue</p>
            <h3 className={styles.statValue}>₹{stats?.totalRevenue?.toFixed(2) || 0}</h3>
            <p className={styles.statChange}>
              ₹{stats?.monthlyRevenue?.toFixed(2) || 0} this month
            </p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{background: '#FFF3E0'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF6C00" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Pending Orders</p>
            <h3 className={styles.statValue}>{stats?.pendingOrders || 0}</h3>
            <p className={styles.statChange}>
              Requires attention
            </p>
          </div>
        </div>

        {/* New Messages */}
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{background: '#F3E5F5'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B1FA2" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>New Messages</p>
            <h3 className={styles.statValue}>{stats?.newMessages || 0}</h3>
            <p className={styles.statChange}>
              {stats?.totalMessages || 0} total messages
            </p>
          </div>
        </div>

        {/* Active Products */}
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{background: '#E0F2F1'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00897B" strokeWidth="2">
              <path d="M20 7h-9M14 17H5M20 7v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Active Products</p>
            <h3 className={styles.statValue}>{stats?.activeProducts || 0}</h3>
            <p className={styles.statChange}>
              {stats?.totalProducts || 0} total products
            </p>
          </div>
        </div>

        {/* Coupons */}
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{background: '#FCE4EC'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C2185B" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Active Coupons</p>
            <h3 className={styles.statValue}>{stats?.activeCoupons || 0}</h3>
            <p className={styles.statChange}>
              {stats?.usedCoupons || 0} used coupons
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className={styles.quickStats}>
        <div className={styles.quickStatItem}>
          <span className={styles.quickStatLabel}>Avg Order Value</span>
          <span className={styles.quickStatValue}>₹{stats?.averageOrderValue?.toFixed(2) || 0}</span>
        </div>
        <div className={styles.quickStatItem}>
          <span className={styles.quickStatLabel}>COD Orders</span>
          <span className={styles.quickStatValue}>{stats?.codOrders || 0}</span>
        </div>
        <div className={styles.quickStatItem}>
          <span className={styles.quickStatLabel}>Online Orders</span>
          <span className={styles.quickStatValue}>{stats?.onlineOrders || 0}</span>
        </div>
        <div className={styles.quickStatItem}>
          <span className={styles.quickStatLabel}>Completed Orders</span>
          <span className={styles.quickStatValue}>{stats?.completedOrders || 0}</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.activitySection}>
        {/* Recent Orders */}
        <div className={styles.activityCard}>
          <div className={styles.activityHeader}>
            <h3 className={styles.activityTitle}>Recent Orders</h3>
            <a href="/admin/orders" className={styles.viewAllLink}>View All</a>
          </div>
          <div className={styles.activityList}>
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </div>
                  <div className={styles.activityDetails}>
                    <p className={styles.activityName}>{order.order_id || 'N/A'}</p>
                    <p className={styles.activityMeta}>{order.customer_name || 'N/A'} • {order.customer_mobile || 'N/A'}</p>
                  </div>
                  <div className={styles.activityRight}>
                    <p className={styles.activityAmount}>₹{parseFloat(order.total_amount || 0).toFixed(2)}</p>
                    <span className={`${styles.statusBadge} ${styles[order.order_status] || styles.pending}`}>
                      {formatStatus(order.order_status || 'pending')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyState}>No recent orders</p>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className={styles.activityCard}>
          <div className={styles.activityHeader}>
            <h3 className={styles.activityTitle}>Recent Messages</h3>
            <a href="/admin/messages" className={styles.viewAllLink}>View All</a>
          </div>
          <div className={styles.activityList}>
            {recentMessages.length > 0 ? (
              recentMessages.map((message) => (
                <div key={message.id} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div className={styles.activityDetails}>
                    <p className={styles.activityName}>{message.name || 'N/A'}</p>
                    <p className={styles.activityMeta}>{message.email || 'N/A'}</p>
                  </div>
                  <div className={styles.activityRight}>
                    <p className={styles.activityTime}>{message.created_at ? formatDate(message.created_at) : 'N/A'}</p>
                    <span className={`${styles.statusBadge} ${styles[message.status] || styles.new}`}>
                      {formatStatus(message.status || 'new')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyState}>No recent messages</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

