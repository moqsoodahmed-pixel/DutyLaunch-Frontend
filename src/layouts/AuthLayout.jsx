import { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { PageFallback } from '../components/ui/PageFallback.jsx';
import { company, legalLinks } from '../data/legal.js';
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Cpu,
  Globe,
  Lock,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { Logo } from '../components/layout/Logo.jsx';
import { images } from '../data/images.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';

export default function AuthLayout() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] lg:grid lg:grid-cols-12">
      {/* ── LEFT COLUMN: AUTHENTICATION FORM ── */}
      <div className="relative flex flex-col justify-between px-5 py-6 sm:px-10 sm:py-8 lg:col-span-6 lg:px-10 xl:col-span-7 xl:px-14">
        {/* Subtle decorative background ambient blooms */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 right-10 h-80 w-80 rounded-full bg-azure-400/10 blur-3xl" />
          <div
            className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] opacity-50"
            aria-hidden="true"
          />
        </div>

        {/* Top Header Bar */}
        <header className="relative z-10 mx-auto flex w-full max-w-[480px] items-center justify-between">
          <Logo height={32} />
          <Link
            to="/"
            className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/90 px-3.5 py-1.5 text-caption font-semibold text-slate-600 shadow-xs backdrop-blur-md transition-all duration-200 hover:border-azure-300 hover:bg-white hover:text-azure-600 hover:shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1" aria-hidden="true" />
            <span>Back to website</span>
          </Link>
        </header>

        {/* Main Interactive Form Card */}
        <main id="main" className="relative z-10 mx-auto my-auto flex w-full max-w-[480px] flex-1 flex-col justify-center py-6 sm:py-8">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-7 shadow-[0_20px_50px_-12px_rgba(15,28,46,0.09),0_2px_8px_rgba(15,28,46,0.03)] ring-1 ring-slate-900/[0.03] backdrop-blur-xl sm:p-9">
            {/* Top glowing specular highlight line */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
              aria-hidden="true"
            />
            <Suspense fallback={<PageFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </main>

        {/* Footer & Compliance Assurance */}
        <footer className="relative z-10 mx-auto w-full max-w-[480px] pt-4 text-caption text-slate-500">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {legalLinks.map((l, index) => (
              <span key={l.path} className="flex items-center gap-3">
                <Link to={l.path} className="transition-colors hover:text-azure-600 hover:underline">
                  {l.label}
                </Link>
                {index < legalLinks.length - 1 && (
                  <span className="text-slate-300" aria-hidden="true">
                    ·
                  </span>
                )}
              </span>
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] leading-relaxed text-slate-400">
            <span>Operated by {company.legalName} (CIN: {company.cin})</span>
            <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
              <Lock className="h-3 w-3 text-emerald-600" aria-hidden="true" />
              256-Bit SSL · DPDP Act 2023
            </span>
          </div>
        </footer>
      </div>

      {/* ── RIGHT COLUMN: EXECUTIVE SHOWCASE PANEL ── */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#060D1F] via-[#0A1B3B] to-[#040A17] p-10 text-white lg:col-span-6 lg:flex lg:flex-col lg:justify-between xl:col-span-5 xl:p-14">
        {/* City Bokeh / Night background overlay */}
        {isDesktop && (
          <img
            src={images.authBackground.src}
            width={images.authBackground.width}
            height={images.authBackground.height}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-screen"
          />
        )}

        {/* Ambient Gradient Glows */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl animate-pulse"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-azure-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-1/3 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl"
          aria-hidden="true"
        />

        {/* Subtle Modern Grid Pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #38BDF8 1px, transparent 1px), linear-gradient(to bottom, #38BDF8 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
          aria-hidden="true"
        />

        {/* Top Header Section */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-semibold text-sky-200 backdrop-blur-md shadow-[0_0_20px_rgba(56,189,248,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            Official Career &amp; Mobility Gateway · UAE &amp; India
          </div>

          <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white xl:text-4xl">
            Accelerate your career <br />
            <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              without borders.
            </span>
          </h2>
          <p className="mt-3.5 text-[14.5px] leading-relaxed text-slate-300">
            DutyLaunch connects ambitious professionals with verified corporate opportunities across Dubai, Abu Dhabi,
            and India, powered by enterprise AI resume intelligence and relocation support.
          </p>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 my-7 space-y-3">
          <div className="group rounded-2xl border border-white/10 bg-white/[0.05] p-3.5 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/[0.08] hover:-translate-y-0.5">
            <div className="flex items-start gap-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/30 transition-transform group-hover:scale-105">
                <Globe className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-small font-bold text-white">Cross-Border Career Pathways</h3>
                <p className="mt-0.5 text-caption leading-relaxed text-slate-300">
                  Direct access to vetted corporate roles across Dubai, Abu Dhabi, and Bangalore with visa sponsorship.
                </p>
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-white/10 bg-white/[0.05] p-3.5 backdrop-blur-md transition-all duration-300 hover:border-sky-400/30 hover:bg-white/[0.08] hover:-translate-y-0.5">
            <div className="flex items-start gap-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-azure-500/25 text-sky-300 ring-1 ring-sky-400/30 transition-transform group-hover:scale-105">
                <Cpu className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-small font-bold text-white">Enterprise ATS Resume Intelligence</h3>
                <p className="mt-0.5 text-caption leading-relaxed text-slate-300">
                  Calibrated for Taleo, Workday, and Greenhouse to maximize interview callbacks with instant score feedback.
                </p>
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-white/10 bg-white/[0.05] p-3.5 backdrop-blur-md transition-all duration-300 hover:border-indigo-400/30 hover:bg-white/[0.08] hover:-translate-y-0.5">
            <div className="flex items-start gap-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500/25 text-indigo-300 ring-1 ring-indigo-400/30 transition-transform group-hover:scale-105">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-small font-bold text-white">45+ Verified Hiring &amp; Education Partners</h3>
                <p className="mt-0.5 text-caption leading-relaxed text-slate-300">
                  Direct recruitment pipelines with recognized multinational employers and accredited university partners.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Placement Proof Card */}
        <div className="relative z-10 mb-6 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.3)] transition-all hover:border-white/25 hover:bg-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 to-azure-600 text-xs font-extrabold text-white shadow-md">
                RS
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <span>Rohan S.</span>
                  <BadgeCheck className="h-3.5 w-3.5 text-cyan-400" aria-label="Verified user" />
                </div>
                <div className="text-[11px] text-slate-300">Lead Systems Engineer · Relocated to Dubai</div>
              </div>
            </div>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
              Verified Placement
            </span>
          </div>
          <p className="mt-2 text-caption italic text-slate-300 leading-relaxed">
            &ldquo;DutyLaunch optimized my ATS score from 58% to 94%. Within 3 weeks I had multiple verified interviews in DIFC.&rdquo;
          </p>
          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
            ))}
            <span className="ml-1 text-[10px] font-medium text-slate-400">Verified Review</span>
          </div>
        </div>

        {/* Trust Proof Metrics */}
        <div className="relative z-10 grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md">
          <div className="text-center">
            <div className="text-lg font-extrabold text-white">250+</div>
            <div className="text-[11px] font-medium text-slate-400">Active Talent</div>
          </div>
          <div className="border-x border-white/10 text-center">
            <div className="text-lg font-extrabold text-cyan-300">94%</div>
            <div className="text-[11px] font-medium text-slate-400">ATS Pass Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-extrabold text-white">45+</div>
            <div className="text-[11px] font-medium text-slate-400">Hiring Partners</div>
          </div>
        </div>

        {/* Bottom Trust Assurance */}
        <div className="relative z-10 mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
            Candidate accounts free forever
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
            DPDP Act 2023 Compliant
          </span>
        </div>
      </aside>
    </div>
  );
}