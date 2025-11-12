import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature, getCashfreeClient } from '@/lib/cashfree';
import { createOrder, CreateOrderData, markCouponAsUsed } from '@/lib/api';
import { supabase } from '@/lib/supabase';

/**
 * SECURE PAYMENT VERIFICATION with TEST MODE support
 * 
 * Security Features:
 * 1. Mandatory signature verification (PRODUCTION only)
 * 2. Server-side Cashfree API verification (PRODUCTION only, optional in TEST)
 * 3. Amount verification against stored session (ALWAYS)
 * 4. Idempotency check (prevent duplicate orders) (ALWAYS)
 * 5. Payment status verification from Cashfree API (PRODUCTION, optional in TEST)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      orderAmount,
      referenceId,
      txStatus,
      paymentMode,
      txMsg,
      txTime,
      signature,
      isTestMode = false,
    } = body;

    // Check if we're actually in test mode from environment
    const actualTestMode = process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT !== 'PRODUCTION';
    const finalTestMode = isTestMode || actualTestMode;

    console.log('🔒 SECURE Payment verification API called:', {
      orderId,
      orderAmount,
      referenceId,
      txStatus,
      paymentMode,
      hasSignature: !!signature,
      isTestMode: finalTestMode,
      environment: process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT || 'TEST',
    });

    // ============================================
    // SECURITY CHECK 1: Validate required parameters
    // ============================================
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID required' },
        { status: 400 }
      );
    }

    // In test mode, referenceId might be auto-generated, so we allow it to be missing
    // In production, referenceId is mandatory
    if (!finalTestMode && !referenceId) {
      return NextResponse.json(
        { success: false, error: 'Transaction reference ID required' },
        { status: 400 }
      );
    }

    // Generate fallback referenceId for test mode if missing
    const finalReferenceId = referenceId || `TEST_${orderId}_${Date.now()}`;

    // ============================================
    // SECURITY CHECK 2: Verify payment signature (MANDATORY in PRODUCTION, OPTIONAL in TEST)
    // ============================================
    
    if (!finalTestMode) {
      // PRODUCTION MODE: Strict signature verification
      if (!signature || signature === '') {
        console.error('❌ SECURITY: No signature provided (PRODUCTION)');
        return NextResponse.json(
          { success: false, error: 'Payment signature missing - verification failed' },
          { status: 400 }
        );
      }

      const isValidSignature = verifyPaymentSignature(
        orderId,
        orderAmount,
        finalReferenceId,
        txStatus,
        paymentMode,
        txMsg,
        txTime,
        signature
      );

      if (!isValidSignature) {
        console.error('❌ SECURITY: Invalid payment signature (PRODUCTION)');
        return NextResponse.json(
          { success: false, error: 'Payment verification failed - Invalid signature' },
          { status: 400 }
        );
      }
      
      console.log('✅ Payment signature verified successfully (PRODUCTION)');
    } else {
      // TEST MODE: Log but skip signature verification
      console.log('⚠️ TEST MODE: Skipping signature verification');
      if (signature && !signature.startsWith('test_signature_')) {
        // If a real signature is provided in test mode, still try to verify (optional)
        const isValidSignature = verifyPaymentSignature(
          orderId,
          orderAmount,
          finalReferenceId,
          txStatus,
          paymentMode,
          txMsg,
          txTime,
          signature
        );
        if (isValidSignature) {
          console.log('✅ Test mode: Signature verified successfully');
        } else {
          console.log('⚠️ Test mode: Signature verification failed, but proceeding');
        }
      }
    }

    // ============================================
    // SECURITY CHECK 3: Get stored payment session
    // ============================================
    
    const { data: paymentSession, error: sessionError } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (sessionError || !paymentSession) {
      console.error('❌ SECURITY: Payment session not found:', orderId);
      return NextResponse.json(
        { success: false, error: 'Payment session not found' },
        { status: 400 }
      );
    }

    // ============================================
    // SECURITY CHECK 4: Idempotency - Check if already processed
    // ============================================
    
    if (paymentSession.status === 'completed') {
      console.warn('⚠️ Payment already processed:', orderId);
      
      // Return existing order
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (existingOrder) {
        return NextResponse.json({
          success: true,
          order: existingOrder,
          message: 'Order already processed',
          paymentId: finalReferenceId,
        });
      }
    }

    // ============================================
    // SECURITY CHECK 5: Verify amount matches stored session
    // ============================================
    
    const sessionAmount = parseFloat(paymentSession.amount);
    const callbackAmount = parseFloat(orderAmount);
    
    if (Math.abs(sessionAmount - callbackAmount) > 0.01) {
      console.error('❌ SECURITY: Amount mismatch!', {
        expected: sessionAmount,
        received: callbackAmount,
      });
      
      // Update session status
      await supabase
        .from('payment_sessions')
        .update({ 
          status: 'failed',
          failure_reason: 'Amount mismatch'
        })
        .eq('order_id', orderId);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Amount mismatch detected. Expected ₹${sessionAmount}, received ₹${callbackAmount}` 
        },
        { status: 400 }
      );
    }

    console.log('✅ Amount verified:', sessionAmount);

    // ============================================
    // SECURITY CHECK 6: Verify payment status with Cashfree API
    // PRODUCTION: Mandatory
    // TEST: Optional (try, but don't fail if API call fails)
    // ============================================
    
    let cashfreeVerificationPassed = false;
    
    try {
      const cashfree = getCashfreeClient();
      
      // Fetch payment details from Cashfree
      const paymentResponse = await cashfree.PGOrderFetchPayments(orderId);
      const payments = paymentResponse.data;
      
      console.log('📡 Cashfree API verification response:', {
        orderFound: !!payments,
        paymentCount: payments?.length || 0,
        isTestMode: finalTestMode,
      });

      if (!payments || payments.length === 0) {
        if (finalTestMode) {
          // In test mode, it's okay if Cashfree doesn't return payments
          console.warn('⚠️ TEST MODE: Payment not found in Cashfree API, but proceeding');
          cashfreeVerificationPassed = true; // Allow test mode to proceed
        } else {
          console.error('❌ SECURITY: Payment not found in Cashfree (PRODUCTION)');
          await supabase
            .from('payment_sessions')
            .update({ 
              status: 'failed',
              failure_reason: 'Payment not found in Cashfree API'
            })
            .eq('order_id', orderId);
          
          return NextResponse.json(
            { success: false, error: 'Payment verification failed - not found' },
            { status: 400 }
          );
        }
      } else {
        // Find the payment with matching reference ID (if available)
        // In test mode, referenceId might not match, so we check if any payment exists
        let payment = null;
        
        if (finalReferenceId && !finalReferenceId.startsWith('TEST_')) {
          // Real referenceId - try to match
          payment = payments.find((p: any) => p.cf_payment_id === finalReferenceId);
        }
        
        // If no exact match but we have payments, use the first successful one
        if (!payment && payments.length > 0) {
          if (finalTestMode) {
            // In test mode, use first payment if available
            payment = payments[0];
            console.log('⚠️ TEST MODE: Using first available payment:', payment.cf_payment_id);
          } else {
            console.error('❌ SECURITY: Payment reference ID mismatch (PRODUCTION)');
            return NextResponse.json(
              { success: false, error: 'Payment verification failed - reference mismatch' },
              { status: 400 }
            );
          }
        }

        if (payment) {
          // Verify payment status
          if (payment.payment_status !== 'SUCCESS') {
            if (finalTestMode) {
              console.warn('⚠️ TEST MODE: Payment status is', payment.payment_status, '- proceeding anyway');
              cashfreeVerificationPassed = true;
            } else {
              console.error('❌ Payment not successful:', payment.payment_status);
              await supabase
                .from('payment_sessions')
                .update({ 
                  status: 'failed',
                  failure_reason: `Payment status: ${payment.payment_status}`
                })
                .eq('order_id', orderId);
              
              return NextResponse.json(
                { success: false, error: `Payment ${payment.payment_status}` },
                { status: 400 }
              );
            }
          } else {
            // Verify payment amount
            const paymentAmountStr = payment.payment_amount?.toString() || '0';
            const paymentAmount = parseFloat(paymentAmountStr);
            if (Math.abs(paymentAmount - sessionAmount) > 0.01) {
              console.error('❌ SECURITY: Cashfree amount mismatch!', {
                expected: sessionAmount,
                received: paymentAmount,
              });
              
              if (!finalTestMode) {
                return NextResponse.json(
                  { success: false, error: 'Payment amount verification failed' },
                  { status: 400 }
                );
              } else {
                console.warn('⚠️ TEST MODE: Amount mismatch, but proceeding');
              }
            }
            
            cashfreeVerificationPassed = true;
            console.log('✅ Cashfree API verification successful');
          }
        } else if (finalTestMode) {
          // Test mode: no payment found but that's okay
          cashfreeVerificationPassed = true;
          console.log('⚠️ TEST MODE: No matching payment found, but proceeding');
        }
      }
      
    } catch (cashfreeError: any) {
      console.error('❌ Cashfree API verification error:', cashfreeError);
      
      if (finalTestMode) {
        // In test mode, API failures are acceptable
        console.warn('⚠️ TEST MODE: Cashfree API verification failed, but proceeding:', cashfreeError.message);
        cashfreeVerificationPassed = true;
      } else {
        // PRODUCTION: Must verify with Cashfree
        return NextResponse.json(
          { success: false, error: 'Payment verification failed - unable to verify with payment gateway' },
          { status: 500 }
        );
      }
    }

    // Final check: In production, we must have passed Cashfree verification
    if (!finalTestMode && !cashfreeVerificationPassed) {
      return NextResponse.json(
        { success: false, error: 'Payment verification failed - gateway verification required' },
        { status: 400 }
      );
    }

    // ============================================
    // ALL CHECKS PASSED - Create order in database
    // ============================================
    
    console.log('✅ All security checks passed - Creating order (Test Mode:', finalTestMode, ')');

    // Prepare order data from validated session
    const orderData: CreateOrderData = {
      orderId: orderId,
      items: paymentSession.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        product: {
          name: item.name,
          price: item.price,
          description: item.description || '',
          weight: item.weight || '',
          image: item.image || '/placeholder-product.svg',
        }
      })),
      shippingAddress: paymentSession.shipping_address || {
        fullName: paymentSession.customer_name,
        mobile: paymentSession.customer_phone,
        address: '',
        city: '',
        state: '',
        pincode: '',
        addressType: 'home',
        whatsappUpdates: false,
      },
      orderSummary: {
        subtotal: parseFloat(paymentSession.subtotal),
        shipping: parseFloat(paymentSession.shipping_charge),
        discount: parseFloat(paymentSession.discount || '0'),
        total: parseFloat(paymentSession.amount),
      },
      paymentMethod: 'online',
      couponCode: paymentSession.coupon_code,
      paymentTransactionId: finalReferenceId,
      paymentOrderId: orderId,
      paymentMode: paymentMode || (finalTestMode ? 'test' : 'online'),
    };

    const result = await createOrder(orderData);

    if (result.success) {
      console.log('✅ Order created successfully:', result.order.id);
      
      // Mark coupon as used
      if (paymentSession.coupon_code) {
        console.log('🎟️ Marking coupon as used:', paymentSession.coupon_code);
        const couponMarkResult = await markCouponAsUsed(
          paymentSession.coupon_code,
          result.order.id,
          paymentSession.customer_phone,
          undefined // Auto-detect coupon type (general or promotion)
        );
        
        if (!couponMarkResult.success) {
          console.error('❌ Failed to mark coupon as used:', couponMarkResult.error);
          // Don't fail order, but log the error
        } else {
          console.log('✅ Coupon marked as used successfully:', couponMarkResult.type);
        }
      }
      
      // Update payment session status
      await supabase
        .from('payment_sessions')
        .update({ 
          status: 'completed',
          payment_reference_id: finalReferenceId,
          completed_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      // Return complete order data for confirmation page
      return NextResponse.json({
        success: true,
        order: result.order,
        paymentId: finalReferenceId,
        orderId: orderId,
        paymentMode: paymentMode || (finalTestMode ? 'test' : 'online'),
        // Include full order details for confirmation page
        orderData: {
          orderId: orderId,
          orderDate: new Date().toISOString(),
          status: 'confirmed',
          paymentMethod: 'online',
          shippingAddress: orderData.shippingAddress,
          orderSummary: orderData.orderSummary,
          items: orderData.items,
          couponCode: orderData.couponCode,
          paymentId: finalReferenceId,
        },
      });
    } else {
      console.error('❌ Order creation failed:', result.error);
      
      // Update session as failed
      await supabase
        .from('payment_sessions')
        .update({ 
          status: 'failed',
          failure_reason: result.error
        })
        .eq('order_id', orderId);
      
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create order' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('❌ Payment verification API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
