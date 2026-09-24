import { Link } from 'react-router-dom'
import { contact } from '../../data/site.js'

const WA_PATH = 'M16 2C8.268 2 2 8.268 2 16c0 2.434.658 4.714 1.806 6.68L2 30l7.52-1.774A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.43 11.43 0 0 1-5.834-1.598l-.418-.248-4.333 1.022 1.044-4.224-.272-.434A11.46 11.46 0 0 1 4.5 16C4.5 9.648 9.648 4.5 16 4.5S27.5 9.648 27.5 16 22.352 27.5 16 27.5zm6.29-8.574c-.345-.172-2.04-1.006-2.355-1.12-.316-.115-.546-.172-.776.172-.23.345-.89 1.12-1.09 1.35-.2.23-.4.258-.746.086-.345-.172-1.458-.537-2.776-1.712-1.026-.916-1.719-2.047-1.92-2.392-.2-.345-.02-.532.15-.703.155-.155.345-.4.518-.603.172-.2.23-.345.345-.574.115-.23.058-.432-.029-.603-.086-.172-.776-1.87-1.063-2.56-.28-.673-.563-.581-.776-.592l-.66-.012c-.23 0-.603.086-.918.432s-1.205 1.178-1.205 2.873 1.233 3.333 1.405 3.563c.172.23 2.427 3.706 5.878 5.196.822.355 1.463.567 1.963.726.824.263 1.574.226 2.167.137.661-.099 2.04-.834 2.327-1.638.287-.805.287-1.494.2-1.638-.086-.144-.316-.23-.66-.4z'

