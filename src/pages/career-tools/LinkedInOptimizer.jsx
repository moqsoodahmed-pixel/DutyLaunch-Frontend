import { useState } from 'react';
import { Check, TriangleAlert } from 'lucide-react';
import { Seo } from '../../components/ui/Seo.jsx';
import { Container, Section } from '../../components/ui/Container.jsx';
import { PageHero } from '../../components/marketing/PageHero.jsx';
import { Textarea } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Progress } from '../../components/ui/Progress.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Mock LinkedIn review — no scraping, no API. The candidate pastes their
 * headline/About text and gets a heuristic score plus copy suggestions,
 * structured so a real LinkedIn-import API can replace `scoreProfile`
 * without touching the page.
 */
function scoreProfile({ headline = '', about = '' }) {
  const checks = [
    { label: 'Headline names a specific role or outcome', pass: /manager|lead|engineer|analyst|specialist|consultant|director|executive/i.test(headline) },
    { label: 'Headline is more than a job title alone', pass: headline.split(/\s+/).filter(Boolean).length >= 6 },
    { label: 'About section mentions measurable results', pass: /\d/.test(about) },
    { label: 'About section is substantial (80+ words)', pass: about.split(/\s+/).filter(Boolean).length >= 80 },
    { label: 'Mentions core skills by name', pass: /skills?|proficient|expert(ise)? in/i.test(about) },
  ];
  const score = Math.round((checks.filter((c) => c.pass).length / checks.length) * 100);
  return { score, checks };
}

export default function LinkedInOptimizer() {
  const { user } = useAuth();
  const [headline, setHeadline] = useState(user?.profile?.headline || '');
  const [about, setAbout] = useState('');
  const [result, setResult] = useState(null);

  return (
    <>
      <Seo title="LinkedIn Optimizer" description="Get a headline and About-section review scored against what recruiters search for." />
      <PageHero
        eyebrow="Career Tools"
        title="LinkedIn Optimizer"
        lead="Paste your current headline and About section. DutyLaunch checks them against the patterns that make a profile easy for recruiters to find and read — no scraping, nothing posted anywhere."
        breadcrumb={[{ label: 'Career Tools', to: '/ats-resume-checker' }, { label: 'LinkedIn Optimizer' }]}
      />

      <Section tone="white">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12">
            <form
              className="tile space-y-5 p-6 lg:col-span-7"
              onSubmit={(e) => {
                e.preventDefault();
                setResult(scoreProfile({ headline, about }));
              }}
            >
              <Textarea
                label="Headline"
                rows={2}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Operations Manager | Process Improvement & Team Leadership | 8+ Years"
              />
              <Textarea
                label="About section"
                rows={8}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Paste your current About section…"
              />
              <Button type="submit">Review my profile</Button>
            </form>

            <div className="lg:col-span-5">
              {!result && (
                <div className="tile p-6 text-small text-slate-600">
                  Your review will appear here — a score out of 100 and specific lines to fix.
                </div>
              )}
              {result && (
                <div className="tile p-6">
                  <p className="eyebrow">LinkedIn Profile Score</p>
                  <p className="tabular mt-2 text-h1 font-extrabold text-ink">{result.score}/100</p>
                  <Progress value={result.score} className="mt-3" />
                  <ul className="mt-5 space-y-3">
                    {result.checks.map((c) => (
                      <li key={c.label} className="flex items-start gap-2.5 text-small">
                        {c.pass ? (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                        ) : (
                          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                        )}
                        <span className={c.pass ? 'text-slate-700' : 'text-ink font-medium'}>{c.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
