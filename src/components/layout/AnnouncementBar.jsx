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
        <div id="announcement-bar" className="relative z-40 bg-gradient-to-r from-ink-900 via-ink-800 to-ink-700 text-white print:hidden">
            <div className="mx-auto flex max-w-shell items-center justify-center gap-2 px-gutter py-2 text-small">
                <Zap className="hidden h-4 w-4 shrink-0 text-frost-400 sm:block" aria-hidden />
                <p className="min-w-0 truncate text-center">
                    <span className="font-semibold">New:</span> Free AI Resume Health score — see what recruiters and the ATS see.{' '}
                    <Link to="/resume-checker" className="font-bold text-frost-300 underline-offset-4 hover:underline">
                        Check yours →
                    </Link>
                </p>
            </div>
            <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss announcement"
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
            >
                <X className="h-4 w-4" aria-hidden />
            </button>
        </div>
    );
}