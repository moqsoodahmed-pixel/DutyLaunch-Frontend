import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Tag,
  Layers,
  Settings2,
  CheckCircle2,
  Check,
  MapPin,
  HelpCircle,
  Plus,
  RefreshCw,
  Search,
  BarChart3,
  Pause,
  Play,
  Edit3,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';

export const CMS_TUTORIAL_STORAGE_KEY = 'dl_cms_tutorial_completed_v1';

const AUTOPLAY_MS = 6500;

/**
 * Each step targets a real `data-tour="..."` element on the page (see
 * CmsPricingDashboard.jsx). `target: null` steps are intro/outro and render
 * as a centered card instead of a spotlight callout.
 */
const TUTORIAL_STEPS = [
  {
    stepId: 'welcome',
    target: null,
    title: 'Hey there — welcome to your Pricing & Offerings CMS',
    badge: 'Overview',
    icon: Sparkles,
    iconColor: 'text-amber-500 bg-amber-50 border-amber-200',
    description:
      "I'm going to walk you through this page section by section, so by the end you'll know exactly what every button, badge, and field does. This is the control room for everything candidates see on pricing, checkout, and the resume builder — no code, no deploys, just this screen.",
    bullets: [
      "I'll highlight each section live on the page as we go.",
      'You can let me drive (auto-play) or click Next/Back to steer yourself.',
      'Nothing you click during the tour is saved — it is safe to explore.',
    ],
  },
  {
    stepId: 'guide-button',
    target: 'guide-button',
    placement: 'bottom',
    title: 'This button brings me back any time',
    badge: 'Top Bar',
    icon: HelpCircle,
    iconColor: 'text-azure-600 bg-azure-50 border-azure-200',
    description:
      'Forgot what something does mid-edit? Click "🎓 CMS Guide" and this same walkthrough reopens from the start — it never disappears from the top bar.',
    bullets: ['Safe to click anytime — it never changes data, only reopens this tour.'],
  },
  {
    stepId: 'reset-button',
    target: 'reset-button',
    placement: 'bottom',
    title: '"Reset Defaults" — handle with care',
    badge: 'Top Bar · Destructive',
    icon: RefreshCw,
    iconColor: 'text-rose-600 bg-rose-50 border-rose-200',
    description:
      'This wipes every custom price, discount, and deliverable you have set and restores the official DutyLaunch catalog. A confirmation dialog always asks before anything is touched — but treat it like a factory reset, not an undo button.',
    bullets: [
      'Use it only when the catalog needs a clean slate.',
      'There is no "undo" after you confirm — double-check before clicking Yes.',
    ],
  },
  {
    stepId: 'add-button',
    target: 'add-button',
    placement: 'bottom',
    title: '"Add New Offering" launches a brand-new package',
    badge: 'Top Bar · Create',
    icon: Plus,
    iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    description:
      'Click this to open a blank package editor — set its name, category, price, deliverables, and which live pages it should appear on, then save to publish it instantly.',
    bullets: ['Opens the same editor used for "Edit Offering" below, just starting empty.'],
  },
  {
    stepId: 'surfaces-bar',
    target: 'surfaces-bar',
    placement: 'bottom',
    title: 'Live surfaces this CMS actually controls',
    badge: 'Blast Radius',
    icon: MapPin,
    iconColor: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    description:
      'These links are not decoration — they are the real pages that read from this CMS. Click one and it opens that live page in a new tab, so you can sanity-check a change immediately after saving it.',
    bullets: [
      '/resume-service, /pricing, and /resume-builder pull prices and deliverables straight from here.',
      '"Admin Resume Orders" jumps you to the order queue those checkouts generate.',
    ],
  },
  {
    stepId: 'kpi_stats',
    target: 'kpi-stats',
    placement: 'bottom',
    title: 'Your catalog at a glance',
    badge: 'Live Stats',
    icon: BarChart3,
    iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    description:
      'These six tiles recalculate live as you edit, publish, or delete offerings below — total count, published count, how many bundles vs. standalone CVs vs. add-ons vs. subscriptions, and the average selling price across the whole catalog.',
    bullets: ['Nothing to click here — it is a read-only pulse-check of the business.'],
  },
  {
    stepId: 'global_settings',
    target: 'global-settings',
    placement: 'top',
    title: 'Site-wide rules live behind this bar',
    badge: 'Global Settings',
    icon: Settings2,
    iconColor: 'text-purple-600 bg-purple-50 border-purple-200',
    description:
      'Click this bar to expand the global settings panel: the GST percentage applied to every checkout invoice, the turnaround SLA disclaimer footnote, and the site-wide announcement banner for sales or seasonal campaigns.',
    bullets: [
      'GST % changes apply to every future invoice immediately after you save.',
      'The announcement banner has its own on/off switch, message, and link field.',
    ],
  },
  {
    stepId: 'category_tabs',
    target: 'category-tabs',
    placement: 'bottom',
    title: 'Jump straight to a category',
    badge: 'Navigation',
    icon: Layers,
    iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    description:
      'These tabs filter the grid below to just one slice of the catalog — Career Bundles, Standalone CVs, Portfolios & Add-ons, Subscriptions, or Specialized Services. The number on each tab is a live count.',
    bullets: ['Click "All Offerings" at any time to clear the category filter.'],
  },
  {
    stepId: 'search_bar',
    target: 'search-bar',
    placement: 'bottom',
    title: 'Search across everything, not just names',
    badge: 'Search',
    icon: Search,
    iconColor: 'text-slate-600 bg-slate-50 border-slate-200',
    description:
      'Type here and it matches against the offering name, its internal slug/key, the tagline, every deliverable bullet, and every "affects surface" tag — so you can find a package by a feature it includes, not just its title.',
    bullets: ['Clear it instantly with the × button that appears once you start typing.'],
  },
  {
    stepId: 'status_filter',
    target: 'status-filter',
    placement: 'bottom',
    title: 'Narrow by publish status',
    badge: 'Filter',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    description:
      'Switch between every status, Published Only (live to candidates right now), Drafts Only (saved but hidden), or Archived — useful for auditing what is actually visible on the public site today.',
    bullets: [],
  },
  {
    stepId: 'card_pricing',
    target: 'card-pricing',
    placement: 'right',
    title: 'Every card shows the real checkout price',
    badge: 'Offering Card · Pricing',
    icon: Tag,
    iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    description:
      'The bold number is what the candidate actually pays. If a strike-through original price is enabled in the editor, it appears beside it with the automatic "Save ₹X" badge — both update the moment you change the price in "Edit Offering."',
    bullets: [],
  },
  {
    stepId: 'card_features',
    target: 'card-features',
    placement: 'right',
    title: 'Deliverables, exactly as candidates will see them',
    badge: 'Offering Card · Features',
    icon: CheckCircle2,
    iconColor: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    description:
      'This list previews the package deliverables. A struck-through item means it is marked "excluded" in the editor but still shown for comparison. Anything past the first four collapses into a "+ N more" line.',
    bullets: [],
  },
  {
    stepId: 'card_impact',
    target: 'card-impact',
    placement: 'right',
    title: '"Affects Live Website at" — know your blast radius per card',
    badge: 'Offering Card · Impact',
    icon: MapPin,
    iconColor: 'text-azure-600 bg-azure-50 border-azure-200',
    description:
      'This is the per-offering version of the surfaces bar up top: the exact live pages and checkout components that render this specific package. Add or remove tags from inside "Edit Offering."',
    bullets: [],
  },
  {
    stepId: 'card_actions',
    target: 'card-actions',
    placement: 'right',
    title: 'Publish, edit, or delete — right from the card',
    badge: 'Offering Card · Actions',
    icon: Edit3,
    iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    description:
      'Toggle "Publish / Draft" to instantly show or hide this package from candidates without deleting it. "Edit Offering" opens the full editor for price, deliverables, and surfaces. The trash icon permanently deletes it — it will ask you to confirm first.',
    bullets: ['Publish/Draft takes effect immediately, with no confirmation step — the delete icon does ask first.'],
  },
  {
    stepId: 'revisit_anytime',
    target: null,
    title: "That's the full tour — you're ready",
    badge: 'All Set',
    icon: Sparkles,
    iconColor: 'text-azure-600 bg-azure-50 border-azure-200',
    description:
      'You have now seen every control on this page: the top-bar actions, the live-surface tracker, the stats row, global settings, category tabs, search and status filters, and a full offering card. Re-open this tour anytime from "🎓 CMS Guide" in the top bar.',
    bullets: [
      'Click "Edit Offering" on any card to change live prices right now.',
      'Click "+ Add New Offering" to launch a brand-new package.',
      'Use search or the category tabs to find any package in seconds.',
    ],
  },
];

