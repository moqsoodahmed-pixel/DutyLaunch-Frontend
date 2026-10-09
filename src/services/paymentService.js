import { api } from './api.js';

/**
 * Razorpay payments. The browser only ever sends WHAT is being bought
 * (item type + id); the server looks up the price, creates the Razorpay
 * order and verifies the payment signature. The Razorpay key secret never
 * reaches the browser.
 */
export const paymentService = {
  config: () => api.get('/payments/config'),
  createOrder: ({ itemType, itemId }) => api.post('/payments/orders', { itemType, itemId }),
  verify: (razorpayResponse) =>
    api.post('/payments/verify', {
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_signature: razorpayResponse.razorpay_signature,
    }),
  failed: ({ orderId, reason }) => api.post('/payments/failed', { razorpay_order_id: orderId, reason }),
  mine: () => api.get('/payments/mine'),
  /** Paid templates the signed-in user owns, plus free-template allowance
   * status: { templates, freeTemplates, paidTemplates, freeTemplateUsed,
   * freeTemplateUsedId }. */
  entitlements: () => api.get('/payments/entitlements'),
  /** Marks the account's one-time free-template allowance as used. Call
   * right before handing over a finished free-template resume (download or
   * save), never on template selection alone — see the backend controller
   * for the exact idempotency rules. */
  consumeFreeTemplate: (templateId) => api.post('/payments/consume-free-template', { templateId }),
};