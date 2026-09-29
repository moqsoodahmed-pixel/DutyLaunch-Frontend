import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, FileUp, Loader2, ShieldCheck, CheckCircle2, TrendingUp } from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { PageHero, HeroActions } from '../components/marketing/PageHero.jsx';
import { ResumeShowcase } from '../components/cv/ResumeShowcase.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { ErrorState } from '../components/ui/States.jsx';
import { seoFor } from '../data/seoPages.js';
import { careerService, printResumeHtml } from '../services/careerService.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Input } from '../components/ui/Field.jsx';
import { ConsentCheckbox } from '../components/ui/ConsentCheckbox.jsx';
import { CONSENT_REQUIRED_MESSAGE } from '../data/legal.js';
import {
  AtsChecklist,
  EvidenceQuestions,
  JobMatchPanel,
  KeywordTable,
  ParseReviewNotice,
  ProposalReview,
  RecommendationList,
  ResumeHealthReport,
  SkillGapPanel,
  TemplateGallery,
} from '../components/career/CareerReport.jsx';
import { canonical, organizationSchema } from '../utils/seo.js';
import { contact } from '../data/site.js';

/**
 * The AI Resume Builder.
 *
 * This is the whole product journey on one page, in the order the
 * specification defines it:
 *
 *   upload → review what we read → add a target job → see the analysis
 *          → answer evidence questions → review rewrites → export
 *
 * Two rules are enforced in the UI rather than left to the backend:
 *
 *  1. The review step is not skippable in spirit. Whatever the parser
 *     could not read confidently is shown before anything else, because
 *     an analysis of a misread CV is worse than no analysis.
 *  2. No rewrite is applied until the candidate has accepted it. The
 *     "Apply" button is disabled until at least one decision is made,
 *     and rejected proposals leave the original text untouched.
 */

const STEPS = [
  { id: 'upload', label: 'Upload' },
  { id: 'review', label: 'Review' },
  { id: 'analyze', label: 'Analyze' },
  { id: 'optimize', label: 'Optimize' },
  { id: 'export', label: 'Export' },
];

const seo = seoFor('aiResumeBuilder');

