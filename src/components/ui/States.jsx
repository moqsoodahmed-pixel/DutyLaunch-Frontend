import { AlertTriangle, Inbox, Loader2, RefreshCw } from 'lucide-react';
import { Button } from './Button.jsx';
import { cn } from '../../utils/cn.js';

export function Spinner({ className }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-slate-400', className)} aria-hidden />;
}

export function LoadingBlock({ label = 'Loading', className }) {
  return (
    <div className={cn('flex items-center justify-center gap-3 py-16 text-small text-slate-500', className)} role="status">
      <Spinner />
      <span>{label}…</span>
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded bg-slate-100', className)} aria-hidden />;
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i} className="space-y-3 rounded-lg border border-line p-5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, description, action, icon: Icon = Inbox, className }) {
  return (
    <div className={cn('rounded-lg border border-dashed border-line px-6 py-14 text-center', className)}>
      <Icon className="mx-auto h-8 w-8 text-slate-300" aria-hidden />
      <h3 className="mt-4 text-h3 font-semibold text-ink">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-small text-slate-600">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, className }) {
  return (
    <div className={cn('rounded-lg border border-danger/25 bg-danger/[0.03] px-6 py-10 text-center', className)} role="alert">
      <AlertTriangle className="mx-auto h-7 w-7 text-danger" aria-hidden />
      <h3 className="mt-3 text-h3 font-semibold text-ink">That didn&apos;t load</h3>
      <p className="mx-auto mt-2 max-w-md text-small text-slate-600">
        {error?.message || 'The request did not complete.'}
      </p>
      {onRetry && (
        <div className="mt-5 flex justify-center">
          <Button variant="outline" size="sm" onClick={() => onRetry()}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
