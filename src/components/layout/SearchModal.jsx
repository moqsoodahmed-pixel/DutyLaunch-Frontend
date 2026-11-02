import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { searchSite } from '../../data/searchIndex.js';
import { cn } from '../../utils/cn.js';

const POPULAR_SHORTCUTS = [
  { title: 'Resume Checker', path: '/resume-checker', group: 'Career+' },
  { title: 'Resume Builder', path: '/resume-builder', group: 'Career+' },
  { title: 'CV Templates', path: '/cv-templates', group: 'Career+' },
  { title: 'Dubai Launch', path: '/dubai-launch', group: 'Global mobility' },
  { title: 'Jobs', path: '/jobs', group: 'Jobs' },
  { title: 'Apostille & Attestation', path: '/apostille-services', group: 'Documentation' },
  { title: 'Higher Education', path: '/higher-education', group: 'Education' },
];

/**
 * Modern Spotlight / Command Palette search modal.
 * Clean elevated card layout, no rectangular input outlines,
 * dedicated X close/cancel button, and quick navigation shortcuts.
 */
export function SearchModal({ onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const q = query.trim();
  const results = useMemo(() => (q ? searchSite(query) : []), [q, query]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => setActive(0), [query]);

  const go = (entry) => {
    if (!entry || !entry.path) return;
    onClose?.();

    if (entry.path.startsWith('http')) {
      window.location.href = entry.path;
      return;
    }

    if (entry.path.includes('#')) {
      const [, hash] = entry.path.split('#');
      navigate(entry.path);

      const scrollToTarget = () => {
        if (!hash) return false;
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return true;
        }
        return false;
      };

      if (!scrollToTarget()) {
        setTimeout(scrollToTarget, 100);
        setTimeout(scrollToTarget, 300);
        setTimeout(scrollToTarget, 600);
      }
      return;
    }

    navigate(entry.path);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (results.length > 0) {
      go(results[active] || results[0]);
    } else if (q) {
      const queryLower = q.toLowerCase();
      if (queryLower.includes('template') || queryLower.includes('cv')) {
        go({ path: '/cv-templates' });
      } else if (queryLower.includes('ai') || queryLower.includes('builder')) {
        go({ path: '/resume-builder' });
      } else if (queryLower.includes('check') || queryLower.includes('score') || queryLower.includes('ats')) {
        go({ path: '/resume-checker' });
      } else if (queryLower.includes('job')) {
        go({ path: '/jobs' });
      } else if (queryLower.includes('price') || queryLower.includes('cost')) {
        go({ path: '/pricing' });
      } else if (queryLower.includes('dubai')) {
        go({ path: '/dubai-launch' });
      } else if (queryLower.includes('course')) {
        go({ path: '/courses' });
      } else if (queryLower.includes('contact')) {
        go({ path: '/contact' });
      } else {
        go({ path: `/?q=${encodeURIComponent(q)}` });
      }
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length > 0) setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length > 0) setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center px-4 pt-20 sm:pt-28">
      {/* Translucent backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Spotlight modal card */}
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.16, 0.84, 0.44, 1] }}
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_25px_70px_-12px_rgba(15,28,46,0.35),0_0_0_1px_rgba(15,28,46,0.05)]"
        role="dialog"
        aria-label="Search DutyLaunch"
      >
        {/* Search input header */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4 transition-colors"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-azure-50 text-azure-600">
            <Search className="h-5 w-5" aria-hidden />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search resumes, jobs, templates, services..."
            className="h-10 min-w-0 flex-1 bg-transparent text-[15px] sm:text-base font-medium text-ink placeholder:text-slate-400 border-none outline-none ring-0 shadow-none !ring-0 !outline-none !shadow-none focus:!ring-0 focus:!outline-none focus-visible:!ring-0 focus-visible:!outline-none"
            aria-label="Search the site"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              title="Clear search"
              aria-label="Clear search"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Explicit X button to cancel / close search bar */}
          <button
            type="button"
            onClick={onClose}
            title="Cancel search"
            aria-label="Close search"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-ink active:scale-95 transition-all cursor-pointer shadow-2xs"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </form>

        {/* Popular / Suggested Shortcuts when query is empty */}
        {!q && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3.5 sm:px-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Popular Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SHORTCUTS.map((s) => (
                <button
                  key={s.path}
                  type="button"
                  onClick={() => go(s)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 text-caption font-semibold text-slate-700 shadow-2xs hover:border-azure-300 hover:bg-azure-50/60 hover:text-azure-700 transition-all cursor-pointer"
                >
                  <Search className="h-3 w-3 text-slate-400" />
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results dropdown — when query exists */}
        {q && results.length > 0 && (
          <div className="border-t border-slate-100 max-h-80 overflow-y-auto p-2 bg-white">
            <ul className="space-y-0.5">
              {results.map((r, i) => (
                <li key={r.path}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(r)}
                    className={cn(
                      'flex w-full items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-left transition-all duration-150 cursor-pointer',
                      i === active
                        ? 'bg-gradient-to-r from-frost-50 via-azure-50/60 to-white border border-frost-200/80 shadow-2xs'
                        : 'hover:bg-slate-50 border border-transparent'
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors',
                        i === active ? 'bg-azure-100/70 text-azure-700' : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      <Search className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-small font-bold text-ink">{r.title}</span>
                      {r.description && (
                        <span className="block truncate text-caption text-slate-500">{r.description}</span>
                      )}
                    </span>
                    <span className="shrink-0 rounded-full bg-azure-50 border border-azure-200/70 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-azure-700">
                      {r.group}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* No results state */}
        {q && results.length === 0 && (
          <div className="border-t border-slate-100 px-6 py-8 text-center bg-white">
            <p className="text-small font-semibold text-ink">No exact match for &ldquo;{query}&rdquo;</p>
            <p className="mt-1 text-caption text-slate-500">
              Press Enter to search site or try searching for &ldquo;Resume&rdquo;, &ldquo;Dubai&rdquo;, &ldquo;Jobs&rdquo;, or &ldquo;Courses&rdquo;.
            </p>
          </div>
        )}

        {/* Bottom helper footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2 sm:px-5 text-[12px] text-slate-500">
          <span>
            Press <kbd className="rounded bg-white px-1.5 py-0.5 font-semibold text-slate-600 shadow-2xs border border-slate-200">Enter</kbd> to select
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-azure-700 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            <span>Click to cancel</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
