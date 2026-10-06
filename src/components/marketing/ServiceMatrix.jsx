import { Link } from 'react-router-dom';
import { Icons } from '../../utils/iconMap.js';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { Container, Section } from '../ui/Container.jsx';
import { SectionHeader } from '../ui/SectionHeader.jsx';
import { GlacierBackdrop } from '../premium/GlacierBackdrop.jsx';

/**
 * Six core pillars of DutyLaunch.
 * Professionally structured in a symmetrical, fully responsive 3-column grid
 * with Glacier frosted-glass styling and consistent visual hierarchy.
 */
const SERVICES = [
  {
    id: 'career',
    badge: 'Popular',
    icon: 'Compass',
    label: 'Career Services',
    summary: 'Profile engineering, ATS-optimised CVs, and 1-on-1 interview coaching to get shortlisted.',
    path: '/career-services',
    highlights: [
      'ATS Resume Engineering',
      '1-on-1 Career Counselling',
      'Interview Preparation',
      'Job Search Outreach',
    ],
    color: {
      icon: 'text-azure-600',
      iconBg: 'bg-azure-50/90 border-azure-200/70',
      badge: 'border-azure-200/80 bg-azure-50/80 text-azure-700',
      accentGlow: 'rgba(29, 93, 184, 0.12)',
      hoverBorder: 'hover:border-azure-300',
      dot: 'bg-azure-500',
    },
  },
  {
    id: 'education',
    badge: 'Study Abroad',
    icon: 'GraduationCap',
    label: 'Higher Education',
    summary: 'Degrees, diplomas, and global university admissions chosen for what they actually unlock.',
    path: '/higher-education',
    highlights: [
      'Study Abroad Programs',
      'University Shortlisting',
      'Degree Evaluation',
      'Scholarship Guidance',
    ],
    color: {
      icon: 'text-indigo-600',
      iconBg: 'bg-indigo-50/90 border-indigo-200/70',
      badge: 'border-indigo-200/80 bg-indigo-50/80 text-indigo-700',
      accentGlow: 'rgba(99, 102, 241, 0.12)',
      hoverBorder: 'hover:border-indigo-300',
      dot: 'bg-indigo-500',
    },
  },
  {
    id: 'global',
    badge: 'Gulf Relocation',
    icon: 'Plane',
    label: 'Global Mobility',
    summary: 'Working abroad made smooth — from your first overseas application to your first week on site.',
    path: '/dubai-launch',
    highlights: [
      'Dubai Launch Package',
      'Visa & Relocation Support',
      'Gulf Employer Network',
      'Settling-in Assistance',
    ],
    color: {
      icon: 'text-sky-600',
      iconBg: 'bg-sky-50/90 border-sky-200/70',
      badge: 'border-sky-200/80 bg-sky-50/80 text-sky-700',
      accentGlow: 'rgba(14, 165, 233, 0.12)',
      hoverBorder: 'hover:border-sky-300',
      dot: 'bg-sky-500',
    },
  },
  {
    id: 'documentation',
    badge: 'Legalisation',
    icon: 'FileCheck2',
    label: 'Documentation & Apostille',
    summary: 'Apostille, embassy attestation, and certified translation with guaranteed end-to-end tracking.',
    path: '/appostle-services',
    highlights: [
      'Hague Apostille Services',
      'Embassy Attestation',
      'Certified Translation',
      'Live Document Tracking',
    ],
    color: {
      icon: 'text-amber-700',
      iconBg: 'bg-amber-50/90 border-amber-200/70',
      badge: 'border-amber-200/80 bg-amber-50/80 text-amber-800',
      accentGlow: 'rgba(217, 119, 6, 0.12)',
      hoverBorder: 'hover:border-amber-300',
      dot: 'bg-amber-500',
    },
  },
  {
    id: 'jobs',
    badge: 'Verified Roles',
    icon: 'Briefcase',
    label: 'Jobs & Placement',
    summary: 'Search, apply, and track applications across verified global companies — free for candidates.',
    path: '/jobs',
    highlights: [
      'Curated Global Vacancies',
      'Direct Employer Matching',
      'Real-Time Status Tracker',
      'Priority Shortlisting',
    ],
    color: {
      icon: 'text-emerald-600',
      iconBg: 'bg-emerald-50/90 border-emerald-200/70',
      badge: 'border-emerald-200/80 bg-emerald-50/80 text-emerald-800',
      accentGlow: 'rgba(16, 185, 129, 0.12)',
      hoverBorder: 'hover:border-emerald-300',
      dot: 'bg-emerald-500',
    },
  },
  {
    id: 'courses',
    badge: 'Upskilling',
    icon: 'BookOpen',
    label: 'Professional Courses',
    summary: 'Mentor-led programmes that end in tangible capstone projects you can showcase.',
    path: '/courses',
    highlights: [
      'Industry-Led Bootcamps',
      'Tech & Business Tracks',
      'Hands-on Portfolio Work',
      'Recognised Certifications',
    ],
    color: {
      icon: 'text-purple-600',
      iconBg: 'bg-purple-50/90 border-purple-200/70',
      badge: 'border-purple-200/80 bg-purple-50/80 text-purple-800',
      accentGlow: 'rgba(147, 51, 234, 0.12)',
      hoverBorder: 'hover:border-purple-300',
      dot: 'bg-purple-500',
    },
  },
];

