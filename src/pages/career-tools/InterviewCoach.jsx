import { useMemo, useState } from 'react';
import { Info, MessagesSquare } from 'lucide-react';
import { Seo } from '../../components/ui/Seo.jsx';
import { Container, Section } from '../../components/ui/Container.jsx';
import { PageHero } from '../../components/marketing/PageHero.jsx';
import { Input, Textarea } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { EmptyState } from '../../components/ui/States.jsx';
import { ResumeSourceCard, apiErrorMessage, useResumeSource } from '../../components/career/ResumeSource.jsx';
import { careerService } from '../../services/careerService.js';

/**
 * Interview Preparation (spec §26).
 *
 * Calls /api/career/interview. The "Your resume" category is built
 * deterministically from the candidate's own claims ("You state X — how
 * was that measured?"), so it works even when the AI model is down.
 */
const CATEGORIES = [
  { key: 'resumeQuestions', label: 'Your resume' },
  { key: 'jdQuestions', label: 'This job' },
  { key: 'roleQuestions', label: 'Role' },
  { key: 'behavioural', label: 'Behavioural' },
  { key: 'technical', label: 'Technical' },
  { key: 'leadership', label: 'Leadership' },
  { key: 'hrQuestions', label: 'HR' },
  { key: 'questionsToAsk', label: 'Ask them' },
];

const STAR = [
  ['situation', 'Situation'],
  ['task', 'Task'],
  ['action', 'Action'],
  ['result', 'Result'],
];

export default function InterviewCoach() {
  const source = useResumeSource();
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [prep, setPrep] = useState(null);
  const [category, setCategory] = useState('resumeQuestions');
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const available = useMemo(
    () => (prep ? CATEGORIES.filter((c) => prep[c.key]?.length).map((c) => ({ value: c.key, label: `${c.label} (${prep[c.key].length})` })) : []),
    [prep]
  );

  async function generate(e) {
    e.preventDefault();
    if (!source.ready) return;
    setBusy(true);
    setError('');
    try {
      const data = await careerService.interview({
        ...source.requestOpts,
        jobDescription: jobDescription.trim() || undefined,
        jobHints: role.trim() ? { jobTitle: role.trim() } : undefined,
      });
      setPrep(data);
      const first = CATEGORIES.find((c) => data[c.key]?.length);
      setCategory(first?.key || 'resumeQuestions');
      setOpen(null);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not prepare your questions right now.'));
    } finally {
      setBusy(false);
    }
  }

  const items = prep?.[category] || [];

  return (
    <>
      <Seo title="Interview Preparation" description="Practice interview questions built from your own CV and the job you are applying for." />
      <PageHero
        eyebrow="Career+"
        title="Interview Preparation"
        lead="Practice the questions you are most likely to face: about your role, the job description, and the claims on your own CV. You get structure notes, not scripted answers to memorise."
        breadcrumb={[{ label: 'Career+', to: '/resume-checker' }, { label: 'Interview Prep' }]}
      />

      <Section tone="white">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-5">
              <ResumeSourceCard source={source} />
              <form className="tile space-y-5 p-6" onSubmit={generate}>
                <p className="text-small font-semibold text-ink">Step 2 — The interview</p>
                <Input label="Role you are interviewing for" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Operations Manager" />
                <Textarea
                  label="Job description"
                  hint="Recommended — adds questions taken straight from the job"
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
                  Prepare my questions
                </Button>
                {!source.ready && <p className="text-caption text-slate-500">Add your CV above first.</p>}
              </form>
            </div>

            <div className="lg:col-span-7">
              {!prep && (
                <EmptyState
                  className="flex h-full min-h-[24rem] flex-col justify-center"
                  icon={MessagesSquare}
                  title="Your practice questions will appear here"
                  description="Grouped by type, each with why it is asked and how to structure a strong answer from your own experience."
                />
              )}

              {prep && (
                <div className="tile h-full p-6">
                  {prep.engineNote && (
                    <div className="mb-5 flex gap-2 rounded-lg bg-amber-50 p-4 text-caption text-slate-700">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                      <p>{prep.engineNote}</p>
                    </div>
                  )}

                  {available.length > 0 && (
                    <Tabs
                      options={available}
                      value={category}
                      onChange={(v) => {
                        setCategory(v);
                        setOpen(null);
                      }}
                      label="Question type"
                    />
                  )}

                  <ul className="mt-6 space-y-3">
                    {items.map((q, i) => {
                      const text = typeof q === 'string' ? q : q.question;
                      const isOpen = open === i;
                      const hasDetail = typeof q !== 'string';
                      return (
                        // eslint-disable-next-line react/no-array-index-key
                        <li key={i} className="overflow-hidden rounded-lg border border-line">
                          <button
                            type="button"
                            onClick={() => hasDetail && setOpen(isOpen ? null : i)}
                            className="flex w-full items-start justify-between gap-4 p-4 text-left"
                            aria-expanded={hasDetail ? isOpen : undefined}
                          >
                            <span className="text-small font-semibold text-ink">{text}</span>
                            {hasDetail && (
                              <span className="shrink-0 text-caption font-bold text-azure-600">{isOpen ? 'Hide' : 'How to answer'}</span>
                            )}
                          </button>
                          {isOpen && hasDetail && (
                            <div className="space-y-3 border-t border-line bg-paper px-4 py-4 text-small text-slate-700">
                              {q.role && <p className="text-caption text-slate-500">From your role: {q.role}</p>}
                              {q.whyAsked && (
                                <p>
                                  <span className="font-semibold text-ink">Why it is asked: </span>
                                  {q.whyAsked}
                                </p>
                              )}
                              {q.answerFramework && (
                                <p>
                                  <span className="font-semibold text-ink">How to answer: </span>
                                  {q.answerFramework}
                                </p>
                              )}
                              {q.starGuidance && (
                                <dl className="grid gap-2 sm:grid-cols-2">
                                  {STAR.map(([k, label]) =>
                                    q.starGuidance[k] ? (
                                      <div key={k} className="rounded-md bg-white p-3">
                                        <dt className="text-caption font-bold text-azure-700">{label}</dt>
                                        <dd className="mt-1">{q.starGuidance[k]}</dd>
                                      </div>
                                    ) : null
                                  )}
                                </dl>
                              )}
                              {q.preparationPoints?.length > 0 && (
                                <ul className="list-disc space-y-1 pl-5">
                                  {q.preparationPoints.map((p) => (
                                    <li key={p}>{p}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
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
