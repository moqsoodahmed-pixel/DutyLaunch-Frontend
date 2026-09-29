import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CornerDownLeft, Search } from 'lucide-react';
import { searchSite } from '../../data/searchIndex.js';

/**
 * Compact in-site search — a popover anchored under the navbar search icon.
 * Shows ONLY the input until the user types; results appear on input (like the
 * reference). Presentational: the navbar renders it while open and owns close
 * on outside-click / Esc / navigation. Keyboard: ↑/↓ move, ↵ open, Esc close.
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
        const t = setTimeout(() => inputRef.current?.focus(), 20);
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
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
        else if (e.key === 'Enter') { e.preventDefault(); go(results[active]); }
        else if (e.key === 'Escape') { e.preventDefault(); onClose?.(); }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.16 }}
            role="dialog"
            aria-label="Search DutyLaunch"
            className="absolute right-0 top-full z-[80] mt-2 flex max-h-[70vh] w-[min(30rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-crystal-lg backdrop-blur-2xl"
        >
            <div className="flex shrink-0 items-center gap-2.5 px-3.5">
                <Search className="h-4.5 w-4.5 shrink-0 text-azure" aria-hidden />
                <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Search resume, jobs, apostille, courses…"
                    className="h-12 w-full bg-transparent text-small text-ink outline-none placeholder:text-slate-400"
                    aria-label="Search the site"
                />
            </div>

            {/* Results appear ONLY while typing. */}
            {q && (
                <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto border-t border-glacier-300 p-1.5">
                    {results.length === 0 ? (
                        <p className="px-3 py-6 text-center text-small text-slate-500">
                            No matches. Try &ldquo;resume&rdquo;, &ldquo;jobs&rdquo; or &ldquo;apostille&rdquo;.
                        </p>
                    ) : (
                        <ul className="grid gap-0.5">
                            {results.map((r, i) => (
                                <li key={r.path}>
                                    <button
                                        type="button"
                                        data-idx={i}
                                        onMouseEnter={() => setActive(i)}
                                        onClick={() => go(r)}
                                        className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${i === active ? 'bg-glacier-200' : 'hover:bg-glacier-100'
                                            }`}
                                    >
                                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-frost-400 to-aurora-500 text-white shadow-crystal">
                                            <Search className="h-3.5 w-3.5" aria-hidden />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center gap-2">
                                                <span className="truncate text-small font-bold text-ink">{r.title}</span>
                                                <span className="shrink-0 rounded-full bg-azure-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-azure-700">
                                                    {r.group}
                                                </span>
                                            </span>
                                            {r.description && <span className="mt-0.5 block truncate text-caption text-slate-500">{r.description}</span>}
                                        </span>
                                        {i === active && <CornerDownLeft className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </motion.div>
    );
}