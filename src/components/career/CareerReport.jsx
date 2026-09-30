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
  Layers,
  Award,
  Zap,
  BookOpen,
  FileText,
  Target,
  ShieldCheck,
  CheckCircle2,
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

const CATEGORY_ICONS = {
  structure: Layers,
  achievement: Award,
  skills: Zap,
  readability: BookOpen,
  formatting: FileText,
  keywords: Target,
};

export function ScoreDial({ score, band, label = 'ATS Health Score', size = 136 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;
  const isHigh = score >= 80;
  const isMedium = score >= 60 && score < 80;

  const gradientId = `score-grad-${score}`;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${label}: ${score} out of 100`}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {isHigh ? (
                <>
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </>
              ) : isMedium ? (
                <>
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#F97316" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="100%" stopColor="#F43F5E" />
                </>
              )}
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth="11" className="stroke-slate-100" fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth="11"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            stroke={`url(#${gradientId})`}
            className="transition-[stroke-dashoffset] duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <span className="text-3xl sm:text-4xl font-black text-ink leading-none">{score}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-1">out of 100</span>
        </div>
      </div>
      <div className="text-center sm:text-left">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-caption font-bold uppercase tracking-wider bg-slate-100 text-slate-600 mb-2">
          {label}
        </span>
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-small font-bold',
              isHigh
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isMedium
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
            )}
          >
            {band?.label || (isHigh ? 'Excellent ATS Score' : isMedium ? 'Good Baseline' : 'Needs Review')}
          </span>
        </div>
        <p className="mt-1.5 text-caption text-slate-500 max-w-[24ch]">
          {isHigh
            ? 'Strong formatting & keyword alignment. Recruiter ATS ready.'
            : isMedium
              ? 'Meets structural requirements with a few recommended tweaks.'
              : 'Several key ATS flags require updates before sending.'}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Resume Health report — Premium Dashboard Layout
 * ------------------------------------------------------------------ */

const SEVERITY_TONE = { high: 'danger', medium: 'amber', low: 'neutral' };

export function ResumeHealthReport({ health }) {
  const [openCategory, setOpenCategory] = useState(null);
  if (!health) return null;

  const categories = Object.entries(health.categories || {});

  return (
    <div className="space-y-6">
      {/* Top Card: Resume Score Dashboard */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <ScoreDial score={health.score} band={health.band} />
          </div>

          <div className="lg:col-span-4 border-t border-slate-100 pt-4 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
            <h4 className="text-small font-bold text-ink">Score Assessment</h4>
            <p className="mt-1 text-small text-slate-600 leading-relaxed">
              {!health.scoredAgainstJd
                ? 'Evaluated across core formatting, bullet impact, and section parsing. Add a job description to calculate role relevance and keyword alignment.'
                : 'Scored with target job requirements. Keywords and skills matched directly against job specifications.'}
            </p>
            {health.methodology && (
              <p className="mt-2.5 flex items-start gap-1.5 text-caption text-slate-500">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-azure" aria-hidden />
                <span>{health.methodology}</span>
              </p>
            )}
          </div>

          <div className="lg:col-span-3 flex flex-col gap-2.5 sm:flex-row lg:flex-col justify-end">
            <Button
              to="/cv-builder"
              variant="premium"
              size="sm"
              className="w-full justify-center shadow-sm text-center"
            >
              Fix in CV Builder
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-caption font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-ink"
            >
              Print / Save ATS Report
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Score Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-small font-bold uppercase tracking-wider text-slate-500">
            Category Breakdown ({categories.length} Evaluation Areas)
          </h3>
          <span className="text-caption text-slate-400">Click any card to expand findings</span>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          {categories.map(([key, category]) => {
            const open = openCategory === key;
            const Icon = CATEGORY_ICONS[key] || ShieldCheck;
            const isHigh = category.score >= 80;
            const isMedium = category.score >= 60 && category.score < 80;

            return (
              <div
                key={key}
                className={cn(
                  'overflow-hidden rounded-xl border bg-white transition-all duration-200',
                  open
                    ? 'border-azure-300 shadow-md ring-1 ring-azure-200/50'
                    : 'border-slate-200/90 shadow-2xs hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xs'
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenCategory(open ? null : key)}
                  className="flex w-full items-center gap-3.5 p-4 text-left cursor-pointer outline-none"
                  aria-expanded={open}
                >
                  <div
                    className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-lg',
                      isHigh
                        ? 'bg-emerald-50 text-emerald-600'
                        : isMedium
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-rose-50 text-rose-600'
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-small font-bold text-ink truncate">{category.label}</span>
                      <span className="text-caption font-bold text-slate-700 tabular-nums">
                        {category.score}
                        <span className="text-[10px] text-slate-400 font-normal">/100</span>
                      </span>
                    </div>

                    {/* Gradient Animated Progress Bar */}
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700 ease-out',
                          isHigh
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                            : isMedium
                              ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                              : 'bg-gradient-to-r from-rose-400 to-red-600'
                        )}
                        style={{ width: `${Math.max(6, category.score)}%` }}
                      />
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{category.weight}% weighting</span>
                      <span className={isHigh ? 'text-emerald-600 font-semibold' : isMedium ? 'text-amber-600 font-semibold' : 'text-rose-600 font-semibold'}>
                        {category.findings?.length ? `${category.findings.length} findings` : 'Optimal'}
                      </span>
                    </div>
                  </div>

                  <ChevronDown
                    className={cn('h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200', open && 'rotate-180')}
                    aria-hidden
                  />
                </button>

                {open && (
                  <div className="border-t border-slate-100 bg-slate-50/70 p-4">
                    {category.findings?.length ? (
                      <ul className="space-y-2.5">
                        {category.findings.map((finding, i) => (
                          <li key={i} className="flex items-start gap-2.5 rounded-lg bg-white p-2.5 border border-slate-200/70 shadow-2xs">
                            <Badge tone={SEVERITY_TONE[finding.severity]} className="mt-0.5 shrink-0 text-[10px] uppercase font-bold">
                              {finding.severity}
                            </Badge>
                            <div className="min-w-0">
                              <p className="text-small font-semibold text-ink">{finding.label}</p>
                              {finding.detail && (
                                <p className="mt-0.5 text-caption text-slate-600 leading-relaxed">{finding.detail}</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-small text-emerald-700 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        All checks in this category are fully optimal.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3-Column Improvement Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryList title="What is strong" items={health.whatIsStrong} tone="success" />
        <SummaryList title="What needs work" items={health.whatNeedsImprovement} tone="amber" />
        <SummaryList title="What is missing" items={health.whatIsMissing} tone="danger" />
      </div>
    </div>
  );
}

function SummaryList({ title, items, tone }) {
  const dot = { success: 'bg-emerald-500', amber: 'bg-amber-500', danger: 'bg-rose-500' }[tone];
  const borderTone = { success: 'border-emerald-200/80', amber: 'border-amber-200/80', danger: 'border-rose-200/80' }[tone];
  return (
    <div className={cn('rounded-xl border bg-white p-5 shadow-2xs', borderTone)}>
      <h3 className="mb-3 text-small font-bold text-ink flex items-center gap-2">
        <span className={cn('h-2 w-2 rounded-full', dot)} />
        {title}
      </h3>
      {items?.length ? (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-small text-slate-600 leading-snug">
              <span className="text-slate-400 select-none">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-small text-slate-400 italic">None reported</p>
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
