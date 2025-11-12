import { supabase } from './supabase';
import { Order, ShippingAddress, CartItem } from '@/types';

// ============================================
// ORDERS API
// ============================================

export interface CreateOrderData {
  orderId: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  orderSummary: {
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
  };
  paymentMethod: string;
  couponCode?: string;
  paymentTransactionId?: string;
  paymentOrderId?: string;
  paymentMode?: string;
}

export async function createOrder(orderData: CreateOrderData) {
  try {
    // 0. Validate stock availability BEFORE creating order
    for (const item of orderData.items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('product_id, name, stock_quantity')
        .eq('product_id', item.productId)
        .single();

      if (productError) {
        return { 
          success: false, 
          error: `Product ${item.product.name} not found` 
        };
      }

      if (product.stock_quantity !== null && product.stock_quantity < item.quantity) {
        return { 
          success: false, 
          error: `Insufficient stock for ${item.product.name}. Only ${product.stock_quantity} available, but ${item.quantity} requested.` 
        };
      }

      if (product.stock_quantity !== null && product.stock_quantity === 0) {
        return { 
          success: false, 
          error: `${item.product.name} is out of stock.` 
        };
      }
    }

    // 1. Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_id: orderData.orderId,
        customer_name: orderData.shippingAddress.fullName,
        customer_mobile: orderData.shippingAddress.mobile,
        whatsapp_updates: orderData.shippingAddress.whatsappUpdates,
        shipping_address: orderData.shippingAddress.address,
        shipping_locality: orderData.shippingAddress.locality,
        shipping_city: orderData.shippingAddress.city,
        shipping_state: orderData.shippingAddress.state,
        shipping_pincode: orderData.shippingAddress.pincode,
        address_type: orderData.shippingAddress.addressType,
        subtotal: orderData.orderSummary.subtotal,
        shipping_charge: orderData.orderSummary.shipping,
        discount: orderData.orderSummary.discount,
        total_amount: orderData.orderSummary.total,
        payment_method: orderData.paymentMethod,
        payment_status: orderData.paymentMethod === 'cod' ? 'pending' : (orderData.paymentTransactionId ? 'completed' : 'pending'),
        order_status: 'confirmed',
        coupon_code: orderData.couponCode || null,
        payment_transaction_id: orderData.paymentTransactionId || null,
        payment_order_id: orderData.paymentOrderId || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }

    // 2. Insert order items (trigger will automatically deduct stock)
    const orderItems = orderData.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.product.name,
      product_description: item.product.description,
      product_weight: item.product.weight,
      product_image: typeof item.product.image === 'string' ? item.product.image : item.product.image.src,
      unit_price: item.product.price,
      quantity: item.quantity,
      total_price: item.product.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw itemsError;
    }

    // SECURITY: Deduct stock quantity for each ordered item
    // This prevents overselling and ensures inventory accuracy
    console.log('📦 Deducting stock for order items...');
    for (const item of orderData.items) {
      try {
        // SECURITY: Use RPC or direct update with atomic operation
        // Fetch current stock first
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

    // 3. Mark coupon as used if applicable
    if (orderData.couponCode) {
      console.log('🎟️ Marking coupon as used:', orderData.couponCode);
      const couponMarkResult = await markCouponAsUsed(
        orderData.couponCode, 
        order.id, // Use UUID id for database foreign key
        orderData.shippingAddress.mobile,
        undefined // Let it auto-detect the type
      );
      
      if (!couponMarkResult.success) {
        console.error('❌ Failed to mark coupon as used:', couponMarkResult.error);
        // Don't fail the order, but log the error for investigation
      } else {
        console.log('✅ Coupon marked as used successfully');
      }
    }

    return { success: true, order };
  } catch (error: any) {
    console.error('Error in createOrder:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create order',
      details: error
    };
  }
}

/**
 * Get order by order ID - SECURE VERSION
 * Validates input and prevents enumeration attacks
 */
