import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

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
    console.log('📊 Analytics API called');
    const authResult = await verifyAdmin(request);
    if (!authResult.authenticated) {
      console.error('❌ Analytics: Unauthorized access attempt');
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const days = parseInt(searchParams.get('days') || '30');
    
    console.log(`📊 Analytics action: ${action}, days: ${days}`);

    if (action === 'sales') {
      console.log(`📈 Fetching sales data for last ${days} days`);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select('created_at, total_amount, order_status')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching sales data:', error);
        throw error;
      }
      
      console.log(`✅ Found ${orders?.length || 0} orders for sales chart`);

      const dailySales = orders?.reduce((acc: any, order) => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, revenue: 0, orders: 0 };
        }
        acc[date].revenue += parseFloat(order.total_amount || 0);
        acc[date].orders += 1;
        return acc;
      }, {});

      return NextResponse.json({
        success: true,
        analytics: Object.values(dailySales || {})
      });
    }

    if (action === 'topProducts') {
      console.log('🏆 Fetching top products data');
      const { data: orderItems, error } = await supabaseAdmin
        .from('order_items')
        .select('product_id, quantity, unit_price');

      if (error) {
        console.error('❌ Error fetching order items:', error);
        throw error;
      }
      
      console.log(`✅ Found ${orderItems?.length || 0} order items`);

      const productStats = orderItems?.reduce((acc: any, item) => {
        if (!acc[item.product_id]) {
          acc[item.product_id] = {
            product_id: item.product_id,
            totalQuantity: 0,
            totalRevenue: 0,
          };
        }
        acc[item.product_id].totalQuantity += item.quantity;
        acc[item.product_id].totalRevenue += parseFloat(item.unit_price) * item.quantity;
        return acc;
      }, {});

      const topProducts = Object.values(productStats || {})
        .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
        .slice(0, 10);

      // Fetch product details
      const productIds = topProducts.map((p: any) => p.product_id);
      console.log(`🔍 Fetching details for ${productIds.length} products`);
      
      const { data: products, error: productsError } = await supabaseAdmin
        .from('products')
        .select('product_id, name, image_url, images_json')
        .in('product_id', productIds);
        
      if (productsError) {
        console.error('❌ Error fetching product details:', productsError);
      }

      const enrichedProducts = topProducts.map((p: any) => {
        const product = products?.find(pr => pr.product_id === p.product_id);
        return {
          ...p,
          name: product?.name || 'Unknown Product',
          image: product?.images_json?.[0] || product?.image_url || '/placeholder-product.svg',
        };
      });

      console.log(`✅ Returning ${enrichedProducts.length} top products`);
      return NextResponse.json({
        success: true,
        products: enrichedProducts
      });
    }

    if (action === 'dashboardStats') {
      console.log('📊 Fetching dashboard statistics');
      const [ordersData, messagesData, productsData, couponsData] = await Promise.all([
        supabaseAdmin.from('orders').select('order_status, total_amount, created_at, payment_method'),
        supabaseAdmin.from('contact_messages').select('status'),
        supabaseAdmin.from('products').select('is_active, stock_quantity'),
        supabaseAdmin.from('coupons').select('id, usage_count, usage_limit'),
      ]);

      const orders = ordersData.data || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      const confirmedOrders = orders.filter(o => o.order_status === 'confirmed');
      const pendingOrders = orders.filter(o => o.order_status === 'pending').length;
      const completedOrders = orders.filter(o => o.order_status === 'delivered').length;
      const todayOrders = orders.filter(o => new Date(o.created_at) >= today).length;
      const monthlyRevenue = orders.filter(o => new Date(o.created_at) >= thisMonth)
        .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Payment method breakdown
      const codOrders = orders.filter(o => o.payment_method === 'cod').length;
      const onlineOrders = orders.filter(o => o.payment_method === 'online').length;

      // Messages
      const unreadMessages = messagesData.data?.filter(m => m.status === 'new').length || 0;

      // Products
      const lowStockProducts = productsData.data?.filter(p => p.is_active && p.stock_quantity < 10).length || 0;

      // Coupons
      const coupons = couponsData.data || [];
      const totalCoupons = coupons.length;
      const usedCoupons = coupons.filter(c => c.usage_count > 0).length;
      const couponUsageRate = totalCoupons > 0 ? (usedCoupons / totalCoupons) * 100 : 0;

      console.log('✅ Dashboard stats calculated:', {
        totalOrders,
        totalRevenue: totalRevenue.toFixed(2),
        codOrders,
        onlineOrders,
      });

      return NextResponse.json({
        success: true,
        stats: {
          totalOrders,
          totalRevenue,
          pendingOrders,
          completedOrders,
          todayOrders,
          monthlyRevenue,
          averageOrderValue,
          unreadMessages,
          lowStockProducts,
          codOrders,
          onlineOrders,
          totalCoupons,
          usedCoupons,
          couponUsageRate,
        }
      });
    }

    console.warn(`⚠️ Invalid action requested: ${action}`);
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('❌ Admin analytics GET error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}

