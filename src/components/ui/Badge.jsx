import { cn } from '../../utils/cn.js';

const tones = {
  neutral: 'bg-slate-100 text-slate-700',
  azure: 'bg-azure-50 text-azure-700',
  amber: 'bg-amber-50 text-amber-600',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  ink: 'bg-ink-800 text-white',
  outline: 'border border-line text-slate-600',
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
