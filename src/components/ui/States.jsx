import { isValidElement } from 'react';
import { AlertTriangle, Inbox, Loader2, RefreshCw } from 'lucide-react';
import { Button } from './Button.jsx';
import { cn } from '../../utils/cn.js';

export function Spinner({ className }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-azure', className)} aria-hidden />;
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
  return <div className={cn('animate-pulse rounded bg-glacier-300', className)} aria-hidden />;
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i} className="space-y-3 rounded-2xl border border-glacier-400 bg-white p-5">
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
  const renderAction = () => {
    if (!action) return null;
    if (isValidElement(action)) return action;
    if (Array.isArray(action)) {
      return (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action.map((act, idx) => {
            if (isValidElement(act)) return act;
            if (typeof act === 'object' && act?.label) {
              return (
                <Button
                  key={idx}
                  variant={act.variant || 'secondary'}
                  onClick={act.onClick}
                  to={act.to}
                >
                  {act.label}
                </Button>
              );
            }
            return null;
          })}
        </div>
      );
    }
    if (typeof action === 'object' && action?.label) {
      return (
        <Button
          variant={action.variant || 'secondary'}
          onClick={action.onClick}
          to={action.to}
        >
          {action.label}
        </Button>
      );
    }
    return null;
  };

  return (
    <div className={cn('rounded-2xl border border-dashed border-azure-200 bg-glacier-100 px-6 py-14 text-center', className)}>
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-glacier-400 bg-white text-azure">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-small text-slate-700">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{renderAction()}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, className }) {
  return (
    <div className={cn('rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center', className)} role="alert">
      <AlertTriangle className="mx-auto h-7 w-7 text-red-700" aria-hidden />
      <h3 className="mt-3 text-lg font-bold text-ink">That didn&apos;t load</h3>
      <p className="mx-auto mt-2 max-w-md text-small text-slate-700">
        {error?.message || 'The request did not complete.'}
      </p>
      {onRetry && (
        <div className="mt-5 flex justify-center">
          <Button variant="secondary" size="sm" onClick={() => onRetry()}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}