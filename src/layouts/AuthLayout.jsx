import { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { PageFallback } from '../components/ui/PageFallback.jsx';
import { company, legalLinks } from '../data/legal.js';
import { ArrowLeft, BadgeCheck, Compass, ShieldCheck, Sparkles } from 'lucide-react';
import { Logo } from '../components/layout/Logo.jsx';
import { images } from '../data/images.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';

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
  // The photo panel only exists from lg up; not rendering the <img> below
  // that means phones never download it (display:none alone does not stop
  // the request, even with loading="lazy").
  const isDesktop = useMediaQuery('(min-width: 1024px)');
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
          <div className="relative overflow-hidden rounded-3xl p-[1.5px] shadow-crystal">
            {/* Continuous travelling border glow */}
            <div
              className="pointer-events-none absolute -inset-[200%] animate-edge-orbit opacity-60"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg, transparent 260deg, #4FC1E6 295deg, #7DD3EF 325deg, #A98CEA 345deg, #FDF3E2 355deg, rgba(255,255,255,1) 358deg, transparent 360deg)',
              }}
              aria-hidden="true"
            />
            <div className="relative rounded-[22.5px] border border-white/80 bg-white/95 p-7 sm:p-9 shadow-sm backdrop-blur-xl">
              <Suspense fallback={<PageFallback />}>
                <Outlet />
              </Suspense>
            </div>
          </div>
        </main>

        {/* Sign-in pages have no main footer, so the compliance links and
            the operating entity are repeated here. */}
        <div className="mx-auto w-full max-w-md text-caption text-slate-500">
          <p className="flex flex-wrap gap-x-3 gap-y-1">
            {legalLinks.map((l) => (
              <Link key={l.path} to={l.path} className="hover:text-ink">
                {l.label}
              </Link>
            ))}
          </p>
          <p className="mt-2 leading-relaxed text-slate-400">
            Operated by {company.legalName} (CIN: {company.cin}).
          </p>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden bg-night-base px-12 py-16 text-white lg:flex lg:flex-col">
        {/* Blurred city-lights photo as a faint base layer, under the grid and
            glow. The navy gradient on top keeps the white copy at full
            contrast. loading="lazy" matters here: this panel is display:none
            below lg — the <img> is only rendered on desktop so phones never
            download it (a lazy image inside display:none is still fetched). */}
        {isDesktop && (
        <img
          src={images.authBackground.src}
          width={images.authBackground.width}
          height={images.authBackground.height}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-45"
        />
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/80"
          aria-hidden
        />
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
            Empowering professionals across India &amp; UAE
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