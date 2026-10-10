import { useState } from 'react';
import { Wand2, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, X, Undo2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/**
 * Review panel for an AI-optimised resume draft.
 *
 * Everything shown here comes from the server's real results: scores from the
 * scoring engine, keywords from the keyword engine, changes from the
 * validated rewrite. Nothing is estimated or invented in the browser.
 */

const FIELD_LABEL = (id = '') => {
  if (id === 'summary') return 'Summary';
  if (id === 'headline') return 'Headline';
  if (id === 'skills-order') return 'Skills';
  const m = id.match(/^experience\.(\d+)\./);
  return m ? `Experience · role ${Number(m[1]) + 1}` : 'Change';
};

function Score({ label, before, after, hint }) {
  const delta = typeof before === 'number' && typeof after === 'number' ? after - before : null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3" title={hint}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-[18px] font-extrabold text-ink">
        {typeof before === 'number' ? before : '—'}
        <span className="mx-1.5 text-[12px] font-semibold text-slate-400">→</span>
        {typeof after === 'number' ? after : '—'}
        {delta !== null && delta !== 0 && (
          <span className={cn('ml-2 text-[11px] font-bold', delta > 0 ? 'text-emerald-600' : 'text-amber-600')}>
            {delta > 0 ? `+${delta}` : delta}
          </span>
        )}
      </p>
    </div>
  );
}

function Chips({ items, tone, onAddSkill }) {
  const [state, setState] = useState({}); // term -> 'confirm' | 'added'
  if (!items?.length) return null;
  const tones = {
    good: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    warn: 'border-amber-200 bg-amber-50 text-amber-800',
    miss: 'border-rose-200 bg-rose-50 text-rose-800',
  };
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      {items.map((k) => {
        const st = state[k.term];
        return (
          <span key={k.term} className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold', tones[tone])}>
            {k.term}
            {onAddSkill && st === 'added' && <span className="text-emerald-700">✓ added by you</span>}
            {onAddSkill && !st && (
              <button type="button" onClick={() => setState((x) => ({ ...x, [k.term]: 'confirm' }))} className="rounded bg-white/70 px-1.5 text-[10px] font-bold text-slate-600 hover:bg-white">
                I have this
              </button>
            )}
            {onAddSkill && st === 'confirm' && (
              <>
                <button type="button" onClick={() => { if (onAddSkill(k.term)) setState((x) => ({ ...x, [k.term]: 'added' })); }} className="rounded bg-slate-800 px-1.5 text-[10px] font-bold text-white">
                  Yes, I have this skill — add
                </button>
                <button type="button" onClick={() => setState((x) => ({ ...x, [k.term]: undefined }))} className="text-[10px] font-bold text-slate-500">Cancel</button>
              </>
            )}
          </span>
        );
      })}
    </div>
  );
}

const rejectionLabel = (id = '') => {
  if (id === 'summary') return 'Summary';
  const m = id.match(/^experience\.(\d+)\.(responsibilities|achievements)\.(\d+)$/);
  return m ? `Role ${Number(m[1]) + 1} · bullet ${Number(m[3]) + 1}` : 'Suggestion';
};

