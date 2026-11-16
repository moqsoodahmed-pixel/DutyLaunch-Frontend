import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Target,
  ArrowRight,
  FileCheck2,
  HelpCircle,
  AlertCircle,
  UserCheck,
  Zap,
  RotateCcw,
  Mail,
  Linkedin,
  Truck,
  Award,
  Sparkles,
  Download,
  Receipt,
  ChevronRight,
  RefreshCw,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { Seo } from '../../components/ui/Seo.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { LoadingBlock, ErrorState } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { pricingService } from '../../services/contentService.js';
import { resumeOrderService } from '../../services/resumeOrderService.js';
import { useRazorpayCheckout } from '../../hooks/useRazorpayCheckout.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';
import { PackageCheckoutModal } from '../../components/marketing/PackageCheckoutModal.jsx';

// Backward compatibility exports for legacy wizard imports
export const BUILDER_AI_OPTIMIZE_KEY = 'dl_builder_ai_optimize';
export const BUILDER_AI_REPORT_KEY = 'dl_builder_ai_report';

const STEPS = [
  { step: '1', title: 'Select Experience Package', desc: 'Choose the band matching your career stage' },
  { step: '2', title: 'Complete Secure Payment', desc: 'Instant online checkout via Razorpay with 18% GST invoice' },
  { step: '3', title: 'Upload Existing Resume/CV', desc: 'Attach PDF, DOC, or DOCX and target career instructions' },
  { step: '4', title: 'Handcrafted by Senior Specialists', desc: 'Comprehensive rewriting, ATS keyword optimization & quality audit' },
  { step: '5', title: 'Download Finished Files', desc: 'Receive finished CV, cover letter & LinkedIn guide in 2–3 days' },
];

// Fallback pricing metadata if backend packages are loading or need decoration
const DEFAULT_PACKAGES = [
  {
    _id: '6af812abf87d01f285883dc4',
    name: 'Early Career Bundle',
    experienceBand: '0 to 2 years',
    price: 399,
    originalPrice: 899,
    currency: 'INR',
    saveText: 'Save ₹500',
    tagline: 'Handcrafted resume for graduates and entry-level professionals.',
    features: [
      { label: 'ATS-friendly CV crafted manually by expert writers' },
      { label: 'Customised cover letter' },
      { label: 'LinkedIn profile optimisation' },
      { label: '1 month unlimited revisions' },
      { label: '2 to 3 day delivery' },
      { label: 'Positioning for internships, trainee and entry-level roles' },
    ],
  },
  {
    _id: '6af812abf87d01f285883dcc',
    name: 'Mid-Level Professional',
    experienceBand: '3 to 5 years',
    price: 799,
    originalPrice: 1499,
    currency: 'INR',
    isPopular: true,
    saveText: 'Save ₹700',
    tagline: 'Turn your achievements and projects into high career impact.',
    features: [
      { label: 'ATS-friendly CV crafted manually by expert writers' },
      { label: 'Customised cover letter' },
      { label: 'LinkedIn profile optimisation' },
      { label: '1 month unlimited revisions' },
      { label: '2 to 3 day delivery' },
      { label: 'Achievement rewriting with measurable outcomes' },
      { label: 'Keyword mapping against your target roles' },
    ],
  },
  {
    _id: '6af812abf87d01f285883dd5',
    name: 'Senior Professional',
    experienceBand: '6 to 8 years',
    price: 999,
    originalPrice: 1799,
    currency: 'INR',
    saveText: 'Save ₹800',
    tagline: 'A strategic profile that positions you as a clear team leader.',
    features: [
      { label: 'ATS-friendly CV crafted manually by expert writers' },
      { label: 'Customised cover letter' },
      { label: 'LinkedIn profile optimisation' },
      { label: '1 month unlimited revisions' },
      { label: '2 to 3 day delivery' },
      { label: 'Achievement rewriting with measurable outcomes' },
      { label: 'Keyword mapping against your target roles' },
      { label: 'Leadership and scope-of-responsibility framing' },
    ],
  },
  {
    _id: '6af812abf87d01f285883ddf',
    name: 'Leadership & Executive',
    experienceBand: '9+ years',
    price: 1199,
    originalPrice: 2199,
    currency: 'INR',
    saveText: 'Save ₹1,000',
    tagline: 'Board-level narrative and portfolio written for decision makers.',
    features: [
      { label: 'ATS-friendly CV crafted manually by expert writers' },
      { label: 'Customised cover letter' },
      { label: 'LinkedIn profile optimisation' },
      { label: '1 month unlimited revisions' },
      { label: '2 to 3 day delivery' },
      { label: 'Achievement rewriting with measurable outcomes' },
      { label: 'Keyword mapping against your target roles' },
      { label: 'Leadership and scope-of-responsibility framing' },
      { label: 'Executive summary and board-level narrative' },
    ],
  },
];

