import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Compass, ShieldCheck, Sparkles } from 'lucide-react';
import { Logo } from '../components/layout/Logo.jsx';

const VALUE_POINTS = [
  { icon: Sparkles, text: 'Build a stronger professional profile' },
  { icon: Compass, text: 'Discover relevant career opportunities' },
  { icon: BadgeCheck, text: 'Learn and grow with the right resources' },
];

/**
 * Shared shell for /login, /register and /forgot-password. Left column is a
 * genuine reason to hold an account, not decoration, and collapses into a
 * compact strip on mobile rather than disappearing outright — the trust
 * signal still matters on a phone, it just costs less vertical space there.
 */
export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-gutter py-6 sm:py-10">
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          <Logo />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-caption font-semibold text-slate-500 transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back to website
          </Link>
        </div>

        <main id="main" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8 sm:py-10">
          <Outlet />
        </main>

        <p className="mx-auto w-full max-w-md text-caption text-slate-500">
          <Link to="/privacy-policy" className="hover:text-ink">
            Privacy policy
          </Link>
          <span className="px-2 text-slate-300">·</span>
          <Link to="/terms" className="hover:text-ink">
            Terms
          </Link>
        </p>
      </div>

      <aside className="relative hidden overflow-hidden bg-ink-900 px-12 py-16 text-white lg:flex lg:flex-col">
        {/* Faint grid + radial mask, same treatment used on the dark marketing
            surfaces — kept subtle deliberately, per brief: no heavy parallax
            or oversized illustration, just enough texture to not read flat. */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 70% 30%, #000 10%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 70% 30%, #000 10%, transparent 70%)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-azure-400/20 blur-3xl"
          aria-hidden
        />

        {/* Content sits in the upper-middle of the panel rather than being
            mathematically centered — true vertical centering pulled the
            heading down because the footnote below it added extra height
            to the centered block. Pinning the footnote to the bottom with
            mt-auto keeps this block's start position stable regardless of
            how much copy it holds. */}
        <div className="relative mt-[8vh] max-w-md xl:mt-[10vh]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-caption font-semibold text-azure-200">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Trusted by job seekers across India &amp; the Gulf
          </span>

          <h2 className="mt-6 text-h1 font-extrabold leading-[1.08] text-white">
            Your career journey starts here.
          </h2>
          <p className="mt-4 text-body text-slate-300">
            DutyLaunch helps you build a professional profile, discover the right opportunities and learn the
            skills that move your career forward — all from one account.
          </p>

          <ul className="mt-9 space-y-4">
            {VALUE_POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-azure-400/15">
                  <Icon className="h-4 w-4 text-azure-200" aria-hidden />
                </span>
                <span className="pt-1 text-body text-slate-200">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-auto max-w-md border-t border-white/10 pt-6 text-small text-slate-400">
          Accounts are free. Career services and courses are paid separately and never charged automatically.
        </p>
      </aside>
    </div>
  );
}