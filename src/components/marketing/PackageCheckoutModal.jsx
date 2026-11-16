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
  Plus,
  Check,
  Briefcase,
  Monitor,
} from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { GoogleAuthButton } from '../auth/GoogleAuthButton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { paymentService } from '../../services/paymentService.js';
import { formatCurrency } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
let scriptPromise = null;

function loadCheckoutScript() {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve();
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

export const CAREER_ADDONS = [
  {
    id: 'portfolio',
    name: 'Visual Executive Portfolio (PDF)',
    price: 999,
    originalPrice: 2999,
    badge: 'Popular Add-on',
    icon: Briefcase,
    description: 'Executive presentation deck showcasing key projects, business impact metrics & case studies.',
  },
  {
    id: 'webPortfolio',
    name: 'Live Personal Web Portfolio',
    price: 1999,
    originalPrice: 3999,
    badge: 'Top Pick',
    icon: Monitor,
    description: 'Custom responsive web portfolio with hosted personal link for LinkedIn and CV bio.',
  },
  {
    id: 'mockInterview',
    name: '1-on-1 Mock Interview Session',
    price: 699,
    originalPrice: 1499,
    badge: 'Coaching',
    icon: User,
    description: '30-minute tailored interview practice with real questions, constructive feedback & salary coaching.',
  },
];

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

  // Addons state
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);

  // Processing state
  const [loading, setLoading] = useState(false);
  const [mockOrder, setMockOrder] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'

  if (!isOpen || !packageData) return null;

  const basePrice = packageData.price || 399;
  const addonsPrice = selectedAddonIds.reduce((sum, id) => {
    const found = CAREER_ADDONS.find((a) => a.id === id);
    return sum + (found ? found.price : 0);
  }, 0);

  const subtotal = basePrice + addonsPrice;
  const gstAmount = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + gstAmount;

  function toggleAddon(id) {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

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

      // 2. Ensure Razorpay script is loaded
      await loadCheckoutScript().catch(() => {});

      // 3. Initiate Payment Order on backend with selected addons
      const { data: order } = await paymentService.createOrder({
        itemType: 'cv-package',
        itemId: packageData._id,
        addonIds: selectedAddonIds,
      });

      // 4. Handle Mock / Dev environment or Live Razorpay
      if (order.orderId?.startsWith('order_mock_') || order.keyId?.includes('mock') || !window.Razorpay) {
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
          prefill: order.prefill || {
            name: activeUser?.name || fullName,
            email: activeUser?.email || email,
            contact: activeUser?.phone || phone,
          },
          theme: { color: '#1D5DB8' },
          handler: async (response) => {
            try {
              const verified = await paymentService.verify(response);
              toast.success(`Payment confirmed for ${packageData.name}!`);
              onPaymentSuccess(verified?.data || verified, packageData, selectedAddonIds);
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
      onPaymentSuccess(verified?.data || verified, packageData, selectedAddonIds);
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
                <span className="text-xs text-sky-200 font-medium">128-bit SSL &bull; Razorpay Verified</span>
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

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {mockOrder ? (
            /* Dedicated Payment Gateway Simulator View */
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-azure">
                      Order Summary
                    </span>
                    <p className="text-sm font-extrabold text-ink">{mockOrder.itemName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Total Payable</span>
                    <p className="text-lg font-black text-ink">₹{totalAmount}</p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-600 flex justify-between">
                  <span>Turnaround SLA:</span>
                  <span className="font-bold text-emerald-700">
                    Delivery in 2–3 Days <span className="text-red-600 font-extrabold">*</span>
                  </span>
                </div>
              </div>

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
            </div>
          ) : (
            <>
              {/* Order Summary & Inclusions */}
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
                    <p className="text-lg font-black text-ink">₹{basePrice}</p>
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

                {/* SLA Badge with Star Mark */}
                <div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-1.5 border border-emerald-200 text-xs font-bold text-emerald-900">
                  <div className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-emerald-600" />
                    <span>
                      Turnaround SLA: Delivery in 2–3 Days <span className="text-red-600 font-extrabold">*</span>
                    </span>
                  </div>
                  <span className="text-emerald-700 text-[11px]">Guaranteed</span>
                </div>
                <p className="mt-1 text-[10.5px] text-slate-500 italic">
                  * Turnaround begins once current CV and career brief are submitted.
                </p>
              </div>

              {/* ProResumes-style Career Addons / Portfolio Section */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-azure">
                      Boost Your Application
                    </span>
                    <h3 className="text-sm font-bold text-ink">Recommended Add-ons & Portfolios</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">Optional</span>
                </div>

                <div className="space-y-2.5">
                  {CAREER_ADDONS.map((addon) => {
                    const isSelected = selectedAddonIds.includes(addon.id);
                    const Icon = addon.icon;

                    return (
                      <div
                        key={addon.id}
                        data-testid={`addon-${addon.id}`}
                        onClick={() => toggleAddon(addon.id)}
                        className={cn(
                          'flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all',
                          isSelected
                            ? 'border-azure bg-azure-50/40 ring-1 ring-azure'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                        )}
                      >
                        <div className="flex items-start gap-2.5 flex-1 pr-3">
                          <div
                            className={cn(
                              'mt-0.5 grid h-5 w-5 place-items-center rounded border transition-colors shrink-0',
                              isSelected
                                ? 'border-azure bg-azure text-white'
                                : 'border-slate-300 bg-white'
                            )}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-ink">{addon.name}</span>
                              <span className="rounded bg-sky-100 text-sky-800 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
                                {addon.badge}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                              {addon.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-xs font-black text-ink">+₹{addon.price}</p>
                          <p className="text-[10px] text-slate-400 line-through">₹{addon.originalPrice}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Price Breakdown */}
                <div className="mt-3.5 space-y-1.5 border-t border-slate-200 pt-3 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Base Package Fee:</span>
                    <span className="font-semibold text-slate-800">₹{basePrice}</span>
                  </div>
                  {addonsPrice > 0 && (
                    <div className="flex justify-between text-azure">
                      <span>Selected Add-ons ({selectedAddonIds.length}):</span>
                      <span className="font-semibold">+₹{addonsPrice}</span>
                    </div>
                  )}
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

              {/* Standard Checkout Form: Signed-In vs Guest */}
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

                    {/* Fast Google Auth for 1-Click Checkout */}
                    <div>
                      <GoogleAuthButton
                        label="Instant Checkout with Google"
                        onSuccess={(loggedInUser) => {
                          setFullName(loggedInUser.name || '');
                          setEmail(loggedInUser.email || '');
                        }}
                      />
                      <div className="my-3 flex items-center gap-2" role="separator">
                        <span className="h-px flex-1 bg-slate-200" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">OR WITH EMAIL</span>
                        <span className="h-px flex-1 bg-slate-200" />
                      </div>
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
                  <span>
                    Delivery in 2–3 Days <span className="text-red-600 font-extrabold">*</span>
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
