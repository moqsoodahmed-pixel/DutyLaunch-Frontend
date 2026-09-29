import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Check, FileCheck2, Mail, Phone, Plane, ScanSearch, Zap,
} from 'lucide-react';
import { Container } from '../ui/Container.jsx';
import { GlacierBackdrop } from '../premium/GlacierBackdrop.jsx';
import { contact } from '../../data/site.js';

const ease = [0.16, 0.84, 0.44, 1];

/* The four headline actions, each a vivid gradient tile — the edrafter-style
   multi-CTA grid, mapped to DutyLaunch's real primary journeys and routes. */
const ACTIONS = [
  { to: '/resume-checker', label: 'Resume Checker', sub: 'Free Resume Health score', icon: ScanSearch, badge: 'FREE', grad: 'from-azure-500 to-azure-700' },
  { to: '/ai-resume-builder', label: 'AI Resume Builder', sub: 'Matched to a job description', icon: Zap, badge: 'AI', grad: 'from-aurora-500 to-violet-600' },
  { to: '/dubai-launch', label: 'Dubai Launch', sub: 'Jobs & relocation in the Gulf', icon: Plane, grad: 'from-frost-500 to-frost-600' },
  { to: '/appostle-services', label: 'Apostille & Attestation', sub: 'Documents, legalised & tracked', icon: FileCheck2, grad: 'from-ink-600 to-ink-800' },
];