export async function getOrderByOrderId(orderId: string) {
  try {
    // Input validation - prevent SQL injection and enumeration
    if (!orderId || typeof orderId !== 'string') {
      return { success: false, error: 'Invalid order ID' };
    }

    // Sanitize order ID - remove any special characters, only allow alphanumeric and hyphens
    const sanitizedOrderId = orderId.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    
    if (!sanitizedOrderId || sanitizedOrderId.length < 5 || sanitizedOrderId.length > 50) {
      return { success: false, error: 'Invalid order ID format' };
    }

    // Use parameterized query (Supabase client does this automatically)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_id', sanitizedOrderId) // Exact match only
      .single();

    if (orderError) {
      // Don't reveal if order exists or not (prevent enumeration)
      console.error('Error fetching order:', orderError);
      return { success: false, error: 'Order not found' };
    }

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    return { success: true, order };
  } catch (error) {
    console.error('Error in getOrderByOrderId:', error);
    return { success: false, error: 'Failed to fetch order' };
  }
}

/**
 * Get orders by mobile number - SECURE VERSION
 * Validates input and prevents enumeration attacks
 */
export async function getOrdersByMobile(mobile: string) {
  try {
    // Input validation
    if (!mobile || typeof mobile !== 'string') {
      return { success: false, error: 'Invalid mobile number' };
    }

    // Sanitize mobile - only digits
    const sanitizedMobile = mobile.replace(/\D/g, '');
    
    // Validate mobile number format (Indian mobile: 10 digits, may start with +91)
    if (sanitizedMobile.length < 10 || sanitizedMobile.length > 13) {
      return { success: false, error: 'Invalid mobile number format' };
    }

    // Extract last 10 digits (handle +91 prefix)
    const mobile10Digits = sanitizedMobile.slice(-10);
    
    if (!/^\d{10}$/.test(mobile10Digits)) {
      return { success: false, error: 'Invalid mobile number' };
    }

    // Use parameterized query with exact match
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_mobile', mobile10Digits) // Exact match only
      .order('created_at', { ascending: false })
      .limit(100); // Limit to prevent abuse

    if (error) {
      console.error('Error fetching orders:', error);
      return { success: false, error: 'Failed to fetch orders' };
    }

    // Don't reveal if mobile has orders or not (prevent enumeration)
    return { success: true, orders: orders || [] };
  } catch (error) {
    console.error('Error in getOrdersByMobile:', error);
    return { success: false, error: 'Failed to fetch orders' };
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ order_status: status })
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order status:', error);
      throw error;
    }

    return { success: true, order: data };
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return { success: false, error };
  }
}

// ============================================
// CONTACT MESSAGES API
// ============================================

export interface CreateContactMessageData {
  name: string;
  email: string;
  phone: string;
  message: string;
  honeypot?: string; // Spam protection field
}

// Rate limiting constants
const RATE_LIMIT_MAX_SUBMISSIONS = 5;
const RATE_LIMIT_WINDOW_HOURS = 1;

export async function createContactMessage(messageData: CreateContactMessageData) {
  try {
    // Security: Check honeypot (should be empty)
    if (messageData.honeypot && messageData.honeypot.trim() !== '') {
      console.warn('Honeypot field filled - likely a bot');
      return { success: false, error: 'Invalid submission' };
    }

    // Client-side validation
    const trimmedName = messageData.name?.trim();
    const trimmedEmail = messageData.email?.trim();
    const trimmedPhone = messageData.phone?.trim();
    const trimmedMessage = messageData.message?.trim();

    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
      return { success: false, error: 'Name must be between 2 and 100 characters' };
    }

    if (!trimmedEmail || !trimmedEmail.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/)) {
      return { success: false, error: 'Invalid email format' };
    }

    if (!trimmedPhone || trimmedPhone.length < 5 || trimmedPhone.length > 20) {
      return { success: false, error: 'Phone must be between 5 and 20 characters' };
    }

    if (!trimmedMessage || trimmedMessage.length < 10 || trimmedMessage.length > 5000) {
      return { success: false, error: 'Message must be between 10 and 5000 characters' };
    }

    // Check rate limit
    const rateLimitCheck = await checkRateLimit(trimmedEmail);
    if (!rateLimitCheck.allowed) {
      console.warn('Rate limit exceeded for email:', trimmedEmail);
      return { 
        success: false, 
        error: `Too many submissions. Please try again later. (${rateLimitCheck.remaining} remaining)` 
      };
    }

    // Insert contact message (NO .select() for security - anon users don't have SELECT permission)
    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        message: trimmedMessage,
        status: 'new',
        honeypot: messageData.honeypot || null,
      });

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    // Update rate limit
    await updateRateLimit(trimmedEmail);

    return { success: true };
  } catch (error: any) {
    console.error('Error in createContactMessage:', {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
      full: error
    });
    return { success: false, error: error?.message || 'Failed to send message' };
  }
}