function useElementRect(target, isOpen) {
  const [rect, setRect] = useState(null);

  const measure = useCallback(() => {
    if (!target) {
      setRect(null);
      return;
    }
    const el = document.querySelector(`[data-tour="${target}"]`);
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    // Let smooth scroll settle a frame before measuring.
    requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    });
  }, [target]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    measure();
    const t1 = setTimeout(measure, 150);
    const t2 = setTimeout(measure, 400);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure, isOpen]);

  return rect;
}

function ProgressDots({ steps, currentIdx, onJump }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {steps.map((s, idx) => (
        <button
          key={s.stepId}
          onClick={() => onJump(idx)}
          title={s.title}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            idx === currentIdx ? 'w-6 bg-azure-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
          }`}
        />
      ))}
    </div>
  );
}

function TourCard({
  step,
  currentIdx,
  total,
  isFirst,
  isLast,
  autoPlay,
  onToggleAutoPlay,
  onNext,
  onPrev,
  onSkip,
  onJump,
  style,
  placement,
}) {
  const StepIcon = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={style}
      className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-200"
      role="dialog"
      aria-modal="true"
      data-placement={placement}
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${step.iconColor}`}>
            <StepIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-azure-600 bg-azure-50 px-2 py-0.5 rounded-full">
                {step.badge}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Step {currentIdx + 1} of {total}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug">{step.title}</h3>
          </div>
        </div>
        <button
          onClick={onSkip}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0"
          title="Close Tutorial"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="py-4">
        <p className="text-sm leading-relaxed text-slate-600">{step.description}</p>
        {step.bullets.length > 0 && (
          <div className="mt-3.5 space-y-2 bg-slate-50/70 border border-slate-200/70 rounded-xl p-3.5">
            {step.bullets.map((bullet, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-azure-600 text-white">
                  <Check className="h-2.5 w-2.5" />
                </div>
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pb-4">
        <ProgressDots steps={TUTORIAL_STEPS} currentIdx={currentIdx} onJump={onJump} />
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3.5">
        <div className="flex items-center gap-2">
          <button
            onClick={onSkip}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline px-1 py-1"
          >
            Skip Tour
          </button>
          <button
            onClick={onToggleAutoPlay}
            title={autoPlay ? 'Pause auto-play' : 'Resume auto-play'}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 px-1 py-1"
          >
            {autoPlay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {autoPlay ? 'Auto' : 'Paused'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!isFirst && (
            <Button variant="secondary" size="sm" onClick={onPrev}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onNext}>
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
  );
}

function computeCardPosition(rect, placement) {
  const CARD_W = 420;
  const GAP = 18;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (!rect) {
    return { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  }

  let top, left, transform = '';

  if (placement === 'bottom') {
    top = rect.top + rect.height + GAP;
    left = Math.min(Math.max(rect.left, 16), vw - CARD_W - 16);
  } else if (placement === 'top') {
    // Roughly 420px of card height needed above the target; fall back to
    // placing it below instead of letting it run off the top of the screen.
    if (rect.top - GAP < 420) {
      top = rect.top + rect.height + GAP;
      left = Math.min(Math.max(rect.left, 16), vw - CARD_W - 16);
    } else {
      top = rect.top - GAP;
      left = Math.min(Math.max(rect.left, 16), vw - CARD_W - 16);
      transform = 'translateY(-100%)';
    }
  } else if (placement === 'right') {
    top = Math.min(Math.max(rect.top, 16), vh - 320);
    left = rect.left + rect.width + GAP;
    if (left + CARD_W > vw - 16) {
      left = Math.max(rect.left - CARD_W - GAP, 16);
    }
  } else {
    top = rect.top + rect.height + GAP;
    left = Math.min(Math.max(rect.left, 16), vw - CARD_W - 16);
  }

  // Keep on-screen vertically too.
  if (!transform && top + 420 > vh) {
    top = Math.max(vh - 440, 16);
  }

  return { position: 'fixed', top, left, width: CARD_W, maxWidth: `calc(100vw - 32px)`, transform };
}

export function CmsTutorialTour({ isOpen, onClose }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const timerRef = useRef(null);

  const step = TUTORIAL_STEPS[currentIdx];
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === TUTORIAL_STEPS.length - 1;

  const rect = useElementRect(step?.target, isOpen);

  const finish = useCallback(() => {
    try {
      localStorage.setItem(CMS_TUTORIAL_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    onClose();
  }, [onClose]);

  const goNext = useCallback(() => {
    setCurrentIdx((prev) => {
      if (prev >= TUTORIAL_STEPS.length - 1) {
        finish();
        return prev;
      }
      return prev + 1;
    });
  }, [finish]);

  const goPrev = useCallback(() => {
    setCurrentIdx((prev) => Math.max(0, prev - 1));
  }, []);

  const jumpTo = useCallback((idx) => {
    setCurrentIdx(idx);
    setAutoPlay(false);
  }, []);

  // Auto-play: advance every AUTOPLAY_MS while enabled, pausing on the final step.
  useEffect(() => {
    if (!isOpen || !autoPlay || isLast) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    timerRef.current = setTimeout(() => {
      setCurrentIdx((prev) => Math.min(prev + 1, TUTORIAL_STEPS.length - 1));
    }, AUTOPLAY_MS);
    return () => clearTimeout(timerRef.current);
  }, [isOpen, autoPlay, currentIdx, isLast]);

  // Reset to step 0 + autoplay on, each time the tour is (re)opened.
  useEffect(() => {
    if (isOpen) {
      setCurrentIdx(0);
      setAutoPlay(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cardStyle = computeCardPosition(rect, step.placement);

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dimmed backdrop with a spotlight cutout over the active element */}
      <svg className="absolute inset-0 h-full w-full pointer-events-none" style={{ zIndex: 101 }}>
        <defs>
          <mask id="cms-tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - 8}
                y={rect.top - 8}
                width={rect.width + 16}
                height={rect.height + 16}
                rx="14"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15,23,42,0.62)"
          mask="url(#cms-tour-mask)"
          className="pointer-events-auto"
          onClick={() => setAutoPlay(false)}
        />
        {rect && (
          <motion.rect
            key={step.stepId}
            x={rect.left - 8}
            y={rect.top - 8}
            width={rect.width + 16}
            height={rect.height + 16}
            rx="14"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.9, 0.3, 0.9] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </svg>

      <AnimatePresence mode="wait">
        <TourCard
          key={step.stepId}
          step={step}
          currentIdx={currentIdx}
          total={TUTORIAL_STEPS.length}
          isFirst={isFirst}
          isLast={isLast}
          autoPlay={autoPlay}
          onToggleAutoPlay={() => setAutoPlay((p) => !p)}
          onNext={() => {
            setAutoPlay(false);
            goNext();
          }}
          onPrev={() => {
            setAutoPlay(false);
            goPrev();
          }}
          onSkip={finish}
          onJump={jumpTo}
          style={{ ...cardStyle, zIndex: 102 }}
          placement={step.placement}
        />
      </AnimatePresence>
    </div>
  );
}
