import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { cn } from '../../utils/cn.js';

/**
 * Admin metric tile. Deliberately flat — the admin reads as an instrument
 * panel, not a marketing page, so no shadows or gradients here.
 */
export function StatCard({ label, value, hint, icon = 'Circle', to, tone = 'default' }) {
  const Icon = Icons[icon] || Icons.Circle;
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-caption font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <Icon
          className={cn('h-4 w-4 shrink-0', tone === 'alert' ? 'text-amber-500' : 'text-slate-300')}
          aria-hidden
        />
      </div>
      <p className="tabular mt-3 text-h1 font-extrabold leading-none text-ink">{value ?? '—'}</p>
      {hint && <p className="mt-2 text-caption text-slate-500">{hint}</p>}
    </>
  );

  const classes = cn(
    'block rounded-lg border bg-white p-5',
    tone === 'alert' ? 'border-amber-200' : 'border-line',
    to && 'transition-colors hover:border-slate-300'
  );

  return to ? (
    <Link to={to} className={classes}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}
