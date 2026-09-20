import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Container, Section } from '../ui/Container.jsx';
import { AtsUploader } from './AtsUploader.jsx';
import { AtsScoreReport } from './AtsScoreReport.jsx';

/**
 * Homepage conversion tool: "How Strong Is Your Resume?" — the ATS checker
 * lives here and on its own dedicated route (/ats-resume-checker).
 */
export function AtsTeaser() {
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
            ) : (
              <AtsUploader onResult={setResult} />
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
