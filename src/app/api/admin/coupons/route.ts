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
    const type = searchParams.get('type');

    if (type === 'promotion') {
      const { data: promoCoupons, error } = await supabaseAdmin
        .from('promotion_coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ success: true, coupons: promoCoupons || [] });
    }

    const { data: generalCoupons, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, coupons: generalCoupons || [] });
  } catch (error) {
    console.error('Admin coupons GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 });
    }

    const couponData = await request.json();

    if (!couponData.code || !couponData.discount_type || !couponData.discount_value) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // SECURITY: Validate and sanitize input data
    if (!couponData.code || typeof couponData.code !== 'string' || couponData.code.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Coupon code must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (!couponData.discount_type || !['percentage', 'flat'].includes(couponData.discount_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid discount type. Must be "percentage" or "flat"' },
        { status: 400 }
      );
    }

    if (!couponData.discount_value || parseFloat(couponData.discount_value) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Discount value must be greater than 0' },
        { status: 400 }
      );
    }

    // SECURITY: Use correct column names from database schema
    // Database columns: code, description, discount_type, discount_value, max_discount,
    // min_order_value, usage_limit, is_active, expires_at, created_at, updated_at, created_by
    const insertData: any = {
      code: couponData.code.toUpperCase().trim(),
      description: couponData.description || null,
      discount_type: couponData.discount_type,
      discount_value: parseFloat(couponData.discount_value),
      max_discount: couponData.max_discount ? parseFloat(couponData.max_discount) : null,
      min_order_value: couponData.min_order_value || couponData.min_purchase || 0, // Correct column: min_order_value
      usage_limit: couponData.usage_limit || couponData.max_uses || null, // Correct column: usage_limit (not max_usages)
      is_active: couponData.is_active !== undefined ? Boolean(couponData.is_active) : true,
      expires_at: couponData.expires_at || couponData.valid_until || null, // Correct column: expires_at
      created_by: 'admin', // Default value
    };

    // SECURITY: Validate numeric values
    if (insertData.discount_value <= 0) {
      return NextResponse.json(
        { success: false, error: 'Discount value must be greater than 0' },
        { status: 400 }
      );
    }

    if (insertData.max_discount !== null && insertData.max_discount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Max discount must be greater than 0 if provided' },
        { status: 400 }
      );
    }

    if (insertData.usage_limit !== null && insertData.usage_limit <= 0) {
      return NextResponse.json(
        { success: false, error: 'Usage limit must be greater than 0 if provided' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, coupon: data });
  } catch (error: any) {
    console.error('Admin coupons POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create coupon' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 });
    }

    const body = await request.json();
    const { id, action, couponData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Invalid coupon ID' }, { status: 400 });
    }

    if (action === 'toggleStatus' && typeof couponData?.is_active === 'boolean') {
      const { data, error } = await supabaseAdmin
        .from('coupons')
        .update({ is_active: couponData.is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, coupon: data });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin coupons PATCH error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Invalid coupon ID' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Admin coupons DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

