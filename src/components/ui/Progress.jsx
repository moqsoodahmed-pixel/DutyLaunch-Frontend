import { useId } from 'react';
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

/**
 * Circular ring variant, for headline scores (profile strength, match %).
 *
 * tone="dark" is for rings that sit on a dark card (e.g. the OneProfile demo
 * card). Before, "dark" was not a known tone, so the ring silently fell back
 * to the light-theme colours: a dark-blue arc, a near-white track and
 * near-black text — i.e. an unreadable "88" on a dark background. The dark
 * tone uses a solid indigo disc, a clearly visible track, a bright
 * frost->aurora arc and big white digits.
 */
export function ProgressRing({ value = 0, max = 100, size = 88, strokeWidth = 8, tone = 'azure', label, sublabel }) {
  const gradId = useId().replace(/:/g, '');
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const dark = tone === 'dark';
  const colors = { azure: '#1D5DB8', success: '#059669', amber: '#D97706', danger: '#DC2626' };
  const trackColor = dark ? 'var(--night-track)' : '#EEF2F7';
  const arcColor = dark ? `url(#${gradId})` : colors[tone] || colors.azure;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        {dark && (
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7DD3EF" />
              <stop offset="100%" stopColor="#C4AEF2" />
            </linearGradient>
          </defs>
        )}
        {/* Solid disc behind the digits so nothing from the card shows through. */}
        {dark && <circle cx={size / 2} cy={size / 2} r={radius - strokeWidth / 2} style={{ fill: 'var(--night-base)' }} />}
        <circle cx={size / 2} cy={size / 2} r={radius} style={{ stroke: trackColor }} strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={arcColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span
          className={cn(
            'tabular font-extrabold',
            dark ? 'text-[1.15rem] leading-none text-white' : 'text-h3 text-ink'
          )}
          role="img"
          aria-label={`Score ${label ?? Math.round(value)}${sublabel ? ` ${sublabel}` : ''}`}
        >
          {label ?? Math.round(value)}
        </span>
        {sublabel && <span className={cn('text-caption', dark ? 'text-slate-200' : 'text-slate-500')}>{sublabel}</span>}
      </div>
    </div>
  );
}
