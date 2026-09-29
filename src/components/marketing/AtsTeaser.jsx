import { useState } from 'react';
import { Check, LogIn, ScanLine } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Container, Section } from '../ui/Container.jsx';
import { Button } from '../ui/Button.jsx';
import { Reveal } from '../ui/Reveal.jsx';
import { GlacierBackdrop } from '../premium/GlacierBackdrop.jsx';
import { GlassPanel } from '../premium/GlassPanel.jsx';
import { AtsUploader } from './AtsUploader.jsx';
import { AtsScoreReport } from './AtsScoreReport.jsx';

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

function GuestGate() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center sm:px-8">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-frost-400 via-azure-400 to-aurora-500 text-white shadow-crystal">
        <LogIn className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="mt-5 text-lead font-bold text-ink">Sign in to check your resume</h3>
      <p className="mt-2 max-w-xs text-small text-slate-500">
        Create a free account or sign in to run your ATS check and save your results.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button to="/login" state={{ from: '/resume-checker' }} variant="premium" size="sm" magnetic>
          Sign in
        </Button>
        <Button to="/register?next=/resume-checker" variant="quiet" size="sm">
          Create free account
        </Button>
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
  const [result, setResult] = useState(null);

  let body;
  if (result) body = <AtsScoreReport result={result} onReset={() => setResult(null)} />;
  else if (initialising) body = <GateSkeleton />;
  else if (user) body = <AtsUploader onResult={setResult} />;
  else body = <GuestGate />;

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
      </Container>
    </Section>
  );
}