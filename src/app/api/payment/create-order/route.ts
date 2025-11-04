import { NextRequest, NextResponse } from 'next/server';
import { createPaymentSession } from '@/lib/cashfree';
import { supabase } from '@/lib/supabase';
import { validateCoupon } from '@/lib/api';

/**
 * SECURE PAYMENT ORDER CREATION
 * 
 * Security Features:
 * 1. Server-side cart validation
 * 2. Price verification against database
 * 3. Stock availability check
 * 4. Coupon validation server-side
 * 5. Amount recalculation on server
 * 6. Payment session tracking
 * 7. Prevents amount manipulation
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔒 SECURE Payment create-order API called');
    
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    const { items, customerDetails, returnUrl, couponCode, shippingAddress } = body;
    
    console.log('Request data:', { 
      itemCount: items?.length,
      customerPhone: customerDetails?.customerPhone?.substring(0, 3) + '***',
      hasCoupon: !!couponCode 
    });

    // ============================================
    // SECURITY CHECK 1: Validate required fields
    // ============================================
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart items required' },
        { status: 400 }
      );
    }

    if (!customerDetails || !customerDetails.customerName || !customerDetails.customerPhone) {
      return NextResponse.json(
        { success: false, error: 'Customer details required' },
        { status: 400 }
      );
    }

    // Check environment variables
    if (!process.env.CASHFREE_SECRET_KEY) {
      console.error('CASHFREE_SECRET_KEY is not set');
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // ============================================
    // SECURITY CHECK 2: Validate cart items against database
    // Recalculate EVERYTHING on server - NEVER trust client
    // ============================================
    
    console.log('🔍 Validating cart items against database...');
    
    let serverCalculatedSubtotal = 0;
    const validatedItems = [];
    
    for (const item of items) {
      // Fetch product from database (including image for invoice)
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('product_id, name, price, stock_quantity, is_active, image_url, weight, description')
        .eq('product_id', item.productId)
        .single();

      if (productError || !product) {
        console.error('❌ Product not found:', item.productId);
        console.error('ProductError details:', productError);
        
        // Get all available product IDs to help debug
        const { data: availableProducts } = await supabase
          .from('products')
          .select('product_id, name')
          .eq('is_active', true)
          .limit(10);
        
        console.log('📦 Available products in database:', availableProducts?.map(p => ({id: p.product_id, name: p.name})));
        
        return NextResponse.json(
          { 
            success: false, 
            error: `Product ID "${item.productId}" not found in database.`,
            details: 'This product may have been removed or the product ID is incorrect.',
            suggestion: 'Please clear your cart and add products again from the homepage.',
            availableProducts: availableProducts?.map(p => p.product_id).slice(0, 5) || []
          },
          { status: 400 }
        );
      }

      // Check if product is active
      if (!product.is_active) {
        return NextResponse.json(
          { success: false, error: `Product not available: ${product.name}` },
          { status: 400 }
        );
      }

      // Check stock availability
      if (product.stock_quantity !== null && product.stock_quantity < item.quantity) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Insufficient stock for ${product.name}. Only ${product.stock_quantity} available.` 
          },
          { status: 400 }
        );
      }

      // Validate quantity
      if (!item.quantity || item.quantity <= 0 || item.quantity > 100) {
        return NextResponse.json(
          { success: false, error: `Invalid quantity for ${product.name}` },
          { status: 400 }
        );
      }

      // Use server-side price (NEVER trust client price)
      const serverPrice = parseFloat(product.price);
      const itemTotal = serverPrice * item.quantity;
      
      serverCalculatedSubtotal += itemTotal;
      
      validatedItems.push({
        productId: product.product_id,
        name: product.name,
        price: serverPrice,
        quantity: item.quantity,
        total: itemTotal,
        image: product.image_url || '/placeholder-product.svg',
        weight: product.weight || '',
        description: product.description || '',
      });
      
      console.log(`✅ Validated: ${product.name} - ₹${serverPrice} x ${item.quantity} = ₹${itemTotal}`);
    }

    console.log('✅ Cart validated. Server subtotal:', serverCalculatedSubtotal);

    // ============================================
    // SECURITY CHECK 3: Calculate shipping (server-side)
    // ============================================
    
    const serverCalculatedShipping = serverCalculatedSubtotal >= 999 ? 0 : 50;
    console.log('✅ Shipping calculated:', serverCalculatedShipping);

    // ============================================
    // SECURITY CHECK 4: Validate coupon (server-side)
    // ============================================
    
    let serverCalculatedDiscount = 0;
    let validatedCouponCode = null;
    
    if (couponCode && couponCode.trim() !== '') {
      console.log('🔍 Validating coupon:', couponCode);
      
      const couponResult = await validateCoupon(
        couponCode, 
        serverCalculatedSubtotal,
        customerDetails.customerPhone
      );

      if (couponResult.valid && couponResult.success) {
        serverCalculatedDiscount = couponResult.discount || 0;
        validatedCouponCode = couponCode.trim().toUpperCase();
        console.log('✅ Coupon valid. Discount:', serverCalculatedDiscount);
      } else {
        console.warn('⚠️ Invalid coupon:', couponResult.message);
        return NextResponse.json(
          { success: false, error: couponResult.message || 'Invalid coupon' },
          { status: 400 }
        );
      }
    }

    // ============================================
    // SECURITY CHECK 5: Calculate final total (server-side)
    // ============================================
    
    const serverCalculatedTotal = serverCalculatedSubtotal + serverCalculatedShipping - serverCalculatedDiscount;
    
    console.log('💰 FINAL SERVER-CALCULATED AMOUNT:', {
      subtotal: serverCalculatedSubtotal,
      shipping: serverCalculatedShipping,
      discount: serverCalculatedDiscount,
      total: serverCalculatedTotal,
    });

    // Validate total is positive
    if (serverCalculatedTotal <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid order total' },
        { status: 400 }
      );
    }

    // ============================================
    // SECURITY CHECK 6: Generate secure order ID
    // ============================================
    
    const orderId = 'VED' + Date.now().toString() + Math.random().toString(36).substring(2, 7).toUpperCase();
    console.log('🆔 Generated order ID:', orderId);

    // ============================================
    // SECURITY CHECK 7: Store payment session in database
    // This prevents amount tampering and enables verification
    // ============================================
    
    const { data: sessionData, error: sessionError } = await supabase
      .from('payment_sessions')
      .insert({
        order_id: orderId,
        amount: serverCalculatedTotal.toFixed(2),
        subtotal: serverCalculatedSubtotal.toFixed(2),
        shipping_charge: serverCalculatedShipping.toFixed(2),
        discount: serverCalculatedDiscount.toFixed(2),
        customer_name: customerDetails.customerName,
        customer_phone: customerDetails.customerPhone,
        customer_email: customerDetails.customerEmail || `${customerDetails.customerPhone}@vedputra.com`,
        items: validatedItems,
        coupon_code: validatedCouponCode,
        shipping_address: shippingAddress,
        status: 'pending',
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min expiry
      })
      .select()
      .single();

    if (sessionError) {
      console.error('❌ Failed to create payment session:', sessionError);
      return NextResponse.json(
        { success: false, error: 'Failed to create payment session' },
        { status: 500 }
      );
    }

    console.log('✅ Payment session stored in database');

    // ============================================
    // Create Cashfree payment session with VALIDATED amount
    // ============================================
    
    const result = await createPaymentSession(
      orderId,
      serverCalculatedTotal,  // Use server-calculated amount
      'INR',
      {
        customerId: customerDetails.customerPhone,
        customerName: customerDetails.customerName,
        customerEmail: customerDetails.customerEmail || `${customerDetails.customerPhone}@vedputra.com`,
        customerPhone: customerDetails.customerPhone,
      },
      {
        returnUrl: returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment-callback`,
      }
    );

    if (result.success && result.paymentSessionId) {
      console.log('✅ Cashfree session created successfully');
      
      // Update session with payment session ID
      await supabase
        .from('payment_sessions')
        .update({ payment_session_id: result.paymentSessionId })
        .eq('order_id', orderId);
      
      return NextResponse.json({
        success: true,
        paymentSessionId: result.paymentSessionId,
        orderId: result.orderId,
        amount: serverCalculatedTotal,  // Send server amount for display
        currency: 'INR',
      });
    } else {
      console.error('❌ Cashfree session creation failed:', result.error);
      
      // Mark session as failed
      await supabase
        .from('payment_sessions')
        .update({ status: 'failed' })
        .eq('order_id', orderId);
      
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create payment session' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('❌ Create Cashfree payment order API error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