const COMPARISON_ROWS = [
  { feature: 'Experience Range', early: '0–2 Years', mid: '3–5 Years', senior: '6–8 Years', exec: '9+ Years' },
  { feature: 'Handcrafted by Senior Writers', early: true, mid: true, senior: true, exec: true },
  { feature: 'Delivery Turnaround', early: '2–3 Days', mid: '2–3 Days', senior: '2–3 Days', exec: '2–3 Days' },
  { feature: 'Unlimited Free Revisions', early: '1 Month', mid: '1 Month', senior: '1 Month', exec: '1 Month' },
  { feature: 'DutyLaunch ATS Compliance Verification', early: true, mid: true, senior: true, exec: true },
  { feature: 'Customised Cover Letter', early: true, mid: true, senior: true, exec: true },
  { feature: 'LinkedIn Profile Optimisation', early: true, mid: true, senior: true, exec: true },
  { feature: 'Achievement Rewriting & Metrics', early: false, mid: true, senior: true, exec: true },
  { feature: 'Role Keyword Mapping & ATS Tuning', early: false, mid: true, senior: true, exec: true },
  { feature: 'Leadership & Scope-of-Authority Framing', early: false, mid: false, senior: true, exec: true },
  { feature: 'Board-Level Executive Summary', early: false, mid: false, senior: false, exec: true },
  { feature: 'Delivery Formats', early: 'PDF + DOCX', mid: 'PDF + DOCX', senior: 'PDF + DOCX', exec: 'PDF + DOCX' },
];

function getFeatureIcon(label = '') {
  const lower = label.toLowerCase();
  if (lower.includes('linkedin')) {
    return <Linkedin className="h-4 w-4 text-[#0077b5] shrink-0 mt-0.5" />;
  }
  if (lower.includes('cover letter')) {
    return <Mail className="h-4 w-4 text-azure shrink-0 mt-0.5" />;
  }
  if (lower.includes('cv') || lower.includes('resume')) {
    return <FileText className="h-4 w-4 text-azure shrink-0 mt-0.5" />;
  }
  if (lower.includes('revision')) {
    return <RotateCcw className="h-4 w-4 text-azure shrink-0 mt-0.5" />;
  }
  if (lower.includes('delivery') || lower.includes('day') || lower.includes('turnaround')) {
    return <Truck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />;
  }
  if (lower.includes('achievement') || lower.includes('outcome')) {
    return <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />;
  }
  if (lower.includes('keyword') || lower.includes('mapping') || lower.includes('target')) {
    return <Target className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />;
  }
  if (lower.includes('leadership') || lower.includes('scope')) {
    return <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />;
  }
  if (lower.includes('executive') || lower.includes('board')) {
    return <Award className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />;
  }
  return <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />;
}

function getStatusBadge(status) {
  switch (status) {
    case 'completed':
      return <Badge tone="success">Completed</Badge>;
    case 'in_progress':
      return <Badge tone="info">In Progress</Badge>;
    case 'assigned':
      return <Badge tone="info">Assigned to Writer</Badge>;
    case 'quality_check':
      return <Badge tone="warning">Quality Check</Badge>;
    case 'rejected':
      return <Badge tone="danger">Rejected</Badge>;
    case 'pending':
    default:
      return <Badge tone="neutral">Pending Review</Badge>;
  }
}