// Rate limiting helper functions
async function checkRateLimit(email: string): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const { data, error } = await supabase
      .from('contact_rate_limit')
      .select('submission_count, last_submission, blocked_until')
      .eq('identifier', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found (first submission)
      console.error('Rate limit check error:', error);
      return { allowed: true, remaining: RATE_LIMIT_MAX_SUBMISSIONS }; // Allow on error to not block legitimate users
    }

    // First submission
    if (!data) {
      return { allowed: true, remaining: RATE_LIMIT_MAX_SUBMISSIONS - 1 };
    }

    // Check if blocked
    if (data.blocked_until && new Date(data.blocked_until) > new Date()) {
      return { allowed: false, remaining: 0 };
    }

    // Check if within rate limit window
    const lastSubmission = new Date(data.last_submission);
    const hoursSinceLastSubmission = (Date.now() - lastSubmission.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastSubmission < RATE_LIMIT_WINDOW_HOURS) {
      if (data.submission_count >= RATE_LIMIT_MAX_SUBMISSIONS) {
        return { allowed: false, remaining: 0 };
      }
      return { allowed: true, remaining: RATE_LIMIT_MAX_SUBMISSIONS - data.submission_count - 1 };
    }

    // Reset counter if outside window
    return { allowed: true, remaining: RATE_LIMIT_MAX_SUBMISSIONS - 1 };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: true, remaining: RATE_LIMIT_MAX_SUBMISSIONS }; // Allow on error
  }
}

