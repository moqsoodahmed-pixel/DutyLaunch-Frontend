import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Info,
  Minus,
  Pencil,
  X,
} from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { Button } from '../ui/Button.jsx';
import { cn } from '../../utils/cn.js';
import { TEMPLATES } from '../../data/resumeTemplates.js';
import { ResumeTemplatePreview } from '../cv/ResumeTemplatePreview.jsx';


/**
 * Presentation layer for the Career Intelligence engine's output.
 *
 * Design rule running through all of it: never show a number without
 * showing how it was reached. Every score has its weighting visible,
 * every keyword verdict shows the sentence it was judged on, and every
 * proposed rewrite shows the original next to it. A score the candidate
 * cannot interrogate is a score they cannot act on.
 */

/* ------------------------------------------------------------------ *
 * Score dial
 * ------------------------------------------------------------------ */

const TONE_CLASS = {
  green: 'text-success',
  amber: 'text-amber-500',
  red: 'text-danger',
};

export function ScoreDial({ score, band, label = 'Resume Health', size = 132 }) {
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;
  const tone = TONE_CLASS[band?.tone] || 'text-azure';

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${label}: ${score} out of 100`}>
          <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth="10" className="stroke-slate-200" fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn('transition-[stroke-dashoffset] duration-700 ease-out', tone)}
            stroke="currentColor"
          />
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <span className="text-h2 font-extrabold leading-none">{score}</span>
          <span className="text-caption text-slate-500">out of 100</span>
        </div>
      </div>
      <div>
        <p className="eyebrow mb-1">{label}</p>
        <p className={cn('text-h3 font-bold', tone)}>{band?.label}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Resume Health report
 * ------------------------------------------------------------------ */

const SEVERITY_TONE = { high: 'danger', medium: 'amber', low: 'neutral' };

export function ResumeHealthReport({ health }) {
  const [openCategory, setOpenCategory] = useState(null);
  if (!health) return null;

  const categories = Object.entries(health.categories || {});

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-6 rounded-lg border border-line bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <ScoreDial score={health.score} band={health.band} />
        {!health.scoredAgainstJd && (
          <p className="max-w-xs text-small text-slate-600">
            Scored without a target job. Add a job description and we can also score keyword alignment and how
            relevant your experience is to that role.
          </p>
        )}
      </div>

      {/* Methodology sits with the score, not buried in a footer. A number
          this prominent has to say what it is and what it isn't. */}
      <p className="flex gap-2.5 rounded border border-line bg-paper p-4 text-small text-slate-600">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        <span>{health.methodology}</span>
      </p>

      <div className="space-y-2.5">
        {categories.map(([key, category]) => {
          const open = openCategory === key;
          return (
            <div key={key} className="overflow-hidden rounded border border-line bg-white">
              <button
                type="button"
                onClick={() => setOpenCategory(open ? null : key)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-paper"
                aria-expanded={open}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-semibold">{category.label}</span>
                    <span className="text-caption text-slate-500">{category.weight}% of your score</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        'h-full rounded-full transition-[width] duration-700',
                        category.score >= 80 ? 'bg-success' : category.score >= 60 ? 'bg-amber-400' : 'bg-danger'
                      )}
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                </div>
                <span className="w-10 text-right font-bold tabular-nums">{category.score}</span>
                <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', open && 'rotate-180')} aria-hidden />
              </button>

              {open && (
                <div className="border-t border-line bg-paper px-5 py-4">
                  {category.findings?.length ? (
                    <ul className="space-y-3">
                      {category.findings.map((finding, i) => (
                        <li key={i} className="flex gap-3">
                          <Badge tone={SEVERITY_TONE[finding.severity]} className="mt-0.5 shrink-0">
                            {finding.severity}
                          </Badge>
                          <div>
                            <p className="text-small font-medium">{finding.label}</p>
                            {finding.detail && <p className="mt-0.5 text-small text-slate-600">{finding.detail}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-small text-slate-600">Nothing to fix here.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <SummaryList title="What is strong" items={health.whatIsStrong} tone="success" />
        <SummaryList title="What needs work" items={health.whatNeedsImprovement} tone="amber" />
        <SummaryList title="What is missing" items={health.whatIsMissing} tone="danger" />
      </div>
    </div>
  );
}

function SummaryList({ title, items, tone }) {
  const dot = { success: 'bg-success', amber: 'bg-amber-400', danger: 'bg-danger' }[tone];
  return (
    <div className="rounded border border-line bg-white p-5">
      <h3 className="mb-3 text-small font-semibold">{title}</h3>
      {items?.length ? (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-small text-slate-600">
              <span className={cn('mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full', dot)} />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-small text-slate-500">—</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * ATS checklist
 * ------------------------------------------------------------------ */

export function AtsChecklist({ checklist = [] }) {
  const [showPassing, setShowPassing] = useState(false);
  const failing = checklist.filter((c) => !c.pass);
  const passing = checklist.filter((c) => c.pass);
  const shown = showPassing ? [...failing, ...passing] : failing;

  return (
    <div className="rounded-lg border border-line bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-h3 font-bold">ATS checklist</h3>
        <span className="text-small text-slate-600">
          {passing.length} of {checklist.length} checks passed
        </span>
      </div>

      {failing.length === 0 && !showPassing && (
        <p className="mb-4 flex items-center gap-2 text-small text-success">
          <Check className="h-4 w-4" aria-hidden /> Every check passed.
        </p>
      )}

      <ul className="divide-y divide-line">
        {shown.map((check) => (
          <li key={check.id} className="flex gap-3 py-3">
            {check.pass ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            ) : (
              <AlertTriangle
                className={cn('mt-0.5 h-4 w-4 shrink-0', check.severity === 'high' ? 'text-danger' : 'text-amber-500')}
                aria-hidden
              />
            )}
            <div className="min-w-0">
              <p className="text-small font-medium">{check.label}</p>
              {!check.pass && check.detail && <p className="mt-0.5 text-small text-slate-600">{check.detail}</p>}
            </div>
          </li>
        ))}
      </ul>

      {passing.length > 0 && (
        <button
          type="button"
          onClick={() => setShowPassing((v) => !v)}
          className="mt-4 text-small font-medium text-azure hover:underline"
        >
          {showPassing ? 'Hide passing checks' : `Show ${passing.length} passing checks`}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Keyword table
 * ------------------------------------------------------------------ */

const MATCH_META = {
  EXACT: { tone: 'success', label: 'Exact', help: 'This exact term appears in your resume.' },
  RELATED: { tone: 'azure', label: 'Related', help: 'You use a recognised equivalent of this term.' },
  POSSIBLE: {
    tone: 'amber',
    label: 'Possible',
    help: 'You describe something adjacent. We will ask you whether it is the same work rather than assume it.',
  },
  MISSING: { tone: 'danger', label: 'Missing', help: 'Nothing in your resume evidences this. We will not add it for you.' },
};

export function KeywordTable({ keywordResult }) {
  const [tierFilter, setTierFilter] = useState(0);
  if (!keywordResult) return null;

  const { keywords = [], summary } = keywordResult;
  const rows = tierFilter ? keywords.filter((k) => k.tier === tierFilter) : keywords;

  return (
    <div className="rounded-lg border border-line bg-white">
      <div className="border-b border-line p-6">
        <h3 className="text-h3 font-bold">Keyword coverage</h3>
        <p className="mt-2 text-small text-slate-600">
          {summary.exact + summary.related} of {summary.total} terms from this job description are evidenced in your
          resume ({summary.coverage}%). Only exact and related matches count — we do not credit a term you have not
          actually demonstrated.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {[0, 1, 2, 3].map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setTierFilter(tier)}
              className={cn(
                'rounded-xs border px-3 py-1.5 text-caption font-medium transition',
                tierFilter === tier ? 'border-azure bg-azure-50 text-azure-700' : 'border-line text-slate-600 hover:bg-paper'
              )}
            >
              {tier === 0 ? `All (${keywords.length})` : `Tier ${tier} (${keywords.filter((k) => k.tier === tier).length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[540px] text-left text-small">
          <thead className="bg-paper text-caption uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-6 py-3 font-semibold">Term</th>
              <th scope="col" className="px-6 py-3 font-semibold">Tier</th>
              <th scope="col" className="px-6 py-3 font-semibold">Status</th>
              <th scope="col" className="px-6 py-3 font-semibold">Evidence in your resume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((keyword) => {
              const meta = MATCH_META[keyword.status] || MATCH_META.MISSING;
              return (
                <tr key={keyword.term} className="align-top">
                  <td className="px-6 py-3.5 font-medium">
                    {keyword.term}
                    {keyword.required && <span className="ml-2 text-caption text-danger">required</span>}
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">{keyword.tier}</td>
                  <td className="px-6 py-3.5">
                    <Badge tone={meta.tone} title={meta.help}>{meta.label}</Badge>
                  </td>
                  <td className="max-w-sm px-6 py-3.5 text-slate-600">
                    {keyword.evidence ? `“${keyword.evidence}”` : <span className="text-slate-400">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Job match
 * ------------------------------------------------------------------ */

export function JobMatchPanel({ match, disclaimer }) {
  if (!match) return null;

  return (
    <div className="rounded-lg border border-line bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-h3 font-bold">Job match</h3>
        <div className="flex items-center gap-3">
          <span className="text-h2 font-extrabold tabular-nums">{match.overall}%</span>
          {match.confidence && (
            <Badge tone={match.confidence === 'high' ? 'success' : match.confidence === 'low' ? 'amber' : 'neutral'}>
              {match.confidence} confidence
            </Badge>
          )}
        </div>
      </div>

      <ul className="mt-5 space-y-4">
        {Object.entries(match.dimensions || {}).map(([key, dimension]) => (
          <li key={key}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-small font-medium capitalize">{key}</span>
              <span className="text-small tabular-nums text-slate-600">{dimension.score}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-azure transition-[width] duration-700" style={{ width: `${dimension.score}%` }} />
            </div>
            {dimension.reason && <p className="mt-1.5 text-small text-slate-600">{dimension.reason}</p>}
          </li>
        ))}
      </ul>

      {disclaimer && (
        <p className="mt-5 flex gap-2.5 border-t border-line pt-4 text-small text-slate-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <span>{disclaimer}</span>
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Skill gap
 * ------------------------------------------------------------------ */

const GAP_META = {
  DEMONSTRATED: { icon: Check, className: 'text-success', label: 'Demonstrated' },
  PARTIAL: { icon: Minus, className: 'text-amber-500', label: 'Partly evidenced' },
  NOT_DEMONSTRATED: { icon: X, className: 'text-danger', label: 'Not evidenced' },
};

export function SkillGapPanel({ skillGap }) {
  if (!skillGap?.assessed?.length) return null;

  return (
    <div className="rounded-lg border border-line bg-white p-6">
      <h3 className="text-h3 font-bold">Skill gap</h3>
      <p className="mt-2 text-small text-slate-600">
        Measured against what this job description asks for, using the evidence already in your resume.
      </p>

      <ul className="mt-5 divide-y divide-line">
        {skillGap.assessed.map((skill) => {
          const meta = GAP_META[skill.status] || GAP_META.NOT_DEMONSTRATED;
          const Icon = meta.icon;
          return (
            <li key={skill.skill} className="flex gap-3 py-3.5">
              <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', meta.className)} aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2.5">
                  <span className="text-small font-medium capitalize">{skill.skill}</span>
                  <span className="text-caption text-slate-500">{meta.label}</span>
                  {skill.necessity === 'required' && <span className="text-caption text-danger">required</span>}
                </div>
                {skill.evidence && <p className="mt-0.5 text-small text-slate-600">“{skill.evidence}”</p>}
              </div>
            </li>
          );
        })}
      </ul>

      {skillGap.recommendations?.length > 0 && (
        <div className="mt-5 border-t border-line pt-5">
          <h4 className="text-small font-semibold">Closing the gap</h4>
          <ul className="mt-3 space-y-2.5">
            {skillGap.recommendations.map((rec) => (
              <li key={rec.skill}>
                <Link to={rec.link} className="group flex items-center gap-2 text-small text-azure hover:underline">
                  <span className="capitalize">{rec.skill}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Evidence questions (spec §13, §14)
 * ------------------------------------------------------------------ */

export function EvidenceQuestions({ questions = [], onAnswer, busyId }) {
  const [answers, setAnswers] = useState({});
  const [openId, setOpenId] = useState(questions[0]?.id || null);

  if (!questions.length) return null;

  const setField = (questionId, field, value) =>
    setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], [field]: value } }));

  return (
    <div className="space-y-3">
      <p className="rounded border border-line bg-paper p-4 text-small text-slate-600">
        Nothing you write here is added to your resume automatically. We build a suggested line from your answer, and
        you decide whether to use it.
      </p>

      {questions.map((question) => {
        const open = openId === question.id;
        const value = answers[question.id] || {};
        return (
          <div key={question.id} className="overflow-hidden rounded border border-line bg-white">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : question.id)}
              className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-paper"
              aria-expanded={open}
            >
              <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-azure" aria-hidden />
              <span className="flex-1 text-small">{question.prompt}</span>
              <ChevronDown className={cn('mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} aria-hidden />
            </button>

            {open && (
              <div className="space-y-4 border-t border-line bg-paper px-5 py-5">
                {question.why && <p className="text-small text-slate-600">{question.why}</p>}

                {(question.followUps || []).map((followUp) => (
                  <label key={followUp.id} className="block">
                    <span className="mb-1.5 block text-small font-medium">
                      {followUp.prompt}
                      {followUp.optional && <span className="ml-1.5 font-normal text-slate-500">(optional)</span>}
                    </span>
                    <input
                      type="text"
                      value={value[followUp.id] || ''}
                      onChange={(e) => setField(question.id, followUp.id, e.target.value)}
                      className="w-full rounded-xs border border-line bg-white px-3.5 py-2.5 text-small outline-none focus:border-azure focus:ring-2 focus:ring-azure-100"
                    />
                  </label>
                ))}

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    size="sm"
                    loading={busyId === question.id}
                    onClick={() => onAnswer?.(question, value)}
                    disabled={!Object.values(value).some((v) => String(v || '').trim())}
                  >
                    Build a line from this
                  </Button>
                  <span className="text-caption text-slate-500">Leave a box empty and we simply leave that part out.</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Before / after review (spec §28, §29)
 * ------------------------------------------------------------------ */

export function ProposalReview({ proposals = [], decisions, onDecide, engineNote }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState('');

  if (!proposals.length) return null;

  return (
    <div className="space-y-4">
      {engineNote && (
        <p className="flex gap-2.5 rounded border border-line bg-paper p-4 text-small text-slate-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <span>{engineNote}</span>
        </p>
      )}

      {proposals.map((proposal) => {
        const decision = decisions?.[proposal.id];
        const editing = editingId === proposal.id;

        return (
          <div
            key={proposal.id}
            className={cn(
              'rounded-lg border bg-white p-5 transition',
              decision?.action === 'accept' && 'border-success/40 bg-success/[0.03]',
              decision?.action === 'reject' && 'border-line opacity-60',
              decision?.action === 'edit' && 'border-azure/40 bg-azure-50/40',
              !decision && 'border-line'
            )}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="eyebrow mb-2">Current</p>
                <p className="text-small text-slate-600 line-through decoration-slate-300">{proposal.original}</p>
              </div>
              <div>
                <p className="eyebrow mb-2">Suggested</p>
                {editing ? (
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={3}
                    className="w-full rounded-xs border border-line px-3.5 py-2.5 text-small outline-none focus:border-azure focus:ring-2 focus:ring-azure-100"
                  />
                ) : (
                  <p className="text-small font-medium">{decision?.text || proposal.proposed}</p>
                )}
              </div>
            </div>

            {/* "Why this change?" is required on every proposal (spec §29) —
                a rewrite the candidate cannot interrogate is one they
                cannot defend in an interview either. */}
            <p className="mt-4 flex gap-2 border-t border-line pt-3.5 text-small text-slate-600">
              <span className="font-medium text-ink">Why this change?</span>
              {proposal.reason}
            </p>

            {proposal.evidence && (
              <p className="mt-1.5 text-caption text-slate-500">
                Evidence level: {proposal.evidence}
                {proposal.keywordsAligned?.length > 0 && ` · aligns with ${proposal.keywordsAligned.join(', ')}`}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {editing ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => {
                      onDecide?.(proposal.id, { action: 'edit', text: draft });
                      setEditingId(null);
                    }}
                  >
                    Save my wording
                  </Button>
                  <Button size="sm" variant="quiet" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant={decision?.action === 'accept' ? 'primary' : 'outline'}
                    onClick={() => onDecide?.(proposal.id, { action: 'accept' })}
                  >
                    <Check className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="quiet"
                    onClick={() => {
                      setDraft(decision?.text || proposal.proposed);
                      setEditingId(proposal.id);
                    }}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="quiet"
                    onClick={() => onDecide?.(proposal.id, { action: 'reject' })}
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Template gallery (HRMS-Style Selection with A4 Previews)
 * ------------------------------------------------------------------ */

export function TemplateGallery({ templates = [], selectedId, onSelect, suggestedId }) {
  const list = TEMPLATES;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((tpl) => {
        const selected = tpl.id === selectedId;
        return (
          <div
            key={tpl.id}
            onClick={() => onSelect?.(tpl.id)}
            className={cn(
              'group relative flex flex-col overflow-hidden rounded-2xl border p-3.5 cursor-pointer transition-all duration-300 bg-white/95 backdrop-blur-md',
              selected
                ? 'border-azure ring-2 ring-azure shadow-[0_20px_50px_-15px_rgba(43,114,212,0.4)] scale-[1.02]'
                : 'border-line hover:-translate-y-1 hover:border-azure-300 hover:shadow-crystal'
            )}
          >
            {/* Top Bar with Selected Tick & Industry */}
            <div className="mb-2 flex items-center justify-between">
              <span className="font-bold text-ink text-small">{tpl.name}</span>
              <span className="rounded-full bg-azure-50 px-2 py-0.5 text-[9.5px] font-bold text-azure-700">
                {tpl.industry || tpl.tagline}
              </span>
            </div>

            {/* Badges */}
            <div className="mb-2 flex flex-wrap items-center gap-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200/60">
                ATS Ready
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-1.5 py-0.5 text-[9px] font-bold text-cyan-700 border border-cyan-200/60">
                Modern
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-1.5 py-0.5 text-[9px] font-bold text-purple-700 border border-purple-200/60">
                Professional
              </span>
            </div>

            {/* Document Preview (Compact Scaled A4) */}
            <div className="relative overflow-hidden rounded-lg border border-glacier-300/80 bg-glacier-100/50 p-1 h-[215px]">
              <ResumeTemplatePreview template={tpl} crop={true} />
              {selected && (
                <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                  <Check className="h-3 w-3" /> Selected
                </span>
              )}
            </div>

            {/* Target Details */}
            <div className="mt-2.5 flex-1">
              <p className="text-[11.5px] font-semibold text-slate-700">
                Persona: <span className="font-bold text-ink">{tpl.personName}</span>
              </p>
              <p className="text-caption text-slate-500 line-clamp-1 mt-0.5">{tpl.targetRoles}</p>
            </div>

            {/* Use Template CTA Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(tpl.id);
              }}
              className={cn(
                'mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-[12px] font-bold transition-all duration-300',
                selected
                  ? 'bg-gradient-to-r from-azure via-cyan-600 to-purple-600 text-white shadow-crystal hover:from-azure-600 hover:to-purple-700'
                  : 'bg-frost-50 text-azure hover:bg-gradient-to-r hover:from-azure hover:to-purple-600 hover:text-white'
              )}
            >
              {selected ? 'Active Template' : 'Use Template'}
            </button>
          </div>
        );
      })}
    </div>
  );
}


/* ------------------------------------------------------------------ *
 * Next actions
 * ------------------------------------------------------------------ */

export function RecommendationList({ recommendations = [] }) {
  if (!recommendations.length) return null;

  return (
    <ol className="space-y-3">
      {recommendations.map((rec, index) => (
        <li key={rec.id} className="flex gap-4 rounded-lg border border-line bg-white p-5">
          <span className="grid h-7 w-7 shrink-0 place-content-center rounded-full bg-azure-50 text-small font-bold text-azure-700">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{rec.title}</p>
            <p className="mt-1 text-small text-slate-600">{rec.body}</p>
            {rec.cta && (
              <Link
                to={rec.cta.to}
                className="group mt-2.5 inline-flex items-center gap-1.5 text-small font-medium text-azure hover:underline"
              >
                {rec.cta.label}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ *
 * Parser review banner
 * ------------------------------------------------------------------ */

export function ParseReviewNotice({ needsReview = [], note }) {
  if (!note) return null;
  const hasIssues = needsReview.length > 0;

  return (
    <div
      className={cn(
        'flex gap-3 rounded border p-4',
        hasIssues ? 'border-amber-200 bg-amber-50' : 'border-line bg-paper'
      )}
    >
      {hasIssues ? (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
      ) : (
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      )}
      <div>
        <p className="text-small">{note}</p>
        {hasIssues && (
          <p className="mt-1.5 text-caption text-slate-600">
            Fields to check: {needsReview.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
