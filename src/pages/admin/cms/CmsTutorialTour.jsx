import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Compass,
  Tag,
  Layers,
  Settings2,
  CheckCircle2,
  Check,
  Zap,
  ShieldCheck,
  TrendingUp,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';

export const CMS_TUTORIAL_STORAGE_KEY = 'dl_cms_tutorial_completed_v1';

const TUTORIAL_STEPS = [
  {
    stepId: 'welcome',
    title: 'Welcome to DutyLaunch Pricing & Services CMS',
    badge: 'Overview',
    icon: Sparkles,
    iconColor: 'text-amber-500 bg-amber-50 border-amber-200',
    description:
      'This centralized CMS gives administrators 100% dynamic control over every single package, standalone CV tier, executive portfolio, add-on, platform subscription, and service across the DutyLaunch platform.',
    bullets: [
      'No code changes required to hike, discount, or launch new offerings.',
      'Instant real-time propagation to candidate portals, public pricing, and checkout.',
      'Audited delivery timelines, revisions, and deliverable inclusions.',
    ],
  },
  {
    stepId: 'impact_badges',
    title: 'Impact Transparency: "📍 Affects Live Site at"',
    badge: 'Live Blast Radius',
    icon: MapPin,
    iconColor: 'text-azure-600 bg-azure-50 border-azure-200',
    description:
      'Every offering card displays visible badges indicating the exact live URLs and checkout components affected when you edit its price, title, or deliverables.',
    bullets: [
      'Examples: /resume-service, /pricing, /resume-builder, Package Checkout Modal.',
      'Never guess where candidate visitors will see your changes.',
      'You can add or remove impact labels in the package editor.',
    ],
  },
  {
    stepId: 'categories',
    title: 'Organized Offerings: Categorized & Uncluttered',
    badge: 'Structure',
    icon: Layers,
    iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    description:
      'Keep your catalog organized without feeling overwhelmed. Offerings are partitioned into dedicated categories that mirror your customer journey:',
    bullets: [
      'Career Bundles: Full experience-stage packages (CV + Cover Letter + LinkedIn).',
      'Standalone CVs: High-converting CV-only tiers.',
      'Executive Portfolios & Add-ons: Visual decks, live personal websites, mock interviews.',
      'Subscriptions & Services: Platform access and specialized mobility offerings.',
    ],
  },
  {
    stepId: 'pricing_control',
    title: 'Dynamic Price Hikes, Discounts & Strikethroughs',
    badge: 'Pricing Controls',
    icon: Tag,
    iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    description:
      'Easily test price elasticity, apply promotional discounts, or hike rates to match market demand:',
    bullets: [
      'Selling Price: The actual amount charged to the candidate.',
      'Original Price: The anchor value displayed before discount.',
      'Strike-through Toggle: Show or hide the struck-out original price on the live site.',
      'Dynamic Savings: The system automatically calculates and highlights "Save ₹X" badges.',
    ],
  },
  {
    stepId: 'features_manager',
    title: 'Custom Deliverables & Features Manager',
    badge: 'Features & Bullets',
    icon: CheckCircle2,
    iconColor: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    description:
      'Every offering has a flexible deliverables builder so you are never locked into hardcoded features:',
    bullets: [
      'Type any deliverable label and click "+ Add Feature" to instantly include it.',
      'Toggle the checkbox to show it as included (✓) or excluded/unavailable.',
      'Edit wording or delete outdated bullets at any time.',
      'Live Card Preview shows you exactly how candidates will see the feature list.',
    ],
  },
  {
    stepId: 'global_settings',
    title: 'Global Tax, Turnaround SLA & Announcement Banners',
    badge: 'Site-wide Rules',
    icon: Settings2,
    iconColor: 'text-purple-600 bg-purple-50 border-purple-200',
    description:
      'Fine-tune global business parameters that affect all transactions and checkout invoices:',
    bullets: [
      'GST Percentage: Set the tax rate applied on checkout invoices (default: 18%).',
      'Turnaround SLA Disclaimer: Official footnote (with "*") guaranteeing delivery terms.',
      'Announcement Banner: Broadcast discounts or seasonal campaigns at the top of the site.',
    ],
  },
  {
    stepId: 'revisit_anytime',
    title: 'Ready to Explore! Revisit the Guide Anytime',
    badge: 'Quick Shortcut',
    icon: HelpCircle,
    iconColor: 'text-azure-600 bg-azure-50 border-azure-200',
    description:
      'You are all set! You can relaunch this interactive tutorial at any time by clicking the "🎓 CMS Guide" button in the top navigation bar.',
    bullets: [
      'Click "Edit Offering & Features" on any card to update live prices.',
      'Click "+ Add New Offering" to launch an entirely new service.',
      'Use the search bar or category filters to find any package in seconds.',
    ],
  },
];

export function CmsTutorialTour({ isOpen, onClose }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentIdx];
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === TUTORIAL_STEPS.length - 1;
  const StepIcon = step.icon;

  function handleSkip() {
    try {
      localStorage.setItem(CMS_TUTORIAL_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    onClose();
  }

  function handleFinish() {
    try {
      localStorage.setItem(CMS_TUTORIAL_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    onClose();
  }

  function handleNext() {
    if (isLast) {
      handleFinish();
    } else {
      setCurrentIdx((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (!isFirst) {
      setCurrentIdx((prev) => prev - 1);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleSkip}
        className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${step.iconColor}`}>
              <StepIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-azure-600 bg-azure-50 px-2 py-0.5 rounded-full">
                  {step.badge}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Step {currentIdx + 1} of {TUTORIAL_STEPS.length}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{step.title}</h3>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title="Close Tutorial"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="py-5">
          <p className="text-sm leading-relaxed text-slate-600 mb-4">{step.description}</p>
          <div className="space-y-2.5 bg-slate-50/70 border border-slate-200/70 rounded-xl p-4">
            {step.bullets.map((bullet, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-azure-600 text-white">
                  <Check className="h-2.5 w-2.5" />
                </div>
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Indicators / Dots */}
        <div className="flex items-center justify-center gap-1.5 pb-5">
          {TUTORIAL_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIdx ? 'w-6 bg-azure-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
              title={`Go to Step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            onClick={handleSkip}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline px-2 py-1"
          >
            Skip Tutorial
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <Button variant="secondary" size="sm" onClick={handlePrev}>
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={handleNext}>
              {isLast ? (
                <>
                  Get Started <Check className="ml-1.5 h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
