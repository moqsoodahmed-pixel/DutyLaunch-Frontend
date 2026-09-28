import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Container, Section } from '../ui/Container.jsx';
import { AtsUploader } from './AtsUploader.jsx';
import { AtsScoreReport } from './AtsScoreReport.jsx';

/**
 * Homepage conversion tool: "How Strong Is Your Resume?" — the ATS checker
 * lives here and on its own dedicated route (/ats-resume-checker).
 */
export function AtsTeaser() {
  const { user, initialising } = useAuth();
  const [result, setResult] = useState(null);

  return (
    <Section tone="paper" id="ats-checker">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-4">Free ATS check</p>
            <h2 className="text-h2 font-bold">How Strong Is Your Resume?</h2>
            <p className="mt-4 text-lead text-slate-600">
              Upload your CV and discover how well it performs against ATS systems — plus get
              actionable recommendations to improve it.
            </p>
            <ul className="mt-6 space-y-2.5 text-small text-slate-600">
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                Your resume is analyzed to calculate a real, on-the-spot score — nothing is
                pre-filled or hard-coded.
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                We don&rsquo;t keep your uploaded document longer than it takes to analyze it.
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            {result ? (
              <AtsScoreReport result={result} onReset={() => setResult(null)} />
            ) : user ? (
              <AtsUploader onResult={setResult} />
            ) : (
              /* Guest gate — direct them to sign in */
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-white px-8 py-16 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-azure-50 text-azure">
                  <LogIn className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-5 text-lead font-bold text-ink">Sign in to check your resume</h3>
                <p className="mt-2 max-w-xs text-small text-slate-500">
                  Create a free account or sign in to run your ATS check and save your results.
                </p>
                <div className="mt-6 flex gap-3">
                  <Link
                    to="/sign-in?next=/resume-checker"
                    className="inline-flex h-10 items-center rounded bg-azure px-5 text-small font-semibold text-white hover:bg-azure-700"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register?next=/resume-checker"
                    className="inline-flex h-10 items-center rounded border border-line bg-white px-5 text-small font-semibold text-ink hover:bg-paper"
                  >
                    Create free account
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}