/* Popular quick links — the chip row under the CTAs. */
const POPULAR = [
  { label: 'CV Templates', to: '/cv-templates' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Courses', to: '/courses' },
  { label: 'Higher Education', to: '/higher-education' },
  { label: 'Pricing', to: '/pricing' },
];

/* Side-card content: three journeys, each a 3-step "how it works" strip,
   switched by the tab pills — mirroring the reference's process card. */
const JOURNEYS = {
  career: {
    label: 'Career',
    steps: [
      ['Check your resume', 'Upload your CV for a free Resume Health score — no account needed.'],
      ['Fix what matters', 'See exactly what a recruiter and the ATS miss, and how to fix it.'],
      ['Apply with confidence', 'A targeted resume, cover letter and LinkedIn that tell one story.'],
    ],
  },
  education: {
    label: 'Education',
    steps: [
      ['Pick a direction', 'Free counselling on courses and study-abroad options that fit.'],
      ['Shortlist programmes', 'Matched to your budget, intake and the market you are targeting.'],
      ['Apply & fund', 'SOP, references, funding and the visa paperwork, in the right order.'],
    ],
  },
  global: {
    label: 'Global mobility',
    steps: [
      ['Get job-ready', 'CV distribution and interview prep for the Gulf job market.'],
      ['Sort the paperwork', 'Visa assistance, apostille and attestation, tracked end to end.'],
      ['Land & settle', 'Airport pickup, accommodation and arrival support in the UAE.'],
    ],
  },
};

export function Hero() {
  const [tab, setTab] = useState('career');
  const journey = JOURNEYS[tab];

  return (
    <section className="seam seam-tone-glacier relative overflow-hidden pb-16 pt-10 sm:pb-20 lg:pb-24 lg:pt-16">
      <GlacierBackdrop dense />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(15,28,46,.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,28,46,.05) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 30% 20%, #000 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 30% 20%, #000 20%, transparent 75%)',
        }}
        aria-hidden
      />

      <Container className="relative z-[1] grid items-center gap-10 xl:grid-cols-12 xl:gap-12">
        {/* ---------------- Left: copy + multi-CTA grid ---------------- */}
        <div className="xl:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="eyebrow"
          >
            <Zap className="h-3.5 w-3.5" aria-hidden />
            Career · Education · Global mobility · Documentation
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.06, ease }}
            className="mt-5 text-h1 font-extrabold leading-[1.05]"
          >
            Your <span className="text-azure-600">career</span>,{' '}
            <span className="text-aurora-500">qualification</span> and{' '}
            <span className="text-frost-600">paperwork</span>
            <span className="-mb-[0.14em] block bg-gradient-to-r from-frost-600 via-azure to-aurora-500 bg-clip-text pb-[0.14em] text-transparent">
              — one launchpad.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.14, ease }}
            className="mt-5 max-w-xl text-lead text-slate-600"
          >
            One team for <strong className="font-semibold text-ink">CV writing</strong>,{' '}
            <strong className="font-semibold text-ink">courses &amp; study abroad</strong>,{' '}
            <strong className="font-semibold text-ink">jobs</strong>, and{' '}
            <strong className="font-semibold text-ink">apostille &amp; attestation</strong> — serving
            candidates across <strong className="font-semibold text-ink">India and the Gulf</strong>.
          </motion.p>

          {/* Four vivid gradient action tiles */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease }}
            className="mt-7 grid gap-3 sm:grid-cols-2"
          >
            {ACTIONS.map(({ to, label, sub, icon: Icon, badge, grad }) => (
              <Link
                key={to}
                to={to}
                className={`group relative flex items-center gap-3.5 overflow-hidden rounded-2xl bg-gradient-to-br ${grad} p-4 text-white shadow-crystal ring-1 ring-inset ring-white/15 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.015] hover:brightness-[1.06] hover:shadow-crystal-lg hover:ring-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
              >
                {/* glass gloss */}
                <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" aria-hidden />
                <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="relative min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-body font-bold leading-tight">{label}</span>
                    {badge && (
                      <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
                        {badge}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-caption text-white/85">{sub}</span>
                </span>
                <ArrowRight className="relative h-4.5 w-4.5 shrink-0 text-white/80 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
              </Link>
            ))}
          </motion.div>

          {/* Popular quick links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center gap-2"
          >
            <span className="text-caption font-bold uppercase tracking-wider text-slate-500">Popular</span>
            {POPULAR.map((p) => (
              <Link
                key={p.to}
                to={p.to}
                className="rounded-full border border-white/70 bg-white/60 px-3.5 py-1.5 text-small font-semibold text-slate-700 shadow-frost-inset backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-frost-400 hover:text-ink hover:shadow-crystal"
              >
                {p.label}
              </Link>
            ))}
          </motion.div>
        </div>

        {/* ---------------- Right: glass process card ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18, ease }}
          className="xl:col-span-5"
        >
          <div className="glass-panel !p-5 sm:!p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-caption font-bold uppercase tracking-wider text-azure">
                <Check className="h-3.5 w-3.5" aria-hidden />
                How it works
              </p>
              <span className="rounded-full bg-azure-50 px-2.5 py-1 text-caption font-bold text-azure-700">
                Free to start
              </span>
            </div>

            {/* Tab pills */}
            <div className="mt-4 flex gap-1.5 rounded-full border border-glacier-300 bg-white/70 p-1 backdrop-blur">
              {Object.entries(JOURNEYS).map(([key, j]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  aria-pressed={tab === key}
                  className={`flex-1 rounded-full px-3 py-1.5 text-caption font-bold transition-all duration-200 ${tab === key
                      ? 'bg-gradient-to-r from-frost-500 to-aurora-500 text-white shadow-crystal'
                      : 'text-slate-600 hover:text-ink'
                    }`}
                >
                  {j.label}
                </button>
              ))}
            </div>

            {/* Numbered steps */}
            <ol className="mt-5 space-y-3.5">
              {journey.steps.map(([title, body], i) => (
                <li key={title} className="flex gap-3.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-azure-500 to-azure-700 text-small font-extrabold text-white shadow-blue">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-small font-bold text-ink">{title}</p>
                    <p className="mt-0.5 text-small text-slate-600">{body}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Contact chips */}
            <div className="mt-5 flex flex-wrap gap-2 border-t border-glacier-300 pt-4">
              <a
                href={contact.phoneHref}
                className="inline-flex items-center gap-2 rounded-full border border-glacier-300 bg-white/70 px-3 py-1.5 text-caption font-semibold text-slate-700 backdrop-blur transition hover:border-frost-400 hover:text-ink"
              >
                <Phone className="h-3.5 w-3.5 text-azure" aria-hidden />
                {contact.phone}
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-2 rounded-full border border-glacier-300 bg-white/70 px-3 py-1.5 text-caption font-semibold text-slate-700 backdrop-blur transition hover:border-frost-400 hover:text-ink"
              >
                <Mail className="h-3.5 w-3.5 text-azure" aria-hidden />
                {contact.email}
              </a>
            </div>

            <Link
              to="/resume-checker"
              className="group mt-4 flex items-center justify-center gap-2 rounded-xl bg-btn-grad px-5 py-3 text-small font-bold text-white shadow-blue transition-all duration-200 hover:-translate-y-0.5 hover:shadow-blue-lg"
            >
              Start with a free Resume Health check
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}