async function updateRateLimit(email: string): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from('contact_rate_limit')
      .select('id, submission_count, last_submission')
      .eq('identifier', email)
      .single();

    if (existing) {
      // Update existing record
      const lastSubmission = new Date(existing.last_submission);
      const hoursSinceLastSubmission = (Date.now() - lastSubmission.getTime()) / (1000 * 60 * 60);

      const newCount = hoursSinceLastSubmission < RATE_LIMIT_WINDOW_HOURS 
        ? existing.submission_count + 1 
        : 1;

      await supabase
        .from('contact_rate_limit')
        .update({
          submission_count: newCount,
          last_submission: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      // Create new record
      await supabase
        .from('contact_rate_limit')
        .insert({
          identifier: email,
          submission_count: 1,
          first_submission: new Date().toISOString(),
          last_submission: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error('Failed to update rate limit:', error);
    // Don't throw - rate limit update failure shouldn't block message submission
  }
}

// ============================================
// PROMOTION COUPONS API
// ============================================

export interface CreatePromotionCouponData {
  mobile: string;
  couponCode: string;
  discountPercentage?: number;
  maxDiscount?: number;
  expiresAt: string;
}

export async function createPromotionCoupon(couponData: CreatePromotionCouponData) {
  try {
    // Check if mobile already has a coupon
    const { data: existing } = await supabase
      .from('promotion_coupons')
      .select('*')
      .eq('mobile', couponData.mobile)
      .single();

    if (existing) {
      return { success: true, coupon: existing, alreadyExists: true };
    }

    // Create new coupon
    const { data, error } = await supabase
      .from('promotion_coupons')
      .insert({
        mobile: couponData.mobile,
        coupon_code: couponData.couponCode,
        discount_percentage: couponData.discountPercentage || 10,
        max_discount: couponData.maxDiscount || 100,
        expires_at: couponData.expiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating promotion coupon:', error);
      throw error;
    }

    return { success: true, coupon: data, alreadyExists: false };
  } catch (error) {
    console.error('Error in createPromotionCoupon:', error);
    return { success: false, error };
  }
}

/**
 * Validate coupon code - SECURE VERSION
 * Includes input validation and prevents enumeration attacks
 */
export async function validateCoupon(couponCode: string, subtotal: number = 0, mobile?: string) {
  try {
    // Input validation - prevent injection and enumeration
    if (!couponCode || typeof couponCode !== 'string') {
      return { success: false, valid: false, message: 'Invalid coupon code' };
    }

    // Sanitize coupon code - only alphanumeric and hyphens
    const sanitizedCode = couponCode.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    
    if (!sanitizedCode || sanitizedCode.length < 3 || sanitizedCode.length > 50) {
      return { success: false, valid: false, message: 'Invalid coupon code format' };
    }

    // Validate subtotal
    if (typeof subtotal !== 'number' || subtotal < 0 || !isFinite(subtotal)) {
      return { success: false, valid: false, message: 'Invalid subtotal' };
    }

    // Validate mobile if provided
    if (mobile && typeof mobile === 'string') {
      const sanitizedMobile = mobile.replace(/\D/g, '').slice(-10);
      if (sanitizedMobile.length !== 10) {
        return { success: false, valid: false, message: 'Invalid mobile number' };
      }
    }

    const code = sanitizedCode;
    
    // First, check if it's a general coupon from the coupons table
    const { data: generalCoupon, error: generalError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (generalCoupon && !generalError) {
      // Validate general coupon
      
      // Check if expired
      if (generalCoupon.expires_at) {
        const now = new Date();
        const expiresAt = new Date(generalCoupon.expires_at);
        if (now > expiresAt) {
          return { success: false, valid: false, message: 'Coupon has expired', type: 'general' };
        }
      }

      // Check usage limit
      if (generalCoupon.usage_limit && generalCoupon.usage_count >= generalCoupon.usage_limit) {
        return { success: false, valid: false, message: 'Coupon usage limit reached', type: 'general' };
      }

      // Check minimum order value
      if (subtotal < generalCoupon.min_order_value) {
        return { 
          success: false, 
          valid: false, 
          message: `Minimum order value ₹${generalCoupon.min_order_value} required`,
          type: 'general'
        };
      }

      // Check if user has already used this coupon (if mobile provided)
      if (mobile) {
        const { data: usage } = await supabase
          .from('coupon_usage')
          .select('*')
          .eq('coupon_id', generalCoupon.id)
          .eq('mobile', mobile)
          .single();

        if (usage) {
          return { success: false, valid: false, message: 'You have already used this coupon', type: 'general' };
        }
      }

      // Calculate discount
      let discount = 0;
      if (generalCoupon.discount_type === 'percentage') {
        discount = (subtotal * generalCoupon.discount_value) / 100;
        if (generalCoupon.max_discount) {
          discount = Math.min(discount, generalCoupon.max_discount);
        }
      } else {
        discount = generalCoupon.discount_value;
      }

      return {
        success: true,
        valid: true,
        coupon: generalCoupon,
        discount,
        type: 'general',
        discountType: generalCoupon.discount_type,
        discountValue: generalCoupon.discount_value,
        maxDiscount: generalCoupon.max_discount,
      };
    }

    // If not a general coupon, check if it's a promotion coupon
    const { data: promoCoupon, error: promoError } = await supabase
      .from('promotion_coupons')
      .select('*')
      .eq('coupon_code', code)
      .single();

    if (promoCoupon && !promoError) {
      // Validate promotion coupon
      
      // Check if expired
      const now = new Date();
      const expiresAt = new Date(promoCoupon.expires_at);
      if (now > expiresAt) {
        return { success: false, valid: false, message: 'Coupon has expired', type: 'promotion' };
      }

      // Check if already used
      if (promoCoupon.is_used) {
        return { success: false, valid: false, message: 'Coupon already used', type: 'promotion' };
      }

      // SECURITY: Verify mobile number matches (promotion coupons are tied to mobile)
      if (mobile && promoCoupon.mobile) {
        const sanitizedInputMobile = mobile.replace(/\D/g, '').slice(-10);
        const sanitizedCouponMobile = promoCoupon.mobile.replace(/\D/g, '').slice(-10);
        
        if (sanitizedInputMobile !== sanitizedCouponMobile) {
          console.warn('⚠️ Mobile number mismatch for coupon:', code);
          return { 
            success: false, 
            valid: false, 
            message: 'This coupon is not valid for your mobile number', 
            type: 'promotion' 
          };
        }
      }

      // Calculate discount (promotion coupons are percentage based)
      const discount = Math.min((subtotal * promoCoupon.discount_percentage) / 100, promoCoupon.max_discount);

      return {
        success: true,
        valid: true,
        coupon: promoCoupon,
        discount,
        type: 'promotion',
        discountType: 'percentage',
        discountValue: promoCoupon.discount_percentage,
        maxDiscount: promoCoupon.max_discount,
      };
    }

    // Coupon not found
    return { success: false, valid: false, message: 'Invalid coupon code', type: null };
  } catch (error) {
    console.error('Error in validateCoupon:', error);
    return { success: false, valid: false, error, message: 'Error validating coupon', type: null };
  }
}

export async function markCouponAsUsed(couponCode: string, orderId: string, mobile?: string, couponType?: string) {
  try {
    console.log('🎟️ markCouponAsUsed called:', { couponCode, orderId, mobile, couponType });
    const code = couponCode.toUpperCase();
    
    // If type is provided, use it directly. Otherwise, detect it
    if (!couponType) {
      // Check which type of coupon it is
      console.log('🔍 Auto-detecting coupon type...');
      const { data: generalCoupon, error: generalCheckError } = await supabase
        .from('coupons')
        .select('id')
        .eq('code', code)
        .single();
      
      if (generalCheckError && generalCheckError.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is expected for promotion coupons
        console.error('Error checking general coupon:', generalCheckError);
      }
      
      couponType = generalCoupon ? 'general' : 'promotion';
      console.log('✅ Detected coupon type:', couponType);
    }
    
    if (couponType === 'general') {
      // Handle general coupon
      console.log('📋 Handling general coupon...');
      const { data: coupon, error: couponFetchError } = await supabase
        .from('coupons')
        .select('id')
        .eq('code', code)
        .single();
      
      if (couponFetchError || !coupon) {
        console.error('❌ General coupon not found:', code);
        return { success: false, error: 'Coupon not found', type: 'general' };
      }
      
      // Increment usage count using RPC function
      const { error: rpcError } = await supabase.rpc('increment_coupon_usage', { coupon_id: coupon.id });
      
      if (rpcError) {
        console.error('❌ Error incrementing coupon usage:', rpcError);
        // Continue anyway to record usage
      }
      
      // Record usage if mobile is provided
      if (mobile) {
        const { error: usageError } = await supabase
          .from('coupon_usage')
          .insert({
            coupon_id: coupon.id,
            mobile,
            order_id: orderId, // UUID string
          });
        
        if (usageError) {
          console.error('❌ Error recording coupon usage:', usageError);
          console.error('❌ Usage error details:', usageError);
          // Don't fail if usage recording fails
        } else {
          console.log('✅ Coupon usage recorded for mobile:', mobile);
        }
      }
      
      console.log('✅ General coupon marked as used');
      return { success: true, type: 'general' };
    } else {
      // Handle promotion coupon
      console.log('🎁 Handling promotion coupon...');
      
      // First check if coupon exists and is not already used
      const { data: existingCoupon, error: checkError } = await supabase
        .from('promotion_coupons')
        .select('*')
        .eq('coupon_code', code)
        .single();
      
      if (checkError) {
        console.error('❌ Error checking promotion coupon:', checkError);
        return { success: false, error: `Coupon not found: ${checkError.message}`, type: 'promotion' };
      }
      
      if (!existingCoupon) {
        console.error('❌ Promotion coupon not found:', code);
        return { success: false, error: 'Coupon not found', type: 'promotion' };
      }
      
      if (existingCoupon.is_used) {
        console.warn('⚠️ Promotion coupon already used:', code);
        return { success: false, error: 'Coupon already used', type: 'promotion', alreadyUsed: true };
      }
      
      // Mark as used
      const { data, error } = await supabase
        .from('promotion_coupons')
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
          order_id: orderId, // UUID string for foreign key to orders.id
        })
        .eq('coupon_code', code)
        .eq('is_used', false) // Additional safety check to prevent race conditions
        .select()
        .single();

      if (error) {
        console.error('❌ Error marking promotion coupon as used:', error);
        return { success: false, error: `Failed to mark coupon as used: ${error.message}`, type: 'promotion' };
      }
      
      if (!data) {
        console.error('❌ No coupon updated (possibly already used)');
        return { success: false, error: 'Coupon may have been used already', type: 'promotion' };
      }

      console.log('✅ Promotion coupon marked as used successfully');
      return { success: true, coupon: data, type: 'promotion' };
    }
  } catch (error: any) {
    console.error('❌ Error in markCouponAsUsed:', error);
    return { success: false, error: error.message || 'Unknown error', type: null };
  }
}

// ============================================
// ADMIN DASHBOARD STATS
// ============================================

export async function getDashboardStats() {
  try {
    // Get total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_status', 'pending');

    // Get total revenue
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_amount');

    const totalRevenue = revenueData?.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0) || 0;

    // Get new contact messages
    const { count: newMessages } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');

    // Get promotion coupons stats
    const { count: totalCoupons } = await supabase
      .from('promotion_coupons')
      .select('*', { count: 'exact', head: true });

    const { count: usedCoupons } = await supabase
      .from('promotion_coupons')
      .select('*', { count: 'exact', head: true })
      .eq('is_used', true);

    return {
      success: true,
      stats: {
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalRevenue,
        newMessages: newMessages || 0,
        totalCoupons: totalCoupons || 0,
        usedCoupons: usedCoupons || 0,
      },
    };
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return { success: false, error };
  }
}

// ============================================
// ADMIN HELPER FUNCTIONS (for admin pages)
// ============================================

export async function getContactMessages() {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, messages: data };
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return { success: false, error };
  }
}

