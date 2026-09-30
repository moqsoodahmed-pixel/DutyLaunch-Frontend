import { useState } from 'react';
import { Copy, Info, PenLine } from 'lucide-react';
import { Seo } from '../../components/ui/Seo.jsx';
import { Container, Section } from '../../components/ui/Container.jsx';
import { PageHero } from '../../components/marketing/PageHero.jsx';
import { Input, Select, Textarea } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { EmptyState } from '../../components/ui/States.jsx';
import { ResumeSourceCard, apiErrorMessage, useResumeSource } from '../../components/career/ResumeSource.jsx';
import { careerService } from '../../services/careerService.js';
import { useToast } from '../../context/ToastContext.jsx';

const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'warm', label: 'Warm' },
  { value: 'direct', label: 'Direct' },
];

/**
 * Cover Letter Assistant (spec §25).
 *
 * Calls /api/career/cover-letter, which writes from the candidate's own
 * resume and the job description only — it never adds facts about the
 * employer. Without an AI key the server returns a rule-based draft built
 * from the candidate's own lines, flagged with `engineNote`.
 */
export default function CoverLetter() {
  const toast = useToast();
  const source = useResumeSource();
  const [form, setForm] = useState({ role: '', company: '', hiringManager: '', tone: 'professional', jobDescription: '' });
  const [letter, setLetter] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const canSubmit = source.ready && (form.role.trim() || form.jobDescription.trim());

  async function generate(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError('');
    try {
      const data = await careerService.coverLetter({
        ...source.requestOpts,
        jobDescription: form.jobDescription.trim() || undefined,
        jobHints: { jobTitle: form.role.trim() || undefined, company: form.company.trim() || undefined },
        company: form.company.trim() || undefined,
        hiringManager: form.hiringManager.trim() || undefined,
        tone: form.tone,
      });
      setLetter(data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not draft the letter right now.'));
    } finally {
      setBusy(false);
    }
  }

  const fullText = letter
    ? [letter.salutation, letter.body, `${letter.closing}\n${letter.candidateName || ''}`.trim()].filter(Boolean).join('\n\n')
    : '';

  return (
    <>
      <Seo title="Cover Letter Generator" description="Draft a targeted cover letter from your own CV and the job description — no invented claims." />
      <PageHero
        eyebrow="Career+"
        title="Cover Letter Assistant"
        lead="A first draft built from your own CV and the job you are applying for. It only uses experience your CV already shows, and it never makes claims about the employer."
        breadcrumb={[{ label: 'Career+', to: '/resume-checker' }, { label: 'Cover Letter' }]}
      />

      <Section tone="white">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-5">
              <ResumeSourceCard source={source} />

              <form className="tile space-y-5 p-6" onSubmit={generate}>
                <p className="text-small font-semibold text-ink">Step 2 — The job</p>
                <Input label="Target role" value={form.role} onChange={update('role')} placeholder="e.g. Operations Manager" />
                <Input label="Company" value={form.company} onChange={update('company')} />
                <Input label="Hiring manager" hint="Optional — leave blank for “Dear Hiring Manager”" value={form.hiringManager} onChange={update('hiringManager')} />
                <Textarea
                  label="Job description"
                  hint="Recommended — the letter is matched to what the job actually asks for"
                  rows={6}
                  value={form.jobDescription}
                  onChange={update('jobDescription')}
                  placeholder="Paste the job description…"
                />
                <Select label="Tone" options={TONES} value={form.tone} onChange={update('tone')} />
                {error && (
                  <p className="text-small text-danger" role="alert">
                    {error}
                  </p>
                )}
                <Button type="submit" fullWidth loading={busy} disabled={!canSubmit}>
                  Generate draft
                </Button>
                {!source.ready && <p className="text-caption text-slate-500">Add your CV above first.</p>}
              </form>
            </div>

            <div className="lg:col-span-7">
              {!letter && (
                <EmptyState
                  className="flex h-full min-h-[24rem] flex-col justify-center"
                  icon={PenLine}
                  title="Your draft will appear here"
                  description="Add your CV and the role, then click Generate draft. You will get a starting point to copy and adjust before you send it."
                />
              )}
              {letter && (
                <div className="tile h-full p-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className="eyebrow">Draft</p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(fullText);
                        toast?.success?.('Copied to clipboard');
                      }}
                      className="inline-flex items-center gap-1.5 text-caption font-semibold text-azure-600 hover:underline"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden />
                      Copy
                    </button>
                  </div>
                  {letter.subjectLine && (
                    <p className="mt-4 text-small text-slate-600">
                      <span className="font-semibold text-ink">Email subject:</span> {letter.subjectLine}
                    </p>
                  )}
                  <pre className="mt-4 whitespace-pre-wrap font-sans text-small leading-relaxed text-slate-700">{fullText}</pre>
                  {(letter.engineNote || letter.note) && (
                    <div className="mt-6 flex gap-2 rounded-lg bg-paper p-4 text-caption text-slate-600">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                      <p>{[letter.engineNote, letter.note].filter(Boolean).join(' ')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