const SOCIALS = [
  { href: 'https://www.instagram.com/', label: 'Instagram', path: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z|M17.5 6.5h.01|M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z' },
  { href: 'https://www.linkedin.com/', label: 'LinkedIn', path: 'M6.94 8.5H3.56V20h3.38V8.5zM5.25 3a1.94 1.94 0 1 0 0 3.88A1.94 1.94 0 0 0 5.25 3zM20.45 20h-3.37v-5.6c0-1.34-.03-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V20H9.68V8.5h3.24v1.57h.05c.45-.86 1.56-1.77 3.2-1.77 3.43 0 4.06 2.26 4.06 5.2V20z' },
]

// Services mirrors the navbar. Pages that are no longer in the navbar
// (templates, ATS checker, employer) stay reachable from here.
const NAV_COLS = [
  { title: 'Services', links: [['Get Your CV', '/pricing'], ['Upskills', '/upskills'], ['Dubai Launch', '/dubai-job-seeker-package'], ['Appostle Services', '/documentation']] },
  { title: 'Career', links: [['Career services', '/career-services'], ['CV templates', '/cv-templates'], ['ATS resume checker', '/ats-resume-checker'], ['Interview preparation', '/career-services#interview'], ['Career counselling', '/career-services#counselling']] },
  { title: 'Learn', links: [['Higher education', '/higher-education'], ['Professional courses', '/professional-courses'], ['All courses', '/courses']] },
  { title: 'Company', links: [['About us', '/about'], ['Jobs', '/jobs'], ['For employers', '/employer'], ['Blog', '/blog'], ['FAQ', '/faq'], ['Contact', '/contact']] },
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
        boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
        overflow: 'hidden',
        border: '0.5px solid rgba(255,255,255,0.18)',
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

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: '#0D1B2E', color: '#dde8f4', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, zIndex: 1, background: 'linear-gradient(90deg, transparent, rgba(94,169,255,.35), transparent)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(600px 300px at 15% 0%, rgba(43,114,212,.16), transparent 65%)' }} />

      {/* ── MAIN BODY ── */}
      {/* Constrained to the same shell width the rest of the site uses
          (max-w-shell = 82.5rem, px-gutter). The old `wrap` class was never
          defined in any stylesheet, so the footer ran full-bleed while every
          section above it stayed centred. */}
      <div className="mx-auto w-full max-w-shell px-gutter" style={{ paddingTop: 56, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr', gap: '40px 32px' }}>

          {/* Col 1 — Brand */}
          <div>
            <Link to="/" style={{ display: 'inline-flex', textDecoration: 'none', marginBottom: 16 }}>
              <img src="/logo-white.png" alt="DutyLaunch" style={{ height: 40, width: 'auto' }} />
            </Link>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#93C5FD', letterSpacing: '.04em', marginBottom: 8 }}>
              Your Career. Your Move. Handled.
            </p>
            <p style={{ fontSize: 13, color: '#c8d8e8', lineHeight: 1.75, marginBottom: 20 }}>
              DutyLaunch helps students, professionals and job seekers with career services, education guidance and global mobility support — from your CV and interviews to studying and working abroad.
            </p>
            {/* Socials */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,.07)', display: 'grid', placeItems: 'center', transition: 'background .15s,transform .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(29,111,224,.3)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.07)'; e.currentTarget.style.transform = 'none' }}>
                  <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="#dde8f4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    {s.path.split('|').map((p, i) => <path key={i} d={p} />)}
                  </svg>
                </a>
              ))}
            </div>
            {/* Made in India — sized to match the LauncherDesk footer badge.
                lineHeight is set explicitly: otherwise both lines inherit the
                body's fixed 27.2px line height (meant for 16px text), which
                made this badge ~73px tall instead of ~54px. */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, lineHeight: 1.6 }}>
              <IndiaFlag width={24} height={16} />
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.04em', lineHeight: 1.6 }}>
                  <span style={{ color: '#FF9933' }}>Proudly </span>
                  <span style={{ color: '#fff' }}>Made in </span>
                  <span style={{ color: '#138808' }}>India</span>
                </div>
                <div style={{ fontSize: 11, color: '#c8d8e8', lineHeight: 1.6 }}>Built for Indian talent</div>
              </div>
            </div>
          </div>

          {/* Nav cols */}
          {NAV_COLS.map(col => (
            <div key={col.title}>
              <h5 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#6da8e0', marginBottom: 16 }}>{col.title}</h5>
              {col.links.map(([label, href]) => (
                <Link key={href} to={href} style={{ display: 'block', fontSize: 13.5, color: '#c8d8e8', marginBottom: 10, textDecoration: 'none', transition: 'color .15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#c8d8e8'}>
                  {label}
                </Link>
              ))}
            </div>
          ))}

        </div>

        {/* ── CONTACT + ADDRESS BAR ── */}
        <div className="dl-contactbar" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, margin: '40px 0 0', padding: '28px 0', borderTop: '1px solid rgba(255,255,255,.07)', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          {/* Contact */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#6da8e0', marginBottom: 14 }}>Contact</div>
            <a href={contact.phoneHref} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#dde8f4', textDecoration: 'none', marginBottom: 10, transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#dde8f4'}>
              <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.1 6.1l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              {contact.phone}
            </a>
            <a href="mailto:contact@dutylaunch.com" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: '#dde8f4', textDecoration: 'none', marginBottom: 16, transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#dde8f4'}>
              <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              contact@dutylaunch.com
            </a>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href={`https://wa.me/${contact.whatsapp}?text=Hi%20DutyLaunch%2C%20I%20need%20assistance.`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#25D366', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 12.5, textDecoration: 'none', transition: 'opacity .15s' }}>
                <svg viewBox="0 0 32 32" width={14} height={14} fill="currentColor"><path d={WA_PATH} /></svg>
                WhatsApp
              </a>
              <a href="mailto:contact@dutylaunch.com"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'linear-gradient(135deg, #1D6FE0, #1656B0)', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 12.5, textDecoration: 'none', boxShadow: '0 2px 8px rgba(29,111,224,.35)', border: '1px solid rgba(255,255,255,.15)', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none' }}>
                <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                Email us
              </a>
            </div>
          </div>

          {/* Corporate Office */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#6da8e0', marginBottom: 14 }}>Corporate Office</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
              <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#6da8e0" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }}><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <span style={{ fontSize: 13, color: '#c8d8e8', lineHeight: 1.7 }}>
                {contact.addressLines.map((line, i) => (
                  <span key={i}>{line}{i < contact.addressLines.length - 1 && <br />}</span>
                ))}
              </span>
            </div>
            {contact.addressMapUrl && (
            <a href={contact.addressMapUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#7ecef4', textDecoration: 'none' }}>
              <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" /></svg>
              Open on Google Maps →
            </a>
            )}
          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div style={{ padding: '20px 0 28px' }}>
          {/* Government registration marks. The MSME mark is navy + gold
              artwork, so it is filtered to flat white to sit on the dark
              footer; the DPIIT/StartupIndia mark already ships with white
              DPIIT text and keeps its saffron/green brand colours. */}
          <div className="dl-badges" style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', marginBottom: 20 }}>
            <img
              src="/badges/msme.png"
              alt="MSME registered"
              width={91}
              height={36}
              style={{
                height: 36,
                width: 'auto',
                filter: 'brightness(0) invert(1)',
                opacity: 0.82,
                transition: 'opacity .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.82')}
            />
            <img
              src="/badges/startup-india.png"
              alt="DPIIT recognised, Startup India"
              width={90}
              height={36}
              style={{
                height: 36,
                width: 'auto',
                opacity: 0.92,
                transition: 'opacity .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.92')}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 12, color: '#8aadd0', lineHeight: 1.6, maxWidth: 700, margin: 0 }}>
              DutyLaunch is operated by DutyLaunch Solutions Pvt. Ltd. Career, education and mobility outcomes depend on individual eligibility and third-party decisions (employers, institutions, embassies). DutyLaunch does not guarantee job offers, admissions or visa approvals.
            </p>
            <span style={{ fontSize: 12, color: '#8aadd0', whiteSpace: 'nowrap' }}>
              © {year} DutyLaunch Solutions Pvt. Ltd.
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:900px){
          footer > div > div:first-child {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px 24px !important;
          }
          footer > div > div:first-child > div:first-child {
            grid-column: 1 / -1 !important;
            max-width: 560px;
          }
          .dl-contactbar {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
        @media(max-width:600px){
          footer > div > div:first-child {
            grid-template-columns: 1fr 1fr !important;
            gap: 28px 16px !important;
          }
          footer > div > div:first-child > div:first-child {
            grid-column: 1 / -1 !important;
          }
          .dl-badges img { height: 30px !important; }
        }
      `}</style>
    </footer>
  )
}