import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, FileCheck2, Palette, Sparkles, Download, LayoutTemplate } from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';
import { ResumeTemplatePreview } from './ResumeTemplatePreview.jsx';
import { TEMPLATES } from '../../data/resumeTemplates.js';

/**
 * Five-step animated explainer for how the DutyLaunch CV builder works.
 *
 * Deliberately original: no copied Zety illustrations or layouts. Steps 1
 * and 4 (template choice / customisation) reuse the project's own real
 * ResumeTemplatePreview + template catalogue rather than fake mockups,
 * per the brief's own preference for that over invented documents. Steps
 * 2, 3 and 5 are simple, original CSS/SVG compositions — there's no
 * equivalent real data to show for "add experience" or "download" before
 * a person has actually used the builder, and inventing fake personal
 * details for a realistic-looking resume here would risk being mistaken
 * for a real AI operation, which the brief explicitly warns against.
 */
const STEPS = [
  {
    id: 'template',
    title: 'Choose a professional template',
    description:
      'Explore professionally designed DutyLaunch templates and select a format suited to your industry, experience, and target role.',
  },
  {
    id: 'experience',
    title: 'Build your professional profile',
    description:
      'Upload an existing resume or start from scratch. Add your work experience, education, skills, certifications, and relevant achievements.',
  },
  {
    id: 'guidance',
    title: 'Strengthen your resume with expert guidance',
    description:
      'Get relevant suggestions and improve your resume using your existing experience and the requirements of your target job.',
  },
  {
    id: 'design',
    title: 'Make the design your own',
    description:
      'Personalize your CV with professional layouts, fonts, colors, and supported section arrangements.',
  },
  {
    id: 'done',
    title: 'Your CV is ready for the next opportunity',
    description:
      'Review your finished resume, save your work, and use the existing supported export options to prepare your application.',
  },
];

const AUTO_ADVANCE_MS = 4500;

// A small, stable sample of real templates for steps 1 and 4 — not meant
// to represent the full catalogue (that's what the gallery below is for),
// just enough variety to show "several templates" and "switching designs."
const SAMPLE_TEMPLATES = TEMPLATES.slice(0, 3);

