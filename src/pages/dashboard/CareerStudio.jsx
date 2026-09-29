import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Circle, AlertTriangle, Loader, PlayCircle, Sparkles } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { Button, Seo, LoadingBlock, ErrorState } from '../../components/ui/index.js';
import { studioService } from '../../services/studioService.js';
import { ImportStep, ReviewStep, ProfilePdfStep, ResumeStep, AtsStep, CoverLetterStep, InterviewStep, DocumentsStep } from '../../components/studio/StudioSteps.jsx';
import { cn } from '../../utils/cn.js';

/**
 * AI Career Studio — the single entry point for Phase 1 (profile →
 * documents) with a link into Phase 2 (mock interviews).
 *
 * Step states come from GET /api/studio, which derives them from saved
 * data; nothing here is a hard-coded or client-side progress figure.
 * The open step lives in the URL (?step=), so refresh and back/forward work.
 */

const STATE = {
  completed: { icon: CheckCircle2, label: 'Completed', cls: 'text-success' },
  'in-progress': { icon: Loader, label: 'In progress', cls: 'text-azure' },
  attention: { icon: AlertTriangle, label: 'Needs attention', cls: 'text-amber-600' },
  'not-started': { icon: Circle, label: 'Not started', cls: 'text-slate-300' },
};

const firstOpenStep = (steps) => (steps.find((s) => s.state !== 'completed') || steps[steps.length - 1]).id;

export default function CareerStudio() {
  const [params, setParams] = useSearchParams();
  const [studio, setStudio] = useState(null);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    try {
      setStudio(await studioService.get());
      setError(null);
    } catch (err) {
      setError(err);
    }
  }, []);
  useEffect(() => { load(); }, [load, refreshKey]);

  const current = params.get('step') || (studio ? firstOpenStep(studio.steps) : 'import');
  const goTo = (id) => {
    setParams((p) => { const n = new URLSearchParams(p); n.set('step', id); return n; });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  /** Re-read progress after any action; optionally move to another step. */
  const done = (next) => {
    setRefreshKey((k) => k + 1);
    if (typeof next === 'string') goTo(next);
  };

  if (error && !studio) return <><PanelHeader title="AI Career Studio" /><ErrorState error={error} onRetry={load} /></>;
  if (!studio) return <><PanelHeader title="AI Career Studio" /><LoadingBlock label="Loading your studio" /></>;

  const steps = studio.steps;
  const common = { studio, onDone: done, goTo, refreshKey };
  const setParam = params.get('set');

  return (
    <>
      <Seo title="AI Career Studio" noIndex />
      <PanelHeader
        title="AI Career Studio"
        description="Build your verified profile once, then create your resume, cover letter and interview preparation from it."
        actions={<Button to="/mock-interview" variant="secondary" size="sm"><PlayCircle className="h-4 w-4" aria-hidden /> Mock interview (Phase 2)</Button>}
      />

      {!studio.ai.configured && (
        <div className="mb-6 flex gap-2.5 rounded-lg bg-amber-50 p-4 text-small text-amber-800" role="status">
          <Sparkles className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
          <p>AI generation is not configured on this server, so cover letters, interview answers and feedback are built with rule-based templates from your own data. Scores are unaffected — they never use AI.</p>
        </div>
      )}
      {studio.ai.modelProblem && (
        <div className="mb-6 rounded-lg bg-amber-50 p-4 text-small text-amber-800" role="status">AI model problem: {studio.ai.modelProblem}</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <nav aria-label="Studio steps" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-line bg-white p-4">
            <p className="text-caption font-semibold uppercase tracking-wide text-slate-500">Phase 1 · {studio.completed} of {steps.length} done</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-azure transition-all" style={{ width: `${(studio.completed / steps.length) * 100}%` }} />
            </div>
            <ol className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible">
              {steps.map((s, i) => {
                const st = STATE[s.state] || STATE['not-started'];
                const Icon = st.icon;
                return (
                  <li key={s.id} className="flex-none lg:flex-auto">
                    <button
                      type="button"
                      onClick={() => goTo(s.id)}
                      aria-current={current === s.id ? 'step' : undefined}
                      className={cn('flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors', current === s.id ? 'bg-azure-50' : 'hover:bg-slate-50')}
                    >
                      <Icon className={cn('mt-0.5 h-4 w-4 flex-none', st.cls)} aria-hidden />
                      <span>
                        <span className={cn('block whitespace-nowrap text-small lg:whitespace-normal', current === s.id ? 'font-bold text-ink' : 'font-medium text-slate-700')}>{i + 1}. {s.label}</span>
                        <span className="hidden text-caption text-slate-500 lg:block">{st.label}{s.detail ? ` · ${s.detail}` : ''}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
          {studio.phase1Complete && (
            <div className="mt-4 rounded-xl bg-ink-800 p-4 text-white">
              <p className="text-small font-bold">Phase 1 complete</p>
              <p className="mt-1 text-caption text-white/75">Practise with a mock interview built on your top 10 questions.</p>
              <Button to="/mock-interview" variant="onInk" size="sm" className="mt-3">Start mock interview</Button>
            </div>
          )}
        </nav>

        <div className="min-w-0">
          {current === 'import' && <ImportStep {...common} />}
          {current === 'review' && <ReviewStep {...common} />}
          {current === 'profile-pdf' && <ProfilePdfStep {...common} />}
          {current === 'resume' && <ResumeStep {...common} />}
          {current === 'ats' && <AtsStep {...common} />}
          {current === 'cover-letter' && <CoverLetterStep {...common} />}
          {current === 'interview' && <InterviewStep {...common} existingSetId={setParam} />}
          {current === 'documents' && <DocumentsStep {...common} />}

          <div className="mt-5 flex justify-between">
            {steps.findIndex((s) => s.id === current) > 0 ? (
              <Button variant="quiet" size="sm" onClick={() => goTo(steps[steps.findIndex((s) => s.id === current) - 1].id)}>← Previous step</Button>
            ) : <span />}
            {steps.findIndex((s) => s.id === current) < steps.length - 1 && (
              <Button variant="quiet" size="sm" onClick={() => goTo(steps[steps.findIndex((s) => s.id === current) + 1].id)}>Next step →</Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
