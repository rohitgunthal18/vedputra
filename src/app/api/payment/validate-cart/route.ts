import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * CART VALIDATION ENDPOINT
 * Pre-validate cart before payment to catch issues early
 */
export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    const validationResults = [];
    
    for (const item of items) {
      // Fetch product from database
      const { data: product, error } = await supabase
        .from('products')
        .select('product_id, name, price, stock_quantity, is_active')
        .eq('product_id', item.productId)
        .single();

      if (error || !product) {
        validationResults.push({
          productId: item.productId,
          valid: false,
          error: `Product ID "${item.productId}" not found in database`,
          suggestion: 'This product may have been removed. Please refresh the page and try again.',
        });
        continue;
      }

      if (!product.is_active) {
        validationResults.push({
          productId: item.productId,
          valid: false,
          error: `${product.name} is no longer available`,
        });
        continue;
      }

      if (product.stock_quantity !== null && product.stock_quantity < item.quantity) {
        validationResults.push({
          productId: item.productId,
          valid: false,
          error: `Insufficient stock for ${product.name}. Only ${product.stock_quantity} available.`,
        });
        continue;
      }

      validationResults.push({
        productId: item.productId,
        valid: true,
        name: product.name,
        price: parseFloat(product.price),
        quantity: item.quantity,
      });
    }

    const invalidItems = validationResults.filter(r => !r.valid);
    
    if (invalidItems.length > 0) {
      return NextResponse.json({
        success: false,
        valid: false,
        errors: invalidItems,
        message: 'Some items in your cart are invalid. Please review and try again.',
      });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      items: validationResults,
    });

  } catch (error: any) {
    console.error('Cart validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate cart' },
      { status: 500 }
    );
  }
}

