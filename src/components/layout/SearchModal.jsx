import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CornerDownLeft, Search, X, Sparkles, ArrowRight } from 'lucide-react';
import { searchSite } from '../../data/searchIndex.js';

const QUICK_LINKS = [
  { title: 'Resume Checker', path: '/resume-checker', group: 'Career Tools', tag: 'FREE' },
  { title: 'AI Resume Builder', path: '/ai-resume-builder', group: 'Career Tools', tag: 'AI' },
  { title: 'CV Templates', path: '/cv-templates', group: 'Career Tools', tag: '5 Flagships' },
  { title: 'Jobs Search', path: '/jobs', group: 'Jobs', tag: 'Live Roles' },
  { title: 'Dubai Launch', path: '/dubai-launch', group: 'Global Mobility', tag: 'Gulf Jobs' },
  { title: 'Apostille & Attestation', path: '/appostle-services', group: 'Documentation', tag: 'Verified' },
];

/**
 * Centered Command Palette Search Modal.
 * Opens as a focused, elegant crystal modal with translucent backdrop.
 * Never clips or distorts the navigation bar.
 * Supports keyboard navigation: ↑/↓ to move, ↵ to open, Esc to close.
 */
export function SearchModal({ onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const q = query.trim();
  const results = useMemo(() => (q ? searchSite(query) : []), [q, query]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const go = (entry) => {
    if (!entry) return;
    onClose?.();
    navigate(entry.path);
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
      if (results[active]) go(results[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center p-4 pt-20 sm:pt-28">
      {/* Translucent Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-ink-950/45 backdrop-blur-md"
        aria-hidden="true"
      />

      {/* Centered Command Palette Card */}
      <motion.div
        initial={{ opacity: 0, y: -14, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.96 }}
        transition={{ duration: 0.18, ease: [0.16, 0.84, 0.44, 1] }}
        role="dialog"
        aria-label="Search DutyLaunch"
        className="relative z-10 flex max-h-[75vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-crystal-2xl backdrop-blur-2xl"
      >
        {/* Search Header Bar */}
        <div className="flex shrink-0 items-center gap-3 border-b border-glacier-200/80 px-4 py-3 sm:px-5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-azure-50 text-azure">
            <Search className="h-4.5 w-4.5" aria-hidden />
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search resume, jobs, apostille, courses…"
            className="h-10 w-full bg-transparent text-body font-medium text-ink outline-none placeholder:text-slate-400"
            aria-label="Search the site"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-ink"
              aria-label="Clear search query"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 sm:inline-block">
              ESC
            </kbd>
          )}
          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-ink sm:hidden"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Area */}
        <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          {!q ? (
            <div>
              <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Popular Quick Links
              </p>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {QUICK_LINKS.map((link) => (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => go(link)}
                    className="group flex items-center justify-between rounded-xl border border-transparent bg-glacier-50/70 p-3 text-left transition-all duration-200 hover:scale-[1.01] hover:border-frost-300 hover:bg-white hover:shadow-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="block text-small font-bold text-ink group-hover:text-azure">
                        {link.title}
                      </span>
                      <span className="block text-caption text-slate-500">
                        {link.group}
                      </span>
                    </div>
                    <span className="shrink-0 rounded-full bg-azure-50 px-2 py-0.5 text-[10px] font-bold text-azure-700">
                      {link.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-body font-semibold text-ink">No results found for &ldquo;{query}&rdquo;</p>
              <p className="mt-1 text-small text-slate-500">
                Try searching for keywords like &ldquo;resume&rdquo;, &ldquo;jobs&rdquo;, &ldquo;templates&rdquo;, or &ldquo;dubai&rdquo;.
              </p>
            </div>
          ) : (
            <div>
              <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {results.length} Search Result{results.length === 1 ? '' : 's'}
              </p>
              <ul className="grid gap-1">
                {results.map((r, i) => (
                  <li key={r.path}>
                    <button
                      type="button"
                      data-idx={i}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(r)}
                      className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-150 ${
                        i === active
                          ? 'border border-frost-300/80 bg-gradient-to-r from-frost-50 via-azure-50/40 to-white shadow-2xs'
                          : 'border border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-frost-400 to-aurora-500 text-white shadow-crystal">
                        <Search className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-small font-bold text-ink">{r.title}</span>
                          <span className="shrink-0 rounded-full bg-azure-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-azure-700">
                            {r.group}
                          </span>
                        </span>
                        {r.description && (
                          <span className="mt-0.5 block truncate text-caption text-slate-500">
                            {r.description}
                          </span>
                        )}
                      </span>
                      {i === active && (
                        <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-azure">
                          <span>Open</span>
                          <CornerDownLeft className="h-3.5 w-3.5" aria-hidden />
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-glacier-200/80 bg-glacier-50/60 px-4 py-2 text-[11px] text-slate-500">
          <span>Navigate with <kbd className="rounded bg-white px-1.5 py-0.5 font-semibold shadow-2xs">↑</kbd> <kbd className="rounded bg-white px-1.5 py-0.5 font-semibold shadow-2xs">↓</kbd></span>
          <span>Press <kbd className="rounded bg-white px-1.5 py-0.5 font-semibold shadow-2xs">↵ Enter</kbd> to select</span>
        </div>
      </motion.div>
    </div>
  );
}