import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Check, FileCheck2, Mail, Phone, Plane, ScanSearch, Zap,
} from 'lucide-react';
import { Container } from '../ui/Container.jsx';
import { Button } from '../ui/Button.jsx';
import { GlacierBackdrop } from '../premium/GlacierBackdrop.jsx';
import { contact } from '../../data/site.js';

const ease = [0.16, 0.84, 0.44, 1];

/* The four headline actions, each a vivid gradient tile, mapped to
   DutyLaunch's real primary journeys and routes. */
const ACTIONS = [
  { to: '/resume-checker', label: 'Resume Checker', sub: 'Free Resume Health score', icon: ScanSearch, badge: 'FREE', grad: 'from-azure-500 to-azure-700' },
  { to: '/resume-builder', label: 'Resume Builder', sub: 'Upload yours or start from scratch', icon: Zap, grad: 'from-aurora-500 to-violet-600' },
  { to: '/dubai-launch', label: 'Dubai Launch', sub: 'Jobs & relocation in the Gulf', icon: Plane, grad: 'from-frost-500 to-frost-600' },
  { to: '/apostille-services', label: 'Apostille & Attestation', sub: 'Documents, legalised & tracked', icon: FileCheck2, grad: 'from-azure-600 to-azure-800' },
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
      ['Check your resume', 'Sign in and upload your CV to get your free Resume Health score.'],
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
    <section className="seam seam-tone-glacier relative overflow-hidden pb-14 pt-10 sm:pb-20 lg:pb-24 lg:pt-16">
      <GlacierBackdrop />

      <Container className="relative z-[1] grid items-center gap-10 xl:grid-cols-12 xl:gap-12">
        {/* ---------------- Left: copy + CTAs ---------------- */}
        <div className="xl:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="eyebrow"
          >
            <Zap className="h-3.5 w-3.5" aria-hidden />
            Career · Education · Global mobility · Documentation
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.04, ease }}
            className="mt-5 text-h1 font-extrabold leading-[1.05]"
          >
            Your career, qualification and paperwork.{' '}
            <span className="block text-azure">One launchpad.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
            className="mt-5 max-w-xl text-lead text-slate-700"
          >
            One team for <strong className="font-semibold text-ink">CV writing</strong>,{' '}
            <strong className="font-semibold text-ink">courses &amp; study abroad</strong>,{' '}
            <strong className="font-semibold text-ink">jobs</strong>, and{' '}
            <strong className="font-semibold text-ink">apostille &amp; attestation</strong>, serving
            candidates across <strong className="font-semibold text-ink">India and the Gulf</strong>.
          </motion.p>

          {/* Four vivid gradient action tiles */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease }}
            className="mt-7 grid gap-3.5 sm:grid-cols-2"
          >
            {ACTIONS.map(({ to, label, sub, icon: Icon, badge, grad }) => (
              <Link
                key={to}
                to={to}
                className={`group relative flex items-center gap-3.5 overflow-hidden rounded-2xl bg-gradient-to-br ${grad} border border-white/25 p-4 text-white shadow-crystal transition-[transform,box-shadow,border-color] duration-300 ease-out hover:border-white/60 hover:shadow-[0_20px_45px_-12px_rgba(43,114,212,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure motion-safe:hover:-translate-y-1.5 motion-safe:hover:scale-[1.025] motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98]`}
              >
                {/* Glassy icon bubble */}
                <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/40 bg-white/20 shadow-inner transition-[background-color,border-color,transform] duration-300 group-hover:border-white/70 group-hover:bg-white/35 motion-safe:group-hover:scale-110">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>

                <span className="relative min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-body font-bold leading-tight">{label}</span>
                    {badge && (
                      <span className="rounded-full border border-white/40 bg-white/25 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
                        {badge}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-caption text-white/90">{sub}</span>
                </span>

                <ArrowRight className="relative h-4.5 w-4.5 shrink-0 text-white/80 transition-[transform,color] duration-300 group-hover:text-white motion-safe:group-hover:translate-x-1.5" aria-hidden />
              </Link>
            ))}
          </motion.div>

          {/* Popular quick links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center gap-2"
          >
            <span className="text-caption font-bold uppercase tracking-wider text-slate-600">Popular</span>
            {POPULAR.map((p) => (
              <Link
                key={p.to}
                to={p.to}
                className="inline-flex min-h-9 items-center rounded-full border border-glacier-400 bg-white px-3.5 text-small font-semibold text-slate-700 hover:border-azure-200 hover:bg-glacier-200 hover:text-azure transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.04] hover:shadow-card-hover motion-safe:active:scale-95"
              >
                {p.label}
              </Link>
            ))}
          </motion.div>
        </div>

        {/* ---------------- Right: process card ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.14, ease }}
          className="xl:col-span-5"
        >
          <div className="card !p-5 sm:!p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-caption font-bold uppercase tracking-wider text-azure-700">
                <Check className="h-3.5 w-3.5" aria-hidden />
                How it works
              </p>
              <span className="rounded-full bg-azure-50 px-2.5 py-1 text-caption font-bold text-azure-700">Free to start</span>
            </div>

            {/* Journey tabs */}
            <div className="mt-4 flex gap-1 rounded-xl border border-glacier-400 bg-glacier-200 p-1" role="group" aria-label="Choose a journey">
              {Object.entries(JOURNEYS).map(([key, j]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  aria-pressed={tab === key}
                  className={`min-h-9 flex-1 rounded-lg px-3 text-caption font-bold transition-[transform,background-color,color] duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400 ${
                    tab === key ? 'bg-azure text-white shadow-xs' : 'text-slate-700 hover:bg-white hover:text-ink'
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
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-azure text-small font-extrabold text-white">
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
            <div className="mt-5 flex flex-wrap gap-2 border-t border-glacier-400 pt-4">
              <a
                href={contact.phoneHref}
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-glacier-400 bg-white px-3 text-caption font-semibold text-slate-700 hover:border-azure-200 hover:text-azure transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.04] hover:shadow-card-hover motion-safe:active:scale-95"
              >
                <Phone className="h-3.5 w-3.5 text-azure" aria-hidden />
                {contact.phone}
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-glacier-400 bg-white px-3 text-caption font-semibold text-slate-700 hover:border-azure-200 hover:text-azure transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.04] hover:shadow-card-hover motion-safe:active:scale-95"
              >
                <Mail className="h-3.5 w-3.5 text-azure" aria-hidden />
                {contact.email}
              </a>
            </div>

            <Button to="/resume-checker" fullWidth variant="secondary" className="mt-4">
              Start with a free Resume Health check
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}