import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Force dynamic rendering - this route uses cookies for authentication
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

// Fail fast if secrets are missing
if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
}

if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
  throw new Error('JWT_SECRET is not configured or using default value');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      );
    }

    // Verify JWT token
    // JWT_SECRET is guaranteed to exist due to fail-fast check at module level
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET!);
    } catch (error) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Verify admin still exists and is active
    const { data: adminUser, error: dbError } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, full_name, role, is_active')
      .eq('id', decoded.id)
      .single();

    if (dbError || !adminUser || !adminUser.is_active) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Admin not found or inactive' },
        { status: 401 }
      );
    }

    // Return admin info
    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        full_name: adminUser.full_name,
        role: adminUser.role
      }
    });
  } catch (error: any) {
    console.error('Admin verify error:', error);
    return NextResponse.json(
      { success: false, authenticated: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}