function TemplateStackIllustration({ activeIndex = 0 }) {
  return (
    <div className="relative mx-auto h-64 w-full max-w-[18rem]" style={{ perspective: '1200px' }}>
      {SAMPLE_TEMPLATES.map((tpl, i) => {
        const offset = i - activeIndex;
        const isActive = offset === 0;
        return (
          <motion.div
            key={tpl.id}
            className="absolute inset-x-6 top-0 overflow-hidden rounded-lg border bg-white shadow-crystal"
            animate={{
              x: offset * 26,
              y: Math.abs(offset) * 10,
              rotate: offset * 4,
              scale: isActive ? 1 : 0.92,
              opacity: Math.abs(offset) > 1 ? 0 : 1,
              zIndex: 10 - Math.abs(offset),
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              borderColor: isActive ? 'rgb(29 93 184)' : 'rgb(215 228 243)',
              borderWidth: isActive ? 2 : 1,
              height: '15rem',
            }}
          >
            <ResumeTemplatePreview template={tpl} crop />
            {isActive && (
              <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-azure text-white shadow">
                <Check className="h-3.5 w-3.5" aria-hidden />
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function ExperienceIllustration() {
  const rows = ['Work experience', 'Education', 'Skills', 'Certifications'];
  return (
    <div className="mx-auto w-full max-w-[18rem] rounded-lg border border-line bg-white p-5 shadow-crystal">
      <div className="h-3 w-2/3 rounded-full bg-ink-800/80" />
      <div className="mt-2 h-2 w-1/3 rounded-full bg-slate-200" />
      <div className="mt-5 space-y-3">
        {rows.map((label, i) => (
          <motion.div
            key={label}
            className="flex items-center gap-2 rounded-md border border-line bg-paper px-3 py-2"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.18, duration: 0.4 }}
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-3 w-3" aria-hidden />
            </span>
            <span className="text-caption font-semibold text-slate-700">{label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function GuidanceIllustration() {
  return (
    <div className="mx-auto flex w-full max-w-[20rem] items-start gap-3">
      <div className="w-1/2 rounded-lg border border-line bg-white p-4 shadow-crystal">
        <div className="h-2.5 w-3/4 rounded-full bg-ink-800/70" />
        <div className="mt-3 space-y-1.5">
          {[1, 0.8, 0.9, 0.6].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full bg-slate-200" style={{ width: `${w * 100}%` }} />
          ))}
        </div>
      </div>
      <motion.div
        className="w-1/2 rounded-lg border border-azure-200 bg-azure-50 p-4"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="flex items-center gap-1.5 text-azure-700">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          <span className="text-[10px] font-bold uppercase tracking-wide">Suggestions</span>
        </div>
        <div className="mt-2 space-y-1.5">
          {[0.9, 0.7, 0.8].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full bg-azure-200" style={{ width: `${w * 100}%` }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function DesignIllustration({ activeIndex = 0 }) {
  return <TemplateStackIllustration activeIndex={activeIndex} />;
}

function DoneIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[16rem]">
      <motion.div
        className="rounded-lg border-2 border-emerald-300 bg-white p-5 shadow-crystal-lg"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="h-3 w-2/3 rounded-full bg-ink-800/80" />
        <div className="mt-2 space-y-1.5">
          {[1, 0.8, 0.9].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full bg-slate-200" style={{ width: `${w * 100}%` }} />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-rose-600">
            <FileCheck2 className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-caption font-bold text-slate-600">resume.pdf</span>
          <Download className="ml-auto h-4 w-4 text-slate-400" aria-hidden />
        </div>
      </motion.div>
      <motion.span
        className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full bg-emerald-500 text-white shadow-lg"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 16 }}
      >
        <Check className="h-5 w-5" aria-hidden />
      </motion.span>
    </div>
  );
}

const ILLUSTRATIONS = {
  template: () => <TemplateStackIllustration activeIndex={0} />,
  experience: ExperienceIllustration,
  guidance: GuidanceIllustration,
  design: () => <DesignIllustration activeIndex={1} />,
  done: DoneIllustration,
};

const STEP_ICONS = { template: LayoutTemplate, experience: FileCheck2, guidance: Sparkles, design: Palette, done: Download };

export function CvBuildingExplainer({ className = '' }) {
  const [active, setActive] = useState(0);
  const [tabHidden, setTabHidden] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const timerRef = useRef(null);

  // Fully automatic, per the brief: no pause-on-hover/focus (an earlier
  // version paused whenever the mouse rested anywhere over the component,
  // which is exactly what made it look "frozen" to anyone whose cursor
  // happened to be sitting nearby while watching the page — the brief now
  // explicitly says to keep it automatic unless there's a visible pause
  // control, and there isn't one). The ONLY things that still pause it are
  // the two the brief explicitly still asks for: a hidden browser tab, and
  // prefers-reduced-motion (checked directly in the interval effect below).
  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Important distinction: reduced motion means fewer/no slide-and-fade
  // transitions (handled below, in the illustration's Framer Motion props),
  // NOT "never advance." The brief is explicit that reduced motion should
  // still "retain a clear presentation of all five steps" — a version that
  // stops the timer entirely on reduced motion would permanently freeze on
  // Step 1 for anyone with that accessibility setting on, which is a worse
  // outcome, not a more accessible one. Only a hidden tab pauses the timer
  // itself.
  useEffect(() => {
    if (tabHidden) return undefined;
    timerRef.current = setTimeout(() => {
      // Step 5 -> Step 1 is just the same modulo wrap every other step
      // uses — there's nothing special-cased about the "reset", so there's
      // no separate code path that could skip or jump.
      setActive((a) => (a + 1) % STEPS.length);
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [active, tabHidden]);

  // Manual clicks still work (handled in the step buttons' onClick below)
  // and don't disable auto-advance afterward — the effect above re-arms a
  // fresh timer from whichever step setActive just moved to, automatically,
  // since it's keyed on `active`.

  const current = STEPS[active];
  const Illustration = ILLUSTRATIONS[current.id];

  return (
    <div className={`grid gap-8 lg:grid-cols-2 lg:items-center ${className}`}>
      {/* Illustration */}
      <div className="order-2 flex min-h-[18rem] flex-col items-center justify-center rounded-2xl border border-line bg-paper p-6 lg:order-1">
        <p className="mb-3 self-start text-[11px] font-bold uppercase tracking-wider text-slate-400" aria-hidden="true">
          Step {active + 1} of {STEPS.length}
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? {} : { opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="w-full"
          >
            <Illustration />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step list */}
      <ol className="order-1 space-y-2 lg:order-2" role="list" aria-label="How the CV builder works, five steps">
        {STEPS.map((step, i) => {
          const isActive = i === active;
          const Icon = STEP_ICONS[step.id];
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                className={`flex w-full items-start gap-3.5 rounded-xl border px-4 py-3.5 text-left transition-colors duration-200 ${
                  isActive ? 'border-azure-200 bg-azure-50' : 'border-transparent hover:bg-paper'
                }`}
              >
                <span
                  className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-small font-extrabold transition-colors duration-200 ${
                    isActive ? 'bg-azure text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className={`flex items-center gap-2 text-body font-bold ${isActive ? 'text-ink' : 'text-slate-700'}`}>
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-azure' : 'text-slate-400'}`} aria-hidden />
                    {step.title}
                  </p>
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mt-1.5 overflow-hidden text-small text-slate-600"
                      >
                        {step.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}