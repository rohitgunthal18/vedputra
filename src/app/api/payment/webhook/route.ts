import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createOrder, CreateOrderData, markCouponAsUsed } from '@/lib/api';
import crypto from 'crypto';

/**
 * CASHFREE WEBHOOK HANDLER
 * 
 * This is the MOST SECURE way to handle payments
 * - Server-to-server communication (cannot be intercepted by user)
 * - Signature verification
 * - Idempotency handling
 * - Independent of client callback
 * 
 * Setup in Cashfree Dashboard:
 * 1. Go to Settings → Webhooks
 * 2. Add webhook URL: https://yourdomain.com/api/payment/webhook
 * 3. Select events: PAYMENT_SUCCESS, PAYMENT_FAILED, PAYMENT_USER_DROPPED
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Webhook received from Cashfree');
    
    const body = await request.json();
    const { data, type } = body;
    
    console.log('Webhook event type:', type);
    console.log('Webhook data:', {
      orderId: data?.order?.order_id,
      paymentStatus: data?.payment?.payment_status,
    });

    // ============================================
    // SECURITY: Verify webhook signature
    // ============================================
    
    const receivedSignature = request.headers.get('x-webhook-signature');
    const timestamp = request.headers.get('x-webhook-timestamp');
    
    if (!receivedSignature || !timestamp) {
      console.error('❌ SECURITY: Missing webhook signature or timestamp');
      return NextResponse.json(
        { success: false, error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Verify signature
    const webhookSecret = process.env.CASHFREE_SECRET_KEY;
    if (!webhookSecret) {
      console.error('❌ Webhook secret not configured');
      return NextResponse.json(
        { success: false, error: 'Configuration error' },
        { status: 500 }
      );
    }

    // Create signature for verification
    const signatureData = `${timestamp}.${JSON.stringify(body)}`;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signatureData)
      .digest('hex');

    // Compare signatures (use timing-safe comparison)
    if (!crypto.timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(expectedSignature))) {
      console.error('❌ SECURITY: Invalid webhook signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    console.log('✅ Webhook signature verified');

    // ============================================
    // Handle different webhook events
    // ============================================
    
    switch (type) {
      case 'PAYMENT_SUCCESS_WEBHOOK':
        return await handlePaymentSuccess(data);
      
      case 'PAYMENT_FAILED_WEBHOOK':
        return await handlePaymentFailed(data);
      
      case 'PAYMENT_USER_DROPPED_WEBHOOK':
        return await handlePaymentDropped(data);
      
      default:
        console.log('ℹ️ Unhandled webhook type:', type);
        return NextResponse.json({ success: true, message: 'Webhook received' });
    }
    
  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment webhook
 */
async function handlePaymentSuccess(data: any) {
  try {
    const orderId = data?.order?.order_id;
    const paymentId = data?.payment?.cf_payment_id;
    const paymentAmount = parseFloat(data?.payment?.payment_amount || '0');
    const paymentStatus = data?.payment?.payment_status;
    const paymentMode = data?.payment?.payment_method;

    console.log('💳 Processing payment success:', {
      orderId,
      paymentId,
      paymentAmount,
      paymentStatus,
    });

    if (!orderId || !paymentId) {
      console.error('❌ Missing orderId or paymentId in webhook');
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ============================================
    // Get payment session from database
    // ============================================
    
    const { data: session, error: sessionError } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (sessionError || !session) {
      console.error('❌ Payment session not found:', orderId);
      return NextResponse.json(
        { success: false, error: 'Payment session not found' },
        { status: 404 }
      );
    }

    // ============================================
    // Idempotency check - prevent duplicate processing
    // ============================================
    
    if (session.status === 'completed') {
      console.log('⚠️ Payment already processed (idempotency)');
      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
        orderId: orderId,
      });
    }

    // ============================================
    // Verify amount matches
    // ============================================
    
    const sessionAmount = parseFloat(session.amount);
    if (Math.abs(sessionAmount - paymentAmount) > 0.01) {
      console.error('❌ SECURITY: Amount mismatch in webhook!', {
        expected: sessionAmount,
        received: paymentAmount,
      });
      
      await supabase
        .from('payment_sessions')
        .update({ 
          status: 'failed',
          failure_reason: 'Amount mismatch in webhook'
        })
        .eq('order_id', orderId);
      
      return NextResponse.json(
        { success: false, error: 'Amount mismatch' },
        { status: 400 }
      );
    }

    // ============================================
    // Create order in database
    // ============================================
    
    console.log('✅ All checks passed - Creating order from webhook');

    const orderData: CreateOrderData = {
      orderId: orderId,
      items: session.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        product: {
          name: item.name,
          price: item.price,
          description: '',
          weight: '',
          image: '',
        }
      })),
      shippingAddress: session.shipping_address || {
        fullName: session.customer_name,
        mobile: session.customer_phone,
        address: '',
        city: '',
        state: '',
        pincode: '',
        addressType: 'home',
        whatsappUpdates: false,
      },
      orderSummary: {
        subtotal: parseFloat(session.subtotal),
        shipping: parseFloat(session.shipping_charge),
        discount: parseFloat(session.discount || '0'),
        total: parseFloat(session.amount),
      },
      paymentMethod: 'online',
      couponCode: session.coupon_code,
      paymentTransactionId: paymentId,
      paymentOrderId: orderId,
      paymentMode: paymentMode,
    };

    const result = await createOrder(orderData);

    if (result.success) {
      console.log('✅ Order created successfully from webhook:', result.order.id);
      
      // Mark coupon as used
      if (session.coupon_code) {
        await markCouponAsUsed(
          session.coupon_code,
          result.order.id,
          session.customer_phone,
          'general'
        );
      }
      
      // Update payment session status
      await supabase
        .from('payment_sessions')
        .update({ 
          status: 'completed',
          payment_reference_id: paymentId,
          completed_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      return NextResponse.json({
        success: true,
        message: 'Order created successfully',
        orderId: orderId,
      });
    } else {
      console.error('❌ Order creation failed in webhook:', result.error);
      
      // Update session as failed
      await supabase
        .from('payment_sessions')
        .update({ 
          status: 'failed',
          failure_reason: result.error
        })
        .eq('order_id', orderId);
      
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('❌ Error in handlePaymentSuccess:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process payment success' },
      { status: 500 }
    );
  }
}

/**
 * Handle failed payment webhook
 */
async function handlePaymentFailed(data: any) {
  try {
    const orderId = data?.order?.order_id;
    const failureReason = data?.payment?.payment_message || 'Payment failed';

    console.log('❌ Payment failed webhook:', orderId, failureReason);

    if (orderId) {
      await supabase
        .from('payment_sessions')
        .update({ 
          status: 'failed',
          failure_reason: failureReason
        })
        .eq('order_id', orderId);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment failure recorded',
    });
  } catch (error: any) {
    console.error('❌ Error in handlePaymentFailed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process payment failure' },
      { status: 500 }
    );
  }
}

/**
 * Handle user dropped payment webhook
 */
async function handlePaymentDropped(data: any) {
  try {
    const orderId = data?.order?.order_id;

    console.log('⚠️ User dropped payment:', orderId);

    if (orderId) {
      await supabase
        .from('payment_sessions')
        .update({ 
          status: 'cancelled',
          failure_reason: 'User cancelled payment'
        })
        .eq('order_id', orderId);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment cancellation recorded',
    });
  } catch (error: any) {
    console.error('❌ Error in handlePaymentDropped:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process payment drop' },
      { status: 500 }
    );
  }
}

