# 🎛️ Admin Dashboard Development Guide

This guide will help you build an admin dashboard to manage your Vedputra e-commerce store.

## 📊 Dashboard Overview

Your admin dashboard should allow you to:
- View and manage orders
- Update order status
- View contact messages
- Manage promotion coupons
- View analytics and statistics

## 🔐 Authentication Setup

### Option 1: Supabase Auth (Recommended)

1. **Enable Email Auth in Supabase**
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Email provider

2. **Create Admin User**
   ```sql
   -- In Supabase SQL Editor
   -- This will be done through Supabase Auth UI
   ```

3. **Install Supabase Auth Helpers**
   ```bash
   npm install @supabase/auth-helpers-nextjs
   ```

4. **Create Auth Context**
   ```typescript
   // src/context/AuthContext.tsx
   'use client';
   
   import { createContext, useContext, useEffect, useState } from 'react';
   import { supabase } from '@/lib/supabase';
   import { User } from '@supabase/supabase-js';
   
   interface AuthContextType {
     user: User | null;
     loading: boolean;
     signIn: (email: string, password: string) => Promise<any>;
     signOut: () => Promise<void>;
   }
   
   const AuthContext = createContext<AuthContextType | undefined>(undefined);
   
   export function AuthProvider({ children }: { children: React.ReactNode }) {
     const [user, setUser] = useState<User | null>(null);
     const [loading, setLoading] = useState(true);
   
     useEffect(() => {
       // Check active session
       supabase.auth.getSession().then(({ data: { session } }) => {
         setUser(session?.user ?? null);
         setLoading(false);
       });
   
       // Listen for auth changes
       const { data: { subscription } } = supabase.auth.onAuthStateChange(
         (_event, session) => {
           setUser(session?.user ?? null);
         }
       );
   
       return () => subscription.unsubscribe();
     }, []);
   
     const signIn = async (email: string, password: string) => {
       const { data, error } = await supabase.auth.signInWithPassword({
         email,
         password,
       });
       return { data, error };
     };
   
     const signOut = async () => {
       await supabase.auth.signOut();
     };
   
     return (
       <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
         {children}
       </AuthContext.Provider>
     );
   }
   
   export const useAuth = () => {
     const context = useContext(AuthContext);
     if (context === undefined) {
       throw new Error('useAuth must be used within an AuthProvider');
     }
     return context;
   };
   ```

### Option 2: Simple Password Protection

For a quick setup without full authentication:

