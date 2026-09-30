import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { searchSite } from '../../data/searchIndex.js';

/**
 * Minimal iOS/macOS Spotlight-inspired search.
 * Interactive search button, precise website routing, smooth section scrolling,
 * and mobile/tablet responsive layout.
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
    if (!entry) return;
    onClose?.();

    if (entry.path.startsWith('http')) {
      window.location.href = entry.path;
      return;
    }

    if (entry.path.includes('#')) {
      const [route, hash] = entry.path.split('#');
      navigate(route || '/');
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
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
        go({ path: '/ai-resume-builder' });
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
    <div className="fixed inset-0 z-[120] flex items-start justify-center px-3 sm:px-4 pt-16 sm:pt-[4.5rem]">
      {/* Translucent backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        className="fixed inset-0 bg-ink-950/40 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Spotlight pill */}
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ duration: 0.18, ease: [0.16, 0.84, 0.44, 1] }}
        className="relative z-10 w-full max-w-lg"
        role="dialog"
        aria-label="Search DutyLaunch"
      >
        {/* Search input form */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2.5 sm:gap-3 rounded-full border border-white/85 bg-white/95 px-3 sm:px-4 py-2.5 shadow-[0_20px_60px_-12px_rgba(15,28,46,0.28),0_8px_24px_-8px_rgba(79,193,230,0.25)] backdrop-blur-2xl"
        >
          <button
            type="submit"
            aria-label="Execute search"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-r from-azure to-cyan-500 text-white shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Search className="h-4 w-4" aria-hidden />
          </button>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search resumes, jobs, templates, services..."
            className="h-7 min-w-0 flex-1 bg-transparent text-small sm:text-body font-medium text-ink outline-none placeholder:text-slate-400"
            aria-label="Search the site"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-200/80 text-slate-500 transition-colors hover:bg-slate-300/80 hover:text-ink cursor-pointer"
              aria-label="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block shrink-0 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
              ESC
            </kbd>
          )}
        </form>

        {/* Results dropdown — only shown when query exists */}
        {q && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.14, ease: [0.16, 0.84, 0.44, 1] }}
            className="mt-2 overflow-hidden rounded-2xl border border-white/85 bg-white/95 shadow-[0_24px_60px_-12px_rgba(15,28,46,0.2)] backdrop-blur-2xl"
          >
            <ul className="max-h-72 overflow-y-auto p-2">
              {results.map((r, i) => (
                <li key={r.path}>
                  <button
                    type="button"
                    data-idx={i}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-100 cursor-pointer ${
                      i === active
                        ? 'bg-gradient-to-r from-frost-50 via-azure-50/50 to-white border border-frost-200/80'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-small font-bold text-ink">{r.title}</span>
                      {r.description && (
                        <span className="block truncate text-caption text-slate-500">{r.description}</span>
                      )}
                    </span>
                    <span className="shrink-0 rounded-full bg-azure-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-azure-700">
                      {r.group}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* No results */}
        {q && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.14 }}
            className="mt-2 rounded-2xl border border-white/85 bg-white/95 px-5 py-4 text-center backdrop-blur-2xl shadow-[0_24px_60px_-12px_rgba(15,28,46,0.15)]"
          >
            <p className="text-small font-semibold text-ink">No exact match for &ldquo;{query}&rdquo;</p>
            <p className="mt-1 text-caption text-slate-500">
              Press Enter or click the Search button to view matching resources.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}