import { useEffect, useRef, useState } from 'react';
import { Sparkles, RotateCcw, ShieldCheck } from 'lucide-react';
import { Button, Textarea } from '../ui/index.js';
import { careerService } from '../../services/careerService.js';
import { describeOptimizeError } from '../../utils/optimizeErrors.js';

/**
 * "ATS review" — the step between "Anything else" and "Choose template" when a
 * resume is built from scratch.
 *
 * It analyses everything the candidate entered and rewrites it with ATS-friendly
 * wording and keywords:
 *   • With a pasted job description, keywords come from that job.
 *   • Without one, AI writes a TYPICAL posting for the candidate's own
 *     profession (server-side) and its keywords are used.
 * Either way, only keywords the candidate's own data already supports are used.
 * Keywords they lack are reported as gaps and never added.
 *
 * Runs automatically the first time the step opens (once per page load), and
 * can be re-run. The result is shown by the wizard's optimisation report, with
 * a per-change "revert" and an "Undo all AI changes" button here.
 */
export function AtsReviewStep({ resume, autoRun, onRunStart, onResult, onUndo, canUndo, hasResult }) {
  const [jd, setJd] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | running | error
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const abortRef = useRef(null);
  const runningRef = useRef(false);

  const jdUsable = jd.trim().length >= 40;

  async function run() {
    if (runningRef.current) return;
    runningRef.current = true;
    onRunStart?.();
    setError('');
    setPhase('running');
    setElapsed(0);

    const controller = new AbortController();
    abortRef.current = controller;
    const started = Date.now();
    const timer = setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 1000);
    try {
      const result = await careerService.optimize({
        resume,
        jobDescription: jdUsable ? jd.trim() : undefined,
        typicalRole: jdUsable ? undefined : true,
        scope: 'all',
        autoApply: true,
        signal: controller.signal,
      });
      if (!result?.optimizedResume) throw new Error('empty');

      // The server answered but no AI was reachable: nothing was rewritten.
      if (result.engine === 'rules') {
        setError(
          result.failureReason === 'rate_limited'
            ? 'The AI is busy right now, so your resume was not rewritten. Wait a minute and press “Analyze & optimize” again.'
            : 'The AI could not be reached, so your resume was not rewritten. You can continue, or try again in a moment.'
        );
        setPhase('error');
        return;
      }

      onResult({
        optimizedResume: result.optimizedResume,
        pending: result.pendingProposals || [],
        report: {
          mode: result.mode,
          keywordSource: result.keywordSource,
          targetRole: result.targetRole,
          scores: result.scores,
          keywords: result.keywords,
          changelog: result.changelog,
          warnings: result.warnings,
          remaining: result.remaining,
          disclaimer: result.disclaimer,
          engineNote: result.engineNote,
          rejections: result.rejections || [],
          considered: result.considered ?? null,
        },
      });
      setPhase('idle');
    } catch (err) {
      if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') {
        setPhase('idle');
      } else {
        setError(describeOptimizeError(err));
        setPhase('error');
      }
    } finally {
      clearInterval(timer);
      abortRef.current = null;
      runningRef.current = false;
    }
  }

  // First visit: start straight away (the parent makes sure it happens once).
  useEffect(() => {
    if (autoRun) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Leaving the step cancels a request that is still running.
  useEffect(() => () => abortRef.current?.abort(), []);

  const running = phase === 'running';
  const stage =
    elapsed < 12
      ? 'Reading everything you entered and checking it against ATS rules…'
      : elapsed < 40
        ? 'Writing ATS-friendly wording and matching keywords your experience supports…'
        : 'Almost there — the AI is taking a little longer than usual…';

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-azure-200 bg-gradient-to-br from-azure-50 to-white p-5">
        <p className="flex items-center gap-2 text-small font-bold text-ink">
          <ShieldCheck className="h-4 w-4 text-azure" aria-hidden /> How this works
        </p>
        <ul className="mt-2 space-y-1 text-small text-slate-700">
          <li>• We analyse every part of your resume: summary, jobs, skills and the rest.</li>
          <li>• AI rewrites weak wording and uses the keywords applicant tracking systems look for.</li>
          <li>• <strong>Only keywords your own experience backs up are used.</strong> Anything you lack is listed as a gap, never added.</li>
          <li>• You can revert any single change, or undo all of them.</li>
        </ul>
      </div>

      <details className="rounded-xl border border-line bg-white p-4">
        <summary className="cursor-pointer text-small font-bold text-ink">Applying for a specific job? Paste its description (optional)</summary>
        <p className="mt-2 text-caption text-slate-600">
          With a real job description, keywords come from that job. Without one, we use a typical posting for your profession.
        </p>
        <Textarea className="mt-3" rows={5} label="Job description" value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the job posting here" disabled={running} />
        {jd.trim() && !jdUsable && <p className="mt-1 text-caption text-amber-700">Paste the full description (at least a few sentences) for it to be used.</p>}
      </details>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={run} loading={running} disabled={running}>
          <Sparkles className="h-4 w-4" aria-hidden /> {hasResult ? 'Run again' : 'Analyze & optimize'}
        </Button>
        {running && (
          <Button variant="quiet" onClick={() => abortRef.current?.abort()}>
            Cancel
          </Button>
        )}
        {canUndo && !running && (
          <Button variant="quiet" onClick={onUndo}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Undo all AI changes
          </Button>
        )}
      </div>

      {running && (
        <p className="text-small font-semibold text-azure-700" aria-live="polite">
          {stage} <span className="font-normal text-slate-500">({elapsed}s — usually under a minute)</span>
        </p>
      )}
      {phase === 'error' && (
        <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-small text-amber-900">
          {error}
        </p>
      )}
    </div>
  );
}
