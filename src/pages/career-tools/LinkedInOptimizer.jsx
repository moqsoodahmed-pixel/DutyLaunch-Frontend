import { useState } from 'react';
import { Check, ClipboardCheck, Copy, Info } from 'lucide-react';
import { Seo } from '../../components/ui/Seo.jsx';
import { Container, Section } from '../../components/ui/Container.jsx';
import { PageHero } from '../../components/marketing/PageHero.jsx';
import { Input, Textarea } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { EmptyState } from '../../components/ui/States.jsx';
import { ResumeSourceCard, apiErrorMessage, useResumeSource } from '../../components/career/ResumeSource.jsx';
import { careerService } from '../../services/careerService.js';
import { useToast } from '../../context/ToastContext.jsx';

/**
 * LinkedIn Optimizer (spec §24).
 *
 * Calls /api/career/linkedin, which builds headline, About, experience
 * and skills recommendations from the same career profile as the resume,
 * so the two tell one consistent story. Nothing is scraped or posted.
 */
const asText = (item) => (typeof item === 'string' ? item : item?.name || item?.title || item?.label || item?.url || '');

export default function LinkedInOptimizer() {
  const toast = useToast();
  const source = useResumeSource();
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const copy = (text) => {
    navigator.clipboard?.writeText(text);
    toast?.success?.('Copied to clipboard');
  };

  async function generate(e) {
    e.preventDefault();
    if (!source.ready) return;
    setBusy(true);
    setError('');
    try {
      const data = await careerService.linkedin({
        ...source.requestOpts,
        jobDescription: jobDescription.trim() || undefined,
        jobHints: role.trim() ? { jobTitle: role.trim() } : undefined,
      });
      setResult(data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not build your recommendations right now.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Seo title="LinkedIn Optimizer" description="LinkedIn headline, About and skills recommendations built from the same profile as your resume." />
      <PageHero
        eyebrow="Career Tools"
        title="LinkedIn Optimizer"
        lead="Recommendations for your headline, About section, experience and skills, built from your own CV so your LinkedIn and resume tell the same story. Nothing is scraped or posted anywhere."
        breadcrumb={[{ label: 'Career Tools', to: '/resume-checker' }, { label: 'LinkedIn Optimizer' }]}
      />

      <Section tone="white">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-5">
              <ResumeSourceCard source={source} />
              <form className="tile space-y-5 p-6" onSubmit={generate}>
                <p className="text-small font-semibold text-ink">Step 2 — What you are aiming for</p>
                <Input label="Target role" hint="Optional" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Operations Manager" />
                <Textarea
                  label="A job description you like"
                  hint="Optional — aligns your keywords with what recruiters search for"
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                {error && (
                  <p className="text-small text-danger" role="alert">
                    {error}
                  </p>
                )}
                <Button type="submit" fullWidth loading={busy} disabled={!source.ready}>
                  Optimize my LinkedIn
                </Button>
                {!source.ready && <p className="text-caption text-slate-500">Add your CV above first.</p>}
              </form>
            </div>

            <div className="lg:col-span-7">
              {!result && (
                <EmptyState
                  className="flex h-full min-h-[24rem] flex-col justify-center"
                  icon={ClipboardCheck}
                  title="Your recommendations will appear here"
                  description="A headline, an About section, rewritten experience entries and the skills worth listing — all from your own CV."
                />
              )}

              {result && (
                <div className="tile h-full space-y-8 p-6">
                  {result.engineNote && (
                    <div className="flex gap-2 rounded-lg bg-amber-50 p-4 text-caption text-slate-700">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                      <p>{result.engineNote}</p>
                    </div>
                  )}

                  <Block title="Headline" onCopy={result.headline ? () => copy(result.headline) : null}>
                    <p className="text-body font-semibold text-ink">{result.headline || '—'}</p>
                    {result.headlineAlternatives?.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {result.headlineAlternatives.map((h) => (
                          <li key={h} className="text-small text-slate-600">
                            Alternative: {h}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Block>

                  {result.about && (
                    <Block title="About" onCopy={() => copy(result.about)}>
                      <p className="whitespace-pre-wrap text-small leading-relaxed text-slate-700">{result.about}</p>
                    </Block>
                  )}

                  {result.experienceRewrites?.length > 0 && (
                    <Block title="Experience entries">
                      <ul className="space-y-4">
                        {result.experienceRewrites.map((x, i) => (
                          // eslint-disable-next-line react/no-array-index-key
                          <li key={i} className="rounded-lg border border-line p-4">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-small font-semibold text-ink">{x.role || x.title}</p>
                              <button type="button" onClick={() => copy(x.text || x.description || '')} className="shrink-0 text-caption font-semibold text-azure-600 hover:underline">
                                Copy
                              </button>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-small text-slate-700">{x.text || x.description}</p>
                          </li>
                        ))}
                      </ul>
                    </Block>
                  )}

                  {result.skillsToAdd?.length > 0 && (
                    <Block title="Skills to list">
                      <div className="flex flex-wrap gap-2">
                        {result.skillsToAdd.map((s) => (
                          <Badge key={asText(s)} tone="azure">
                            {asText(s)}
                          </Badge>
                        ))}
                      </div>
                    </Block>
                  )}

                  {result.featuredSuggestions?.length > 0 && (
                    <Block title="Featured section">
                      <ul className="list-disc space-y-1 pl-5 text-small text-slate-700">
                        {result.featuredSuggestions.map((f) => (
                          <li key={asText(f)}>{asText(f)}</li>
                        ))}
                      </ul>
                    </Block>
                  )}

                  {result.profileChecklist?.length > 0 && (
                    <Block title="Profile checklist">
                      <ul className="space-y-2">
                        {result.profileChecklist.map((c) => (
                          <li key={asText(c)} className="flex items-start gap-2 text-small text-slate-700">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                            {asText(c)}
                          </li>
                        ))}
                      </ul>
                    </Block>
                  )}

                  {result.consistencyNote && <p className="text-caption text-slate-500">{result.consistencyNote}</p>}
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

function Block({ title, onCopy, children }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="eyebrow">{title}</h2>
        {onCopy && (
          <button type="button" onClick={onCopy} className="inline-flex items-center gap-1.5 text-caption font-semibold text-azure-600 hover:underline">
            <Copy className="h-3.5 w-3.5" aria-hidden />
            Copy
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
