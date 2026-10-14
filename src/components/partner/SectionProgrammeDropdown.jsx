import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Plus, Search, Sparkles, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export function SectionProgrammeDropdown({
  groupTitle,
  items = [],
  selectedSlugs = [],
  onToggle,
  onAddCustom,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customInput, setCustomInput] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  // Filter items in this section
  const query = search.trim().toLowerCase();
  const filteredItems = items.filter((p) => p.item.toLowerCase().includes(query));

  // Check if current search query is a new unique custom entry
  const hasExactMatch = items.some((p) => p.item.toLowerCase() === query);
  const canAddFromSearch = query.length >= 2 && !hasExactMatch;

  const handleAdd = (name) => {
    const val = name.trim();
    if (!val) return;
    onAddCustom(groupTitle, val);
    setSearch('');
    setCustomInput('');
  };

  // Selected items that belong to this section
  const selectedInThisGroup = items.filter((p) => selectedSlugs.includes(p.slug));

  return (
    <div ref={containerRef} className="rounded-xl border border-line bg-paper/60 p-4 transition-all">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-caption font-bold uppercase tracking-wider text-slate-700">
            {groupTitle}
          </span>
          {selectedInThisGroup.length > 0 && (
            <span className="rounded-full bg-azure-50 px-2.5 py-0.5 text-caption font-bold text-azure-700">
              {selectedInThisGroup.length} selected
            </span>
          )}
        </div>
        {selectedInThisGroup.length > 0 && (
          <button
            type="button"
            onClick={() => {
              selectedInThisGroup.forEach((p) => onToggle(p.slug));
            }}
            className="text-caption text-slate-500 hover:text-danger hover:underline"
          >
            Clear section
          </button>
        )}
      </div>

      {/* Dropdown Trigger */}
      <div className="relative mt-3">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(
            'flex w-full items-center justify-between gap-3 rounded-lg border bg-white px-3.5 py-2.5 text-left text-small font-medium transition-all shadow-xs',
            open
              ? 'border-azure-500 ring-2 ring-azure-100'
              : 'border-line hover:border-azure-300'
          )}
        >
          <span className="truncate text-slate-600">
            {selectedInThisGroup.length === 0
              ? `Select or add options for ${groupTitle}...`
              : `${selectedInThisGroup.length} option${selectedInThisGroup.length === 1 ? '' : 's'} selected`}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200',
              open && 'rotate-180 text-azure-600'
            )}
            aria-hidden
          />
        </button>

        {/* Dropdown Menu Panel */}
        {open && (
          <div className="absolute left-0 right-0 top-full z-30 mt-1.5 rounded-xl border border-line bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            {/* Search Input */}
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (canAddFromSearch) {
                      handleAdd(search);
                    }
                  }
                }}
                placeholder={`Search or type custom ${groupTitle.toLowerCase()}...`}
                className="w-full rounded-md border border-line bg-slate-50 py-1.5 pl-8 pr-7 text-small text-ink placeholder:text-slate-400 focus:border-azure-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-azure-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Quick Add From Search button */}
            {canAddFromSearch && (
              <button
                type="button"
                onClick={() => handleAdd(search)}
                className="mb-2 flex w-full items-center justify-between gap-2 rounded-lg border border-dashed border-azure-300 bg-azure-50/70 px-3 py-2 text-left text-small font-semibold text-azure-700 transition-colors hover:bg-azure-100"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Plus className="h-4 w-4 shrink-0" aria-hidden />
                  Add custom: &ldquo;{search.trim()}&rdquo;
                </span>
                <span className="shrink-0 rounded bg-azure-200/80 px-1.5 py-0.5 text-caption font-bold text-azure-800">
                  Enter ↵
                </span>
              </button>
            )}

            {/* Options List */}
            <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1" role="listbox">
              {filteredItems.length === 0 && !canAddFromSearch ? (
                <div className="py-4 text-center text-small text-slate-500">
                  No matching options found.
                </div>
              ) : (
                filteredItems.map((p) => {
                  const on = selectedSlugs.includes(p.slug);
                  return (
                    <button
                      key={p.slug}
                      type="button"
                      role="option"
                      aria-selected={on}
                      onClick={() => onToggle(p.slug)}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-small transition-colors',
                        on
                          ? 'bg-azure-50 font-semibold text-azure-800'
                          : 'text-slate-700 hover:bg-slate-100'
                      )}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span
                          className={cn(
                            'grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors',
                            on
                              ? 'border-azure-600 bg-azure-600 text-white'
                              : 'border-slate-300 bg-white'
                          )}
                        >
                          {on && <Check className="h-3 w-3 stroke-[3]" />}
                        </span>
                        <span className="truncate">{p.item}</span>
                      </span>

                      {p.isCustom && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-700">
                          <Sparkles className="h-2.5 w-2.5" />
                          Custom
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Custom Entry Addition Bar */}
            <div className="mt-2 border-t border-line pt-2">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAdd(customInput);
                    }
                  }}
                  placeholder="Type custom entry name..."
                  className="flex-1 rounded-md border border-line bg-white px-2.5 py-1.5 text-small placeholder:text-slate-400 focus:border-azure-500 focus:outline-none focus:ring-1 focus:ring-azure-500"
                />
                <button
                  type="button"
                  disabled={!customInput.trim()}
                  onClick={() => handleAdd(customInput)}
                  className="inline-flex items-center gap-1 rounded-md bg-azure-600 px-3 py-1.5 text-small font-semibold text-white transition-colors hover:bg-azure-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Items Tags / Pills Display */}
      {selectedInThisGroup.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {selectedInThisGroup.map((p) => (
            <span
              key={p.slug}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-caption font-medium transition-colors',
                p.isCustom
                  ? 'border-amber-300 bg-amber-50 text-amber-900'
                  : 'border-azure-200 bg-azure-50 text-azure-900'
              )}
            >
              <span>{p.item}</span>
              {p.isCustom && (
                <span className="text-[10px] font-bold text-amber-600">(Custom)</span>
              )}
              <button
                type="button"
                onClick={() => onToggle(p.slug)}
                aria-label={`Remove ${p.item}`}
                className="grid h-3.5 w-3.5 place-items-center rounded-full text-slate-400 transition-colors hover:bg-black/10 hover:text-slate-700"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
