import { Cashfree, CFEnvironment } from 'cashfree-pg';

// Initialize Cashfree client
export function getCashfreeClient() {
  const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID || '';
  const secretKey = process.env.CASHFREE_SECRET_KEY || '';
  const environment = process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT || 'TEST';

  // Convert environment string to CFEnvironment enum
  const cfEnvironment = environment === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

  // Initialize Cashfree with correct parameters
  // Constructor: (XEnvironment, XClientId, XClientSecret, ...)
  const cashfree = new Cashfree(
    cfEnvironment,
    appId,      // XClientId (App ID)
    secretKey   // XClientSecret (Secret Key)
  );

  // Set API version
  cashfree.XApiVersion = '2023-08-01';

  return cashfree;
}

// Verify payment signature
export function verifyPaymentSignature(
  orderId: string,
  orderAmount: number,
  referenceId: string,
  txStatus: string,
  paymentMode: string,
  txMsg: string,
  txTime: string,
  signature: string
): boolean {
  const crypto = require('crypto');
  const secretKey = process.env.CASHFREE_SECRET_KEY || '';
  
  // Create message string for signature verification
  const message = `${orderId}${orderAmount}${referenceId}${txStatus}${paymentMode}${txMsg}${txTime}`;
  
  // Generate signature
  const generatedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(message)
    .digest('hex');
  
  return generatedSignature === signature;
}

// Create payment session
export async function createPaymentSession(
  orderId: string,
  orderAmount: number,
  orderCurrency: string,
  customerDetails: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  },
  orderMeta: {
    returnUrl: string;
    notifyUrl?: string;
  }
) {
  try {
    // Check environment variables first
    const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID || '';
    const secretKey = process.env.CASHFREE_SECRET_KEY || '';
    const environment = process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT || 'TEST';
    
    if (!secretKey || !appId) {
      console.error('Cashfree credentials not set:', {
        hasAppId: !!appId,
        hasSecretKey: !!secretKey,
      });
      return {
        success: false,
        error: 'Payment gateway configuration error. Please contact support.',
      };
    }
    
    const cashfree = getCashfreeClient();
    
    const sessionRequest = {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: orderCurrency,
      customer_details: {
        customer_id: customerDetails.customerId,
        customer_name: customerDetails.customerName,
        customer_email: customerDetails.customerEmail,
        customer_phone: customerDetails.customerPhone,
      },
      order_meta: {
        return_url: orderMeta.returnUrl,
        notify_url: orderMeta.notifyUrl || orderMeta.returnUrl,
      },
    };

    console.log('Creating Cashfree order with request:', JSON.stringify(sessionRequest, null, 2));
    console.log('Using Cashfree App ID:', appId ? `${appId.substring(0, 10)}...` : 'NOT SET');
    console.log('Using Cashfree Environment:', environment);

    // Use PGCreateOrder method from cashfree-pg SDK
    // The method signature: PGCreateOrder(CreateOrderRequest, x_request_id?, x_idempotency_key?, options?)
    // Note: The API version is set in the client instance (XApiVersion)
    const response = await cashfree.PGCreateOrder(sessionRequest);
    
    // Extract data from Axios response
    const orderData = response.data;
    
    console.log('Cashfree order response:', JSON.stringify(orderData, null, 2));
    
    // Extract payment session ID from response
    // Cashfree returns payment_session_id in snake_case format
    const paymentSessionId = orderData.payment_session_id || 
                            (orderData as any)?.payment_session_id;
    
    const responseOrderId = orderData.order_id || orderId;
    
    if (!paymentSessionId) {
      console.error('Payment session ID not found in response:', orderData);
      return {
        success: false,
        error: 'Payment session ID not received from payment gateway',
      };
    }
    
    return {
      success: true,
      paymentSessionId: paymentSessionId,
      orderId: responseOrderId,
    };
  } catch (error: any) {
    console.error('Cashfree payment session creation error:', error);
    
    // More detailed error logging
    if (error.response) {
      console.error('Cashfree API response error:', error.response.data || error.response.body);
      console.error('Cashfree API response status:', error.response.status);
      console.error('Cashfree API response headers:', error.response.headers);
    }
    if (error.message) {
      console.error('Cashfree error message:', error.message);
    }
    if (error.stack) {
      console.error('Cashfree error stack:', error.stack);
    }
    
    // Check if environment variables are set
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    if (!secretKey) {
      console.error('CASHFREE_SECRET_KEY is not set in environment variables');
      return {
        success: false,
        error: 'Payment gateway configuration error. Please contact support.',
      };
    }
    
    // Extract error message from response
    let errorMessage = 'Failed to create payment session';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