export function OptimizationReport({ report, onRevert, onAddSkill, onDismiss }) {
  const [open, setOpen] = useState(true);
  const [reverted, setReverted] = useState({});
  if (!report) return null;

  const { scores, keywords, changelog = [], warnings = [], remaining, mode, disclaimer, engineNote, rejections = [], considered, keywordSource, targetRole } = report;
  const before = scores?.before;
  const after = scores?.after;
  const jobMode = mode === 'job-matched';
  const visibleChanges = changelog.filter((c) => c.action !== 'reject');

  return (
    <div className="mb-6 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-xs" aria-label="AI optimization results">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-purple-600">
            <Wand2 className="h-4 w-4 text-white" />
          </span>
          <div>
            <p className="text-small font-bold text-purple-900">
              {visibleChanges.length > 0
                ? `Optimized draft — ${visibleChanges.length} change${visibleChanges.length === 1 ? '' : 's'} applied`
                : rejections.length > 0
                  ? 'No safe rewording was found — your original wording was kept'
                  : 'Your resume was already well written — no rewording was needed'}
            </p>
            <p className="text-[11.5px] text-purple-700">
              {keywordSource === 'typical-role'
                ? `Matched to a typical ${targetRole || 'job'} posting written by AI from your profession — not a real job. Keywords your experience already supports were used; the rest are listed as gaps. Paste a real job description for exact matching.`
                : jobMode
                  ? 'Matched to the job description you pasted.'
                  : 'General ATS optimization — not matched to a specific job. Paste a job description to see how well you match it and which of its keywords you can add.'}{' '}
              {visibleChanges.length > 0
                ? 'Review and edit anything, then download.'
                : rejections.length > 0
                  ? `The AI looked at every bullet. ${rejections.length} suggestion${rejections.length === 1 ? ' was' : 's were'} blocked by the fact check (they would have dropped a keyword or changed nothing real) and the rest were already clear, so nothing was changed.`
                  : 'Your original wording was kept.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? 'Collapse results' : 'Expand results'} className="rounded-lg p-1.5 text-purple-400 hover:bg-purple-100 hover:text-purple-700">
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button type="button" onClick={onDismiss} aria-label="Hide results" className="rounded-lg p-1.5 text-purple-400 hover:bg-purple-100 hover:text-purple-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-4 border-t border-purple-200 px-5 pb-5 pt-4">
          {(engineNote || warnings.length > 0) && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11.5px] text-amber-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div>
                {engineNote && <p>{engineNote}</p>}
                {warnings.map((w) => <p key={w}>{w}</p>)}
              </div>
            </div>
          )}

          {/* What the AI did with each part */}
          {typeof considered === 'number' && (
            <p className="text-[11.5px] text-slate-700">
              {visibleChanges.filter((c) => /^experience\./.test(c.id)).length} of {considered} bullet points were reworded
              {changelog.some((c) => c.id === 'summary') ? ' and your summary was rewritten' : '; your summary was left as you wrote it'}.
              Anything that was already clear, or that could not be improved without adding facts, was kept unchanged.
            </p>
          )}
          {rejections.length > 0 && (
            <details className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11.5px] text-slate-700">
              <summary className="cursor-pointer font-bold text-ink">{rejections.length} suggestion{rejections.length === 1 ? ' was' : 's were'} not used (fact check)</summary>
              <ul className="mt-2 space-y-1">
                {rejections.map((r, i) => (
                  <li key={`${r.id}-${i}`}><strong>{rejectionLabel(r.id)}:</strong> {(r.problems || []).join('; ')}.</li>
                ))}
              </ul>
              <p className="mt-2 text-[10.5px] text-slate-500">Your original wording was kept for these. This protects you from claims you could not back up in an interview.</p>
            </details>
          )}

          {/* Scores */}
          <div>
            <p className="text-[12px] font-bold text-ink">Readiness (original → optimized)</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <Score label="Resume health" before={before?.resumeHealth} after={after?.resumeHealth} hint="Structure, content strength and ATS-readability checks." />
              {jobMode && <Score label="Job match" before={before?.jobMatch} after={after?.jobMatch} hint="How well your evidenced skills match this job description." />}
              {jobMode && <Score label="Keyword coverage %" before={before?.keywordCoverage} after={after?.keywordCoverage} hint="Share of the job's keywords your resume evidences." />}
            </div>
            <p className="mt-2 text-[10.5px] leading-snug text-slate-500">
              {disclaimer || 'These are estimates. Employers configure their applicant tracking systems differently.'}{' '}
              Scores only rise when the checks find a real improvement.
            </p>
          </div>

          {/* Keywords */}
          {jobMode && keywords && (
            <div className="space-y-3">
              {keywords.matched?.length > 0 && (
                <div>
                  <p className="text-[12px] font-bold text-ink">Keywords your resume already supports</p>
                  <Chips items={keywords.matched} tone="good" />
                </div>
              )}
              {keywords.needsConfirmation?.length > 0 && (
                <div>
                  <p className="text-[12px] font-bold text-ink">Possible matches — add them only if they are true for you</p>
                  <Chips items={keywords.needsConfirmation} tone="warn" onAddSkill={onAddSkill} />
                </div>
              )}
              {(keywords.missingRequired?.length > 0 || keywords.missingPreferred?.length > 0) && (
                <div>
                  <p className="text-[12px] font-bold text-ink">Not found in your resume (not added)</p>
                  {keywords.missingRequired?.length > 0 && <p className="mt-1 text-[10.5px] font-semibold uppercase text-slate-400">Required</p>}
                  <Chips items={keywords.missingRequired} tone="miss" onAddSkill={onAddSkill} />
                  {keywords.missingPreferred?.length > 0 && <p className="mt-1.5 text-[10.5px] font-semibold uppercase text-slate-400">Preferred</p>}
                  <Chips items={keywords.missingPreferred} tone="miss" onAddSkill={onAddSkill} />
                  <p className="mt-1.5 text-[10.5px] text-slate-500">If you genuinely have one of these skills, click "I have this" to add it to your Skills. We never add a skill you haven't confirmed.</p>
                </div>
              )}
            </div>
          )}

          {/* Changes */}
          {visibleChanges.length > 0 && (
            <div>
              <p className="text-[12px] font-bold text-ink">What changed</p>
              <div className="mt-2 max-h-96 space-y-2 overflow-y-auto pr-1">
                {visibleChanges.map((c, i) => {
                  const key = `${c.id}-${i}`;
                  const isReverted = Boolean(reverted[key]);
                  const canRevert = Boolean(c.original && c.final && onRevert);
                  return (
                    <div key={key} className={cn('rounded-lg border bg-white p-3 text-[12px]', isReverted ? 'border-slate-200 opacity-60' : 'border-emerald-200')}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{FIELD_LABEL(c.id)}</span>
                        {canRevert && !isReverted && (
                          <button
                            type="button"
                            onClick={() => { if (onRevert(c)) setReverted((r) => ({ ...r, [key]: true })); }}
                            className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100"
                          >
                            <Undo2 className="h-3 w-3" /> Restore original
                          </button>
                        )}
                        {isReverted && <span className="text-[10px] font-bold text-slate-500">Original restored</span>}
                      </div>
                      {c.original ? <p className="mb-1 text-[11.5px] leading-relaxed text-slate-400 line-through decoration-slate-300">{c.original}</p> : null}
                      {c.final ? <p className="text-[11.5px] font-medium leading-relaxed text-ink">{c.final}</p> : null}
                      {c.reason && <p className="mt-1 text-[10.5px] italic text-indigo-500">💡 {c.reason}</p>}
                      {c.keywordsAligned?.length > 0 && (
                        <p className="mt-1 text-[10.5px] text-emerald-700">Keywords aligned: {c.keywordsAligned.join(', ')}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Remaining */}
          {remaining?.recommendations?.length > 0 && (
            <div>
              <p className="text-[12px] font-bold text-ink">Still worth doing</p>
              <ul className="mt-1.5 space-y-1">
                {remaining.recommendations.map((r) => (
                  <li key={r.id} className="flex items-start gap-1.5 text-[11.5px] text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />
                    <span><strong>{r.title}.</strong> {r.body}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OptimizationReport;