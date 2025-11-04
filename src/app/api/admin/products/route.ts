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
 * GET /api/admin/products - Fetch all products (Admin only)
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

    // Fetch all products using service role (bypasses RLS)
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw productsError;
    }

    return NextResponse.json({
      success: true,
      products: products || [],
    });
  } catch (error) {
    console.error('Admin products GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products - Create a new product (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const productData = await request.json();

    // Input validation
    if (!productData.product_id || !productData.name || !productData.price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: product_id, name, price' },
        { status: 400 }
      );
    }

    // Validate image data
    if (productData.image_urls && Array.isArray(productData.image_urls)) {
      const totalSize = productData.image_urls.reduce((sum: number, img: string) => sum + img.length, 0);
      const totalSizeKB = Math.round(totalSize / 1024);
      
      if (totalSizeKB > 2048) { // 2MB limit
        return NextResponse.json(
          { success: false, error: 'Images are too large. Please compress them or use fewer images.' },
          { status: 400 }
        );
      }
      
      // Transform image_urls to proper format
      console.log(`Creating product with ${productData.image_urls.length} images (${totalSizeKB}KB total)`);
      productData.image_url = productData.image_urls[0]; // Primary image
      productData.images_json = productData.image_urls; // All images in JSONB
      // Don't use TEXT[] array to avoid PostgreSQL array element size limits
      productData.image_urls = null;
    } else if (productData.image_url) {
      productData.images_json = [productData.image_url];
      productData.image_urls = null;
    }

    // Insert product
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      product: data,
    });
  } catch (error: any) {
    console.error('Admin products POST API error:', error);
    
    const errorMessage = error?.message || 'Failed to create product';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/products - Update a product or toggle status (Admin only)
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
    const { id, action, productData } = body;

    // Input validation
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Toggle status action
    if (action === 'toggleStatus' && typeof productData?.is_active === 'boolean') {
      const { data, error } = await supabaseAdmin
        .from('products')
        .update({ is_active: productData.is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling product status:', error);
        throw error;
      }

      return NextResponse.json({
        success: true,
        product: data,
      });
    }

    // Update product action
    if (action === 'update' && productData) {
      // Validate image data
      if (productData.image_urls && Array.isArray(productData.image_urls)) {
        const totalSize = productData.image_urls.reduce((sum: number, img: string) => sum + img.length, 0);
        const totalSizeKB = Math.round(totalSize / 1024);
        
        if (totalSizeKB > 2048) { // 2MB limit
          return NextResponse.json(
            { success: false, error: 'Images are too large. Please compress them or use fewer images.' },
            { status: 400 }
          );
        }
      }

      // Build update object with all valid fields
      const updateData: any = {};
      
      // Map all basic fields from productData to updateData
      const allowedFields = [
        'product_id', 'name', 'description', 'long_description', 'price', 'weight', 
        'sku', 'category', 'badge', 'stock_quantity', 'is_active',
        'benefits', 'ingredients', 'how_to_use', 'storage_instructions', 'shelf_life',
        'certifications', 'faq', 'meta_title', 'meta_description', 'meta_keywords',
        'nutrition_facts', 'serving_size', 'origin_country', 'manufacturing_process',
        'safety_warnings', 'suitable_for'
      ];

      for (const field of allowedFields) {
        if (productData[field] !== undefined) {
          updateData[field] = productData[field];
        }
      }

      // Handle images - store in JSONB for better handling of large data
      if (productData.image_urls && Array.isArray(productData.image_urls) && productData.image_urls.length > 0) {
        console.log(`Updating product with ${productData.image_urls.length} images (${Math.round(productData.image_urls.reduce((sum: number, img: string) => sum + img.length, 0) / 1024)}KB total)`);
        
        updateData.image_url = productData.image_urls[0]; // Primary image
        updateData.images_json = productData.image_urls; // All images in JSONB
        // Don't use TEXT[] array to avoid PostgreSQL array element size limits
        updateData.image_urls = null;
      } else if (productData.image_url !== undefined) {
        updateData.image_url = productData.image_url;
        if (productData.image_url) {
          updateData.images_json = [productData.image_url];
        }
        updateData.image_urls = null;
      }

      // Always update timestamp
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabaseAdmin
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      return NextResponse.json({
        success: true,
        product: data,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action or missing data' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Admin products PATCH API error:', error);
    
    const errorMessage = error?.message || 'Failed to update product';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products - Delete a product (Admin only)
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
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Admin products DELETE API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

