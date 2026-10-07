import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { paymentService } from '../services/paymentService.js';
import { formatCurrency } from '../utils/format.js';

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptPromise = null;
/** Loads Razorpay Checkout once, on first use, instead of on every page. */
function loadCheckoutScript() {
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = CHECKOUT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error('Could not load the payment window. Check your connection and try again.'));
      };
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

let configPromise = null;
/** Whether online payment is switched on (cached for the session). */
function loadPaymentsConfig() {
  if (!configPromise) {
    configPromise = paymentService
      .config()
      .then((res) => res.data)
      .catch(() => {
        configPromise = null;
        return { enabled: false };
      });
  }
  return configPromise;
}

/**
 * Opens Razorpay Checkout for one item.
 *
 *   const { pay, pendingId, enabled } = useRazorpayCheckout();
 *   <Button onClick={() => pay({ itemType: 'cv-package', itemId: pkg._id })} loading={pendingId === pkg._id} />
 *
 * Signed-out visitors are sent to sign in and brought back to this page.
 */
export function useRazorpayCheckout() {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingId, setPendingId] = useState(null);
  const [enabled, setEnabled] = useState(null); // null = still checking

  useEffect(() => {
    let active = true;
    loadPaymentsConfig().then((cfg) => active && setEnabled(Boolean(cfg?.enabled)));
    return () => {
      active = false;
    };
  }, []);

  const pay = useCallback(
    async ({ itemType, itemId }) => {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: location.pathname + location.search } });
        return;
      }
      if (pendingId) return;
      setPendingId(itemId);

      try {
        await loadCheckoutScript();
        const { data: order } = await paymentService.createOrder({ itemType, itemId });
        const gst = order.breakdown?.gstAmount
          ? ` (incl. ${order.breakdown.gstRate}% GST ${formatCurrency(order.breakdown.gstAmount / 100, order.currency)})`
          : '';

        const checkout = new window.Razorpay({
          key: order.keyId,
          order_id: order.orderId,
          amount: order.amount,
          currency: order.currency,
          name: 'DutyLaunch',
          description: `${order.itemName}${gst}`.slice(0, 255),
          prefill: order.prefill,
          theme: { color: '#1D5DB8' },
          handler: async (response) => {
            try {
              await paymentService.verify(response);
              toast.success(`Payment successful. Thank you — ${order.itemName} is confirmed.`);
              if (user?.role !== 'admin') navigate('/payments');
            } catch (error) {
              toast.error(error.message || 'We could not confirm your payment. Contact support with your payment id.');
            } finally {
              setPendingId(null);
            }
          },
          modal: {
            ondismiss: () => setPendingId(null),
          },
        });

        // Razorpay keeps its window open after a failed attempt so the user
        // can retry with another method; we only record the failure.
        checkout.on('payment.failed', (response) => {
          const reason = response?.error?.description || 'Payment failed';
          paymentService.failed({ orderId: order.orderId, reason }).catch(() => {});
          toast.error(`${reason}. You can try again with another method.`);
        });

        checkout.open();
      } catch (error) {
        toast.error(error.message || 'Could not start the payment. Try again.');
        setPendingId(null);
      }
    },
    [isAuthenticated, user, toast, navigate, location.pathname, location.search, pendingId]
  );

  return { pay, pendingId, enabled };
}
