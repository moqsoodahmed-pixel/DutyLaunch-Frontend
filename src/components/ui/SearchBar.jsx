import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export function SearchBar({ value, onChange, onSubmit, placeholder = 'Search', label, className, children }) {
  return (
    <form
      role="search"
      className={cn('flex flex-col gap-2 sm:flex-row', className)}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" aria-hidden />
        {/* Native search-input clear button hidden: the custom X below replaces it. */}
        <input
          type="search"
          value={value}
          aria-label={label || placeholder}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-12 w-full rounded border border-line bg-white pl-11 pr-10 text-body text-ink placeholder:text-slate-400 focus:border-azure-400 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-ink"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
      {children}
    </form>
  );
}