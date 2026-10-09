import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileUp, PencilLine, Upload, UserRound, Check,
  Sparkles, Loader2, Wand2, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConsentCheckbox } from '../../components/ui/ConsentCheckbox.jsx';
import { careerService } from '../../services/careerService.js';
import { BUILDER_IMPORT_KEY } from '../../utils/resumeToBuilder.js';
import { cn } from '../../utils/cn.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { draftKey } from '../ResumeWizard.jsx';
import { takePendingUpload } from '../../utils/pendingUpload.js';

export const BUILDER_AI_OPTIMIZE_KEY = 'dl_resume_ai_optimize';
export const BUILDER_AI_REPORT_KEY = 'dl_resume_ai_report';

const MIN_JD_CHARS = 60;
const MAX_JD_CHARS = 30000;
// The API accepts about 500 KB per request; keep the raw text (used only to
// verify rewrites against the original wording) when it comfortably fits.
const MAX_RAW_TEXT_FOR_VERIFY = 120000;

/** What goes to /optimize: the parsed resume WITH its raw text, so the
    server can verify every rewritten number and name against the original. */
function forOptimize(resume) {
  const r = { ...resume };
  delete r._confidence;
  if (r._source && (r._source.rawText || '').length > MAX_RAW_TEXT_FOR_VERIFY) r._source = { ...r._source, rawText: '' };
  return r;
}

function describeOptimizeError(err) {
  const status = err?.response?.status ?? err?.status;
  if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') return 'Optimization was cancelled.';
  if (err?.code === 'ECONNABORTED' || /timeout/i.test(err?.message || '')) return 'The AI took too long to answer. Your resume has not been changed.';
  if (status === 429) return 'Too many requests right now. Wait a minute and try again.';
  if (status === 401 || status === 403) return 'Your session has expired. Sign in again to use AI optimization.';
  if (status === 400 || status === 422) return err?.response?.data?.message || 'We could not process this resume for optimization.';
  return 'AI optimization is unavailable right now. Your resume has not been changed.';
}

/**
 * Removes large internal-only fields before storing in sessionStorage
 * or sending over the network.
 *
 * _source.rawText can be 100–400 KB. sessionStorage has a 5 MB browser
 * limit; a big DOCX can trigger QuotaExceededError, which is silently
 * caught and leaves the wizard with empty fields. rawText is only needed
 * during rewriting (already done at this point), so discarding it is safe.
 */
function stripLargeFields(resume) {
  if (!resume || typeof resume !== 'object') return resume;
  const r = { ...resume };
  if (r._source) r._source = { ...r._source, rawText: '' };
  delete r._confidence;
  return r;
}

const CHOICES = [
  {
    id: 'upload',
    icon: FileUp,
    title: 'Yes, upload from my resume',
    body: 'We read your existing resume, improve it with AI for better ATS scoring, and fill in the builder for you.',
    badge: 'Speed up your resume',
  },
  {
    id: 'scratch',
    icon: PencilLine,
    title: 'No, start from scratch',
    body: 'We guide you step by step — contact details, work history, education, skills and summary — with ready-made examples to pick from.',
  },
];

const STAGE = {
  CHOOSE: 'choose',
  UPLOAD: 'upload',
  PARSING: 'parsing',
  TARGET: 'target',        // resume read; ask for the target job description
  OPTIMIZING: 'optimizing',
};