```typescript
// src/app/admin/page.tsx
'use client';

import { useState } from 'react';

const ADMIN_PASSWORD = 'your-secure-password'; // Change this!

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
    } else {
      alert('Invalid password');
    }
  };

  if (isAuthenticated) {
    return <AdminDashboard />;
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter admin password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

## 📄 Dashboard Pages

### 1. Dashboard Home (`/admin`)

**Features:**
- Overview statistics
- Recent orders
- Quick actions

**Code Example:**
```typescript
// src/app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const result = await getDashboardStats();
    if (result.success) {
      setStats(result.stats);
    }
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{stats.totalOrders}</p>
        </div>
        
        <div className="stat-card">
          <h3>Pending Orders</h3>
          <p className="stat-value">{stats.pendingOrders}</p>
        </div>
        
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">₹{stats.totalRevenue.toFixed(2)}</p>
        </div>
        
        <div className="stat-card">
          <h3>New Messages</h3>
          <p className="stat-value">{stats.newMessages}</p>
        </div>
        
        <div className="stat-card">
          <h3>Coupons Used</h3>
          <p className="stat-value">{stats.usedCoupons} / {stats.totalCoupons}</p>
        </div>
      </div>
    </div>
  );
}
```

### 2. Orders Management (`/admin/orders`)

**Features:**
- View all orders
- Filter by status
- Update order status
- View order details

**Code Example:**
```typescript
// src/app/admin/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { updateOrderStatus } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    setLoading(true);
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('order_status', filter);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error loading orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const result = await updateOrderStatus(orderId, newStatus);
    if (result.success) {
      loadOrders(); // Reload orders
      alert('Order status updated successfully');
    } else {
      alert('Failed to update order status');
    }
  };

  return (
    <div className="orders-page">
      <h1>Orders Management</h1>
      
      {/* Filter */}
      <div className="filters">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('confirmed')}>Confirmed</button>
        <button onClick={() => setFilter('processing')}>Processing</button>
        <button onClick={() => setFilter('shipped')}>Shipped</button>
        <button onClick={() => setFilter('delivered')}>Delivered</button>
        <button onClick={() => setFilter('cancelled')}>Cancelled</button>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Mobile</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.order_id}</td>
                <td>{order.customer_name}</td>
                <td>{order.customer_mobile}</td>
                <td>₹{order.total_amount}</td>
                <td>{order.payment_method.toUpperCase()}</td>
                <td>
                  <select
                    value={order.order_status}
                    onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
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
                  <button onClick={() => viewOrderDetails(order.id)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

### 3. Contact Messages (`/admin/messages`)

**Code Example:**
```typescript
// src/app/admin/messages/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getContactMessages } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    const result = await getContactMessages();
    if (result.success) {
      setMessages(result.messages || []);
    }
    setLoading(false);
  };

  const markAsRead = async (messageId: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status: 'read' })
      .eq('id', messageId);

    if (!error) {
      loadMessages();
    }
  };

  return (
    <div className="messages-page">
      <h1>Contact Messages</h1>
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="messages-list">
          {messages.map((message) => (
            <div key={message.id} className={`message-card ${message.status}`}>
              <div className="message-header">
                <h3>{message.name}</h3>
                <span className="status-badge">{message.status}</span>
              </div>
              <p><strong>Email:</strong> {message.email}</p>
              <p><strong>Phone:</strong> {message.phone}</p>
              <p><strong>Message:</strong> {message.message}</p>
              <p><strong>Date:</strong> {new Date(message.created_at).toLocaleString()}</p>
              {message.status === 'new' && (
                <button onClick={() => markAsRead(message.id)}>Mark as Read</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 4. Promotion Coupons (`/admin/coupons`)

**Code Example:**
```typescript
// src/app/admin/coupons/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getPromotionCoupons } from '@/lib/api';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    const result = await getPromotionCoupons();
    if (result.success) {
      setCoupons(result.coupons || []);
    }
    setLoading(false);
  };

  const filteredCoupons = coupons.filter(coupon => {
    if (filter === 'used') return coupon.is_used;
    if (filter === 'unused') return !coupon.is_used;
    return true;
  });

  return (
    <div className="coupons-page">
      <h1>Promotion Coupons</h1>
      
      <div className="filters">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('used')}>Used</button>
        <button onClick={() => setFilter('unused')}>Unused</button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="coupons-table">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Mobile</th>
              <th>Discount</th>
              <th>Status</th>
              <th>Created</th>
              <th>Expires</th>
              <th>Used At</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoupons.map((coupon) => (
              <tr key={coupon.id}>
                <td><strong>{coupon.coupon_code}</strong></td>
                <td>{coupon.mobile}</td>
                <td>{coupon.discount_percentage}% (Max ₹{coupon.max_discount})</td>
                <td>
                  <span className={coupon.is_used ? 'used' : 'unused'}>
                    {coupon.is_used ? 'Used' : 'Unused'}
                  </span>
                </td>
                <td>{new Date(coupon.created_at).toLocaleDateString()}</td>
                <td>{new Date(coupon.expires_at).toLocaleDateString()}</td>
                <td>{coupon.used_at ? new Date(coupon.used_at).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

## 📊 Useful SQL Queries

### Get Orders with Customer Details
```sql
SELECT 
  o.order_id,
  o.customer_name,
  o.customer_mobile,
  o.total_amount,
  o.payment_method,
  o.order_status,
  o.created_at,
  COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id
ORDER BY o.created_at DESC;
```

### Get Revenue by Date
```sql
SELECT 
  DATE(created_at) as order_date,
  COUNT(*) as order_count,
  SUM(total_amount) as daily_revenue
FROM orders
WHERE order_status != 'cancelled'
GROUP BY DATE(created_at)
ORDER BY order_date DESC
LIMIT 30;
```

### Get Top Selling Products
```sql
SELECT 
  product_name,
  SUM(quantity) as total_sold,
  SUM(total_price) as total_revenue
FROM order_items
GROUP BY product_name
ORDER BY total_sold DESC;
```

### Get Coupon Usage Statistics
```sql
SELECT 
  COUNT(*) as total_coupons,
  COUNT(CASE WHEN is_used THEN 1 END) as used_coupons,
  COUNT(CASE WHEN NOT is_used THEN 1 END) as unused_coupons,
  ROUND(COUNT(CASE WHEN is_used THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) as usage_rate
FROM promotion_coupons;
```

## 🎨 Styling Tips

Create a consistent admin theme:

```css
/* admin-styles.css */
.admin-dashboard {
  padding: 2rem;
  background: #f5f5f5;
  min-height: 100vh;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #4A6741;
  margin: 0.5rem 0;
}

.orders-table {
  width: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.orders-table th {
  background: #4A6741;
  color: white;
  padding: 1rem;
  text-align: left;
}

.orders-table td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.new {
  background: #e3f2fd;
  color: #1976d2;
}

.status-badge.read {
  background: #f3e5f5;
  color: #7b1fa2;
}
```

## 🔒 Security Best Practices

1. **Always use RLS policies**
   - Restrict admin operations to authenticated users
   - Never expose sensitive data to public

2. **Validate user permissions**
   - Check user role before allowing admin actions
   - Use Supabase Auth for proper authentication

3. **Sanitize inputs**
   - Always validate and sanitize user inputs
   - Use parameterized queries

4. **Use HTTPS**
   - Always use HTTPS in production
   - Never expose API keys in client-side code

## 📱 Mobile Responsive

Make sure your admin dashboard is mobile-friendly:

```css
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .orders-table {
    font-size: 0.875rem;
  }
  
  .orders-table td,
  .orders-table th {
    padding: 0.5rem;
  }
}
```

## 🚀 Deployment

When deploying your admin dashboard:

1. **Set up proper authentication**
2. **Use environment variables for sensitive data**
3. **Enable RLS policies for admin tables**
4. **Set up proper CORS policies**
5. **Use HTTPS only**
6. **Implement rate limiting**
7. **Set up monitoring and logging**

---

## 📞 Need Help?

- Check Supabase documentation: https://supabase.com/docs
- Review the API functions in `src/lib/api.ts`
- Test queries in Supabase SQL Editor
- Check browser console for errors

---

## 🎉 You're Ready!

You now have all the tools and knowledge to build a powerful admin dashboard for your Vedputra e-commerce store! 🚀