export default function ResumeBuilderStart() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Load packages from backend
  const { data: packagesData, loading: loadingPackages, error: packageError, refetch } = useApi(
    () => pricingService.cvPackages(),
    []
  );

  // Load candidate orders if authenticated
  const { data: myOrdersData, loading: loadingOrders, refetch: refetchOrders } = useApi(
    () => (user ? resumeOrderService.myOrders() : Promise.resolve([])),
    [user]
  );

  const rawPackages = packagesData?.length ? packagesData : DEFAULT_PACKAGES;
  const packages = rawPackages.map((pkg) => {
    let original = 899;
    let saveText = 'Save ₹500';
    if (pkg.price >= 1100) { original = 2199; saveText = 'Save ₹1,000'; }
    else if (pkg.price >= 900) { original = 1799; saveText = 'Save ₹800'; }
    else if (pkg.price >= 700) { original = 1499; saveText = 'Save ₹700'; }
    return { ...pkg, originalPrice: original, saveText };
  });

  const myOrders = myOrdersData || [];
  const activeOrder = myOrders.length > 0 ? myOrders[0] : null;

  // View toggle: whether existing customer wants to see all packages
  const [showAllPackages, setShowAllPackages] = useState(false);

  // Active unsubmitted payment state (if user just paid)
  const [activePayment, setActivePayment] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [checkoutPackage, setCheckoutPackage] = useState(null);

  // Upload Form state
  const [resumeFile, setResumeFile] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [userInstructions, setUserInstructions] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadSuccessOrder, setUploadSuccessOrder] = useState(null);

  // Razorpay checkout hook
  const { pay, pendingId } = useRazorpayCheckout();

  // Handle purchasing or upgrading a package - opens instant checkout & payment modal
  function handleBuyPackage(pkg) {
    setCheckoutPackage(pkg);
  }

  // Handle successful payment confirmation
  function handlePaymentSuccess(verifiedPayment, pkg) {
    setSelectedPackage(pkg);
    setActivePayment(verifiedPayment);
    refetchOrders();
    setTimeout(() => {
      const el = document.getElementById('cv-upload-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  }

  // Handle file submissions
  async function handleSubmitOrder(e) {
    e.preventDefault();
    if (!resumeFile && !cvFile) {
      toast.error('Please upload at least one file: either your existing Resume or existing CV.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (resumeFile) formData.append('resume', resumeFile);
      if (cvFile) formData.append('cv', cvFile);

      if (activePayment?.id || activePayment?._id) {
        formData.append('paymentId', activePayment.id || activePayment._id);
      }
      if (selectedPackage?._id) {
        formData.append('packageId', selectedPackage._id);
      }

      formData.append('userInstructions', userInstructions.trim());
      formData.append('targetRole', targetRole.trim());
      formData.append('targetIndustry', targetIndustry.trim());

      const res = await resumeOrderService.create(formData);
      setUploadSuccessOrder(res.data);
      toast.success('Your resume build request has been created! Our senior team has begun work.');
      setActivePayment(null);
      refetchOrders();
    } catch (err) {
      toast.error(err.message || 'Could not submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // Determine which higher tier packages are available for upgrade
  const currentTierPrice = activeOrder?.price || 0;
  const upgradeTiers = packages.filter((p) => p.price > currentTierPrice);

  return (
    <>
      <Seo
        title="Professional Resume & CV Service — DutyLaunch"
        description="DutyLaunch professional resume & CV crafting service. Human-written by senior specialists, covering custom cover letter, LinkedIn profile optimization, 2 to 3 day delivery, and 1 month unlimited revisions."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-10">
        {/* Main Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-azure">
              <FileCheck2 className="h-3.5 w-3.5 text-azure" />
              <span>Pro Resume & CV Writing Service</span>
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
              Professional Resume & CV Crafting
            </h1>
            <p className="mt-2 max-w-2xl text-base text-slate-600 leading-relaxed">
              Bespoke, human-led resume and CV craftsmanship. Senior career specialists rewrite, format,
              and optimize your documents for high impact, ATS compliance, and guaranteed delivery in 2–3 days.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {myOrders.length > 0 && (
              <Button to="/my-resumes" variant="outline" size="sm">
                View My Resume Orders ({myOrders.length})
              </Button>
            )}
            <Button to="/resume-checker" variant="premium" size="sm" className="shadow-sm">
              Free ATS Checker &rarr;
            </Button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SCENARIO A: USER HAS AN ACTIVE/PURCHASED ORDER -> SHOW PRESENT PACK VIEW */}
        {/* ========================================================================= */}
        {user && activeOrder && !showAllPackages && (
          <div className="space-y-8">
            {/* Present Active Plan Banner */}
            <div className="rounded-2xl border-2 border-azure/40 bg-gradient-to-br from-white via-frost-50/50 to-azure-50/30 p-6 shadow-md sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-md bg-azure px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                      Your Present Active Plan
                    </span>
                    {getStatusBadge(activeOrder.status)}
                    <span className="text-xs font-semibold text-slate-500">
                      Order #{activeOrder.orderNumber}
                    </span>
                  </div>

                  <h2 className="mt-3 text-2xl sm:text-3xl font-black text-ink">
                    {activeOrder.packageName}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    Experience Band: <strong className="text-slate-800">{activeOrder.experienceBand}</strong> &bull;
                    Purchased on {formatDate(activeOrder.purchaseDate)} &bull; Amount Paid: ₹{activeOrder.paymentAmount || activeOrder.price}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-950 flex items-center gap-2.5 shadow-sm">
                    <Truck className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Turnaround Guarantee</p>
                      <p className="text-sm font-extrabold text-emerald-900">Delivery in 2–3 Days</p>
                    </div>
                  </div>

                  <Button to="/my-resumes" variant="primary">
                    Track Order & Timeline &rarr;
                  </Button>
                </div>
              </div>

              {/* Deliverables Status Grid */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-slate-200/80 pt-6">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <FileText className="h-5 w-5 text-azure" />
                    {activeOrder.completedResume ? (
                      <span className="text-xs font-bold text-emerald-600">Ready</span>
                    ) : (
                      <span className="text-xs font-bold text-azure">In Progress</span>
                    )}
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-ink">ATS-Friendly CV</h4>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {activeOrder.completedResume ? 'Finished & verified' : 'Crafting in progress'}
                  </p>
                  {activeOrder.completedResume && (
                    <a
                      href={`/api/resume-orders/${activeOrder._id}/download/completed-resume`}
                      className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-azure hover:underline"
                    >
                      <Download className="h-3.5 w-3.5" /> Download CV
                    </a>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <Mail className="h-5 w-5 text-indigo-600" />
                    <span className="text-xs font-bold text-emerald-600">Included</span>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-ink">Customised Cover Letter</h4>
                  <p className="mt-0.5 text-xs text-slate-500">Tailored to target roles</p>
                  {activeOrder.completedCv && (
                    <a
                      href={`/api/resume-orders/${activeOrder._id}/download/completed-cv`}
                      className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-azure hover:underline"
                    >
                      <Download className="h-3.5 w-3.5" /> Download Letter
                    </a>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <Linkedin className="h-5 w-5 text-[#0077b5]" />
                    <span className="text-xs font-bold text-emerald-600">Included</span>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-ink">LinkedIn Optimisation</h4>
                  <p className="mt-0.5 text-xs text-slate-500">Headline & about section audit</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <RotateCcw className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-600">Active</span>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-ink">1 Month Revisions</h4>
                  <p className="mt-0.5 text-xs text-slate-500">Unlimited adjustments</p>
                </div>
              </div>
            </div>

            {/* Need to Upload Files (if pending or activePayment) */}
            {(activePayment || (!activeOrder.originalResume && !activeOrder.originalCv)) && (
              <div id="cv-upload-section" className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500 text-white">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-amber-950">
                      Action Required: Attach Your Current Resume or CV
                    </h3>
                    <p className="mt-1 text-sm text-amber-900/90 leading-relaxed">
                      Your payment is confirmed for <strong>{selectedPackage?.name || activeOrder.packageName}</strong>. Please upload your current
                      documents so our executive writers can immediately begin your rewrite!
                    </p>

                    <form onSubmit={handleSubmitOrder} className="mt-5 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
                          <label className="block text-xs font-bold text-slate-700">Existing Resume (PDF/DOC/DOCX)</label>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                            className="mt-2 block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-azure/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-azure"
                          />
                        </div>
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
                          <label className="block text-xs font-bold text-slate-700">Existing CV (PDF/DOC/DOCX)</label>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                            className="mt-2 block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-azure/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-azure"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Target Job Title (e.g. Operations Manager, React Lead)"
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Target Region / Industry (e.g. Dubai, UAE / IT FinTech)"
                          value={targetIndustry}
                          onChange={(e) => setTargetIndustry(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm"
                        />
                      </div>

                      <textarea
                        rows={3}
                        placeholder="Instructions for writing team (e.g. career shift, highlight specific enterprise projects)..."
                        value={userInstructions}
                        onChange={(e) => setUserInstructions(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm"
                      />

                      <Button type="submit" loading={submitting}>
                        Submit Files to Writing Team
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade Package Section */}
            {upgradeTiers.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-azure">
                      Upgrade Opportunity
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-ink">
                      Upgrade to a Higher Experience Tier
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Need team leadership framing, executive summary, or board-level storytelling? Upgrade anytime.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllPackages(true)}
                  >
                    View All Packages & Pricing
                  </Button>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  {upgradeTiers.map((pkg) => (
                    <div
                      key={pkg._id}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 flex flex-col justify-between hover:bg-white hover:border-azure hover:shadow-md transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-azure uppercase tracking-wider">
                            {pkg.experienceBand}
                          </span>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            {pkg.saveText}
                          </span>
                        </div>
                        <h4 className="mt-2 text-lg font-bold text-ink">{pkg.name}</h4>
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2">{pkg.tagline}</p>

                        <div className="mt-4 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-ink">{formatCurrency(pkg.price, pkg.currency)}</span>
                          <span className="text-xs text-slate-400 line-through">₹{pkg.originalPrice}</span>
                          <span className="text-xs text-slate-500">+18% GST</span>
                        </div>

                        <ul className="mt-4 space-y-2 border-t border-slate-200/80 pt-3">
                          {pkg.features?.slice(0, 4).map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                              <CheckCircle2 className="h-3.5 w-3.5 text-azure shrink-0 mt-0.5" />
                              <span>{f.label}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-200/80">
                        <Button
                          className="w-full text-xs font-bold"
                          variant="primary"
                          onClick={() => handleBuyPackage(pkg)}
                          loading={pendingId === pkg._id}
                        >
                          Upgrade to {pkg.name} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCENARIO B: PUBLIC VISITOR OR USER BROWSING PRICING & PACKAGES            */}
        {/* ========================================================================= */}
        {(!user || !activeOrder || showAllPackages) && (
          <div className="space-y-12">
            {showAllPackages && activeOrder && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllPackages(false)}
                >
                  &larr; Return to My Active Pack ({activeOrder.packageName})
                </Button>
              </div>
            )}

            {/* Active Payment Upload Section (if user just completed payment) */}
            {activePayment && (
              <div id="cv-upload-section" className="rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50/60 p-6 sm:p-8 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-emerald-600 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-white">
                        Payment Confirmed
                      </span>
                      <span className="text-xs font-bold text-emerald-950">
                        {selectedPackage?.name} &bull; Delivery in 2–3 Days
                      </span>
                    </div>
                    <h3 className="mt-2 text-xl font-bold text-emerald-950">
                      Step 2: Upload Your Existing Resume or CV
                    </h3>
                    <p className="mt-1 text-sm text-emerald-900 leading-relaxed">
                      Attach your existing documents and any target career instructions below so our senior career specialists can begin your rewrite immediately.
                    </p>

                    <form onSubmit={handleSubmitOrder} className="mt-5 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-dashed border-emerald-300 bg-white p-4">
                          <label className="block text-xs font-bold text-slate-700">Existing Resume (PDF/DOC/DOCX)</label>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                            className="mt-2 block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-azure/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-azure"
                          />
                        </div>
                        <div className="rounded-xl border border-dashed border-emerald-300 bg-white p-4">
                          <label className="block text-xs font-bold text-slate-700">Existing CV (PDF/DOC/DOCX)</label>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                            className="mt-2 block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-azure/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-azure"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Target Job Title (e.g. Operations Manager, React Lead)"
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Target Region / Industry (e.g. Dubai, UAE / IT FinTech)"
                          value={targetIndustry}
                          onChange={(e) => setTargetIndustry(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm bg-white"
                        />
                      </div>

                      <textarea
                        rows={3}
                        placeholder="Instructions for writing team (e.g. career shift, highlight specific enterprise projects)..."
                        value={userInstructions}
                        onChange={(e) => setUserInstructions(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm bg-white"
                      />

                      <Button type="submit" variant="primary" loading={submitting}>
                        Submit Files to Writing Team &rarr;
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* How Our CV Service Works (ProResumes 4-Step Style) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-azure">
                  Manual Expert Service
                </span>
                <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-ink">
                  How Our Resume & CV Service Works
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Unlike automated generic builders, senior industry career writers craft your resume to ensure it showcases your real strengths and passes employer screenings.
                </p>
              </div>

              {/* Stepper Visualizer */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {STEPS.map((s) => (
                  <div
                    key={s.step}
                    className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:bg-white hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-azure text-xs font-bold text-white">
                        {s.step}
                      </span>
                      <Clock className="h-4 w-4 text-slate-400" />
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-ink">{s.title}</h3>
                    <p className="mt-1 text-xs text-slate-500 leading-snug">{s.desc}</p>
                  </div>
                ))}
              </div>

              {/* Trust points */}
              <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-slate-100 pt-6 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  100% Written by Real Career Writers
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-azure" />
                  2–3 Days Fast Turnaround
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  1 Month of Unlimited Revisions
                </div>
                <div className="flex items-center gap-1.5">
                  <FileCheck2 className="h-4 w-4 text-cyan-600" />
                  DutyLaunch Internal ATS Optimized
                </div>
              </div>
            </div>

            {/* Pricing Section (ProResumes Blue Header Style) */}
            <div id="pricing-packages" className="space-y-6">
              <div className="rounded-2xl bg-gradient-to-r from-[#0d2a5c] via-[#123875] to-[#1a4a8d] p-6 text-white shadow-lg sm:p-8">
                <div className="max-w-2xl">
                  <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-azure-100 backdrop-blur-sm">
                    Choose Your CV & Resume Package
                  </span>
                  <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Find the best plan that suits your career stage and needs.
                  </h2>
                  <p className="mt-2 text-sm text-slate-200">
                    Transparent pricing by years of experience. Every bundle includes a custom CV, targeted cover letter, LinkedIn profile guidance, 2 to 3 day delivery, and 1 month of unlimited revisions.
                  </p>
                </div>
              </div>

              {/* Package Cards Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {packages.map((pkg) => {
                  const isBuying = pendingId === pkg._id;

                  return (
                    <div
                      key={pkg._id}
                      className={cn(
                        'relative flex flex-col justify-between rounded-2xl border bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl',
                        pkg.isPopular
                          ? 'border-2 border-azure shadow-md ring-4 ring-azure/10'
                          : 'border-slate-200 shadow-sm'
                      )}
                    >
                      {/* Top Badges */}
                      {pkg.isPopular && (
                        <span className="absolute -top-3.5 left-6 rounded-full bg-amber-300 px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-ink shadow-sm ring-2 ring-white">
                          Most Popular
                        </span>
                      )}

                      <span className="absolute -top-3.5 right-4 rounded-full bg-blue-700 px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-white shadow-md ring-2 ring-white">
                        {pkg.saveText}
                      </span>

                      <div>
                        {/* Title & Experience Band */}
                        <div className="pt-1">
                          <h3 className="text-xl font-extrabold text-ink">{pkg.name}</h3>
                          <p className="mt-0.5 text-sm font-medium text-slate-500">
                            {pkg.experienceBand} of experience
                          </p>
                        </div>

                        <p className="mt-2 text-xs text-slate-500 line-clamp-2 min-h-[2.5em]">
                          {pkg.tagline}
                        </p>

                        {/* Price Row */}
                        <div className="mt-3 flex flex-wrap items-baseline gap-2">
                          <span className="text-3xl sm:text-4xl font-black tracking-tight text-ink">
                            {formatCurrency(pkg.price, pkg.currency)}
                          </span>
                          <span className="text-sm font-semibold text-slate-400 line-through">
                            ₹{pkg.originalPrice}
                          </span>
                          <span className="text-xs font-medium text-slate-500">+18% GST</span>
                        </div>

                        {/* Combo Visual Badges (CV + Letter + LinkedIn) */}
                        <div className="my-4 rounded-xl border border-slate-200/90 bg-slate-50/90 py-2.5 px-3 text-center shadow-inner">
                          <div className="flex items-center justify-around">
                            <div className="flex flex-col items-center gap-1">
                              <FileText className="h-4 w-4 text-azure" />
                              <span className="text-[11px] font-bold text-slate-700">CV</span>
                            </div>
                            <span className="text-xs font-bold text-slate-300">+</span>
                            <div className="flex flex-col items-center gap-1">
                              <Mail className="h-4 w-4 text-azure" />
                              <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">Cover Letter</span>
                            </div>
                            <span className="text-xs font-bold text-slate-300">+</span>
                            <div className="flex flex-col items-center gap-1">
                              <Linkedin className="h-4 w-4 text-[#0077b5]" />
                              <span className="text-[11px] font-bold text-[#0077b5]">LinkedIn</span>
                            </div>
                          </div>
                        </div>

                        {/* Deliverables List */}
                        <div className="mt-2 space-y-2.5 border-t border-slate-100 pt-4">
                          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                            Deliverables included:
                          </div>
                          {pkg.features?.map((f, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                              {getFeatureIcon(f.label)}
                              <span className="leading-snug">{f.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <div className="mb-3 flex items-center justify-center gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50/90 py-1.5 px-3 text-center text-xs font-bold text-emerald-900 shadow-sm">
                          <Truck className="h-4 w-4 text-emerald-600" />
                          <span>Delivery in 2–3 Days</span>
                        </div>

                        <Button
                          className="w-full justify-center text-sm font-bold py-2.5 shadow-sm"
                          variant="primary"
                          onClick={() => handleBuyPackage(pkg)}
                          loading={isBuying}
                        >
                          {user ? `Buy ${pkg.name}` : `Choose ${pkg.name}`} <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Button>
                        <p className="mt-2 text-center text-[11px] text-slate-400">
                          2 to 3 day delivery &bull; 1 month unlimited revisions
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Feature Comparison Table (matching user uploaded image) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-azure">
                  Side-By-Side Comparison
                </span>
                <h3 className="mt-1 text-2xl font-extrabold text-ink">
                  Detailed Feature Comparison
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Compare deliverable inclusions, writer specialization, and turnaround across our career bundles.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="py-3 px-4 text-sm font-extrabold text-ink">Feature / Inclusions</th>
                      <th className="py-3 px-4 text-sm font-extrabold text-slate-800 text-center">Early Career (₹399)</th>
                      <th className="py-3 px-4 text-sm font-extrabold text-azure text-center bg-azure-50/50 rounded-t-lg">Mid-Level (₹799)</th>
                      <th className="py-3 px-4 text-sm font-extrabold text-slate-800 text-center">Senior (₹999)</th>
                      <th className="py-3 px-4 text-sm font-extrabold text-slate-800 text-center">Executive (₹1,199)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {COMPARISON_ROWS.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-700">{row.feature}</td>
                        <td className="py-3 px-4 text-center text-slate-600">
                          {typeof row.early === 'boolean' ? (
                            row.early ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-slate-300">&mdash;</span>
                          ) : (
                            row.early
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-azure font-semibold bg-azure-50/30">
                          {typeof row.mid === 'boolean' ? (
                            row.mid ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-slate-300">&mdash;</span>
                          ) : (
                            row.mid
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-600">
                          {typeof row.senior === 'boolean' ? (
                            row.senior ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-slate-300">&mdash;</span>
                          ) : (
                            row.senior
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-600">
                          {typeof row.exec === 'boolean' ? (
                            row.exec ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-slate-300">&mdash;</span>
                          ) : (
                            row.exec
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-slate-50/50">
                      <td className="py-4 px-4 text-xs font-bold text-slate-500 uppercase">
                        Select Package
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs font-bold"
                          onClick={() => handleBuyPackage(packages[0] || DEFAULT_PACKAGES[0])}
                        >
                          Choose Early Career
                        </Button>
                      </td>
                      <td className="py-4 px-4 text-center bg-azure-50/40">
                        <Button
                          size="sm"
                          variant="primary"
                          className="w-full text-xs font-bold"
                          onClick={() => handleBuyPackage(packages[1] || DEFAULT_PACKAGES[1])}
                        >
                          Choose Mid-Level
                        </Button>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs font-bold"
                          onClick={() => handleBuyPackage(packages[2] || DEFAULT_PACKAGES[2])}
                        >
                          Choose Senior
                        </Button>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs font-bold"
                          onClick={() => handleBuyPackage(packages[3] || DEFAULT_PACKAGES[3])}
                        >
                          Choose Executive
                        </Button>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ATS Scoring Transparency Notice */}
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-5 text-amber-900 shadow-sm backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <strong className="font-bold text-amber-950">Important ATS Scoring Transparency Notice:</strong>
              <p className="mt-1 leading-relaxed text-amber-900/90">
                This ATS Score is generated using DutyLaunch's internal evaluation system. It is intended only as a
                reference based on our internal scoring methodology. It is NOT a universal ATS score.
              </p>
              <div className="mt-2.5">
                <Link
                  to="/resume-checker"
                  className="inline-flex items-center gap-1 font-semibold text-azure hover:underline text-xs"
                >
                  Open DutyLaunch Internal ATS Resume Checker <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Instant Checkout & Payment Modal */}
        <PackageCheckoutModal
          isOpen={Boolean(checkoutPackage)}
          packageData={checkoutPackage}
          onClose={() => setCheckoutPackage(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
    </>
  );
}
