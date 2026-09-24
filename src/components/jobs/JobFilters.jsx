import { useState } from 'react';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Select } from '../ui/Field.jsx';
import { Button } from '../ui/Button.jsx';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
const WORK_MODES = ['On-site', 'Hybrid', 'Remote'];
const SORTS = [
  { value: 'relevance', label: 'Most relevant' },
  { value: 'recent', label: 'Newest first' },
  { value: 'salary-high', label: 'Highest salary' },
];

export function JobFilters({ filters, facets, onChange, onReset, resultCount }) {
  const active = Object.entries(filters).filter(([key, value]) => value && !['page', 'sort', 'q'].includes(key));
  // Below lg the filter panel sits above the results, so it starts collapsed —
  // otherwise five dropdowns push every job below the fold on a phone.
  const [open, setOpen] = useState(false);

  return (
    <aside
      className="rounded-lg border border-line bg-white p-5 shadow-xs lg:sticky lg:top-24"
      aria-label="Job filters"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="min-w-0 text-small font-bold text-ink">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="job-filter-fields"
            className="inline-flex items-center gap-2 lg:pointer-events-none"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-azure-50 text-azure">
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
            </span>
            Filters
            {active.length > 0 && (
              <span className="rounded-full bg-azure px-1.5 py-0.5 text-[11px] font-bold leading-none text-white lg:hidden">
                {active.length}
              </span>
            )}
            <ChevronDown
              className={cn('h-4 w-4 text-slate-400 transition-transform lg:hidden', open && 'rotate-180')}
              aria-hidden
            />
          </button>
        </h2>
        {active.length > 0 && (
          <button type="button" onClick={onReset} className="text-caption font-bold text-azure-600 hover:underline">
            Clear all
          </button>
        )}
      </div>

      {active.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {active.map(([key, value]) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => onChange({ [key]: '' })}
                className="inline-flex items-center gap-1.5 rounded-full bg-azure-50 px-2.5 py-1 text-caption font-semibold text-azure-700"
              >
                {value}
                <X className="h-3 w-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div id="job-filter-fields" className={cn(open ? 'block' : 'hidden', 'lg:block')}>
      <div className="mt-5 space-y-4 border-t border-line pt-5">
        <Select
          label="Category"
          placeholder="All categories"
          options={facets?.categories || []}
          value={filters.category || ''}
          onChange={(e) => onChange({ category: e.target.value })}
        />
        <Select
          label="Location"
          placeholder="Anywhere"
          options={facets?.locations || []}
          value={filters.location || ''}
          onChange={(e) => onChange({ location: e.target.value })}
        />
        <Select
          label="Job type"
          placeholder="Any type"
          options={JOB_TYPES}
          value={filters.jobType || ''}
          onChange={(e) => onChange({ jobType: e.target.value })}
        />
        <Select
          label="Work mode"
          placeholder="Any mode"
          options={WORK_MODES}
          value={filters.workMode || ''}
          onChange={(e) => onChange({ workMode: e.target.value })}
        />
        <Select
          label="Maximum experience"
          placeholder="Any experience"
          options={[
            { value: '1', label: 'Up to 1 year' },
            { value: '3', label: 'Up to 3 years' },
            { value: '7', label: 'Up to 7 years' },
            { value: '15', label: 'Up to 15 years' },
          ]}
          value={filters.maxExperience || ''}
          onChange={(e) => onChange({ maxExperience: e.target.value })}
        />
        <Select
          label="Sort by"
          options={SORTS}
          value={filters.sort || 'relevance'}
          onChange={(e) => onChange({ sort: e.target.value })}
        />
      </div>

      {typeof resultCount === 'number' && (
        <p className="mt-5 text-caption text-slate-500">
          {resultCount} {resultCount === 1 ? 'role' : 'roles'} match these filters
        </p>
      )}

      <Button variant="ghost" size="sm" className="mt-2 lg:hidden" onClick={onReset} fullWidth>
        Reset filters
      </Button>
      </div>
    </aside>
  );
}
