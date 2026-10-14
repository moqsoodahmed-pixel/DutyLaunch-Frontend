import { Link } from 'react-router-dom'
import { contact } from '../../data/site.js'
import { company, legalLinks } from '../../data/legal.js'
import { GlacierBackdrop } from '../premium/GlacierBackdrop.jsx'
import { SocialIcon } from '../ui/SocialIcon.jsx'
import { cn } from '../../utils/cn.js'
import msmeBadge from '../../assets/badges/msme.png'
import startupIndiaBadge from '../../assets/badges/startup-india.png'

const WA_PATH = 'M16 2C8.268 2 2 8.268 2 16c0 2.434.658 4.714 1.806 6.68L2 30l7.52-1.774A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.43 11.43 0 0 1-5.834-1.598l-.418-.248-4.333 1.022 1.044-4.224-.272-.434A11.46 11.46 0 0 1 4.5 16C4.5 9.648 9.648 4.5 16 4.5S27.5 9.648 27.5 16 22.352 27.5 16 27.5zm6.29-8.574c-.345-.172-2.04-1.006-2.355-1.12-.316-.115-.546-.172-.776.172-.23.345-.89 1.12-1.09 1.35-.2.23-.4.258-.746.086-.345-.172-1.458-.537-2.776-1.712-1.026-.916-1.719-2.047-1.92-2.392-.2-.345-.02-.532.15-.703.155-.155.345-.4.518-.603.172-.2.23-.345.345-.574.115-.23.058-.432-.029-.603-.086-.172-.776-1.87-1.063-2.56-.28-.673-.563-.581-.776-.592l-.66-.012c-.23 0-.603.086-.918.432s-1.205 1.178-1.205 2.873 1.233 3.333 1.405 3.563c.172.23 2.427 3.706 5.878 5.196.822.355 1.463.567 1.963.726.824.263 1.574.226 2.167.137.661-.099 2.04-.834 2.327-1.638.287-.805.287-1.494.2-1.638-.086-.144-.316-.23-.66-.4z'

const SOCIALS = [
  { href: 'https://www.instagram.com/dutylaunch_?stkn=ZHVnOXZ3ZW5scGdl', label: 'Instagram' },
  { href: 'https://www.facebook.com/share/1Df5RbBE8N/', label: 'Facebook' },
  { href: 'https://x.com/Dutylaunch_2025', label: 'X (Twitter)' },
  { href: 'https://www.youtube.com/@DutyLaunch_2025', label: 'YouTube' },
  { href: 'https://www.linkedin.com/', label: 'LinkedIn' },
]

// Services mirrors the navbar. Pages that are no longer in the navbar
// (templates, ATS checker, employer) stay reachable from here.
const NAV_COLS = [
  { title: 'Services', links: [['Get Your CV', '/pricing'], ['Upskills', '/upskills'], ['Dubai Launch', '/dubai-launch'], ['Apostille', '/apostille-services']] },
  { title: 'Career', links: [['Career services', '/career-services'], ['CV templates', '/cv-templates'], ['ATS resume checker', '/resume-checker'], ['Interview preparation', '/career-services#interview'], ['Career counselling', '/career-services#counselling']] },
  { title: 'Learn', links: [['Higher education', '/higher-education'], ['Professional courses', '/professional-courses'], ['All courses', '/courses']] },
  { title: 'Company', links: [['About us', '/about'], ['Jobs', '/jobs'], ['For employers', '/employers'], ['Blog', '/blog'], ['FAQ', '/faq'], ['Partner with us', '/register?type=institute'], ['Contact', '/contact']] },
  // Mandatory compliance links, shown on every public page.
  { title: 'Legal & Policies', links: legalLinks.map((l) => [l.label, l.path]) },
]

function IndiaFlag({ width = 24, height = 16, style = {} }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 16"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        borderRadius: 2.5,
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(15,28,46,0.18)',
        overflow: 'hidden',
        border: '0.5px solid rgba(15,28,46,0.12)',
        ...style
      }}
    >
      {/* Saffron Top */}
      <rect width="24" height="5.33" fill="#FF9933" />
      {/* White Middle */}
      <rect y="5.33" width="24" height="5.34" fill="#FFFFFF" />
      {/* Green Bottom */}
      <rect y="10.67" width="24" height="5.33" fill="#138808" />
      {/* Ashoka Chakra in Center */}
      <circle cx="12" cy="8" r="2.1" fill="none" stroke="#000080" strokeWidth="0.45" />
      <circle cx="12" cy="8" r="0.6" fill="#000080" />
      {/* 24 spokes */}
      {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((deg) => (
        <line
          key={deg}
          x1="12"
          y1="8"
          x2={12 + 2.05 * Math.cos((deg * Math.PI) / 180)}
          y2={8 + 2.05 * Math.sin((deg * Math.PI) / 180)}
          stroke="#000080"
          strokeWidth="0.25"
        />
      ))}
    </svg>
  )
}

const colHeading = 'mb-4 text-caption font-bold uppercase tracking-[0.1em] text-ink-600';
const footerLink =
  'inline-block py-1 text-[13.5px] leading-snug text-slate-600 transition-colors hover:text-azure hover:underline hover:underline-offset-4 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400';
const contactLink =
  'flex items-center gap-2 text-small text-ink transition-colors hover:text-azure focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400';
const mapLink =
  'inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-azure hover:underline hover:underline-offset-4 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400';
