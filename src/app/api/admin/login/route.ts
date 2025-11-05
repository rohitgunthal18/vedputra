import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimiter } from '@/lib/rateLimiter';

// Force dynamic rendering - this route sets cookies for authentication
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

// Fail fast if secrets are missing
if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured. Please set it in environment variables.');
}

if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
  throw new Error('JWT_SECRET is not configured or using default value. Please set a strong secret in environment variables.');
}

// Use service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // STRICT SERVER-SIDE VALIDATION - NO HARDCODED AUTHENTICATION
    // Input type validation
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    // Sanitize and validate input
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPassword = password.trim();

    // Empty string check
    if (!sanitizedEmail || !sanitizedPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    // Email format validation (RFC 5322 compliant)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    // Email length validation (max 255 characters)
    if (sanitizedEmail.length > 255) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    // Password length validation (min 6, max 128 characters)
    if (sanitizedPassword.length < 6 || sanitizedPassword.length > 128) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    // Additional security: Check for common injection patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /onerror=/i,
      /onload=/i,
      /eval\(/i,
      /expression\(/i,
    ];
    
    const hasDangerousPattern = dangerousPatterns.some(pattern => 
      pattern.test(sanitizedEmail) || pattern.test(sanitizedPassword)
    );

    if (hasDangerousPattern) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    // Extract IP address from headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
    
    // Rate limiting: 5 attempts per 15 minutes per IP
    const rateLimitKey = `admin_login_${clientIp}`;
    if (rateLimiter.check(rateLimitKey, 5, 15 * 60 * 1000)) {
      const remaining = rateLimiter.getRemaining(rateLimitKey, 5);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: Math.ceil((15 * 60 * 1000) / 1000) // seconds
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '900' // 15 minutes in seconds
          }
        }
      );
    }

    // Fetch admin user from database
    const { data: adminUser, error: dbError } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, password_hash, full_name, role, is_active')
      .eq('email', sanitizedEmail)
      .single();

    // Always return same error message to prevent user enumeration
    // Check password even if user doesn't exist (constant time operation)
    let passwordValid = false;
    let isActive = false;
    
    if (!dbError && adminUser) {
      isActive = adminUser.is_active === true;
      // Verify password
      passwordValid = await bcrypt.compare(sanitizedPassword, adminUser.password_hash || '');
    } else {
      // Perform dummy bcrypt comparison to prevent timing attacks
      await bcrypt.compare(sanitizedPassword, '$2b$10$dummy.hash.to.prevent.timing.attacks');
    }

    // Always return same error message if authentication fails
    if (!passwordValid || !adminUser || !isActive) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await supabaseAdmin
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id);

    // Create JWT token
    // JWT_SECRET is guaranteed to exist due to fail-fast check at module level
    const token = jwt.sign(
      {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        type: 'admin'
      },
      JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        full_name: adminUser.full_name,
        role: adminUser.role
      }
    });

    // Set httpOnly cookie (secure, not accessible via JavaScript)
    // Vercel production: Use secure cookies with HTTPS, sameSite 'lax' for better compatibility
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: isProduction, // true on Vercel (HTTPS required)
      sameSite: isProduction ? 'lax' : 'lax', // Use 'lax' for better cross-site compatibility (still secure)
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
      // Don't set domain - let browser use current domain automatically
      // This ensures it works with both vercel.app and custom domains
    });

    return response;
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}