export default function ResumeBuilderStart() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initial =
    params.get('start') === 'upload' ? 'upload'
    : params.get('start') === 'scratch' ? 'scratch'
    : 'upload';

  const [choice, setChoice] = useState(initial);
  const [stage, setStage] = useState('choose');
  const [file, setFile] = useState(null);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [savedProfile, setSavedProfile] = useState(null);
  const [optimizeNote, setOptimizeNote] = useState('');
  const [parsed, setParsed] = useState(null);          // the parsed ORIGINAL resume; never overwritten
  const [jd, setJd] = useState('');
  const [optFailure, setOptFailure] = useState(null);  // { message }
  const [elapsed, setElapsed] = useState(0);
  const optimizingRef = useRef(false);                 // blocks duplicate requests
  const abortRef = useRef(null);
  const [withJdMode, setWithJdMode] = useState(false);

  useEffect(() => {
    let active = true;
    careerService.getProfile()
      .then((res) => {
        if (active && res?.exists && res.master?.personal?.name) setSavedProfile(res.master);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const quickstart = params.get('quickstart') === '1';
  const quickstarted = useRef(false);
  useEffect(() => {
    if (quickstart && savedProfile && !quickstarted.current) {
      quickstarted.current = true;
      handOff(savedProfile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickstart, savedProfile]);

  useEffect(() => {
    if (params.get('upload') !== '1') return;
    const pending = takePendingUpload();
    if (pending) {
      setFile(pending);
      setChoice('upload');
      setStage('upload');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const template = params.get('template') || 'dl-elite';
  const { user } = useAuth();

  const openEditor = (start, state = {}) =>
    navigate(
      `/resume-builder/wizard?start=${start}${start === 'scratch' ? '&fresh=1' : ''}&template=${encodeURIComponent(template)}`,
      { state }
    );

  const [draft, setDraft] = useState(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey(user?.id || user?._id));
      const d = raw ? JSON.parse(raw) : null;
      if (d?.personal?.firstName) setDraft(d);
    } catch { /* ignore */ }
  }, [user]);

  /**
   * Hand the parsed resume to the wizard.
   *
   * Strategy (defence-in-depth):
   *   1. Primary:  React Router location.state  — zero-copy, no storage limits.
   *   2. Fallback: sessionStorage               — survives Suspense boundary delays.
   *
   * Both paths carry the stripped resume (rawText cleared) so neither
   * hits size limits.
   */
  function handOff(resume, aiResult = null, report = null) {
    const lean = stripLargeFields(resume);
    const routerState = { importedResume: lean, aiProposals: aiResult || null, aiReport: report || null };

    // Fallback: also write to sessionStorage in case location.state is lost
    // (e.g. ProtectedRoute redirect chain clears it).
    try {
      sessionStorage.setItem(BUILDER_IMPORT_KEY, JSON.stringify(lean));
      if (aiResult) sessionStorage.setItem(BUILDER_AI_OPTIMIZE_KEY, JSON.stringify(aiResult));
      else sessionStorage.removeItem(BUILDER_AI_OPTIMIZE_KEY);
      if (report) sessionStorage.setItem(BUILDER_AI_REPORT_KEY, JSON.stringify(report));
      else sessionStorage.removeItem(BUILDER_AI_REPORT_KEY);
    } catch {
      // If sessionStorage is full, clear it and retry once
      try {
        sessionStorage.clear();
        sessionStorage.setItem(BUILDER_IMPORT_KEY, JSON.stringify(lean));
      } catch { /* ignored — router state is the primary path */ }
    }

    openEditor('upload', routerState);
  }

  function next() {
    setError('');
    if (choice === 'scratch') return openEditor('scratch');
    return setStage('upload');
  }

  /** Step 1 — read the file. Nothing is sent to the AI yet. */
  async function readFile() {
    setError('');
    setOptimizeNote('');
    setOptFailure(null);
    if (!file) return setError('Choose your resume file first.');
    if (!consent) return setError('Please tick the consent box to continue.');
    if (stage === STAGE.PARSING) return;

    setStage(STAGE.PARSING);
    try {
      const res = await careerService.parseFile(file, null, { consent, purpose: 'builder' });
      const resume = res?.resume || res;
      if (!resume?.personal && !resume?.experience) {
        throw new Error('We could not read that file. Try a text-based PDF or DOCX.');
      }
      setParsed(resume);
      setStage(STAGE.TARGET);
    } catch (err) {
      setError(err?.message || 'We could not read that file. Try a text-based PDF or DOCX, or start from scratch.');
      setStage(STAGE.UPLOAD);
    }
  }

  /** Step 2 — optimize with (or without) a job description. */
  async function runOptimize(useJd) {
    if (!parsed || optimizingRef.current) return;          // ignore double clicks
    optimizingRef.current = true;
    setOptFailure(null);
    setWithJdMode(useJd);
    setElapsed(0);
    setStage(STAGE.OPTIMIZING);

    const controller = new AbortController();
    abortRef.current = controller;
    const started = Date.now();
    const timer = setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 1000);

    try {
      const result = await careerService.optimize({
        resume: forOptimize(parsed),
        jobDescription: useJd ? jd.trim() : undefined,
        scope: 'all',
        autoApply: true,
        signal: controller.signal,
      });

      if (!result?.optimizedResume) throw new Error('empty');

      // The server answered but the AI itself was not available: nothing
      // was rewritten. Tell the candidate instead of pretending it worked.
      if (result.engine === 'rules') {
        setOptFailure({
          message: result.failureReason === 'rate_limited'
            ? 'The AI is busy right now, so your resume was not rewritten.'
            : 'The AI could not be reached, so your resume was not rewritten.',
        });
        setStage(STAGE.TARGET);
        return;
      }

      const pending = result.pendingProposals || [];
      const report = {
        mode: result.mode,
        scores: result.scores,
        keywords: result.keywords,
        changelog: result.changelog,
        warnings: result.warnings,
        remaining: result.remaining,
        disclaimer: result.disclaimer,
        engineNote: result.engineNote,
        rejections: result.rejections || [],
        considered: result.considered ?? null,
      };
      handOff(
        result.optimizedResume,
        pending.length ? { proposals: pending, engineNote: result.engineNote } : null,
        report
      );
    } catch (err) {
      const cancelled = err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError';
      if (!cancelled) setOptFailure({ message: describeOptimizeError(err) });
      setStage(STAGE.TARGET);
    } finally {
      clearInterval(timer);
      abortRef.current = null;
      optimizingRef.current = false;
    }
  }

  function cancelOptimize() {
    abortRef.current?.abort();
  }

  useEffect(() => () => abortRef.current?.abort(), []);

  const isBusy = stage === STAGE.PARSING || stage === STAGE.OPTIMIZING;
  const showUploadCard = stage === STAGE.UPLOAD || stage === STAGE.PARSING;
  const jdLength = jd.trim().length;

  return (
    <>
      <PanelHeader
        title="Resume Builder"
        description="Create a professional, ATS-friendly resume. Free templates are included; paid templates unlock after a one-time payment."
      />

      {stage === 'choose' && draft && (
        <div className="mb-5 flex flex-col gap-3 rounded-lg border border-azure-200 bg-azure-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-small text-ink">
            <strong>Continue where you left off</strong> — your resume for{' '}
            {[draft.personal.firstName, draft.personal.surname].filter(Boolean).join(' ')} is saved in this browser.
          </p>
          <Button size="sm" onClick={() => navigate('/resume-builder/wizard')}>
            Continue my resume
          </Button>
        </div>
      )}

      {stage === 'choose' && (
        <div className="rounded-lg border border-line bg-white p-6 sm:p-8">
          <div className="text-center">
            <h2 className="text-h2 font-extrabold text-ink">Are you uploading an existing resume?</h2>
            <p className="mt-2 text-body text-slate-600">Just review, edit and update it with new information.</p>
            <p className="mt-3 text-caption text-slate-500">
              Takes about 5 minutes. Pick one option below, then press Next — you can't lose your progress, it saves automatically.
            </p>
          </div>

          <div role="radiogroup" aria-label="How do you want to start?" className="mt-8 grid gap-5 md:grid-cols-2">
            {CHOICES.map(({ id, icon: Icon, title, body, badge }) => {
              const selected = choice === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setChoice(id)}
                  onDoubleClick={() => {
                    setChoice(id);
                    if (id === 'scratch') openEditor('scratch');
                    else setStage('upload');
                  }}
                  className={cn(
                    'relative flex flex-col items-center rounded-xl border-2 bg-white px-6 pb-8 pt-10 text-center transition-all',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure',
                    selected ? 'border-azure shadow-crystal' : 'border-line hover:border-azure-300'
                  )}
                >
                  {badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-rose-100 px-3 py-1 text-caption font-bold uppercase tracking-wide text-rose-800">
                      {badge}
                    </span>
                  )}
                  {selected && (
                    <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-azure text-white" aria-hidden>
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <span className={cn('grid h-14 w-14 place-items-center rounded-2xl', selected ? 'bg-azure-50 text-azure' : 'bg-paper text-slate-600')}>
                    <Icon className="h-7 w-7" aria-hidden />
                  </span>
                  <span className="mt-4 text-h3 font-bold text-ink">{title}</span>
                  <span className="mt-2 max-w-sm text-small text-slate-600">{body}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <Button size="lg" onClick={next}>Next</Button>
          </div>
        </div>
      )}

      {showUploadCard && (
        <div className="rounded-lg border border-line bg-white p-6 sm:p-8">
          <h2 className="text-h3 font-bold text-ink">Upload your resume</h2>
          <p className="mt-1 text-small text-slate-600">
            PDF or DOCX, text-based (not a scanned image), up to 5 MB. We fill in the builder — you review and edit everything.
          </p>

          <div className="mt-4 flex items-start gap-3 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3">
            <Wand2 className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
            <div>
              <p className="text-[12px] font-bold text-purple-800">AI Resume Enhancement included</p>
              <p className="text-[11.5px] text-purple-700">
                After reading your file you can paste the job you are applying for. Our AI then rewrites your summary and
                bullet points with ATS-friendly wording and the job's keywords — only where your experience supports them,
                and without changing any facts, dates, numbers or employers.
              </p>
            </div>
          </div>

          <label
            className={cn(
              'mt-5 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-10 text-center transition-colors',
              isBusy ? 'border-line bg-slate-50 cursor-not-allowed' : 'border-line bg-paper hover:border-azure-300'
            )}
          >
            <Upload className={cn('h-7 w-7', isBusy ? 'text-slate-300' : 'text-azure')} aria-hidden />
            <span className="mt-2 text-small font-semibold text-ink">
              {file ? file.name : 'Choose your resume file'}
            </span>
            <span className="text-caption text-slate-500">PDF or DOCX · max 5 MB</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="sr-only"
              disabled={isBusy}
              onChange={(e) => { setFile(e.target.files?.[0] || null); setError(''); setParsed(null); }}
            />
          </label>

          <div className="mt-4">
            <ConsentCheckbox checked={consent} onChange={(e) => setConsent(e.target.checked)} disabled={isBusy} />
          </div>

          {stage === STAGE.PARSING && (
            <div role="status" className="mt-5 flex items-center gap-3 rounded-lg border border-azure-200 bg-azure-50 px-4 py-3 text-[12px] font-semibold text-azure-800">
              <Loader2 className="h-4 w-4 animate-spin text-azure" /> Reading your resume…
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button onClick={readFile} loading={stage === STAGE.PARSING} disabled={isBusy}>
              {stage === STAGE.PARSING ? 'Reading resume…' : 'Read my resume'}
            </Button>
            <Button variant="quiet" onClick={() => setStage('choose')} disabled={isBusy}>
              Back
            </Button>
          </div>

          {savedProfile && !isBusy && (
            <div className="mt-6 flex flex-col gap-3 rounded-lg bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <UserRound className="h-5 w-5 text-azure" aria-hidden />
                <p className="text-small text-slate-700">
                  Or use the profile you already saved in <strong>AI Career Studio</strong>
                  {savedProfile.personal?.name ? ` (${savedProfile.personal.name})` : ''}.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => handOff(savedProfile)}>
                Use my saved profile
              </Button>
            </div>
          )}

          {error && (
            <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="text-small font-medium text-danger">{error}</p>
            </div>
          )}
        </div>
      )}

      {(stage === STAGE.TARGET || stage === STAGE.OPTIMIZING) && parsed && (
        <div className="rounded-lg border border-line bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] font-semibold text-emerald-800" role="status">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>
              Resume read: {parsed.experience?.length || 0} job{(parsed.experience?.length || 0) === 1 ? '' : 's'}
              {parsed.education?.length ? `, ${parsed.education.length} education entr${parsed.education.length === 1 ? 'y' : 'ies'}` : ''}
              {parsed.certifications?.length ? `, ${parsed.certifications.length} certification${parsed.certifications.length === 1 ? '' : 's'}` : ''} found.
              You can check everything in the builder.
            </span>
          </div>

          {stage === STAGE.TARGET && (
            <>
              <h2 className="mt-6 text-h3 font-bold text-ink">Which job are you applying for?</h2>
              <p className="mt-1 text-small text-slate-600">
                Paste the full job description and we will use its keywords — but only where your own experience backs them up.
                Skills you don't have are listed as gaps, never added.
              </p>

              <label htmlFor="jd-input" className="mt-4 block text-[12px] font-bold text-slate-700">Job description</label>
              <textarea
                id="jd-input"
                value={jd}
                onChange={(e) => setJd(e.target.value.slice(0, MAX_JD_CHARS))}
                rows={9}
                placeholder="Paste the complete job description here…"
                className="mt-1 w-full rounded-lg border border-line bg-paper p-3 text-small text-ink focus:border-azure focus:outline-none focus:ring-2 focus:ring-azure-200"
              />
              <p className="mt-1 text-caption text-slate-500">
                {jdLength < MIN_JD_CHARS && jdLength > 0 ? `Add a little more detail (${MIN_JD_CHARS - jdLength} more characters) or ` : ''}
                {jdLength.toLocaleString()} / {MAX_JD_CHARS.toLocaleString()} characters
              </p>

              {optFailure && (
                <div role="alert" className="mt-4 flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <p className="text-small font-medium text-amber-900">{optFailure.message} Your uploaded resume is safe.</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => runOptimize(withJdMode)}>
                    <RefreshCw className="h-3.5 w-3.5" /> Try again
                  </Button>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button onClick={() => runOptimize(true)} disabled={jdLength < MIN_JD_CHARS}>
                  Optimize for this job
                </Button>
                <Button variant="outline" onClick={() => runOptimize(false)}>
                  Continue without a job description
                </Button>
                <Button variant="quiet" onClick={() => handOff(parsed)}>
                  Skip AI — open my resume as it is
                </Button>
                <Button variant="quiet" onClick={() => { setStage(STAGE.UPLOAD); setParsed(null); }}>
                  Back
                </Button>
              </div>
              <p className="mt-3 text-caption text-slate-500">
                Without a job description we improve general ATS-readability only; the result is not matched to a specific job.
              </p>
            </>
          )}

          {stage === STAGE.OPTIMIZING && (
            <div className="mt-6 space-y-2" aria-live="polite">
              <div className="flex items-start gap-3 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-[12px] font-semibold text-purple-800">
                <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-purple-600" />
                <div>
                  <p>
                    {withJdMode
                      ? 'Analyzing the job, matching keywords, rewriting and fact-checking your resume…'
                      : 'Rewriting and fact-checking your resume for ATS-readability…'}
                  </p>
                  <p className="mt-1 font-normal text-purple-700">
                    {elapsed}s elapsed — this usually takes 15–60 seconds. Please keep this page open.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-semibold text-slate-400">
                <Sparkles className="h-4 w-4 text-slate-300" />
                Preparing your optimized resume in the builder
              </div>
              <div className="pt-2">
                <Button variant="quiet" size="sm" onClick={cancelOptimize}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
