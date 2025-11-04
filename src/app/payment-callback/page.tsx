'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header/Header';
import styles from './PaymentCallback.module.css';

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    // Log the full URL and all search params
    console.log('Full URL:', window.location.href);
    console.log('URL Search:', window.location.search);
    
    // Get all parameters from URL
    const allParams = Object.fromEntries(searchParams.entries());
    console.log('All URL parameters:', allParams);
    
    // Check if we're in test mode
    const isTestMode = process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT !== 'PRODUCTION';
    console.log('Payment environment:', isTestMode ? 'TEST' : 'PRODUCTION');
    
    // Cashfree sends response in query parameters
    // Try different possible parameter names
    const orderId = searchParams.get('order_id') || 
                   searchParams.get('orderId') || 
                   searchParams.get('order-id') ||
                   searchParams.get('orderid') ||
                   allParams['order_id'] ||
                   allParams['orderId'] ||
                   allParams['order-id'];
    
    const orderAmount = searchParams.get('order_amount') || 
                       searchParams.get('orderAmount') || 
                       searchParams.get('order-amount') ||
                       allParams['order_amount'] ||
                       allParams['orderAmount'];
    
    const referenceId = searchParams.get('reference_id') || 
                       searchParams.get('referenceId') || 
                       searchParams.get('reference-id') ||
                       allParams['reference_id'] ||
                       allParams['referenceId'];
    
    const txStatus = searchParams.get('tx_status') || 
                    searchParams.get('txStatus') || 
                    searchParams.get('tx-status') ||
                    searchParams.get('status') ||
                    allParams['tx_status'] ||
                    allParams['txStatus'] ||
                    allParams['status'];
    
    const paymentMode = searchParams.get('payment_mode') || 
                       searchParams.get('paymentMode') || 
                       searchParams.get('payment-mode') ||
                       allParams['payment_mode'] ||
                       allParams['paymentMode'];
    
    const txMsg = searchParams.get('tx_msg') || 
                 searchParams.get('txMsg') || 
                 searchParams.get('tx-msg') ||
                 searchParams.get('message') ||
                 allParams['tx_msg'] ||
                 allParams['txMsg'] ||
                 allParams['message'];
    
    const txTime = searchParams.get('tx_time') || 
                  searchParams.get('txTime') || 
                  searchParams.get('tx-time') ||
                  allParams['tx_time'] ||
                  allParams['txTime'];
    
    const signature = searchParams.get('signature') || 
                     allParams['signature'];

    // Log all received parameters for debugging
    console.log('Parsed payment callback parameters:', {
      orderId,
      orderAmount,
      referenceId,
      txStatus,
      paymentMode,
      txMsg,
      txTime,
      signature: signature ? `${signature.substring(0, 20)}...` : null,
      isTestMode,
    });

    // Get order data from localStorage first (as fallback for orderId)
    const storedOrderData = localStorage.getItem('vedputra_pending_order');
    let orderData = null;
    
    if (storedOrderData) {
      try {
        orderData = JSON.parse(storedOrderData);
        console.log('Retrieved order data from localStorage:', {
          orderId: orderData?.orderId,
          hasItems: !!orderData?.items,
        });
      } catch (e) {
        console.error('Failed to parse stored order data:', e);
      }
    }

    // Use orderId from URL or fallback to localStorage
    const finalOrderId = orderId || orderData?.orderId;
    
    // Check if we have the minimum required parameters
    if (!finalOrderId) {
      console.error('Missing order_id in payment callback and localStorage');
      console.error('Available URL params:', Object.keys(allParams));
      setStatus('failed');
      setMessage('Invalid payment response: Missing order ID. Please check console for details and contact support.');
      return;
    }

    // If status is missing, try to infer from other parameters
    // If we have referenceId, payment was likely successful
    let finalTxStatus = txStatus;
    
    if (!finalTxStatus && referenceId) {
      console.warn('Status missing but referenceId exists - assuming SUCCESS');
      finalTxStatus = 'SUCCESS';
    } else if (!finalTxStatus) {
      // Check if URL contains success indicators
      const urlLower = window.location.href.toLowerCase();
      if (urlLower.includes('success') || urlLower.includes('paid') || urlLower.includes('completed')) {
        console.warn('Status missing but URL suggests success - assuming SUCCESS');
        finalTxStatus = 'SUCCESS';
      } else if (urlLower.includes('fail') || urlLower.includes('error') || urlLower.includes('cancelled')) {
        console.warn('Status missing but URL suggests failure');
        finalTxStatus = 'FAILED';
      } else {
        // If we have orderId and orderData, proceed anyway
        // The verification API will check with Cashfree if payment was successful
        console.warn('Status missing - will proceed with order creation and verify payment status');
        console.warn('Available URL params:', Object.keys(allParams));
        console.warn('Full URL:', window.location.href);
        // In test mode, assume success if we reached callback page
        // In production, this would be stricter
        finalTxStatus = isTestMode ? 'SUCCESS' : 'FAILED';
      }
    }

    // Verify payment - SECURE VERSION with TEST MODE support
    console.log('Payment status:', finalTxStatus);
    console.log('Has referenceId:', !!referenceId);
    console.log('Has signature:', !!signature);
    console.log('Test mode:', isTestMode);

    if (finalTxStatus === 'SUCCESS' || finalTxStatus === 'success' || finalTxStatus === 'Success') {
      // In test mode, referenceId and signature might be missing - handle gracefully
      // In production, these are mandatory for security
      if (!isTestMode) {
        // PRODUCTION MODE: Strict validation
        if (!referenceId) {
          console.error('Payment successful but missing reference_id (PRODUCTION)');
          setStatus('failed');
          setMessage('Payment verification failed - missing transaction ID. Please contact support with order ID: ' + finalOrderId);
          return;
        }

        if (!signature) {
          console.error('❌ SECURITY: Payment successful but missing signature (PRODUCTION)');
          setStatus('failed');
          setMessage('Payment verification failed - missing signature. Please contact support with order ID: ' + finalOrderId);
          return;
        }
      } else {
        // TEST MODE: Generate fallback referenceId if missing
        const finalReferenceId = referenceId || `TEST_${finalOrderId}_${Date.now()}`;
        console.log('Test mode: Using referenceId:', finalReferenceId);
        
        // Generate a test signature if missing (for consistency, not security)
        const finalSignature = signature || 'test_signature_' + finalReferenceId;
        console.log('Test mode: Using test signature');
        
        // Override with generated values for test mode
        const testReferenceId = finalReferenceId;
        const testSignature = finalSignature;
        
        // Send verification request with test mode indicator
        verifyAndCreateOrder({
          orderId: finalOrderId,
          orderAmount: parseFloat(orderAmount || '0'),
          referenceId: testReferenceId,
          txStatus: finalTxStatus,
          paymentMode: paymentMode || 'test',
          txMsg: txMsg || 'Test payment',
          txTime: txTime || new Date().toISOString(),
          signature: testSignature,
          isTestMode: true,
        });
        return;
      }

      // PRODUCTION MODE: Send verification with actual referenceId and signature
      verifyAndCreateOrder({
        orderId: finalOrderId,
        orderAmount: parseFloat(orderAmount || '0'),
        referenceId: referenceId,
        txStatus: finalTxStatus,
        paymentMode: paymentMode || 'unknown',
        txMsg: txMsg || '',
        txTime: txTime || new Date().toISOString(),
        signature: signature,
        isTestMode: false,
      });
    } else {
      console.error('Payment failed with status:', finalTxStatus, 'Message:', txMsg);
      setStatus('failed');
      setMessage(txMsg || `Payment ${finalTxStatus}. Please try again.`);
      // Clear pending order data
      localStorage.removeItem('vedputra_pending_order');
    }
  }, [searchParams]);

  const verifyAndCreateOrder = async (paymentData: any) => {
    try {
      console.log('🔒 SECURE: Verifying payment with server-side validation:', {
        orderId: paymentData.orderId,
        referenceId: paymentData.referenceId,
        txStatus: paymentData.txStatus,
        hasSignature: !!paymentData.signature,
        isTestMode: paymentData.isTestMode,
      });

      // Send only payment response parameters
      // Server will get order data from payment_sessions table (cannot be tampered)
      const verificationPayload = {
        orderId: paymentData.orderId,
        orderAmount: paymentData.orderAmount,
        referenceId: paymentData.referenceId,
        txStatus: paymentData.txStatus,
        paymentMode: paymentData.paymentMode,
        txMsg: paymentData.txMsg,
        txTime: paymentData.txTime,
        signature: paymentData.signature,
        isTestMode: paymentData.isTestMode || false,
      };

      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationPayload),
      });

      console.log('Verification API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Verification API error:', errorText);
        throw new Error(`Verification failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Verification result:', result);

      if (result.success) {
        setStatus('success');
        setMessage('Payment successful! Your order has been confirmed.');

        // Save complete order data to localStorage for immediate display
        const localOrderData = result.orderData || {
          orderId: paymentData.orderId,
          paymentId: paymentData.referenceId,
          paymentMode: paymentData.paymentMode,
          orderDate: new Date().toISOString(),
          status: 'confirmed',
        };
        localStorage.setItem('vedputra_last_order', JSON.stringify(localOrderData));

        // Clear pending order and applied coupon
        localStorage.removeItem('vedputra_pending_order');
        localStorage.removeItem('vedputra_applied_coupon');
        
        // Clear cart using CartContext
        clearCart();

        // Redirect to order confirmation after 2 seconds
        setTimeout(() => {
          router.push(`/order-confirmation?orderId=${paymentData.orderId}&paymentId=${paymentData.referenceId}`);
        }, 2000);
      } else {
        setStatus('failed');
        setMessage(result.error || 'Payment verification failed. Please contact support.');
        localStorage.removeItem('vedputra_pending_order');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      setMessage('Error processing payment. Please contact support.');
      localStorage.removeItem('vedputra_pending_order');
    }
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.card}>
          {status === 'processing' && (
            <>
            <div className={styles.spinner}></div>
            <h2>Processing Payment...</h2>
            <p>{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className={styles.successIcon}>✓</div>
            <h2>Payment Successful!</h2>
            <p>{message}</p>
            <p className={styles.redirectText}>Redirecting to order confirmation...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className={styles.errorIcon}>✗</div>
            <h2>Payment Failed</h2>
            <p>{message}</p>
            <div className={styles.actions}>
              <Link href="/checkout" className={styles.retryBtn}>
                Try Again
              </Link>
              <Link href="/cart" className={styles.backBtn}>
                Back to Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.spinner}></div>
          <h2>Loading...</h2>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}