export default function AiResumeBuilder() {
  const { success, error: toastError } = useToast();
  const { isAuthenticated } = useAuth();
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState('');

  const [searchParams] = useSearchParams();
  const paramTemplate = searchParams.get('template');

  const [step, setStep] = useState('upload');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState(null);

  const [parsed, setParsed] = useState(null); // { resume, needsReview, reviewNote }
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const [proposals, setProposals] = useState([]);
  const [engineNote, setEngineNote] = useState('');
  const [decisions, setDecisions] = useState({});

  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState(paramTemplate || '');
  const [blockingIssues, setBlockingIssues] = useState([]);

  useEffect(() => {
    if (paramTemplate) {
      setTemplateId(paramTemplate);
    }
  }, [paramTemplate]);

  const fileInput = useRef(null);
  const reportRef = useRef(null);

  useEffect(() => {
    careerService.getTemplates().then(setTemplates).catch(() => setTemplates([]));
  }, []);

  const scrollToReport = useCallback(() => {
    // A result that appears below the fold reads as nothing having happened.
    window.requestAnimationFrame(() => reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, []);

  /* ---------- upload ---------- */

  async function handleFile(file) {
    if (!file) return;
    setError(null);
    setBusy('upload');
    try {
      const result = await careerService.parseFile(file, undefined, { consent });
      setParsed(result);
      setResume(result.resume);
      setStep('review');
    } catch (err) {
      setError(err?.message || 'We could not read that file. If it is a scan, try a text-based PDF or a Word file.');
    } finally {
      setBusy('');
    }
  }

  /* ---------- review corrections (spec §5, §48) ---------- */

  async function saveCorrections(corrected) {
    setResume(corrected);
    // Anything scored before the correction is now stale.
    if (analysis) setAnalysis(null);
    if (!isAuthenticated) {
      success('Corrections applied. Run the analysis again to use them.');
      return;
    }
    setBusy('save');
    try {
      await careerService.updateProfile({ resume: corrected });
      success('Corrections saved to your career profile.');
    } catch (err) {
      toastError(err?.message || 'Corrections applied here, but could not be saved to your profile.');
    } finally {
      setBusy('');
    }
  }

  /* ---------- analysis ---------- */

  async function runAnalysis() {
    if (!resume) return;
    setError(null);
    setBusy('analyze');
    try {
      const result = await careerService.analyze({ resume, jobDescription: jobDescription.trim() || undefined });
      setAnalysis(result);
      setTemplateId((current) => current || result.suggestedTemplate);
      setStep('analyze');
      scrollToReport();
    } catch (err) {
      setError(err?.message || 'Something went wrong running the analysis.');
    } finally {
      setBusy('');
    }
  }

  /* ---------- evidence ---------- */

  const [answerBusy, setAnswerBusy] = useState('');

  async function handleAnswer(question, answers) {
    setAnswerBusy(question.id);
    try {
      const result = await careerService.submitEvidenceAnswer({ question, answers });
      success(result.suggestedBullet ? `Suggested line: ${result.suggestedBullet.bullet}` : result.note);
    } catch (err) {
      toastError(err?.message || 'Could not save that answer.');
    } finally {
      setAnswerBusy('');
    }
  }

  /* ---------- optimisation ---------- */

  async function runOptimize() {
    setError(null);
    setBusy('optimize');
    try {
      const result = await careerService.optimize({ resume, jobDescription: jobDescription.trim() || undefined });
      setProposals(result.proposals || []);
      setEngineNote(result.engineNote || '');
      setDecisions({});
      setStep('optimize');
    } catch (err) {
      setError(err?.message || 'Could not generate suggestions right now.');
    } finally {
      setBusy('');
    }
  }

  const decisionList = useMemo(
    () => Object.entries(decisions).map(([id, decision]) => ({ id, ...decision })),
    [decisions]
  );

  async function applyDecisions() {
    setBusy('apply');
    try {
      const result = await careerService.applyOptimization({
        resume,
        jobDescription: jobDescription.trim() || undefined,
        proposals,
        decisions: decisionList,
      });
      setResume(result.resume);
      setAnalysis((prev) => ({ ...prev, health: result.health, match: result.match }));
      setBlockingIssues(result.qualityControl?.blockingIssues || []);
      setProposals([]);
      setDecisions({});
      setStep('export');
      success('Your changes are in. Nothing you rejected was applied.');
      scrollToReport();
    } catch (err) {
      setError(err?.message || 'Could not apply those changes.');
    } finally {
      setBusy('');
    }
  }

  /* ---------- export ---------- */

  async function handleExport(acknowledge = false) {
    setBusy('export');
    setError(null);
    try {
      const result = await careerService.exportResume({
        resume,
        jobDescription: jobDescription.trim() || undefined,
        templateId,
        acknowledgeIssues: acknowledge,
      });
      setBlockingIssues([]);
      const opened = printResumeHtml(result.html, result.fileName);
      if (!opened) {
        toastError('Allow pop-ups for this site to download your resume.');
      }
    } catch (err) {
      const message = err?.message || 'Could not prepare the download.';
      setError(message);
      // Export refusal is a feature, not a bug: it means an unverified
      // claim is still in the document.
      setBlockingIssues((prev) => (prev.length ? prev : [{ id: 'unknown', label: message }]));
    } finally {
      setBusy('');
    }
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <>
      <Seo
        title={seo.title}
        description={seo.description}
        schema={[
          organizationSchema(contact),
          {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'DutyLaunch AI Resume Builder',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            url: canonical(seo.path),
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          },
        ]}
      />

      <PageHero
        eyebrow="AI Resume Builder"
        title={seo.heading}
        lead={seo.subheading}
        breadcrumb={[{ label: 'Career Tools', to: '/ai-resume-builder' }, { label: 'AI Resume Builder' }]}
        actions={
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <HeroActions primary={seo.primaryCta} secondary={seo.secondaryCta} />
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden />
                100% ATS Verified
              </span>
              <span className="inline-flex items-center gap-1.5 text-azure-700">
                <TrendingUp className="h-4 w-4 text-azure" aria-hidden />
                10,000+ Resumes Built
              </span>
              <span className="inline-flex items-center gap-1.5 text-purple-700">
                <CheckCircle2 className="h-4 w-4 text-purple-600" aria-hidden />
                Zero Layout Rejection
              </span>
            </div>
          </div>
        }
        aside={<ResumeShowcase />}
      />

      {/* Progress rail — the spec asks for clear progress indicators, and
          a five-stage process with no rail feels like a form that never ends. */}
      <div className="border-b border-line bg-white">
        <Container className="py-4">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-small">
            {STEPS.map((s, i) => (
              <li key={s.id} className="flex items-center gap-2">
                <span
                  className={[
                    'grid h-6 w-6 place-content-center rounded-full text-caption font-bold',
                    i < stepIndex ? 'bg-success text-white' : i === stepIndex ? 'bg-azure text-white' : 'bg-slate-100 text-slate-500',
                  ].join(' ')}
                >
                  {i + 1}
                </span>
                <span className={i === stepIndex ? 'font-semibold' : 'text-slate-500'}>{s.label}</span>
                {i < STEPS.length - 1 && <span className="mx-1 text-slate-300">›</span>}
              </li>
            ))}
          </ol>
        </Container>
      </div>

      <Section id="upload" tone="paper">
        <Container>
          <SectionHeader
            label="Step 1"
            title="Start with the CV you already have"
            lead="PDF or Word. We read it the way a parser would, then show you exactly what we extracted before anything else happens."
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Upload Area Card with Continuous Travelling Edge Glow */}
            <div className="group relative overflow-hidden rounded-2xl p-[1.5px] shadow-crystal transition-all duration-300 hover:shadow-crystal-lg">
              <div
                className="pointer-events-none absolute -inset-[200%] animate-edge-orbit opacity-40 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, transparent 260deg, #4FC1E6 295deg, #7DD3EF 325deg, #A98CEA 345deg, #FDF3E2 355deg, rgba(255,255,255,1) 358deg, transparent 360deg)',
                }}
                aria-hidden="true"
              />
              <div className="relative flex h-full flex-col rounded-[14.5px] border border-white/80 bg-white/95 p-6 backdrop-blur-xl">
                <input
                  ref={fileInput}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  className="sr-only"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!consent) return setConsentError(CONSENT_REQUIRED_MESSAGE);
                    return fileInput.current?.click();
                  }}
                  className="flex w-full flex-1 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-frost-300/80 bg-frost-50/30 px-6 py-10 text-center transition-all duration-300 hover:border-azure hover:bg-azure-50/50 hover:shadow-crystal"
                >
                  {busy === 'upload' ? (
                    <Loader2 className="h-8 w-8 animate-spin text-azure" aria-hidden />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-crystal text-azure transition-transform duration-200 group-hover:scale-110">
                      <FileUp className="h-7 w-7 text-azure" aria-hidden />
                    </div>
                  )}
                  <span className="text-body font-bold text-ink">{busy === 'upload' ? 'Reading your CV…' : 'Choose your CV'}</span>
                  <span className="text-small text-slate-500">PDF, DOC or DOCX (Max 10MB)</span>
                </button>

                <ConsentCheckbox
                  className="mt-4"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (e.target.checked) setConsentError('');
                  }}
                  error={consentError}
                />

                {parsed && (
                  <p className="mt-4 rounded-lg bg-glacier-50 border border-glacier-200/80 p-2.5 text-small text-slate-700">
                    Read <span className="font-semibold text-ink">{resume?._source?.fileName}</span> —{' '}
                    {resume?.experience?.length || 0} roles, {resume?.education?.length || 0} qualifications.
                  </p>
                )}
              </div>
            </div>

            {/* Target Job Description Card with Continuous Travelling Edge Glow */}
            <div className="group relative overflow-hidden rounded-2xl p-[1.5px] shadow-crystal transition-all duration-300 hover:shadow-crystal-lg">
              <div
                className="pointer-events-none absolute -inset-[200%] animate-edge-orbit opacity-40 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, transparent 260deg, #4FC1E6 295deg, #7DD3EF 325deg, #A98CEA 345deg, #FDF3E2 355deg, rgba(255,255,255,1) 358deg, transparent 360deg)',
                }}
                aria-hidden="true"
              />
              <div className="relative flex h-full flex-col rounded-[14.5px] border border-white/80 bg-white/95 p-6 backdrop-blur-xl">
                <label className="block flex-1">
                  <span className="mb-1.5 block font-bold text-ink">Target job description</span>
                  <span className="mb-3 block text-small text-slate-500">
                    Optional, but unlocks targeted ATS keyword matching and role relevance scores.
                  </span>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={7}
                    placeholder="Paste the target job description or requirements here…"
                    className="w-full rounded-lg border border-line bg-glacier-50/30 px-3.5 py-3 text-small outline-none transition-all focus:border-azure focus:bg-white focus:ring-2 focus:ring-azure-100"
                  />
                </label>

                <Button
                  className="mt-4 shadow-crystal"
                  fullWidth
                  variant="premium"
                  loading={busy === 'analyze'}
                  disabled={!resume}
                  onClick={runAnalysis}
                >
                  Analyze my resume
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6">
              <ErrorState error={{ message: error }} />
            </div>
          )}
        </Container>
      </Section>

      {parsed && (
        <Section id="review">
          <Container>
            <SectionHeader
              label="Step 2"
              title="Check what we read"
              lead="We write nothing we are unsure of. Where a field was unreadable we left it empty rather than guessing. Click Edit to correct anything before you rely on the analysis."
            />
            <div className="mt-6 space-y-5">
              <ParseReviewNotice needsReview={parsed.needsReview} note={parsed.reviewNote} />
              <ExtractedSummary resume={resume} onSave={saveCorrections} saving={busy === 'save'} />
            </div>
          </Container>
        </Section>
      )}

      <div ref={reportRef} />

      {analysis && (
        <Section id="report" tone="paper">
          <Container className="space-y-10">
            <SectionHeader label="Step 3" title="Your Resume Health" lead="Every number below can be opened up to show how it was reached." />

            <ResumeHealthReport health={analysis.health} />

            {analysis.match && <JobMatchPanel match={analysis.match} disclaimer={analysis.match.disclaimer} />}
            {analysis.keywords && <KeywordTable keywordResult={analysis.keywords} />}
            {analysis.skillGap && <SkillGapPanel skillGap={analysis.skillGap} />}

            <AtsChecklist checklist={analysis.health.checklist} />

            <div>
              <h3 className="mb-4 text-h3 font-bold">What to do next</h3>
              <RecommendationList recommendations={analysis.recommendations} />
            </div>

            {analysis.questions?.length > 0 && (
              <div id="evidence">
                <SectionHeader
                  label="Step 4"
                  title="Questions only you can answer"
                  lead="These turn work you have already done into claims your resume can actually make."
                />
                <div className="mt-6">
                  <EvidenceQuestions questions={analysis.questions} onAnswer={handleAnswer} busyId={answerBusy} />
                </div>
              </div>
            )}

            <div className="rounded-lg border border-line bg-white p-6">
              <h3 className="text-h3 font-bold">Ready to improve the wording?</h3>
              <p className="mt-2 max-w-prose text-small text-slate-600">
                We will suggest stronger phrasing for your existing bullets. Every suggestion shows the original next
                to it and explains itself, and nothing changes until you accept it.
              </p>
              <Button className="mt-4" loading={busy === 'optimize'} onClick={runOptimize}>
                Suggest improvements
              </Button>
            </div>
          </Container>
        </Section>
      )}

      {proposals.length > 0 && (
        <Section id="optimize">
          <Container>
            <SectionHeader
              label="Step 4"
              title="Accept, edit or reject each change"
              lead="This is your resume. Nothing here is applied until you say so."
            />
            <div className="mt-6">
              <ProposalReview
                proposals={proposals}
                decisions={decisions}
                engineNote={engineNote}
                onDecide={(id, decision) => setDecisions((prev) => ({ ...prev, [id]: decision }))}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button loading={busy === 'apply'} disabled={!decisionList.length} onClick={applyDecisions}>
                Apply {decisionList.filter((d) => d.action !== 'reject').length} change
                {decisionList.filter((d) => d.action !== 'reject').length === 1 ? '' : 's'}
              </Button>
              <span className="text-small text-slate-600">
                {decisionList.length} of {proposals.length} reviewed
              </span>
            </div>
          </Container>
        </Section>
      )}

      {analysis && (
        <Section id="export" tone="paper">
          <Container>
            <SectionHeader
              label="Step 5"
              title="Choose a template and export"
              lead="Every template is single-column, text-based and free of the graphics that break parsers. They differ in typography and spacing, not in what a parser can read."
            />

            <div className="mt-8">
              <TemplateGallery
                templates={templates}
                selectedId={templateId}
                suggestedId={analysis.suggestedTemplate}
                onSelect={setTemplateId}
              />
            </div>

            {blockingIssues.length > 0 && (
              <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-6">
                <h3 className="font-semibold">Before you export</h3>
                <ul className="mt-3 space-y-2">
                  {blockingIssues.map((issue) => (
                    <li key={issue.id} className="text-small text-slate-700">• {issue.label}</li>
                  ))}
                </ul>
                <p className="mt-3 text-small text-slate-600">
                  These are claims we could not trace back to your original CV or to something you confirmed. Fix them,
                  or confirm that they are accurate and you are happy to stand behind them.
                </p>
                <Button className="mt-4" variant="quiet" loading={busy === 'export'} onClick={() => handleExport(true)}>
                  These are accurate — export anyway
                </Button>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button size="lg" loading={busy === 'export'} onClick={() => handleExport(false)}>
                <Download className="mr-2 h-4 w-4" aria-hidden />
                Download as PDF
              </Button>
              <Badge tone="outline">Opens your browser&apos;s print dialogue — choose &ldquo;Save as PDF&rdquo;</Badge>
            </div>

            <p className="mt-6 max-w-prose text-small text-slate-600">
              Want a targeted version for a different role?{' '}
              <Link to="/register" className="text-azure hover:underline">
                Create an account
              </Link>{' '}
              and your master profile is saved, so the next version takes a paste of a job description rather than a
              rebuild.
            </p>
          </Container>
        </Section>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Extracted-data summary
 * ------------------------------------------------------------------ */

const CONTACT_FIELDS = [
  ['name', 'Name'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['location', 'Location'],
  ['linkedin', 'LinkedIn'],
];

function ExtractedSummary({ resume, onSave, saving }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(resume);

  useEffect(() => {
    if (!editing) setDraft(resume);
  }, [resume, editing]);

  if (!resume) return null;

  const setPersonal = (key, value) => setDraft((d) => ({ ...d, personal: { ...(d.personal || {}), [key]: value } }));
  const setRole = (index, key, value) =>
    setDraft((d) => ({
      ...d,
      experience: (d.experience || []).map((r, i) => (i === index ? { ...r, [key]: value } : r)),
    }));

  const view = editing ? draft : resume;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-3">
        {editing ? (
          <>
            <Button variant="quiet" size="sm" onClick={() => { setDraft(resume); setEditing(false); }}>
              Cancel
            </Button>
            <Button size="sm" loading={saving} onClick={async () => { await onSave?.(draft); setEditing(false); }}>
              Save corrections
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Edit what we read
          </Button>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-white p-6">
          <h3 className="mb-4 font-semibold">Contact details</h3>
          {editing ? (
            <div className="space-y-3">
              {CONTACT_FIELDS.map(([key, label]) => (
                <Input key={key} label={label} value={view.personal?.[key] || ''} onChange={(e) => setPersonal(key, e.target.value)} />
              ))}
            </div>
          ) : (
            <dl className="space-y-2.5">
              {CONTACT_FIELDS.map(([key, label]) => {
                const value = view.personal?.[key];
                return (
                  <div key={key} className="flex gap-4 text-small">
                    <dt className="w-24 shrink-0 text-slate-500">{label}</dt>
                    <dd className={value ? '' : 'text-danger'}>{value || 'Not found — please add'}</dd>
                  </div>
                );
              })}
            </dl>
          )}
        </div>

        <div className="rounded-lg border border-line bg-white p-6">
          <h3 className="mb-4 font-semibold">Experience we read</h3>
          {view.experience?.length ? (
            <ul className="space-y-4">
              {view.experience.map((role, i) => (
                <li key={role.id || i} className="text-small">
                  {editing ? (
                    <div className="grid gap-3 rounded-md border border-line p-3 sm:grid-cols-2">
                      <Input label="Job title" value={role.title || ''} onChange={(e) => setRole(i, 'title', e.target.value)} />
                      <Input label="Company" value={role.company || ''} onChange={(e) => setRole(i, 'company', e.target.value)} />
                      <Input label="Start" placeholder="e.g. 2021-04" value={role.startDate || ''} onChange={(e) => setRole(i, 'startDate', e.target.value)} />
                      <Input
                        label="End"
                        placeholder="e.g. 2024-02"
                        hint={role.current ? 'Marked as your current role' : undefined}
                        value={role.current ? 'Present' : role.endDate || ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          const current = /^present$/i.test(v.trim());
                          setDraft((d) => ({
                            ...d,
                            experience: d.experience.map((r, j) => (j === i ? { ...r, current, endDate: current ? '' : v } : r)),
                          }));
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      <p className="font-medium">
                        {role.title || <span className="text-danger">Title not found</span>}
                        {role.company ? ` · ${role.company}` : ''}
                      </p>
                      <p className="text-slate-600">
                        {role.startDate || '?'} – {role.current ? 'Present' : role.endDate || '?'}
                        {' · '}
                        {(role.responsibilities?.length || 0) + (role.achievements?.length || 0)} bullets
                      </p>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-small text-slate-600">
              No work history was found. If you are a student or a fresher that is expected — your projects, internships
              and coursework are what we will score instead.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}