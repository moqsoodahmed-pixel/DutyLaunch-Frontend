import { cn } from '../../utils/cn.js';

const tones = {
  /* Semantic tones. Text colours are the 700-level shades so every badge keeps
     >= 4.5:1 contrast at 12px (the old 500/600 text on a tint fell short). */
  neutral: 'bg-glacier-200 text-slate-700',
  azure: 'bg-azure-50 text-azure-700',
  info: 'bg-azure-50 text-azure-700',
  amber: 'bg-amber-50 text-amber-600',
  warning: 'bg-amber-50 text-amber-600',
  success: 'bg-emerald-50 text-emerald-700',
  danger: 'bg-red-50 text-red-700',
  ink: 'bg-ink-800 text-white',
  outline: 'border border-glacier-400 text-slate-700',
};

export function Badge({ tone = 'neutral', className, children, ...rest }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-caption font-semibold',
        tones[tone],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

const STATUS_TONES = {
  published: 'success', submitted: 'azure', new: 'azure', draft: 'neutral',
  pending: 'amber', 'under-review': 'amber', read: 'neutral', contacted: 'amber',
  shortlisted: 'azure', interviewing: 'azure', scheduled: 'azure',
  offered: 'success', converted: 'success', replied: 'success',
  rejected: 'danger', closed: 'neutral', withdrawn: 'neutral', archived: 'neutral',
};

export function StatusBadge({ status }) {
  if (!status) return null;
  return <Badge tone={STATUS_TONES[status] || 'neutral'}>{status.replace(/-/g, ' ')}</Badge>;
}