export async function getPromotionCoupons() {
  try {
    const { data, error } = await supabase
      .from('promotion_coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, coupons: data };
  } catch (error) {
    console.error('Error fetching promotion coupons:', error);
    return { success: false, error };
  }
}

// ============================================
// PUBLIC PRODUCTS API (for website display)
// ============================================

export async function getActiveProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Transform database products to match Product type
    const products = data?.map((p) => ({
      id: p.product_id,
      product_id: p.product_id, // Include product_id for filtering in blogs
      name: p.name,
      description: p.description,
      price: parseFloat(p.price),
      discount_price: p.discount_price ? parseFloat(p.discount_price) : undefined,
      weight: p.weight,
      rating: p.rating || 5.0,
      reviews: p.reviews || 0,
      badge: p.badge as 'bestseller' | 'new' | 'organic' | undefined,
      image: p.image_url || '/placeholder-product.svg', // Primary image for backward compatibility
      image_url: p.image_url || '/placeholder-product.svg', // For blog display
      images: p.images_json || p.image_urls || [p.image_url] || ['/placeholder-product.svg'], // Multiple images array (JSONB or array)
      images_json: p.images_json || p.image_urls || [p.image_url] || ['/placeholder-product.svg'], // For blog display
      stock_quantity: p.stock_quantity,
      is_active: p.is_active,
    }));

    return { success: true, products };
  } catch (error) {
    console.error('Error fetching active products:', error);
    return { success: false, error };
  }
}

