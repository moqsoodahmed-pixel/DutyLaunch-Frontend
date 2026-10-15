import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, ScanLine } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { HIGHLIGHT_EVENT, HIGHLIGHT_KEY, hasFlag, setFlag } from '../../utils/atsWelcome.js';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';
import { Container, Section } from '../ui/Container.jsx';
import { Button } from '../ui/Button.jsx';
import { Reveal } from '../ui/Reveal.jsx';
import { GlacierBackdrop } from '../premium/GlacierBackdrop.jsx';
import { GlassPanel } from '../premium/GlassPanel.jsx';
import { AtsUploader } from './AtsUploader.jsx';
import { AtsScoreReport } from './AtsScoreReport.jsx';
import AtsResumeVisual from './AtsResumeVisual.jsx';

const ASSURANCES = [
  'Your resume is analyzed to calculate a real, on-the-spot score — nothing is pre-filled or hard-coded.',
  'We don\u2019t keep your uploaded document longer than it takes to analyze it.',
];

/** Placeholder shown while the session is still being resolved. Without
 * it, a signed-in visitor briefly saw the "Sign in" prompt on every load,
 * because `user` is null until the auth check completes. */
function GateSkeleton() {
  return (
    <div className="flex animate-pulse flex-col items-center px-8 py-16 motion-reduce:animate-none" aria-hidden>
      <span className="h-14 w-14 rounded-full bg-glacier-300" />
      <span className="mt-5 h-5 w-56 rounded bg-glacier-300" />
      <span className="mt-3 h-4 w-72 max-w-full rounded bg-glacier-300/70" />
      <span className="mt-6 h-10 w-64 max-w-full rounded-lg bg-glacier-300/70" />
    </div>
  );
}

