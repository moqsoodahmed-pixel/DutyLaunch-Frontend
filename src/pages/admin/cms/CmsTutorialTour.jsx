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
      'Click "Admin Resume Orders" to review candidates who purchased any of these offerings.',
    ],
  },
  {
    stepId: 'kpi-stats',
    target: 'kpi-stats',
    placement: 'bottom',
    title: 'Live catalog metrics at a single glance',
    badge: 'Metrics Row',
    icon: BarChart3,
    iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
    description:
      'The 6 cards here give you instant visibility into your catalog: total count, how many packages are in each category (Bundles, CV-only, Add-ons, Subscriptions), and the current average selling price across everything live.',
    bullets: [
      'Numbers update immediately as you add, delete, or re-categorize packages.',
      'Each card shows the breakdown and key category descriptor below the main figure.',
    ],
  },
  {
    stepId: 'global-settings',
    target: 'global-settings',
    placement: 'bottom',
    title: 'Global Platform Settings — site-wide policies',
    badge: 'Platform Config',
    icon: Settings2,
    iconColor: 'text-slate-700 bg-slate-100 border-slate-300',
    description:
      'Click anywhere on this bar to expand the platform-wide controls. This is where you configure settings that apply to EVERY offering at once.',
    bullets: [
      'GST Tax Rate — currently 18%, automatically added on checkout invoices.',
      'SLA Turnaround Disclaimer — the official guarantee footnote attached to the asterisk (*).',
      'Site-wide Announcement Banner — toggle a promotional bar at the very top of the live site.',
    ],
  },
  {
    stepId: 'category-tabs',
    target: 'category-tabs',
    placement: 'bottom',
    title: 'Category Tabs filter the workspace in one click',
    badge: 'Catalog Navigation',
    icon: Layers,
    iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    description:
      'Switch between All Offerings, Career Bundles, Standalone CVs, Portfolios & Add-ons, Subscriptions, and Specialized Services. The count badge on each tab shows how many items are in that group right now.',
    bullets: [
      'Clicking a tab instantly narrows the grid below to just that group.',
      'Notice the count numbers — they match the KPI stats row above.',
    ],
  },
  {
    stepId: 'search-bar',
    target: 'search-bar',
    placement: 'bottom',
    title: 'Instant search across names, slugs & features',
    badge: 'Search & Filters',
    icon: Search,
    iconColor: 'text-slate-600 bg-slate-50 border-slate-200',
    description:
      'Type any keyword — e.g. "Early", "Portfolio", "Executive", or even "DOCX" — and the grid instantly filters down. You can search by offering name, deliverable feature, or even target surface.',
    bullets: ['A clear (X) icon appears as soon as you type, so you can reset in one click.'],
  },
  {
    stepId: 'status-filter',
    target: 'status-filter',
    placement: 'bottom',
    title: 'Filter by lifecycle status: Published vs Draft',
    badge: 'Search & Filters',
    icon: Tag,
    iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    description:
      'Quickly isolate items that are Published (live to candidates) versus Draft (hidden from the public while you work on them). You can also view Archived packages here.',
    bullets: ['Handy when you want to review all work-in-progress packages before making them live.'],
  },
  {
    stepId: 'offering-card',
    target: 'offering-card',
    placement: 'right',
    title: 'The Offering Card — your package at a glance',
    badge: 'Offering Card',
    icon: Sparkles,
    iconColor: 'text-azure-600 bg-azure-50 border-azure-200',
    description:
      'Each card represents one real package on the website. The top bar shows its category pill on the left, the live status badge (Published / Draft) on the right, and a "Most Popular" glow pill if flagged.',
    bullets: [
      'The card name, experience band, and discount badge are prominently displayed.',
      'Next we will look at how the price and features are presented.',
    ],
  },
  {
    stepId: 'card-pricing',
    target: 'card-pricing',
    placement: 'right',
    title: 'Dynamic price + strikethrough + GST preview',
    badge: 'Offering Card · Pricing',
    icon: Tag,
    iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    description:
      'This shows the live selling price, any promotional strikethrough original price, and the +18% GST note. What you see here is the exact price sent to Razorpay checkout.',
    bullets: [
      'Hike or discount the price anytime via "Edit Offering."',
      'Strikethrough is optional — if disabled, only the clean price is shown.',
    ],
  },
  {
    stepId: 'card-features',
    target: 'card-features',
    placement: 'right',
    title: 'Deliverables checklist — what the candidate gets',
    badge: 'Offering Card · Features',
    icon: CheckCircle2,
    iconColor: 'text-azure-600 bg-azure-50 border-azure-200',
    description:
      'Every bullet listed here renders as an included/excluded deliverable on the public comparison tables and checkout. Green checkmarks mean included; strikethrough means excluded.',
    bullets: [
      'Add, remove, or reorder deliverables at will inside "Edit Offering."',
      'Turnaround SLA (e.g. "Delivery in 2–3 Days *") is highlighted in the green badge right above.',
    ],
  },
  {
    stepId: 'card-impact',
    target: 'card-impact',
    placement: 'right',
    title: 'Blast-radius transparency: where this card is live',
    badge: 'Offering Card · Surfaces',
    icon: MapPin,
    iconColor: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    description:
      'This is the per-offering version of the surfaces bar up top: the exact live pages and checkout components that render this specific package. Add or remove tags from inside "Edit Offering."',
    bullets: [],
  },
  {
    stepId: 'card-actions',
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

function useElementRect(target, placement, isOpen) {
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

    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // Intelligent scroll position based on placement and screen size:
    // For wide/bottom elements (like kpi-stats, surfaces-bar, global-settings, category-tabs),
    // scroll so the element sits near top (Y ≈ 70px) to maximize space below for the card.
    // For right-side elements (like offering cards), center them vertically.
    if (placement === 'bottom') {
      const elTop = el.getBoundingClientRect().top + window.scrollY;
      const targetY = Math.max(0, elTop - 72);
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    } else if (placement === 'top') {
      const elBottom = el.getBoundingClientRect().bottom + window.scrollY;
      const targetY = Math.max(0, elBottom - vh + 100);
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    } else {
      // 'right' or 'left' or null: center target vertically
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    const update = () => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom, right: r.right });
    };

    requestAnimationFrame(update);
    const t1 = setTimeout(update, 120);
    const t2 = setTimeout(update, 350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [target, placement]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const cleanup = measure();
    const handleScrollOrResize = () => {
      if (!target) return;
      const el = document.querySelector(`[data-tour="${target}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom, right: r.right });
      }
    };
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    return () => {
      if (cleanup) cleanup();
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [measure, isOpen, target]);

  return rect;
}

function ProgressDots({ steps, currentIdx, onJump }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 px-2">
      {steps.map((s, idx) => (
        <button
          key={s.stepId}
          onClick={() => onJump(idx)}
          title={`Step ${idx + 1}: ${s.title}`}
          aria-label={`Step ${idx + 1}`}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            idx === currentIdx ? 'w-5 sm:w-6 bg-azure-600' : 'w-1.5 sm:w-2 bg-slate-200 hover:bg-slate-300'
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
  maxHeight,
}) {
  const StepIcon = step.icon;
  return (
    <div
      style={maxHeight ? { maxHeight: `${maxHeight}px` } : undefined}
      className="flex flex-col max-h-[82vh] w-full rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Header - Non-shrinking */}
      <div className="shrink-0 flex items-start justify-between gap-3 border-b border-slate-100 p-3.5 sm:p-4 bg-white">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className={`p-1.5 sm:p-2 rounded-xl border shrink-0 ${step.iconColor}`}>
            <StepIcon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-azure-600 bg-azure-50 px-2 py-0.5 rounded-full">
                {step.badge}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium whitespace-nowrap">
                Step {currentIdx + 1} of {total}
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 leading-snug break-words">
              {step.title}
            </h3>
          </div>
        </div>
        <button
          onClick={onSkip}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0"
          title="Close Tutorial"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body - Smoothly scrollable if viewport height is small */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-2.5 overscroll-contain min-h-0">
        <p className="text-xs leading-relaxed text-slate-600 break-words">{step.description}</p>
        {step.bullets?.length > 0 && (
          <div className="space-y-1.5 bg-slate-50/80 border border-slate-200/70 rounded-xl p-2.5 sm:p-3">
            {step.bullets.map((bullet, i) => (
              <div key={i} className="flex items-start gap-1.5 sm:gap-2 text-xs text-slate-700">
                <div className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-azure-600 text-white">
                  <Check className="h-2 w-2" />
                </div>
                <span className="leading-relaxed break-words">{bullet}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Non-shrinking, always fully visible with buttons */}
      <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 p-2.5 sm:p-3 space-y-2">
        <ProgressDots steps={TUTORIAL_STEPS} currentIdx={currentIdx} onJump={onJump} />

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onSkip}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 hover:underline px-1 py-0.5"
            >
              Skip Tour
            </button>
            <button
              onClick={onToggleAutoPlay}
              title={autoPlay ? 'Pause auto-play' : 'Resume auto-play'}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md px-1.5 sm:px-2 py-0.5 shadow-2xs"
            >
              {autoPlay ? <Pause className="h-2.5 w-2.5 text-amber-500" /> : <Play className="h-2.5 w-2.5 text-emerald-600" />}
              <span>{autoPlay ? 'Auto' : 'Paused'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {!isFirst && (
              <Button variant="secondary" size="xs" onClick={onPrev}>
                <ArrowLeft className="mr-1 h-3 w-3" /> Back
              </Button>
            )}
            <Button variant="primary" size="xs" onClick={onNext}>
              {isLast ? (
                <>
                  Get Started <Check className="ml-1 h-3 w-3" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="ml-1 h-3 w-3" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Calculates absolute desktop pixel coordinates for targeted steps
 * ensuring zero transforms, zero clipping, and smart placement above, below, or to the side.
 */
function computeTargetedPlacement(rect, preferredPlacement = 'bottom') {
  if (!rect) return null;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Mobile / narrow viewports (< 768px): always centered modal overlay
  if (vw < 768) return null;

  const cardWidth = Math.min(410, vw - 32);
  const margin = 16;
  const gap = 12;
  const minCardHeight = 240;

  const spaceRight = vw - (rect.right + gap) - margin;
  const spaceLeft = rect.left - gap - margin;
  const spaceBelow = vh - (rect.bottom + gap) - margin;
  const spaceAbove = rect.top - gap - margin;

  // Decide effective placement
  let effectivePlacement = preferredPlacement;

  if (preferredPlacement === 'right') {
    if (spaceRight >= cardWidth) {
      effectivePlacement = 'right';
    } else if (spaceLeft >= cardWidth) {
      effectivePlacement = 'left';
    } else if (spaceBelow >= 270) {
      effectivePlacement = 'bottom';
    } else if (spaceAbove >= 270) {
      effectivePlacement = 'top';
    } else {
      return null; // Fallback to centered modal
    }
  } else if (preferredPlacement === 'left') {
    if (spaceLeft >= cardWidth) {
      effectivePlacement = 'left';
    } else if (spaceRight >= cardWidth) {
      effectivePlacement = 'right';
    } else if (spaceBelow >= 270) {
      effectivePlacement = 'bottom';
    } else if (spaceAbove >= 270) {
      effectivePlacement = 'top';
    } else {
      return null;
    }
  } else if (preferredPlacement === 'bottom') {
    if (spaceBelow >= 260) {
      effectivePlacement = 'bottom';
    } else if (spaceAbove >= 260) {
      effectivePlacement = 'top';
    } else if (spaceRight >= cardWidth && rect.width < vw * 0.5) {
      effectivePlacement = 'right';
    } else {
      return null;
    }
  } else if (preferredPlacement === 'top') {
    if (spaceAbove >= 260) {
      effectivePlacement = 'top';
    } else if (spaceBelow >= 260) {
      effectivePlacement = 'bottom';
    } else if (spaceRight >= cardWidth && rect.width < vw * 0.5) {
      effectivePlacement = 'right';
    } else {
      return null;
    }
  }

  // Now compute precise coordinates based on effectivePlacement:
  if (effectivePlacement === 'right') {
    const left = rect.right + gap;
    const top = Math.max(margin, Math.min(rect.top - 6, vh - 350 - margin));
    const maxHeight = Math.max(minCardHeight, vh - top - margin);
    return {
      position: 'fixed',
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      width: `${Math.round(cardWidth)}px`,
      maxHeight: Math.round(maxHeight),
      zIndex: 102,
    };
  }

  if (effectivePlacement === 'left') {
    const left = Math.max(margin, rect.left - gap - cardWidth);
    const top = Math.max(margin, Math.min(rect.top - 6, vh - 350 - margin));
    const maxHeight = Math.max(minCardHeight, vh - top - margin);
    return {
      position: 'fixed',
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      width: `${Math.round(cardWidth)}px`,
      maxHeight: Math.round(maxHeight),
      zIndex: 102,
    };
  }

  if (effectivePlacement === 'bottom') {
    const top = rect.bottom + gap;
    const maxHeight = Math.max(minCardHeight, vh - top - margin);
    let left;
    if (rect.width > cardWidth) {
      // Wide element: place with pleasant left indent (24px into the target), clamped
      left = Math.max(margin, Math.min(rect.left + 24, vw - cardWidth - margin));
    } else {
      // Narrow element: center horizontally on target
      left = Math.max(margin, Math.min(rect.left + (rect.width - cardWidth) / 2, vw - cardWidth - margin));
    }
    return {
      position: 'fixed',
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      width: `${Math.round(cardWidth)}px`,
      maxHeight: Math.round(maxHeight),
      zIndex: 102,
    };
  }

  if (effectivePlacement === 'top') {
    const bottom = vh - rect.top + gap;
    const maxHeight = Math.max(minCardHeight, rect.top - gap - margin);
    let left;
    if (rect.width > cardWidth) {
      left = Math.max(margin, Math.min(rect.left + 24, vw - cardWidth - margin));
    } else {
      left = Math.max(margin, Math.min(rect.left + (rect.width - cardWidth) / 2, vw - cardWidth - margin));
    }
    return {
      position: 'fixed',
      bottom: `${Math.round(bottom)}px`,
      left: `${Math.round(left)}px`,
      width: `${Math.round(cardWidth)}px`,
      maxHeight: Math.round(maxHeight),
      zIndex: 102,
    };
  }

  return null;
}

export function CmsTutorialTour({ isOpen, onClose }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const timerRef = useRef(null);

  const step = TUTORIAL_STEPS[currentIdx];
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === TUTORIAL_STEPS.length - 1;

  const rect = useElementRect(step?.target, step?.placement, isOpen);

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

  const targetedStyle = step.target ? computeTargetedPlacement(rect, step.placement) : null;
  const isCentered = !targetedStyle;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Dimmed backdrop with spotlight cutout */}
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

      {/* Modal / Card Presentation Layer */}
      {isCentered ? (
        /* Centered Modal: Flexbox container guarantees flawless centering on ALL viewports */
        <div className="fixed inset-0 z-[102] flex items-center justify-center p-3 sm:p-5 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-lg">
            <TourCard
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
            />
          </div>
        </div>
      ) : (
        /* Desktop Targeted Placement: Placed adjacent to element without CSS transforms */
        <div style={targetedStyle} className="pointer-events-auto flex flex-col">
          <TourCard
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
            maxHeight={targetedStyle.maxHeight}
          />
        </div>
      )}
    </div>
  );
}
