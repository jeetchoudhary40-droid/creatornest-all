// ============================================================
// Creator Nest — Cashfree Payment Gateway Integration
// Supports: v2023-08-01 PG API (Sandbox & Production)
// Provides automatic fallback to interactive simulation if keys are not yet configured.
// ============================================================

export interface CashfreeOrderParams {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl?: string;
  notifyUrl?: string;
  orderNote?: string;
}

export interface CashfreeOrderResult {
  success: boolean;
  orderId: string;
  paymentSessionId: string;
  orderStatus: string;
  isSimulation: boolean;
  error?: string;
}

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || '';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
const CASHFREE_ENVIRONMENT = (process.env.CASHFREE_ENVIRONMENT || 'TEST').toUpperCase();
const CASHFREE_API_VERSION = process.env.CASHFREE_API_VERSION || '2023-08-01';

const BASE_URL = CASHFREE_ENVIRONMENT === 'PROD' || CASHFREE_ENVIRONMENT === 'PRODUCTION'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

/**
 * Checks if Cashfree credentials are configured
 */
export function isCashfreeConfigured(): boolean {
  return Boolean(
    CASHFREE_APP_ID && 
    CASHFREE_SECRET_KEY && 
    !CASHFREE_APP_ID.includes('YOUR_') && 
    !CASHFREE_SECRET_KEY.includes('YOUR_')
  );
}

/**
 * Creates an order on Cashfree PG
 */
export async function createCashfreeOrder(params: CashfreeOrderParams): Promise<CashfreeOrderResult> {
  const {
    orderId,
    orderAmount,
    customerName,
    customerEmail,
    customerPhone,
    returnUrl,
    notifyUrl,
    orderNote = 'Creator Nest Digital AI Tool Purchase'
  } = params;

  // Clean phone number (must be 10 digits for India)
  const cleanPhone = (customerPhone || '9999999999').replace(/[^0-9]/g, '').slice(-10);
  const cleanEmail = customerEmail || 'customer@creatornest.in';
  const cleanName = customerName || 'Valued Creator';

  // 1. If keys are not configured or in local simulation mode
  if (!isCashfreeConfigured()) {
    console.log('[Cashfree] Keys not configured or simulation mode. Generating interactive test session for order:', orderId);
    return {
      success: true,
      orderId,
      paymentSessionId: `session_sim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      orderStatus: 'ACTIVE',
      isSimulation: true
    };
  }

  // 2. Real Cashfree PG API call
  try {
    const payload = {
      order_id: orderId,
      order_amount: Number(orderAmount.toFixed(2)),
      order_currency: 'INR',
      customer_details: {
        customer_id: `cust_${cleanPhone}_${Date.now().toString().slice(-4)}`,
        customer_name: cleanName,
        customer_email: cleanEmail,
        customer_phone: cleanPhone
      },
      order_meta: {
        return_url: returnUrl || `http://localhost:3000/marketplace/item/return?order_id={order_id}`,
        notify_url: notifyUrl || undefined
      },
      order_note: orderNote
    };

    const response = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'x-api-version': CASHFREE_API_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Cashfree API Error] Create Order Failed:', data);
      throw new Error(data.message || data.error || 'Cashfree order creation failed');
    }

    return {
      success: true,
      orderId: data.order_id,
      paymentSessionId: data.payment_session_id,
      orderStatus: data.order_status,
      isSimulation: false
    };
  } catch (err: any) {
    console.error('[Cashfree] Error creating order:', err);
    // Fall back to simulation if network error occurs in development
    if (process.env.NODE_ENV !== 'production') {
      return {
        success: true,
        orderId,
        paymentSessionId: `session_sim_${Date.now()}`,
        orderStatus: 'ACTIVE',
        isSimulation: true
      };
    }
    return {
      success: false,
      orderId,
      paymentSessionId: '',
      orderStatus: 'FAILED',
      isSimulation: false,
      error: err.message
    };
  }
}

/**
 * Verifies an order with Cashfree
 */
export async function verifyCashfreeOrder(orderId: string): Promise<{
  paid: boolean;
  status: string;
  orderAmount?: number;
  referenceId?: string;
  isSimulation?: boolean;
}> {
  if (!isCashfreeConfigured() || orderId.includes('sim_') || orderId.startsWith('order_sim_')) {
    return {
      paid: true,
      status: 'PAID',
      isSimulation: true
    };
  }

  try {
    const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'x-api-version': CASHFREE_API_VERSION
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Cashfree API Error] Verify Order Failed:', data);
      return { paid: false, status: data.order_status || 'UNKNOWN' };
    }

    const isPaid = data.order_status === 'PAID';
    return {
      paid: isPaid,
      status: data.order_status,
      orderAmount: data.order_amount,
      referenceId: data.cf_order_id ? String(data.cf_order_id) : undefined,
      isSimulation: false
    };
  } catch (err) {
    console.error('[Cashfree] Verify error:', err);
    return { paid: false, status: 'ERROR' };
  }
}
