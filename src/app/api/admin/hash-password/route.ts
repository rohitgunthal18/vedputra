import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// One-time route to hash existing admin password
// Remove this after password is hashed
export async function POST(request: NextRequest) {
  try {
    // Secure this endpoint - only allow from server or with secret
    const { password, secret } = await request.json();
    
    if (secret !== process.env.ADMIN_SETUP_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update admin user password
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .update({ password_hash: hashedPassword })
      .eq('email', 'admin@vedputra.in')
      .select();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password hashed successfully'
    });
  } catch (error: any) {
    console.error('Hash password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to hash password' },
      { status: 500 }
    );
  }
}

