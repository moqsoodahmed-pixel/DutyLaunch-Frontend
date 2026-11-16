import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Truck,
  CreditCard,
  Smartphone,
  Building2,
  FileText,
  Mail,
  Linkedin,
  RotateCcw,
  Sparkles,
  User,
} from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { paymentService } from '../../services/paymentService.js';
import { formatCurrency } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

export function PackageCheckoutModal({
  isOpen,
  onClose,
  packageData,
  onPaymentSuccess,
}) {
  const { user, login, register } = useAuth();
  const toast = useToast();

  // Guest auth form state
  const [authMode, setAuthMode] = useState('register'); // 'register' | 'login'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Processing state
  const [loading, setLoading] = useState(false);
  const [mockOrder, setMockOrder] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'

  if (!isOpen || !packageData) return null;

  const price = packageData.price || 399;
  const gstAmount = Math.round(price * 0.18);
  const totalAmount = price + gstAmount;

  async function handleProceedToPay(e) {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      let activeUser = user;

      // 1. If not authenticated, register or login user first
      if (!activeUser) {
        if (!email.trim()) {
          toast.error('Please enter your email address to proceed.');
          setLoading(false);
          return;
        }

        if (authMode === 'register') {
          if (!fullName.trim()) {
            toast.error('Please enter your full name.');
            setLoading(false);
            return;
          }
          const generatedPwd = password.trim() || 'DutyLaunch@2026!';
          try {
            activeUser = await register({
              name: fullName.trim(),
              email: email.trim().toLowerCase(),
              phone: phone.trim() || undefined,
              password: generatedPwd,
              role: 'user',
            });
            toast.success(`Account created! Welcome, ${fullName.trim()}.`);
          } catch (regErr) {
            // If already exists, prompt to switch to login
            if (regErr.message?.toLowerCase().includes('already exists') || regErr.status === 409) {
              setAuthMode('login');
              toast.info('An account with this email already exists. Please enter your password to sign in.');
              setLoading(false);
              return;
            }
            throw regErr;
          }
        } else {
          // Login
          if (!password.trim()) {
            toast.error('Please enter your password to sign in.');
            setLoading(false);
            return;
          }
          activeUser = await login({
            email: email.trim().toLowerCase(),
            password: password.trim(),
          });
          toast.success(`Signed in as ${activeUser.name}.`);
        }
      }

      // 2. Initiate Payment Order on backend
      const { data: order } = await paymentService.createOrder({
        itemType: 'cv-package',
        itemId: packageData._id,
      });

      // 3. Handle Mock / Dev environment or Live Razorpay
      if (order.orderId?.startsWith('order_mock_') || order.keyId?.includes('mock')) {
        // Display realistic payment selection screen in modal
        setMockOrder(order);
        setLoading(false);
        return;
      }

      // Real Razorpay gateway
      if (window.Razorpay) {
        const checkout = new window.Razorpay({
          key: order.keyId,
          order_id: order.orderId,
          amount: order.amount,
          currency: order.currency,
          name: 'DutyLaunch',
          description: `${order.itemName} (incl. 18% GST)`,
          prefill: order.prefill,
          theme: { color: '#1D5DB8' },
          handler: async (response) => {
            try {
              const verified = await paymentService.verify(response);
              toast.success(`Payment confirmed for ${packageData.name}!`);
              onPaymentSuccess(verified?.data || verified, packageData);
              onClose();
            } catch (err) {
              toast.error(err.message || 'Payment confirmation failed.');
            }
          },
          modal: {
            ondismiss: () => setLoading(false),
          },
        });
        checkout.open();
      } else {
        throw new Error('Payment gateway is loading. Please try again.');
      }
    } catch (err) {
      toast.error(err.message || 'Could not initiate checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Handle Mock Payment completion in dev/sandbox
  async function handleConfirmMockPayment() {
    if (!mockOrder) return;
    setLoading(true);
    try {
      const verified = await paymentService.verify({
        razorpay_order_id: mockOrder.orderId,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: '0'.repeat(64),
      });
      toast.success(`Payment of ₹${totalAmount} confirmed for ${packageData.name}!`);
      onPaymentSuccess(verified?.data || verified, packageData);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Could not verify test payment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d2a5c] via-[#123875] to-[#1a4a8d] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 backdrop-blur-md text-azure-100">
              <ShieldCheck className="h-5 w-5 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-200">
                  Secure Checkout
                </span>
                <span className="text-xs text-sky-200 font-medium">128-bit SSL</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {packageData.name} &bull; {packageData.experienceBand || '0 to 2 years'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close checkout"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Order Summary & Deliverables Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-azure">
                  Package Inclusions
                </span>
                <p className="text-sm font-extrabold text-ink">{packageData.name}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-400 line-through">
                  ₹{packageData.originalPrice || 899}
                </span>
                <p className="text-lg font-black text-ink">₹{price}</p>
              </div>
            </div>

            {/* Inclusions Grid */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-azure shrink-0" />
                <span>ATS-Friendly CV (PDF + DOCX)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-azure shrink-0" />
                <span>Customised Cover Letter</span>
              </div>
              <div className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-[#0077b5] shrink-0" />
                <span>LinkedIn Profile Optimisation</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-azure shrink-0" />
                <span>1 Month Unlimited Revisions</span>
              </div>
            </div>

            {/* SLA Badge */}
            <div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-1.5 border border-emerald-200 text-xs font-bold text-emerald-900">
              <div className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-emerald-600" />
                <span>Turnaround SLA: Delivery in 2–3 Days</span>
              </div>
              <span className="text-emerald-700 text-[11px]">Guaranteed</span>
            </div>

            {/* Price Breakdown */}
            <div className="mt-3.5 space-y-1.5 border-t border-slate-200 pt-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Base Package Fee:</span>
                <span className="font-semibold text-slate-800">₹{price}</span>
              </div>
              <div className="flex justify-between">
                <span>Applicable GST (18%):</span>
                <span className="font-semibold text-slate-800">₹{gstAmount}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm font-extrabold text-ink">
                <span>Total Amount Payable:</span>
                <span className="text-azure font-black">₹{totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Conditional: Mock Payment Simulator View */}
          {mockOrder ? (
            <div className="rounded-xl border-2 border-azure/40 bg-azure-50/30 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-azure">
                    Select Payment Method
                  </span>
                  <h3 className="text-base font-extrabold text-ink">Complete Payment (₹{totalAmount})</h3>
                </div>
                <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-bold">
                  Test Gateway Active
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('upi')}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all',
                    selectedMethod === 'upi'
                      ? 'border-azure bg-white shadow-sm ring-2 ring-azure/20 text-azure'
                      : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                  )}
                >
                  <Smartphone className="h-5 w-5 mb-1" />
                  <span className="text-xs font-bold">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all',
                    selectedMethod === 'card'
                      ? 'border-azure bg-white shadow-sm ring-2 ring-azure/20 text-azure'
                      : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                  )}
                >
                  <CreditCard className="h-5 w-5 mb-1" />
                  <span className="text-xs font-bold">Debit / Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('netbanking')}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all',
                    selectedMethod === 'netbanking'
                      ? 'border-azure bg-white shadow-sm ring-2 ring-azure/20 text-azure'
                      : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                  )}
                >
                  <Building2 className="h-5 w-5 mb-1" />
                  <span className="text-xs font-bold">Net Banking</span>
                </button>
              </div>

              <div className="rounded-lg bg-white p-3 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p>
                  <strong>Gateway Order ID:</strong> {mockOrder.orderId}
                </p>
                <p>
                  <strong>Simulated Mode:</strong> Google Pay, PhonePe, Cards & NetBanking approved.
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  className="flex-1 py-3 text-sm font-bold shadow-md"
                  variant="primary"
                  onClick={handleConfirmMockPayment}
                  loading={loading}
                >
                  <Lock className="mr-1.5 h-4 w-4" /> Pay ₹{totalAmount} & Unlock Upload Form
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setMockOrder(null)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* Standard Checkout Form: Signed-In vs Guest */
            <div className="space-y-4">
              {user ? (
                /* Authenticated User View */
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Candidate Account Details
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Verified
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-slate-800">
                    <p className="font-extrabold text-ink">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    {user.phone && <p className="text-xs text-slate-500">{user.phone}</p>}
                  </div>
                </div>
              ) : (
                /* Guest Checkout Form */
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
                  {/* Mode Selector */}
                  <div className="flex border-b border-slate-200 pb-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className={cn(
                        'text-xs font-bold pb-1 transition-all border-b-2',
                        authMode === 'register'
                          ? 'border-azure text-azure'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      )}
                    >
                      1. Instant Checkout (New Candidate)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className={cn(
                        'text-xs font-bold pb-1 transition-all border-b-2',
                        authMode === 'login'
                          ? 'border-azure text-azure'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      )}
                    >
                      2. Sign In to Existing Account
                    </button>
                  </div>

                  {authMode === 'register' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Chandu Gowda"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-azure focus:ring-1 focus:ring-azure"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="chandu@example.com"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-azure focus:ring-1 focus:ring-azure"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Phone / WhatsApp Number
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-azure focus:ring-1 focus:ring-azure"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Account Password (optional)
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create password or leave blank for auto-account"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-azure focus:ring-1 focus:ring-azure"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Registered Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your-email@example.com"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-azure focus:ring-1 focus:ring-azure"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Password *
                        </label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Your account password"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-azure focus:ring-1 focus:ring-azure"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Direct Proceed to Payment Button */}
              <Button
                className="w-full py-3.5 text-sm font-bold shadow-lg"
                variant="primary"
                onClick={handleProceedToPay}
                loading={loading}
              >
                <Lock className="mr-1.5 h-4 w-4" /> Proceed to Payment (₹{totalAmount}){' '}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Razorpay Verified
                </span>
                <span>&bull;</span>
                <span>Includes 18% GST Tax Invoice</span>
                <span>&bull;</span>
                <span>Delivery in 2–3 Days</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