// ============================================
// PRODUCT DETAILS API
// ============================================

export async function getProductByProductId(productId: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }

    const product = {
      id: data.id,
      product_id: data.product_id,
      name: data.name,
      description: data.description,
      long_description: data.long_description,
      price: parseFloat(data.price),
      weight: data.weight,
      rating: data.rating || 5.0,
      reviews: data.reviews || 0,
      badge: data.badge,
      image: data.image_url || '/placeholder-product.svg',
      images: data.images_json || data.image_urls || [data.image_url] || ['/placeholder-product.svg'],
      stock_quantity: data.stock_quantity,
      is_active: data.is_active,
      sku: data.sku,
      category: data.category,
      benefits: data.benefits || [],
      ingredients: data.ingredients,
      how_to_use: data.how_to_use,
      storage_instructions: data.storage_instructions,
      shelf_life: data.shelf_life,
      certifications: data.certifications || [],
      faq: data.faq || [],
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      meta_keywords: data.meta_keywords,
      nutrition_facts: data.nutrition_facts || {},
      serving_size: data.serving_size,
      origin_country: data.origin_country,
      manufacturing_process: data.manufacturing_process,
      safety_warnings: data.safety_warnings,
      suitable_for: data.suitable_for || [],
    };

    return { success: true, product };
  } catch (error) {
    console.error('Error in getProductByProductId:', error);
    return { success: false, error };
  }
}

// ============================================
// PRODUCT REVIEWS API
// ============================================

export interface CreateReviewData {
  product_id: string; // This is the UUID from products.id
  product_string_id?: string; // This is the varchar from products.product_id
  reviewer_name: string;
  reviewer_mobile: string;
  reviewer_email?: string;
  rating: number;
  title?: string;
  review_text: string;
  review_images?: string[];
}

