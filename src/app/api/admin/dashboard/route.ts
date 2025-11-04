import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Force dynamic rendering - this route uses cookies for authentication
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
}

if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
  throw new Error('JWT_SECRET is not configured or using default value');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return { authenticated: false, error: 'Unauthorized' };

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET!);
    const { data: adminUser, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, is_active')
      .eq('id', decoded.id)
      .single();

    if (error || !adminUser || !adminUser.is_active) {
      return { authenticated: false, error: 'Unauthorized' };
    }
    return { authenticated: true, admin: adminUser };
  } catch (error) {
    return { authenticated: false, error: 'Unauthorized' };
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      // Fetch all required data in parallel for better performance
      // Handle errors gracefully - if a table doesn't exist or query fails, use empty array
      const [ordersResult, messagesResult, productsResult, couponsResult, promoCouponsResult] = await Promise.allSettled([
        supabaseAdmin.from('orders').select('order_status, total_amount, payment_method, created_at'),
        supabaseAdmin.from('contact_messages').select('status, created_at'),
        supabaseAdmin.from('products').select('is_active, stock_quantity'),
        supabaseAdmin.from('coupons').select('id, is_active, usage_count, expires_at'),
        supabaseAdmin.from('promotion_coupons').select('id, is_used, expires_at'),
      ]);

      // Extract data safely, defaulting to empty array if query failed
      const orders = (ordersResult.status === 'fulfilled' && !ordersResult.value.error) ? (ordersResult.value.data || []) : [];
      const messages = (messagesResult.status === 'fulfilled' && !messagesResult.value.error) ? (messagesResult.value.data || []) : [];
      const products = (productsResult.status === 'fulfilled' && !productsResult.value.error) ? (productsResult.value.data || []) : [];
      const coupons = (couponsResult.status === 'fulfilled' && !couponsResult.value.error) ? (couponsResult.value.data || []) : [];
      const promoCoupons = (promoCouponsResult.status === 'fulfilled' && !promoCouponsResult.value.error) ? (promoCouponsResult.value.data || []) : [];

      // Current date calculations
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Order statistics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) || 0;
      const pendingOrders = orders.filter(o => o.order_status === 'pending' || o.order_status === 'confirmed').length || 0;
      const completedOrders = orders.filter(o => o.order_status === 'delivered').length || 0;
      
      // Today's orders count
      const todayOrders = orders.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate >= todayStart;
      }).length || 0;

      // Monthly revenue
      const monthlyRevenue = orders
        .filter(o => {
          const orderDate = new Date(o.created_at);
          return orderDate >= monthStart && o.order_status !== 'cancelled';
        })
        .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) || 0;

      // Payment method statistics
      const codOrders = orders.filter(o => o.payment_method === 'cod' && o.order_status !== 'cancelled').length || 0;
      const onlineOrders = orders.filter(o => o.payment_method === 'online' && o.order_status !== 'cancelled').length || 0;

      // Average order value
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Message statistics
      const newMessages = messages.filter(m => m.status === 'new').length || 0;
      const totalMessages = messages.length || 0;

      // Product statistics
      const activeProducts = products.filter(p => p.is_active === true).length || 0;
      const totalProducts = products.length || 0;

      // Coupon statistics (general coupons)
      const activeCoupons = coupons.filter(c => {
        if (!c.is_active) return false;
        if (c.expires_at) {
          const expiresAt = new Date(c.expires_at);
          return expiresAt > now;
        }
        return true;
      }).length || 0;

      // Used coupons count (promotion coupons)
      const usedCoupons = promoCoupons.filter(c => c.is_used === true).length || 0;

      return NextResponse.json({
        success: true,
        stats: {
          totalOrders,
          todayOrders,
          totalRevenue,
          monthlyRevenue,
          pendingOrders,
          completedOrders,
          newMessages,
          totalMessages,
          activeProducts,
          totalProducts,
          activeCoupons,
          usedCoupons,
          averageOrderValue,
          codOrders,
          onlineOrders,
        }
      });
    }

    if (action === 'recentOrders') {
      const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return NextResponse.json({ success: true, orders: orders || [] });
    }

    if (action === 'recentMessages') {
      const { data: messages, error } = await supabaseAdmin
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return NextResponse.json({ success: true, messages: messages || [] });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin dashboard GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