function GuestGate({ highlight, replayKey }) {
  const reduce = usePrefersReducedMotion();

  return (
    <div className="grid items-center gap-6 px-1 py-4 sm:px-3 md:grid-cols-2 md:gap-4 lg:grid-cols-1 lg:gap-6 lg:py-6 xl:grid-cols-2 xl:gap-8">
      {/* Illustration — above the copy on small screens, beside it from md up.
          It sits in its own grid cell, so it can never cover the buttons. */}
      <div className="md:order-2 lg:order-1 xl:order-2">
        <div className="mx-auto w-full max-w-[16rem] sm:max-w-[19rem] md:max-w-[21rem]">
          <AtsResumeVisual replayKey={replayKey} />
          <p className="mt-1 text-center text-caption text-slate-500">
            Illustrative preview — your real score appears after you upload.
          </p>
        </div>
      </div>

      <div className="text-center md:order-1 md:text-left lg:order-2 lg:mx-auto lg:max-w-md lg:text-center xl:order-1 xl:mx-0 xl:max-w-none xl:text-left">
        <p className="text-caption font-bold uppercase tracking-[0.14em] text-azure-700">Free AI resume check</p>
        <h3 className="mt-2 text-lead font-bold leading-snug text-ink">
          Is Your Resume Ready for the Next Opportunity?
        </h3>
        <p className="mt-2 text-small text-slate-600">
          Discover how ATS-friendly your resume is and get actionable recommendations to improve it.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center md:justify-start lg:justify-center xl:justify-start">
          <motion.span
            className="flex rounded sm:inline-flex"
            animate={
              highlight && !reduce
                ? {
                    boxShadow: [
                      '0 0 0 0 rgba(79,193,230,0)',
                      '0 0 0 7px rgba(79,193,230,0.45)',
                      '0 0 0 0 rgba(79,193,230,0)',
                    ],
                  }
                : { boxShadow: '0 0 0 0 rgba(79,193,230,0)' }
            }
            transition={{ duration: 1.5, delay: highlight ? 1.2 : 0, ease: 'easeInOut' }}
          >
            <Button
              to="/register?next=/resume-checker"
              variant="premium"
              size="sm"
              magnetic
              className="w-full sm:w-auto"
            >
              Create Free Account
            </Button>
          </motion.span>
          <Button to="/login" state={{ from: '/resume-checker' }} variant="quiet" size="sm">
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Homepage conversion tool: "How Strong Is Your Resume?" — the ATS checker
 * lives here and on its own dedicated route (/resume-checker).
 *
 * The tool is presented inside a frosted "product window" frame. The
 * uploader and report components themselves are unchanged — they're shared
 * with the dedicated checker page and get their own pass there.
 */
export function AtsTeaser() {
  const { user, initialising } = useAuth();
  const reduce = usePrefersReducedMotion();
  const [result, setResult] = useState(null);

  // ── Temporary first-visit highlight ────────────────────────────────────
  // Fires once, the first time a signed-out visitor actually has the panel on
  // screen (or when the welcome dialog asks for it). It lasts a few seconds,
  // never loops, and never blocks clicks.
  const panelRef = useRef(null);
  const onScreen = useInView(panelRef, { amount: 0.55 });
  const guest = !result && !initialising && !user;
  const [highlight, setHighlight] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const request = () => setPending(true);
    window.addEventListener(HIGHLIGHT_EVENT, request);
    return () => window.removeEventListener(HIGHLIGHT_EVENT, request);
  }, []);

  // A request from the welcome dialog stays valid for a few seconds, so a
  // slow smooth-scroll still ends in a highlight but a stale request can't.
  useEffect(() => {
    if (!pending) return undefined;
    const id = window.setTimeout(() => setPending(false), 7000);
    return () => window.clearTimeout(id);
  }, [pending]);

  useEffect(() => {
    if (!guest || !onScreen) return;
    if (pending) {
      setPending(false);
      setFlag(HIGHLIGHT_KEY);
      setReplayKey((k) => k + 1);
      setHighlight(true);
    } else if (!hasFlag(HIGHLIGHT_KEY)) {
      setFlag(HIGHLIGHT_KEY);
      setHighlight(true);
    }
  }, [guest, onScreen, pending]);

  useEffect(() => {
    if (!highlight) return undefined;
    const id = window.setTimeout(() => setHighlight(false), 4800);
    return () => window.clearTimeout(id);
  }, [highlight, replayKey]);

  const body = (() => {
    if (result) return <AtsScoreReport result={result} onReset={() => setResult(null)} />;
    if (initialising) return <GateSkeleton />;
    if (user) return <AtsUploader onResult={setResult} />;
    return <GuestGate highlight={highlight} replayKey={replayKey} />;
  })();

  return (
    <Section tone="glacier" id="ats-checker" backdrop={<GlacierBackdrop />}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow mb-4">Free ATS check</p>
            <h2 className="text-h2 font-bold">
              How Strong Is{' '}
              <span className="-mb-[0.14em] bg-gradient-to-r from-frost-600 via-azure to-aurora-500 bg-clip-text pb-[0.14em] text-transparent">
                Your Resume?
              </span>
            </h2>
            <p className="mt-4 text-lead text-slate-600">
              Upload your CV and discover how well it performs against ATS systems — plus get
              actionable recommendations to improve it.
            </p>
            <ul className="mt-6 space-y-3 text-small text-slate-600">
              {ASSURANCES.map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-gradient-to-br from-frost-400 to-aurora-500">
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} aria-hidden />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="min-w-0 lg:col-span-7">
            {/* The glow lives on this wrapper (outside the panel's own
                overflow-hidden) and is purely visual: it carries no pointer
                events of its own and is removed after a few seconds. */}
            <div
              ref={panelRef}
              data-ats-panel
              className={`rounded-xl transition-[box-shadow,transform] duration-500 ease-out ${
                highlight
                  ? `shadow-[0_0_0_2px_rgba(79,193,230,0.55),0_26px_64px_-14px_rgba(79,193,230,0.60)] ${
                      reduce ? '' : '-translate-y-1.5'
                    }`
                  : ''
              }`}
            >
            <GlassPanel className="overflow-hidden">
              {/* Product-window header */}
              <div className="flex items-center justify-between border-b border-glacier-400/60 bg-white/50 px-5 py-3">
                <span className="flex items-center gap-2 text-caption font-semibold text-ink">
                  <ScanLine className="h-4 w-4 text-frost-600" aria-hidden />
                  ATS Resume Checker
                </span>
                <span className="rounded-full border border-frost-200 bg-white/70 px-2.5 py-0.5 text-caption font-semibold text-azure-700">
                  Free
                </span>
              </div>
              <div className="p-4 sm:p-6" aria-busy={initialising || undefined}>
                {body}
              </div>
            </GlassPanel>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}