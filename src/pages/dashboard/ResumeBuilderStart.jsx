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
import { paymentService } from '../../services/paymentService.js';
import { resumeOrderService } from '../../services/resumeOrderService.js';
import { useRazorpayCheckout } from '../../hooks/useRazorpayCheckout.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

export const BUILDER_AI_OPTIMIZE_KEY = 'dl_resume_ai_optimize';
export const BUILDER_AI_REPORT_KEY = 'dl_resume_ai_report';

const STEPS = [
  { step: '1', title: 'Select Experience Package', desc: 'Choose the band matching your career stage' },
  { step: '2', title: 'Complete Payment', desc: 'Secure online checkout via Razorpay' },
  { step: '3', title: 'Upload Existing Resume/CV', desc: 'Attach PDF, DOC, or DOCX and instructions' },
  { step: '4', title: 'Professional Document Crafting', desc: 'Comprehensive rewriting, ATS keyword optimization & quality audit' },
  { step: '5', title: 'Download Finished Files', desc: 'Receive ready-to-apply CV, resume & letter' },
];

function getPricingDetails(price) {
  if (price <= 399) return { original: 899, save: 'Save ₹500' };
  if (price <= 799) return { original: 1499, save: 'Save ₹700' };
  if (price <= 999) return { original: 1799, save: 'Save ₹800' };
  return { original: 2199, save: 'Save ₹1,000' };
}

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

  // Load user's recent orders to check if they already have an active/pending order
  const { data: myOrdersData, loading: loadingOrders, refetch: refetchOrders } = useApi(
    () => resumeOrderService.myOrders(),
    []
  );

  const packages = packagesData || [];
  const myOrders = myOrdersData || [];

  // Active unsubmitted payment state (if user just paid or selected an unlinked payment)
  const [activePayment, setActivePayment] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Upload Form state
  const [resumeFile, setResumeFile] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [userInstructions, setUserInstructions] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadSuccessOrder, setUploadSuccessOrder] = useState(null);

  // Razorpay checkout
  const { pay, pendingId, enabled: paymentEnabled } = useRazorpayCheckout();

  // Handle purchasing a package
  async function handleBuyPackage(pkg) {
    setSelectedPackage(pkg);
    pay({
      itemType: 'cv-package',
      itemId: pkg._id,
      onSuccess: async (verifiedPayment) => {
        toast.success(`Payment confirmed for ${pkg.name}. Now attach your existing resume or CV!`);
        setActivePayment(verifiedPayment);
        // Scroll to upload section smoothly
        window.scrollTo({ top: 400, behavior: 'smooth' });
      },
    });
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
      toast.success('Your resume build request has been created! Our team is on it.');
      refetchOrders();
    } catch (err) {
      toast.error(err.message || 'Could not submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Seo
        title="Resume Building Service — DutyLaunch"
        description="DutyLaunch bespoke professional resume building service. Handcrafted by expert career writers with within a day turnaround, ATS verification, and 1 month of unlimited revisions."
      />

      <PanelHeader
        title="Resume & CV Building Service"
        description="Bespoke, human-led resume and CV craftsmanship. Executive career specialists rewrite, format, and optimize your documents for high impact and ATS compatibility."
        actions={
          myOrders.length > 0 ? (
            <Button to="/my-resumes" variant="outline" size="sm">
              View My Orders ({myOrders.length})
            </Button>
          ) : null
        }
      />

      {loadingPackages && <LoadingBlock label="Loading service packages..." />}
      {packageError && <ErrorState error={packageError} onRetry={refetch} />}

      {!loadingPackages && !packageError && (
        <div className="space-y-10 pb-12">
          {/* Success Banner if user just submitted */}
          {uploadSuccessOrder && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/80 p-6 text-slate-800 shadow-sm backdrop-blur-sm sm:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-md">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-h3 font-bold text-ink">
                      Request Confirmed! (Order #{uploadSuccessOrder.orderNumber})
                    </h2>
                    <Badge tone="success">Status: Pending Review</Badge>
                  </div>
                  <p className="text-slate-600">
                    Thank you! Your existing documents and instructions have been safely transmitted to our executive writing team.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-100/80 px-3 py-2 text-small font-semibold text-emerald-900">
                    <Clock className="h-4 w-4" />
                    Turnaround: Within a day, our professional writers will complete your custom resume and CV.
                  </div>
                  <div className="pt-3 flex flex-wrap gap-3">
                    <Button to="/my-resumes">Track in My Resume Orders</Button>
                    <Button variant="outline" onClick={() => setUploadSuccessOrder(null)}>
                      Place Another Order
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Workflow Explanation Banner */}
          <div className="rounded-2xl border border-glacier-300 bg-white p-6 shadow-sm sm:p-8">
            <div className="max-w-2xl">
              <span className="text-caption font-bold uppercase tracking-wider text-azure">
                Manual Expert Service
              </span>
              <h2 className="mt-1 text-h2 font-extrabold text-ink">
                How Our Resume Building Service Works
              </h2>
              <p className="mt-2 text-body text-slate-600">
                Unlike automated templates, certified career coaches, industry writers, and QA specialists handcraft your resume to ensure it showcases your real strengths and passes employer screenings.
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
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-azure text-caption font-bold text-white">
                      {s.step}
                    </span>
                    <Clock className="h-4 w-4 text-slate-400" />
                  </div>
                  <h3 className="mt-3 text-small font-bold text-ink">{s.title}</h3>
                  <p className="mt-1 text-caption text-slate-500">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Trust points */}
            <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-slate-100 pt-6 text-caption font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-emerald-600" />
                100% Written by Real Career Writers
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-azure" />
                Within a Day Fast Turnaround
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                1 Month of Unlimited Revisions
              </div>
              <div className="flex items-center gap-1.5">
                <FileCheck2 className="h-4 w-4 text-cyan-600" />
                Recruiter-Ready & ATS Optimized
              </div>
            </div>
          </div>

          {/* Upload Section if user has an active purchased package or clicks upload */}
          {activePayment && (
            <div
              id="upload-section"
              className="rounded-2xl border-2 border-azure/40 bg-frost-50/40 p-6 shadow-md backdrop-blur-sm sm:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-azure text-small font-bold text-white">
                  3
                </span>
                <div>
                  <h3 className="text-h3 font-bold text-ink">Upload Your Existing Documents & Requirements</h3>
                  <p className="text-small text-slate-600">
                    Payment active for{' '}
                    <strong className="text-ink">{activePayment.itemName || selectedPackage?.name}</strong>. Please
                    upload your current resume and/or CV to initiate the build process.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitOrder} className="mt-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Existing Resume Upload */}
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 hover:border-azure transition-colors">
                    <label className="block text-small font-bold text-ink">
                      Existing Resume (Optional if CV provided)
                    </label>
                    <p className="text-caption text-slate-500 mb-3">Accepted: PDF, DOC, DOCX up to 10MB</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      className="block w-full text-small text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-azure/10 file:px-4 file:py-2 file:text-small file:font-semibold file:text-azure hover:file:bg-azure/20"
                    />
                    {resumeFile && (
                      <p className="mt-2 text-caption font-medium text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Selected: {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  {/* Existing CV Upload */}
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 hover:border-azure transition-colors">
                    <label className="block text-small font-bold text-ink">
                      Existing CV (Optional if Resume provided)
                    </label>
                    <p className="text-caption text-slate-500 mb-3">Accepted: PDF, DOC, DOCX up to 10MB</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                      className="block w-full text-small text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-azure/10 file:px-4 file:py-2 file:text-small file:font-semibold file:text-azure hover:file:bg-azure/20"
                    />
                    {cvFile && (
                      <p className="mt-2 text-caption font-medium text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Selected: {cvFile.name} ({(cvFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>

                {/* Role and Sector preferences */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-small font-bold text-ink mb-1">
                      Target Job Title / Role
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Full Stack Engineer, Operations Manager"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-small text-ink focus:border-azure focus:outline-none focus:ring-1 focus:ring-azure"
                    />
                  </div>
                  <div>
                    <label className="block text-small font-bold text-ink mb-1">
                      Target Industry or Region
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. FinTech / IT / Dubai & Middle East / Remote"
                      value={targetIndustry}
                      onChange={(e) => setTargetIndustry(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-small text-ink focus:border-azure focus:outline-none focus:ring-1 focus:ring-azure"
                    />
                  </div>
                </div>

                {/* Custom instructions */}
                <div>
                  <label className="block text-small font-bold text-ink mb-1">
                    Special Instructions or Notes for Our Writers
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about specific projects, leadership achievements, career transitions, or certifications you want highlighted..."
                    value={userInstructions}
                    onChange={(e) => setUserInstructions(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-small text-ink focus:border-azure focus:outline-none focus:ring-1 focus:ring-azure"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="quiet"
                    onClick={() => setActivePayment(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={submitting}>
                    Submit Resume Build Request
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Pricing & Packages Selection (ProResumes layout inspired) */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-r from-[#0d2a5c] via-[#123875] to-[#1a4a8d] p-6 text-white shadow-lg sm:p-8">
              <div className="max-w-2xl">
                <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-azure-100 backdrop-blur-sm">
                  Step 1: Choose Your Experience Package
                </span>
                <h2 className="mt-2 text-h2 font-black tracking-tight text-white">
                  Find the best plan that suits your career stage and needs.
                </h2>
                <p className="mt-2 text-small text-slate-200">
                  Priced transparently by years of experience. Every bundle contains a comprehensive rewrite, custom cover letter, LinkedIn profile guidance, within a day turnaround, and 1 month of unlimited revisions.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {packages.map((pkg) => {
                const isSelected = selectedPackage?._id === pkg._id;
                const isBuying = pendingId === pkg._id;
                const pricingInfo = getPricingDetails(pkg.price);

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
                      {pricingInfo.save}
                    </span>

                    <div>
                      {/* Title & Experience Band */}
                      <div className="pt-1">
                        <h3 className="text-h3 font-extrabold text-ink">{pkg.name}</h3>
                        <p className="mt-0.5 text-small font-medium text-slate-500">
                          {pkg.experienceBand} of experience
                        </p>
                      </div>

                      <p className="mt-2 text-caption text-slate-500 line-clamp-2 min-h-[2.5em]">
                        {pkg.tagline || pkg.bestFor}
                      </p>

                      {/* Pricing Row with Strikethrough Original Price */}
                      <div className="mt-3 flex flex-wrap items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-black tracking-tight text-ink">
                          {formatCurrency(pkg.price, pkg.currency)}
                        </span>
                        <span className="text-small font-semibold text-slate-400 line-through">
                          ₹{pricingInfo.original}
                        </span>
                        <span className="text-caption font-medium text-slate-500">+18% GST</span>
                      </div>

                      {/* Visual Combo Icon Row (ProResumes style: Icon on top, Label on bottom) */}
                      <div className="my-4 rounded-xl border border-slate-200/90 bg-slate-50/90 py-2.5 px-3 text-center shadow-inner">
                        <div className="flex items-center justify-around">
                          <div className="flex flex-col items-center gap-1">
                            <FileText className="h-4 w-4 text-azure" />
                            <span className="text-[11px] font-bold text-slate-700">CV</span>
                          </div>
                          <span className="text-caption font-bold text-slate-300">+</span>
                          <div className="flex flex-col items-center gap-1">
                            <Mail className="h-4 w-4 text-azure" />
                            <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">Cover Letter</span>
                          </div>
                          <span className="text-caption font-bold text-slate-300">+</span>
                          <div className="flex flex-col items-center gap-1">
                            <Linkedin className="h-4 w-4 text-[#0077b5]" />
                            <span className="text-[11px] font-bold text-[#0077b5]">LinkedIn</span>
                          </div>
                        </div>
                      </div>

                      {/* Deliverables List with Custom Icons */}
                      <div className="mt-2 space-y-2.5 border-t border-slate-100 pt-4">
                        <div className="text-caption font-bold text-slate-700 uppercase tracking-wider">
                          Deliverables included:
                        </div>
                        {pkg.features?.map((f, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-small text-slate-600">
                            {getFeatureIcon(f.label)}
                            <span className="leading-snug">{f.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Area */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      {/* Dedicated Delivery Badge */}
                      <div className="mb-3 flex items-center justify-center gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50/90 py-1.5 px-3 text-center text-[12px] font-bold text-emerald-900 shadow-sm">
                        <Truck className="h-4 w-4 text-emerald-600" />
                        <span>Delivery within a day</span>
                      </div>

                      <Button
                        className="w-full justify-center text-small font-bold py-2.5 shadow-sm"
                        variant={pkg.isPopular ? 'primary' : 'primary'}
                        onClick={() => handleBuyPackage(pkg)}
                        loading={isBuying}
                      >
                        Buy {pkg.name} <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                      <p className="mt-2 text-center text-[11px] text-slate-400">
                        Within a day delivery • {pkg.revisionWindow || '1 month unlimited revisions'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dedicated ATS Score Notice Section */}
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-5 text-amber-900 shadow-sm backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div className="text-small">
                <strong className="font-bold text-amber-950">Important ATS Scoring Transparency Notice:</strong>
                <p className="mt-1 leading-relaxed text-amber-900/90">
                  This ATS Score is generated using DutyLaunch's internal evaluation system. It is intended only as a
                  reference based on our internal scoring methodology. It is NOT a universal ATS score.
                </p>
                <div className="mt-2">
                  <Link
                    to="/resume-checker"
                    className="inline-flex items-center gap-1 font-semibold text-azure hover:underline text-small"
                  >
                    Open DutyLaunch Internal ATS Resume Checker <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