const pin = (
  <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} className="mt-1 shrink-0 text-ink-600" aria-hidden="true"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
)
const external = (
  <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" /></svg>
)
const mailIcon = (
  <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
)

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden border-t border-glacier-400 bg-glacier-100 text-ink" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">DutyLaunch site footer</h2>

      {/* Calm, static glacier tint behind the footer (same backdrop as the hero). */}
      <GlacierBackdrop />

      <div className="relative z-[1] mx-auto w-full max-w-shell px-gutter pt-12 sm:pt-14">
        {/* Main columns: 6-up on wide screens, 3-up on tablet, 2-up on phones. */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 xl:grid-cols-[1.7fr_1fr_1fr_1fr_1fr_1.15fr] xl:gap-x-8">

          {/* Brand */}
          <div className="col-span-2 max-w-xl sm:col-span-3 xl:col-span-1">
            <Link to="/" className="mb-4 inline-flex" aria-label="DutyLaunch, home">
              <img src="/logo.png" alt="DutyLaunch" width={167} height={40} style={{ height: 40, width: 'auto' }} />
            </Link>
            <p className="mb-2 text-caption font-bold tracking-[0.04em] text-azure">Your Career. Your Move. Handled.</p>
            <p className="mb-5 text-small text-slate-600">
              DutyLaunch helps students, professionals and job seekers with career services, education guidance and global mobility support, from your CV and interviews to studying and working abroad.
            </p>
            <ul className="mb-5 flex flex-wrap gap-2.5" aria-label="DutyLaunch on social media">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <SocialIcon social={s} size="sm" rounded="md" />
                </li>
              ))}
            </ul>
            <div className="inline-flex items-center gap-2.5 rounded-xl border border-glacier-400 bg-glacier-200 px-3.5 py-2 leading-snug">
              <IndiaFlag width={24} height={16} />
              <div>
                <div className="text-[11.5px] font-bold tracking-[0.04em]">
                  <span style={{ color: '#B45309' }}>Proudly </span>
                  <span className="text-ink">Made in </span>
                  <span style={{ color: '#0E7A2E' }}>India</span>
                </div>
                <div className="text-[11px] text-slate-600">Built for Indian talent</div>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {NAV_COLS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className={colHeading}>{col.title}</h3>
              <ul>
                {col.links.map(([label, href]) => (
                  <li key={href}>
                    <Link to={href} className={footerLink}>{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Contact + addresses */}
        <div className="mt-10 grid gap-8 border-y border-glacier-400 py-8 md:grid-cols-3">
          <div>
            <h3 className={colHeading}>Contact</h3>
            <a href={contact.phoneHref} className={cn(contactLink, 'mb-2.5')}>
              <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.1 6.1l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              {contact.phone}
            </a>
            <a href="mailto:contact@dutylaunch.com" className={cn(contactLink, 'mb-4')}>
              {mailIcon}
              contact@dutylaunch.com
            </a>
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://wa.me/${contact.whatsapp}?text=Hi%20DutyLaunch%2C%20I%20need%20assistance.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#0F7A40] px-3.5 text-[12.5px] font-bold text-white transition-colors hover:bg-[#0B6633] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400 focus-visible:ring-offset-2"
              >
                <svg viewBox="0 0 32 32" width={14} height={14} fill="currentColor" aria-hidden="true"><path d={WA_PATH} /></svg>
                WhatsApp
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a
                href="mailto:contact@dutylaunch.com"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-azure px-3.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-ink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400 focus-visible:ring-offset-2"
              >
                {mailIcon}
                Email us
              </a>
            </div>
          </div>

          <div>
            <h3 className={colHeading}>Corporate Office</h3>
            <div className="mb-2.5 flex items-start gap-2.5">
              {pin}
              <address className="text-small not-italic text-slate-600">
                {contact.addressLines.map((line, i) => (
                  <span key={i}>{line}{i < contact.addressLines.length - 1 && <br />}</span>
                ))}
              </address>
            </div>
            {contact.addressMapUrl && (
              <a href={contact.addressMapUrl} target="_blank" rel="noopener noreferrer" className={mapLink}>
                {external}
                Open on Google Maps
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </div>

          <div>
            <h3 className={colHeading}>Registered Office</h3>
            <div className="mb-2.5 flex items-start gap-2.5">
              {pin}
              <address className="text-small not-italic text-slate-600">
                {company.registeredOfficeName && (
                  <>
                    <span className="font-bold text-ink">{company.registeredOfficeName}</span>
                    <br />
                  </>
                )}
                {company.registeredOffice}
              </address>
            </div>
            {company.registeredOfficeMapUrl && (
              <a href={company.registeredOfficeMapUrl} target="_blank" rel="noopener noreferrer" className={mapLink}>
                {external}
                Open on Google Maps
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </div>
        </div>

        {/* Bottom bar: registrations, entity line, disclaimer, copyright */}
        <div className="pb-8 pt-6">
          <div className="mb-5 flex flex-wrap items-center gap-5">
            <img src={msmeBadge} alt="MSME registered: Micro, Small & Medium Enterprises" width={72} height={58} className="h-12 w-auto sm:h-[58px]" />
            <img src={startupIndiaBadge} alt="DPIIT recognised, Startup India" width={90} height={36} className="h-8 w-auto sm:h-9" />
          </div>
          <p className="mb-3 max-w-[900px] text-[12.5px] leading-relaxed text-slate-600">
            {company.brand} is operated by {company.legalName} (CIN: {company.cin}).
          </p>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="max-w-[700px] text-caption text-slate-600">
              Career, education and mobility outcomes depend on individual eligibility and third-party decisions (employers, institutions, embassies). DutyLaunch does not guarantee job offers, admissions or visa approvals.
            </p>
            <span className="text-caption text-slate-600 sm:whitespace-nowrap">© {year} {company.legalName}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}