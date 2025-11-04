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

// Use service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Verify admin authentication middleware
 */
async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    return { authenticated: false, error: 'Unauthorized - No token' };
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET!);

    // Verify admin is still active
    const { data: adminUser, error: dbError } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, role, is_active')
      .eq('id', decoded.id)
      .eq('email', decoded.email)
      .single();

    if (dbError || !adminUser || !adminUser.is_active) {
      return { authenticated: false, error: 'Unauthorized - User not found or inactive' };
    }

    return { authenticated: true, admin: adminUser };
  } catch (error) {
    return { authenticated: false, error: 'Unauthorized - Invalid token' };
  }
}

/**
 * GET /api/admin/reviews - Fetch all reviews or stats (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const productId = searchParams.get('productId');

    // Get stats
    if (action === 'stats') {
      const { data, error } = await supabaseAdmin
        .from('product_reviews')
        .select('is_approved, rating');

      if (error) throw error;

      const total = data?.length || 0;
      const approved = data?.filter(r => r.is_approved).length || 0;
      const pending = total - approved;
      const avgRating = data?.length 
        ? (data.reduce((sum, r) => sum + r.rating, 0) / data.length).toFixed(1)
        : '0.0';

      return NextResponse.json({
        success: true,
        stats: {
          total,
          approved,
          pending,
          avgRating: parseFloat(avgRating)
        }
      });
    }

    // Get all reviews (with optional product filter)
    let query = supabaseAdmin
      .from('product_reviews')
      .select(`
        *,
        products (
          product_id,
          name,
          image_url,
          images_json
        )
      `)
      .order('created_at', { ascending: false });

    if (productId) {
      // First, get the product UUID from product_id
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('product_id', productId)
        .single();

      if (productError || !product) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }

      query = query.eq('product_id', product.id);
    }

    const { data: reviews, error: reviewsError } = await query;

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      throw reviewsError;
    }

    return NextResponse.json({
      success: true,
      reviews: reviews || [],
    });
  } catch (error) {
    console.error('Admin reviews GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/reviews - Update review or toggle approval (Admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, action, reviewData } = body;

    // Input validation
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid review ID' },
        { status: 400 }
      );
    }

    // Toggle approval action
    if (action === 'toggleApproval' && typeof reviewData?.is_approved === 'boolean') {
      const { data, error } = await supabaseAdmin
        .from('product_reviews')
        .update({ 
          is_approved: reviewData.is_approved,
          published_at: reviewData.is_approved ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling review approval:', error);
        throw error;
      }

      return NextResponse.json({
        success: true,
        review: data,
      });
    }

    // Update review action
    if (action === 'update' && reviewData) {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // Validate and sanitize inputs
      if (reviewData.reviewer_name !== undefined) {
        if (typeof reviewData.reviewer_name !== 'string' || reviewData.reviewer_name.trim().length < 2) {
          return NextResponse.json(
            { success: false, error: 'Invalid reviewer name' },
            { status: 400 }
          );
        }
        updateData.reviewer_name = reviewData.reviewer_name.trim();
      }

      if (reviewData.rating !== undefined) {
        const rating = parseInt(reviewData.rating);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          return NextResponse.json(
            { success: false, error: 'Rating must be between 1 and 5' },
            { status: 400 }
          );
        }
        updateData.rating = rating;
      }

      if (reviewData.title !== undefined) {
        updateData.title = reviewData.title?.trim() || null;
      }

      if (reviewData.review_text !== undefined) {
        if (typeof reviewData.review_text !== 'string' || reviewData.review_text.trim().length < 10) {
          return NextResponse.json(
            { success: false, error: 'Review text must be at least 10 characters' },
            { status: 400 }
          );
        }
        updateData.review_text = reviewData.review_text.trim();
      }

      if (reviewData.is_approved !== undefined) {
        updateData.is_approved = reviewData.is_approved;
        updateData.published_at = reviewData.is_approved ? new Date().toISOString() : null;
      }

      const { data, error } = await supabaseAdmin
        .from('product_reviews')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating review:', error);
        throw error;
      }

      return NextResponse.json({
        success: true,
        review: data,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action or missing data' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Admin reviews PATCH API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reviews - Delete a review (Admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Input validation
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid review ID' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('product_reviews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting review:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Admin reviews DELETE API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

