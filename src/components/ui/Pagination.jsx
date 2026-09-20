import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export function Pagination({ meta, onChange, className }) {
  if (!meta || meta.totalPages <= 1) return null;
  const { page, totalPages } = meta;

  const pages = [];
  const window = 1;
  for (let i = 1; i <= totalPages; i += 1) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= window) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }

  const btn = 'inline-flex h-9 min-w-9 items-center justify-center rounded px-2.5 text-small font-medium transition-colors';

  return (
    <nav className={cn('flex items-center justify-center gap-1', className)} aria-label="Pagination">
      <button
        type="button"
        className={cn(btn, 'border border-line text-slate-600 hover:bg-paper disabled:opacity-40')}
        disabled={!meta.hasPrevPage}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          // eslint-disable-next-line react/no-array-index-key
          <span key={`gap-${i}`} className="px-1.5 text-small text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(btn, p === page ? 'bg-ink-800 text-white' : 'border border-line text-slate-600 hover:bg-paper')}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        className={cn(btn, 'border border-line text-slate-600 hover:bg-paper disabled:opacity-40')}
        disabled={!meta.hasNextPage}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </nav>
  );
}
