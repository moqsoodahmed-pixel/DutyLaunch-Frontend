import { cn } from '../../utils/cn.js';

/**
 * Simple horizontal progress meter — used for profile completion, profile
 * strength and match scores so those numbers read consistently everywhere.
 */
export function Progress({ value = 0, max = 100, tone = 'azure', className, trackClassName }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  const tones = {
    azure: 'bg-btn-grad',
    success: 'bg-success',
    amber: 'bg-amber-500',
    danger: 'bg-danger',
  };

  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-100', trackClassName, className)}>
      <div
        className={cn('h-full rounded-full transition-all', tones[tone] || tones.azure)}
        style={{ width: `${percent}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
    </div>
  );
}

/** Circular ring variant, for headline scores (profile strength, match %). */
export function ProgressRing({ value = 0, max = 100, size = 88, strokeWidth = 8, tone = 'azure', label, sublabel }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const colors = { azure: '#1D5DB8', success: '#059669', amber: '#D97706', danger: '#DC2626' };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#EEF2F7" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[tone] || colors.azure}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="tabular text-h3 font-extrabold text-ink">{label ?? Math.round(value)}</span>
        {sublabel && <span className="text-caption text-slate-500">{sublabel}</span>}
      </div>
    </div>
  );
}
