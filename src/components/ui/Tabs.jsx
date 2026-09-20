import { cn } from '../../utils/cn.js';

/** Horizontal filter tabs. Scrolls on small screens rather than wrapping. */
export function Tabs({ options, value, onChange, className, label = 'Filter' }) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('no-scrollbar -mx-gutter flex gap-1.5 overflow-x-auto px-gutter sm:mx-0 sm:flex-wrap sm:px-0', className)}
    >
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const text = typeof opt === 'string' ? opt : opt.label;
        const active = val === value;
        return (
          <button
            key={val}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(val)}
            className={cn(
              'shrink-0 rounded-sm border px-3.5 py-2 text-small font-medium transition-colors',
              active ? 'border-ink-800 bg-ink-800 text-white' : 'border-line bg-white text-slate-600 hover:border-slate-300'
            )}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}
