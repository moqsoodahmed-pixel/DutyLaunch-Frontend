import { motion } from 'framer-motion';
import { AlertTriangle, Check, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { cn } from '../../utils/cn.js';

const CATEGORY_LABELS = {
  contact: 'Contact Information',
  formatting: 'Formatting',
  keywords: 'Keyword Match',
  experience: 'Experience',
  skills: 'Skills',
  education: 'Education',
  achievements: 'Achievements',
};

/* Display-only banding (thresholds unchanged). Colour carries meaning:
   green = strong, blue = good, amber = needs work, red = weak. Text colours are
   the darker shades so the label passes AA contrast on white. */
function band(score) {
  if (score >= 85) return { label: 'Excellent', tone: 'text-emerald-700', stroke: '#047857', bar: 'bg-emerald-600', meaning: 'Well set up for most applicant tracking systems.' };
  if (score >= 70) return { label: 'Good', tone: 'text-azure', stroke: '#1D5DB8', bar: 'bg-azure', meaning: 'Solid, with a few fixes that would raise it further.' };
  if (score >= 50) return { label: 'Needs work', tone: 'text-amber-600', stroke: '#D97706', bar: 'bg-amber-500', meaning: 'Likely to lose points with ATS filters. Start with the items below.' };
  return { label: 'Weak', tone: 'text-danger', stroke: '#DC2626', bar: 'bg-danger', meaning: 'High risk of being filtered out. Fix the items below first.' };
}

function ScoreRing({ score }) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const { label, tone, stroke } = band(score);

  return (
    <div className="relative grid h-44 w-44 shrink-0 place-items-center" role="img" aria-label={`ATS score ${score} out of 100: ${label}`}>
      <svg viewBox="0 0 152 152" className="h-44 w-44 -rotate-90" aria-hidden>
        <circle cx="76" cy="76" r={radius} fill="none" stroke="#D7E4F3" strokeWidth="12" />
        <motion.circle
          cx="76"
          cy="76"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 0.84, 0.44, 1] }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-caption font-semibold uppercase tracking-wide text-slate-600">ATS Score</span>
        <span className="tabular text-[2.75rem] font-extrabold leading-none text-ink">{score}</span>
        <span className="text-caption text-slate-600">/100</span>
        <span className={cn('mt-1 text-small font-bold', tone)}>{label}</span>
      </div>
    </div>
  );
}

function CategoryBar({ label, score, delay }) {
  const { bar } = band(score);
  return (
    <div>
      <div className="flex items-center justify-between text-small">
        <span className="font-medium text-ink">{label}</span>
        <span className="tabular font-semibold text-slate-600">{score}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-glacier-300" role="progressbar" aria-label={label} aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
        <motion.div
          className={cn('h-full rounded-full', bar)}
          initial={{ width: '0%' }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.9, delay, ease: [0.16, 0.84, 0.44, 1] }}
        />
      </div>
    </div>
  );
}

export function AtsScoreReport({ result, onReset }) {
  if (!result) return null;
  const { score, categories, strengths = [], weaknesses = [], recommendations = [], suggested } = result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card !p-6 sm:!p-8"
    >
      <div className="flex flex-col items-center gap-8 border-b border-glacier-400 pb-8 lg:flex-row lg:items-start">
        <ScoreRing score={score} />
        <div className="flex-1">
          <p className="text-small font-semibold text-azure">DutyLaunch ATS Compatibility Score</p>
          <p className="mt-2 text-body font-semibold text-ink">{band(score).meaning}</p>
          <p className="mt-1 text-small text-slate-600">
            An internal assessment of how well this resume is likely to be parsed and ranked by common
            Applicant Tracking Systems, not an official score from any specific vendor.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {Object.entries(categories || {}).map(([key, value], i) => (
              <CategoryBar key={key} label={CATEGORY_LABELS[key] || key} score={value} delay={0.1 + i * 0.06} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="flex items-center gap-2 text-small font-bold text-ink">
            <Check className="h-4 w-4 text-emerald-700" aria-hidden /> What&rsquo;s working
          </h3>
          <ul className="mt-3 space-y-2">
            {strengths.length === 0 && <li className="text-small text-slate-600">No strong signals detected yet.</li>}
            {strengths.map((s) => (
              <li key={s} className="flex gap-2 text-small text-slate-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="flex items-center gap-2 text-small font-bold text-ink">
            <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden /> Needs improvement
          </h3>
          <ul className="mt-3 space-y-2">
            {weaknesses.length === 0 && <li className="text-small text-slate-600">No major gaps found.</li>}
            {weaknesses.map((w) => (
              <li key={w} className="flex gap-2 text-small text-slate-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="card-panel mt-8 !p-5">
          <h3 className="text-small font-bold text-ink">Recommendations</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {recommendations.map((r) => (
              <li key={r} className="text-small text-slate-700">
                &bull; {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {suggested && (
        <div className="mt-8 rounded-lg border border-teal-200 bg-teal-50 p-5">
          <h3 className="flex items-center gap-2 text-small font-bold text-teal-800">
            AI-suggested summary rewrite
          </h3>
          <p className="mt-2 text-small leading-relaxed text-teal-900">{suggested}</p>
          <p className="mt-2 text-caption text-teal-700">Review and personalise before using, this is a starting point, not your final copy.</p>
        </div>
      )}

      <div className="mt-8 flex flex-col items-start gap-4 rounded-lg border border-azure-200 bg-azure-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-small font-bold text-ink">Want to improve your score?</p>
          <p className="mt-0.5 text-small text-slate-600">
            Let our career experts transform your resume into an ATS-friendly professional CV.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button to="/pricing" size="sm">
            Get My CV Professionally Written
          </Button>
          <Button to="/pricing" variant="secondary" size="sm">
            Explore CV Packages
          </Button>
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex items-center gap-1.5 text-small font-semibold text-slate-500 hover:text-ink"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Check another resume
      </button>
    </motion.div>
  );
}