export function ServiceMatrix() {
  return (
    <Section tone="glacier" style={{ '--seam-bottom': 'var(--seam-tone)' }} backdrop={<GlacierBackdrop dense />}>
      <Container>
        {/* Section Header */}
        <SectionHeader
          label="What we do"
          title="Everything you need to move forward"
          lead="Six connected services. Most people start with one and come back for the next — a CV, then a course, then the paperwork for a move abroad."
        />

        {/* Responsive Symmetrical Grid */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = Icons[service.icon] || Icons.Circle;

            return (
              <Link
                to={service.path}
                key={service.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/80 bg-white/75 p-6 sm:p-7 shadow-crystal backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/95 hover:shadow-crystal-lg ${service.color.hoverBorder}`}
              >
                {/* Top gradient highlight on hover */}
                <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-azure-500 via-frost-400 to-aurora-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Subtle ambient corner glow on hover */}
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: service.color.accentGlow }}
                  aria-hidden
                />

                <div className="relative z-10">
                  {/* Card Header: Icon badge & pill */}
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border shadow-xs transition-all duration-300 group-hover:scale-105 ${service.color.iconBg}`}
                    >
                      <Icon className={`h-5 w-5 ${service.color.icon}`} aria-hidden />
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide backdrop-blur-xs ${service.color.badge}`}
                    >
                      {service.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-5 text-xl font-bold tracking-tight text-ink transition-colors group-hover:text-azure-600 sm:text-[22px]">
                    {service.label}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {service.summary}
                  </p>

                  {/* Feature Highlights */}
                  <ul className="mt-5 space-y-2 border-t border-slate-100/80 pt-4">
                    {service.highlights.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2.5 text-xs font-medium text-slate-700 transition-colors group-hover:text-slate-900"
                      >
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${service.color.dot}`} aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Footer */}
                <div className="relative z-10 mt-6 flex items-center justify-between border-t border-slate-100/80 pt-4">
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-azure-600 transition-colors group-hover:text-azure-700">
                    <span>Explore service</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                  </span>
                  <span className="text-xs font-semibold text-slate-400 transition-colors group-hover:text-azure-500">
                    View details &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Modular Ecosystem Consultation Banner */}
        <div className="mt-10 sm:mt-12 flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl border border-white/80 bg-white/70 p-6 sm:p-8 shadow-crystal backdrop-blur-xl">
          <div className="flex items-center gap-4 text-left">
            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-azure-200/70 bg-azure-50 text-azure-600 shadow-xs">
              <Sparkles className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-ink">
                Not sure which service you need first?
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Our career counsellors assess your profile and map out the exact sequence — free of charge.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <Link
              to="/contact#consultation"
              className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-azure-600 px-5 py-3 text-sm font-bold text-white shadow-lift transition-all hover:bg-azure-700 hover:shadow-blue"
            >
              <span>Book Free Consultation</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}