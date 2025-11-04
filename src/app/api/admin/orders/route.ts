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
    const filter = searchParams.get('filter') || 'all';

    let query = supabaseAdmin
      .from('orders')
      .select('*, order_items(*)');

    if (filter !== 'all') {
      query = query.eq('order_status', filter);
    }

    query = query.order('created_at', { ascending: false });

    const { data: orders, error } = await query;

    if (error) throw error;
    return NextResponse.json({ success: true, orders: orders || [] });
  } catch (error) {
    console.error('Admin orders GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 });
    }

    const body = await request.json();
    const { id, action, orderData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Invalid order ID' }, { status: 400 });
    }

    if (action === 'updateStatus') {
      const { newStatus, oldStatus } = orderData;
      
      // SECURITY: Validate status values - prevent injection attacks
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!newStatus || typeof newStatus !== 'string' || !validStatuses.includes(newStatus)) {
        console.error('❌ Invalid order status attempted:', newStatus);
        return NextResponse.json({ success: false, error: 'Invalid status value' }, { status: 400 });
      }

      // SECURITY: Validate order ID format (UUID)
      if (!id || typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        console.error('❌ Invalid order ID format:', id);
        return NextResponse.json({ success: false, error: 'Invalid order ID format' }, { status: 400 });
      }

      // SECURITY: Fetch current order first to verify it exists and get current status
      const { data: currentOrder, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('id, order_status')
        .eq('id', id)
        .single();

      if (fetchError || !currentOrder) {
        console.error('❌ Order not found:', id, fetchError);
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }

      // SECURITY: Use actual current status from database, not from client
      const actualOldStatus = currentOrder.order_status;

      // Update order status
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .update({ 
          order_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (orderError) {
        console.error('❌ Error updating order status:', orderError);
        throw orderError;
      }

      // Add to status history (with actual old status from DB)
      const { error: historyError } = await supabaseAdmin
        .from('order_status_history')
        .insert({
          order_id: id,
          old_status: actualOldStatus,
          new_status: newStatus,
          changed_by: 'admin',
          notes: `Status changed from ${actualOldStatus} to ${newStatus}`,
        });

      if (historyError) {
        console.error('⚠️ Error adding to status history (non-critical):', historyError);
        // Don't fail the request if history fails, but log it
      }

      console.log(`✅ Order ${id} status updated: ${actualOldStatus} → ${newStatus}`);
      return NextResponse.json({ success: true, order });
    }

    if (action === 'updateTracking') {
      const { tracking_number } = orderData;

      // SECURITY: Validate order ID format (UUID)
      if (!id || typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        console.error('❌ Invalid order ID format:', id);
        return NextResponse.json({ success: false, error: 'Invalid order ID format' }, { status: 400 });
      }

      // Validate tracking number
      if (tracking_number && typeof tracking_number !== 'string') {
        return NextResponse.json({ success: false, error: 'Invalid tracking number format' }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
        .from('orders')
        .update({ 
          tracking_number: tracking_number || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, order: data });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin orders PATCH error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}