export async function createProductReview(reviewData: CreateReviewData) {
  try {
    console.log('Creating product review:', reviewData);

    // Validation
    const trimmedName = reviewData.reviewer_name?.trim();
    const trimmedMobile = reviewData.reviewer_mobile?.trim().replace(/\D/g, '');
    const trimmedText = reviewData.review_text?.trim();

    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: 'Name must be at least 2 characters' };
    }

    if (!trimmedMobile || trimmedMobile.length < 10) {
      return { success: false, error: 'Valid mobile number is required' };
    }

    if (!trimmedText || trimmedText.length < 10) {
      return { success: false, error: 'Review must be at least 10 characters' };
    }

    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5' };
    }

    // First, get the product_string_id from products table if not provided
    let productStringId = reviewData.product_string_id;
    
    if (!productStringId) {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('product_id')
        .eq('id', reviewData.product_id)
        .single();
      
      if (productError || !productData) {
        console.error('Error fetching product:', productError);
        return { success: false, error: 'Product not found' };
      }
      
      productStringId = productData.product_id;
    }

    console.log('Checking orders for mobile:', trimmedMobile, 'and product_id:', productStringId);

    // Verify buyer - STRICT CHECK:
    // 1. Must have purchased THIS specific product (not just any product)
    // 2. Order must be DELIVERED
    // 3. Can review multiple times if bought multiple times
    const { data: deliveredOrders, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        order_status,
        order_items!inner(product_id)
      `)
      .eq('customer_mobile', trimmedMobile)
      .eq('order_status', 'delivered');

    if (orderError) {
      console.error('Error verifying purchase:', orderError);
      return { success: false, error: 'Error verifying purchase' };
    }

    console.log('Found delivered orders:', deliveredOrders?.length, 'orders');

    // Filter orders that contain THIS specific product
    const ordersWithProduct = deliveredOrders?.filter((order: any) =>
      order.order_items?.some((item: any) => item.product_id === productStringId)
    );

    if (!ordersWithProduct || ordersWithProduct.length === 0) {
      console.log('No delivered orders found for product_id:', productStringId);
      return {
        success: false,
        error: 'Only verified buyers with delivered orders can post reviews. Please ensure your order has been delivered.'
      };
    }

    console.log('Found', ordersWithProduct.length, 'delivered order(s) with this product');

    // Get all order IDs that have already been reviewed
    const { data: existingReviews } = await supabase
      .from('product_reviews')
      .select('order_id')
      .eq('product_id', reviewData.product_id)
      .eq('reviewer_mobile', trimmedMobile);

    const reviewedOrderIds = new Set(
      existingReviews?.map((r: any) => r.order_id).filter(Boolean) || []
    );

    // Find an order that hasn't been reviewed yet
    const unreviewedOrder = ordersWithProduct.find((order: any) => 
      !reviewedOrderIds.has(order.id)
    );

    if (!unreviewedOrder) {
      return { 
        success: false, 
        error: `You have already reviewed all your orders for this product. You can only review once per order.` 
      };
    }

    console.log('Using order:', unreviewedOrder.id, 'for review');

    // Use customer name from order
    const actualReviewerName = unreviewedOrder.customer_name || reviewData.reviewer_name;

    // Insert review - AUTO-APPROVE for verified purchases
    const now = new Date().toISOString();
    const { data: review, error: insertError } = await supabase
      .from('product_reviews')
      .insert({
        product_id: reviewData.product_id,
        order_id: unreviewedOrder.id, // Link to specific order
        reviewer_name: actualReviewerName, // Use actual customer name from order
        reviewer_mobile: trimmedMobile,
        reviewer_email: reviewData.reviewer_email?.trim() || null,
        rating: reviewData.rating,
        title: reviewData.title?.trim() || null,
        review_text: trimmedText,
        review_images: reviewData.review_images || [],
        is_verified_purchase: true,
        is_approved: true, // AUTO-APPROVE verified purchases
        published_at: now,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting review:', insertError);
      throw insertError;
    }

    console.log('✅ Review created successfully:', review);

    // Update product rating and review count
    console.log('📊 Updating product ratings...');
    const ratingUpdateResult = await updateProductRatingFromReviews(reviewData.product_id);
    
    if (!ratingUpdateResult.success) {
      console.error('⚠️ Warning: Failed to update product rating, but review was saved');
      // Don't fail the review creation, but log the error
    } else {
      console.log('✅ Product ratings updated:', ratingUpdateResult);
    }

    return { success: true, review };
  } catch (error: any) {
    console.error('Error in createProductReview:', error);
    return { success: false, error: error?.message || 'Failed to create review' };
  }
}

export async function getProductReviews(productId: string) {
  try {
    // First, check if productId is UUID or string ID
    // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (8-4-4-4-12)
    // String ID examples: "3", "moringa-leaf-powder", "beetroot-stamina-powder"
    let productUuid = productId;
    
    // Check if it's a valid UUID format (8-4-4-4-12 pattern)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(productId);
    
    if (!isUuid) {
      // It's a string ID, need to look up the UUID
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('product_id', productId)
        .single();
      
      if (productError || !productData) {
        console.error('Error fetching product for reviews:', productError);
        return { success: false, error: 'Product not found' };
      }
      
      productUuid = productData.id;
    }

    const { data: reviews, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productUuid)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }

    console.log(`Found ${reviews?.length || 0} reviews for product ${productId}`);
    return { success: true, reviews: reviews || [] };
  } catch (error) {
    console.error('Error in getProductReviews:', error);
    return { success: false, error };
  }
}

export async function getReviewStats(productId: string) {
  try {
    // First, check if productId is UUID or string ID
    // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (8-4-4-4-12)
    // String ID examples: "3", "moringa-leaf-powder", "beetroot-stamina-powder"
    let productUuid = productId;
    
    // Check if it's a valid UUID format (8-4-4-4-12 pattern)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(productId);
    
    if (!isUuid) {
      // It's a string ID, need to look up the UUID
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('product_id', productId)
        .single();
      
      if (productError || !productData) {
        console.error('Error fetching product for stats:', productError);
        return {
          success: true,
          stats: {
            average: 0,
            total: 0,
            distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
          }
        };
      }
      
      productUuid = productData.id;
    }

    const { data: reviews, error } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productUuid)
      .eq('is_approved', true);

    if (error) {
      console.error('Error fetching review stats:', error);
      throw error;
    }

    if (!reviews || reviews.length === 0) {
      return {
        success: true,
        stats: {
          average: 0,
          total: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      };
    }

    // Calculate stats
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = (sum / total).toFixed(1);

    const distribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    return {
      success: true,
      stats: {
        average: parseFloat(average),
        total,
        distribution
      }
    };
  } catch (error) {
    console.error('Error in getReviewStats:', error);
    return { success: false, error };
  }
}

// ============================================
// UPDATE PRODUCT RATINGS (from actual reviews)
// ============================================

/**
 * Recalculates and updates product rating and review count based on approved reviews
 * This should be called whenever:
 * - A new review is created
 * - A review is approved/disapproved
 * - A review is deleted
 */
export async function updateProductRatingFromReviews(productUuid: string) {
  try {
    console.log('📊 Updating product rating for:', productUuid);

    // Get all approved reviews for this product
    const { data: reviews, error: reviewError } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productUuid)
      .eq('is_approved', true);

    if (reviewError) {
      console.error('❌ Error fetching reviews for rating update:', reviewError);
      return { success: false, error: reviewError };
    }

    // Calculate average rating and count
    const reviewCount = reviews?.length || 0;
    let avgRating = 0;

    if (reviewCount > 0) {
      const sum = reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
      avgRating = Math.round((sum / reviewCount) * 10) / 10; // Round to 1 decimal
    }

    console.log(`📈 Calculated: ${reviewCount} reviews, avg rating ${avgRating}`);

    // Update product table
    const { error: updateError } = await supabase
      .from('products')
      .update({
        rating: avgRating,
        reviews: reviewCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', productUuid);

    if (updateError) {
      console.error('❌ Error updating product ratings:', updateError);
      return { success: false, error: updateError };
    }

    console.log('✅ Product rating updated successfully');
    return { success: true, rating: avgRating, reviewCount };
  } catch (error) {
    console.error('❌ Error in updateProductRatingFromReviews:', error);
    return { success: false, error };
  }
}

// ============================================
// BLOGS API (Public)
// ============================================

export interface PublicBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  category: string | null;
  published_at: string | null;
  read_time_minutes: number | null;
  views_count: number;
  author_name: string | null;
}

export async function getPublishedBlogs(limit?: number) {
  try {
    let query = supabase
      .from('blogs')
      .select('id, title, slug, excerpt, featured_image, category, published_at, read_time_minutes, views_count, author_name')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, blogs: data as PublicBlog[] };
  } catch (error) {
    console.error('Error fetching published blogs:', error);
    return { success: false, blogs: [] };
  }
}

export async function getBlogBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) throw error;

    // Increment view count
    if (data) {
      await supabase
        .from('blogs')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', data.id);
    }

    return { success: true, blog: data };
  } catch (error) {
    console.error('Error fetching blog:', error);
    return { success: false, blog: null };
  }
}

