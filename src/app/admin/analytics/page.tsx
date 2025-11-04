'use client';

import { useEffect, useState } from 'react';
import styles from './Analytics.module.css';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    
    try {
      const [statsResponse, salesResponse, productsResponse] = await Promise.all([
        fetch('/api/admin/analytics?action=dashboardStats', { method: 'GET', credentials: 'include' }),
        fetch(`/api/admin/analytics?action=sales&days=${timeRange}`, { method: 'GET', credentials: 'include' }),
        fetch('/api/admin/analytics?action=topProducts', { method: 'GET', credentials: 'include' }),
      ]);

      const statsResult = await statsResponse.json();
      const salesResult = await salesResponse.json();
      const productsResult = await productsResponse.json();

      if (statsResponse.status === 401 || salesResponse.status === 401 || productsResponse.status === 401) {
        window.location.href = '/admin/login';
        return;
      }

      if (statsResult.success) setStats(statsResult.stats);
      if (salesResult.success) setSalesData(salesResult.analytics || []);
      if (productsResult.success) setTopProducts(productsResult.products || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = Math.max(...salesData.map((d: any) => d.revenue), 1);
  const maxOrders = Math.max(...salesData.map((d: any) => d.orders), 1);

  return (
    <div className={styles.analyticsPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Analytics & Reports</h1>
          <p className={styles.pageSubtitle}>Track your business performance and insights</p>
        </div>
        <div className={styles.headerActions}>
          <select 
            className={styles.timeSelect}
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
          <button className={styles.refreshBtn} onClick={loadAnalytics}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricIcon} style={{background: '#E3F2FD'}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1976D2" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className={styles.metricContent}>
                <p className={styles.metricLabel}>Total Revenue</p>
                <h2 className={styles.metricValue}>₹{stats?.totalRevenue?.toFixed(2) || 0}</h2>
                <p className={styles.metricChange}>
                  <span className={styles.positive}>+₹{stats?.monthlyRevenue?.toFixed(2) || 0}</span> this month
                </p>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricIcon} style={{background: '#E8F5E9'}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <div className={styles.metricContent}>
                <p className={styles.metricLabel}>Total Orders</p>
                <h2 className={styles.metricValue}>{stats?.totalOrders || 0}</h2>
                <p className={styles.metricChange}>
                  <span className={styles.positive}>+{stats?.todayOrders || 0}</span> today
                </p>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricIcon} style={{background: '#F3E5F5'}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7B1FA2" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className={styles.metricContent}>
                <p className={styles.metricLabel}>Avg Order Value</p>
                <h2 className={styles.metricValue}>₹{stats?.averageOrderValue?.toFixed(2) || 0}</h2>
                <p className={styles.metricChange}>Per order</p>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricIcon} style={{background: '#FFF3E0'}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF6C00" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <div className={styles.metricContent}>
                <p className={styles.metricLabel}>Coupon Usage</p>
                <h2 className={styles.metricValue}>{stats?.couponUsageRate?.toFixed(1) || 0}%</h2>
                <p className={styles.metricChange}>
                  {stats?.usedCoupons || 0} / {stats?.totalCoupons || 0} used
                </p>
              </div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className={styles.chartSection}>
            <div className={styles.chartHeader}>
              <h3>Revenue Trend</h3>
              <span className={styles.chartPeriod}>Last {timeRange} Days</span>
            </div>
            <div className={styles.chart}>
              {salesData.length > 0 ? (
                <div className={styles.barChart}>
                  {salesData.map((day: any, index: number) => (
                    <div key={index} className={styles.barContainer}>
                      <div
                        className={styles.bar}
                        style={{
                          height: `${(day.revenue / maxRevenue) * 100}%`,
                          background: `linear-gradient(to top, var(--primary-green), var(--primary-light))`
                        }}
                        title={`₹${day.revenue.toFixed(2)}`}
                      >
                        <span className={styles.barValue}>₹{day.revenue.toFixed(0)}</span>
                      </div>
                      <span className={styles.barLabel}>
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noData}>No sales data available</div>
              )}
            </div>
          </div>

          {/* Two Column Section */}
          <div className={styles.twoColumnSection}>
            {/* Top Products */}
            <div className={styles.chartSection}>
              <div className={styles.chartHeader}>
                <h3>Top Selling Products</h3>
              </div>
              <div className={styles.productList}>
                {topProducts.length > 0 ? (
                  topProducts.map((product: any, index: number) => {
                    const maxQty = topProducts[0]?.totalQuantity || 1;
                    return (
                      <div key={index} className={styles.productItem}>
                        <div className={styles.productRank}>#{index + 1}</div>
                        <div className={styles.productInfo}>
                          <h4>{product.name}</h4>
                          <div className={styles.productStats}>
                            <span>{product.totalQuantity} units sold</span>
                            <span className={styles.productRevenue}>₹{product.totalRevenue.toFixed(2)}</span>
                          </div>
                          <div className={styles.productBar}>
                            <div
                              className={styles.productBarFill}
                              style={{ width: `${(product.totalQuantity / maxQty) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.noData}>No product data available</div>
                )}
              </div>
            </div>

            {/* Order Status Breakdown */}
            <div className={styles.chartSection}>
              <div className={styles.chartHeader}>
                <h3>Order Status Breakdown</h3>
              </div>
              <div className={styles.statusList}>
                <div className={styles.statusItem}>
                  <div className={styles.statusDot} style={{background: '#1976D2'}}></div>
                  <span className={styles.statusLabel}>Confirmed</span>
                  <span className={styles.statusValue}>{stats?.pendingOrders || 0}</span>
                </div>
                <div className={styles.statusItem}>
                  <div className={styles.statusDot} style={{background: '#2E7D32'}}></div>
                  <span className={styles.statusLabel}>Delivered</span>
                  <span className={styles.statusValue}>{stats?.completedOrders || 0}</span>
                </div>
                <div className={styles.statusItem}>
                  <div className={styles.statusDot} style={{background: '#EF6C00'}}></div>
                  <span className={styles.statusLabel}>COD Orders</span>
                  <span className={styles.statusValue}>{stats?.codOrders || 0}</span>
                </div>
                <div className={styles.statusItem}>
                  <div className={styles.statusDot} style={{background: '#7B1FA2'}}></div>
                  <span className={styles.statusLabel}>Online Orders</span>
                  <span className={styles.statusValue}>{stats?.onlineOrders || 0}</span>
                </div>
              </div>

              {/* Payment Method Pie */}
              <div className={styles.pieChart}>
                <svg viewBox="0 0 200 200" className={styles.pieSvg}>
                  {stats?.codOrders || stats?.onlineOrders ? (
                    <>
                      <circle cx="100" cy="100" r="80" fill="#EF6C00" />
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="transparent"
                        stroke="#7B1FA2"
                        strokeWidth="160"
                        strokeDasharray={`${((stats.onlineOrders / (stats.codOrders + stats.onlineOrders)) * 502.65)} 502.65`}
                        transform="rotate(-90 100 100)"
                      />
                      <text x="100" y="95" textAnchor="middle" className={styles.pieLabel}>Payment</text>
                      <text x="100" y="115" textAnchor="middle" className={styles.pieValue}>Methods</text>
                    </>
                  ) : (
                    <text x="100" y="105" textAnchor="middle" className={styles.noDataText}>No data</text>
                  )}
                </svg>
                <div className={styles.pieLegend}>
                  <div className={styles.legendItem}>
                    <span className={styles.legendDot} style={{background: '#EF6C00'}}></span>
                    <span>COD ({stats?.codOrders || 0})</span>
                  </div>
                  <div className={styles.legendItem}>
                    <span className={styles.legendDot} style={{background: '#7B1FA2'}}></span>
                    <span>Online ({stats?.onlineOrders || 0})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

