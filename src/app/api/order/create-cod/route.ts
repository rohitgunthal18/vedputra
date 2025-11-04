import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateCoupon, markCouponAsUsed } from '@/lib/api';

/**
 * SECURE COD ORDER CREATION
 * Same server-side validation as online payments
 * Prevents price manipulation for COD orders
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔒 SECURE COD order API called');
    
    const body = await request.json();
    const { items, shippingAddress, couponCode } = body;
    
    console.log('COD Order data:', { 
      itemCount: items?.length,
      customerName: shippingAddress?.fullName,
      customerPhone: shippingAddress?.mobile?.substring(0, 3) + '***',
      hasCoupon: !!couponCode 
    });

    // ============================================
    // SECURITY CHECK 1: Validate required fields
    // ============================================
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.mobile) {
      return NextResponse.json(
        { success: false, error: 'Shipping address required' },
        { status: 400 }
      );
    }

    // ============================================
    // SECURITY CHECK 2: Validate cart items against database
    // Same logic as online payment
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
        return NextResponse.json(
          { 
            success: false, 
            error: `Product ID "${item.productId}" not found in database.`,
            details: 'Please clear your cart and try again.'
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
        shippingAddress.mobile
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

    // ============================================
    // Generate secure order ID
    // ============================================
    
    const orderId = 'VED' + Date.now().toString().slice(-8);
    console.log('🆔 Generated order ID:', orderId);

    // ============================================
    // Create order in database with VALIDATED data
    // ============================================
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        customer_name: shippingAddress.fullName,
        customer_mobile: shippingAddress.mobile,
        whatsapp_updates: shippingAddress.whatsappUpdates || false,
        shipping_address: shippingAddress.address,
        shipping_locality: shippingAddress.locality || '',
        shipping_city: shippingAddress.city,
        shipping_state: shippingAddress.state,
        shipping_pincode: shippingAddress.pincode,
        address_type: shippingAddress.addressType || 'home',
        subtotal: serverCalculatedSubtotal,
        shipping_charge: serverCalculatedShipping,
        discount: serverCalculatedDiscount,
        total_amount: serverCalculatedTotal,
        payment_method: 'cod',
        payment_status: 'pending',
        order_status: 'confirmed',
        coupon_code: validatedCouponCode,
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Error creating order:', orderError);
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      );
    }

    console.log('✅ Order created:', order.id);

    // ============================================
    // Insert order items with VALIDATED prices
    // ============================================
    
    const orderItems = validatedItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      product_description: item.description || '',
      product_weight: item.weight || '',
      product_image: item.image || '/placeholder-product.svg',
      unit_price: item.price,
      quantity: item.quantity,
      total_price: item.total,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('❌ Error creating order items:', itemsError);
      // Try to delete the order since items failed
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { success: false, error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    console.log('✅ Order items created');

    // ============================================
    // SECURITY: Deduct stock quantity for each ordered item
    // This prevents overselling and ensures inventory accuracy
    // ============================================
    
    console.log('📦 Deducting stock for order items...');
    for (const item of validatedItems) {
      try {
        // SECURITY: Fetch current stock first to verify
        const { data: product, error: productFetchError } = await supabase
          .from('products')
          .select('stock_quantity, product_id')
          .eq('product_id', item.productId)
          .single();

        if (productFetchError) {
          console.error(`❌ Error fetching product ${item.productId} for stock update:`, productFetchError);
          continue; // Skip this product but don't fail entire order
        }

        // SECURITY: Only update if stock_quantity is not null (some products might not track stock)
        if (product.stock_quantity !== null) {
          const newStock = Math.max(0, product.stock_quantity - item.quantity);
          
          const { error: stockUpdateError } = await supabase
            .from('products')
            .update({ 
              stock_quantity: newStock,
              updated_at: new Date().toISOString()
            })
            .eq('product_id', item.productId);

          if (stockUpdateError) {
            console.error(`❌ Error updating stock for product ${item.productId}:`, stockUpdateError);
            // Log but don't fail - order is already created
          } else {
            console.log(`✅ Stock updated: ${item.productId} - ${product.stock_quantity} → ${newStock} (deducted ${item.quantity})`);
          }
        } else {
          console.log(`ℹ️ Product ${item.productId} has null stock_quantity, skipping stock deduction`);
        }
      } catch (stockError: any) {
        console.error(`❌ Unexpected error updating stock for ${item.productId}:`, stockError);
        // Continue with other products - order is already created
      }
    }
    console.log('✅ Stock deduction completed');

    // ============================================
    // Mark coupon as used
    // ============================================
    
    if (validatedCouponCode) {
      await markCouponAsUsed(
        validatedCouponCode,
        order.id,
        shippingAddress.mobile,
        'general'
      );
      console.log('✅ Coupon marked as used');
    }

    console.log('🎉 COD order completed successfully!');

    // Return complete order data for order confirmation page
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_id: order.order_id,
        total_amount: serverCalculatedTotal,
        // Include full order details for confirmation page
        orderData: {
          orderId: order.order_id,
          orderDate: new Date().toISOString(),
          status: 'confirmed',
          paymentMethod: 'cod',
          shippingAddress: shippingAddress,
          orderSummary: {
            subtotal: serverCalculatedSubtotal,
            shipping: serverCalculatedShipping,
            discount: serverCalculatedDiscount,
            total: serverCalculatedTotal,
          },
          items: validatedItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            product: {
              name: item.name,
              price: item.price,
              weight: item.weight,
              image: item.image,
              description: item.description,
            },
          })),
          couponCode: validatedCouponCode,
        },
      },
    });

  } catch (error: any) {
    console.error('❌ COD order API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

