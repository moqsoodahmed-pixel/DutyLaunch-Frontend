import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, X } from 'lucide-react';

/* Dismissible top "trending" bar — the strip the reference site runs above
   its navbar. Remembers dismissal per-browser so it does not nag on every
   visit. Purely additive: it renders above <Navbar/> and scrolls away, so
   the sticky navbar behaviour underneath is unchanged. */
const KEY = 'dl.announcement.dismissed.v1';

export function AnnouncementBar() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        try {
            setOpen(localStorage.getItem(KEY) !== '1');
        } catch {
            setOpen(true);
        }
    }, []);

    if (!open) return null;

    const dismiss = () => {
        setOpen(false);
        try {
            localStorage.setItem(KEY, '1');
        } catch {
            /* private mode — bar just re-appears next load, which is fine */
        }
    };

    return (
        <div id="announcement-bar" className="relative z-40 bg-mist-base border-b border-mist-line text-ink print:hidden">
            <div className="mx-auto flex max-w-shell items-center justify-center gap-1.5 px-3 pr-10 sm:px-gutter sm:pr-12 py-2 text-small">
                <Zap className="hidden h-4 w-4 shrink-0 text-azure sm:block" aria-hidden />
                {/* The CTA link must never be the part that gets clipped — only the
                    descriptive text truncates, and it shortens first on narrow
                    screens, so "Check yours →" is always visible. */}
                <span className="min-w-0 truncate">
                    <span className="font-semibold">New:</span>{' '}
                    <span className="hidden sm:inline">Free AI Resume Health score, see what recruiters and the ATS see.</span>
                    <span className="sm:hidden">Free AI Resume Health score.</span>
                </span>
                <Link
                    to="/resume-checker"
                    className="shrink-0 font-bold text-azure-700 underline underline-offset-4 hover:underline"
                >
                    Check yours →
                </Link>
            </div>
            <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss announcement"
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-slate-600 transition hover:bg-white hover:text-ink"
            >
                <X className="h-4 w-4" aria-hidden />
            </button>
        </div>
    );
}