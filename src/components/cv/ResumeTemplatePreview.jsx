import { useEffect, useRef, useState } from 'react';

/**
 * Renders a real, ATS-formatted CV document for a given role template and
 * scales it to whatever box it is dropped into.
 *
 * Five visual identities — Meridian, Pulse, Slate, Grove, Arc — each with
 * a distinct typographic and layout personality.  All five follow the same
 * ATS hard rules:
 *   - single text flow, top to bottom in DOM order
 *   - no <table> for layout, no text boxes, no multi-column text
 *   - real headings: Summary, Experience, Skills, Education
 *   - dates on the same line as role, consistent MM/YYYY – MM/YYYY form
 *   - no images, icons or graphics carrying information
 *   - no skill bars or percentage meters
 *
 * The document is laid out at true A4 (794 × 1123 CSS px at 96dpi) and
 * transform-scaled, so a thumbnail and the full-size modal preview are the
 * same markup at different scales — no separate "small" artwork to keep in
 * sync, and the text stays crisp because it is text, not an image.
 */

const PAGE_W = 794;
const PAGE_H = 1123;

const CONTACT =
  'your.email@example.com  |  +91 00000 00000  |  City, Country  |  linkedin.com/in/yourprofile';
const COMPANIES = ['Company Name', 'Previous Company', 'Earlier Employer'];
const DATES = ['03/2022 – Present', '06/2019 – 02/2022', '01/2017 – 05/2019'];

function useFitScale(ref, deps = []) {
  const [scale, setScale] = useState(0.25);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const set = () => setScale(el.clientWidth / PAGE_W);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return scale;
}

/* ─────────────────────────────────────────────────────────────────────────
 * Shared building blocks
 * ───────────────────────────────────────────────────────────────────────── */

function Bullets({ items = [], size = 11.5, color = '#2d3748', gap = 3.5 }) {
  const clean = items.filter(Boolean);
  if (!clean.length) return null;
  return (
    <ul style={{ margin: '5px 0 0', paddingLeft: 15 }}>
      {clean.map((b, i) => (
        <li key={i} style={{ fontSize: size, lineHeight: 1.5, color, marginBottom: gap }}>
          {b}
        </li>
      ))}
    </ul>
  );
}

function ExperienceBlock({ tpl, size = 11.5, titleColor = '#111827', companyColor = '#374151', metaColor = '#6b7280', count = 3 }) {
  return (
    <>
      {COMPANIES.slice(0, count).map((co, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: size, fontWeight: 700, color: titleColor }}>
              {tpl.titles[i] || tpl.titles[0]}
            </span>
            <span style={{ fontSize: size - 1, color: metaColor, whiteSpace: 'nowrap' }}>{DATES[i]}</span>
          </div>
          <p style={{ fontSize: size - 0.5, color: companyColor, margin: '1px 0 3px' }}>{co}</p>
          <Bullets items={tpl.bullets.slice(0, i === 0 ? 3 : 2)} size={size - 0.5} color={companyColor} />
        </div>
      ))}
    </>
  );
}

function SkillsInline({ skills, size = 11.5, color = '#374151', separator = ' · ' }) {
  return (
    <p style={{ fontSize: size, color, lineHeight: 1.65, margin: 0 }}>
      {skills.join(separator)}
    </p>
  );
}

function EducationBlock({ tpl, size = 11.5, titleColor = '#111827', subColor = '#374151', dateColor = '#6b7280' }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: size, fontWeight: 700, color: titleColor }}>{tpl.degree}</span>
        <span style={{ fontSize: size - 1, color: dateColor }}>2015 – 2019</span>
      </div>
      <p style={{ fontSize: size - 0.5, color: subColor, margin: '1px 0 0' }}>University / College Name</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * 1.  MERIDIAN
 *     Personality: authoritative and calm. Navy left-border accent column,
 *     Georgia name, tracked Helvetica section headings.  The most ATS-safe
 *     of the five.  Best for: banking, consulting, law, government, any role
 *     where a recruiter expects something they recognise immediately.
 * ───────────────────────────────────────────────────────────────────────── */
function Meridian({ tpl }) {
  const NAVY = '#0B1F48';
  const RULE = '#0B1F48';
  const TEXT = '#1a202c';
  const MUTED = '#4a5568';

  const SectionHead = ({ children }) => (
    <h3
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: NAVY,
        margin: '18px 0 7px',
        paddingBottom: 4,
        borderBottom: `2px solid ${RULE}`,
      }}
    >
      {children}
    </h3>
  );

  return (
    <div style={{ display: 'flex', minHeight: PAGE_H }}>
      {/* Left accent border — purely decorative, no content */}
      <div style={{ width: 6, background: NAVY, flexShrink: 0 }} />

      <div style={{ flex: 1, padding: '44px 52px 44px 44px' }}>
        {/* Header */}
        <h1
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 30,
            fontWeight: 700,
            color: NAVY,
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          YOUR NAME
        </h1>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#2563EB', margin: '4px 0 0' }}>
          {tpl.headline}
        </p>
        <p style={{ fontSize: 10, color: MUTED, margin: '5px 0 0', letterSpacing: '0.01em' }}>
          {CONTACT}
        </p>

        <SectionHead>Professional Summary</SectionHead>
        <p style={{ fontSize: 11.5, lineHeight: 1.6, color: TEXT, margin: 0 }}>{tpl.summary}</p>

        <SectionHead>Professional Experience</SectionHead>
        <ExperienceBlock tpl={tpl} size={11.5} titleColor={TEXT} companyColor={MUTED} />

        <SectionHead>Core Skills</SectionHead>
        <SkillsInline skills={tpl.skills} size={11.5} color={TEXT} separator=" · " />

        <SectionHead>Education</SectionHead>
        <EducationBlock tpl={tpl} size={11.5} titleColor={TEXT} subColor={MUTED} dateColor={MUTED} />

        {tpl.certs.length > 0 && (
          <>
            <SectionHead>Certifications</SectionHead>
            <Bullets items={tpl.certs} size={11} color={TEXT} />
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * 2.  PULSE
 *     Personality: sharp and data-driven. Teal name, hairline top rule,
 *     skills displayed as inline chips on a tinted row.  Best for: software
 *     engineers, data scientists, DevOps, product — any role where showing
 *     you understand density and information hierarchy matters.
 * ───────────────────────────────────────────────────────────────────────── */
function Pulse({ tpl }) {
  const TEAL = '#0F766E';
  const INK = '#111827';
  const MUTED = '#4b5563';
  const CHIP_BG = '#F0FDFA';
  const CHIP_BORDER = '#99F6E4';

  return (
    <div style={{ padding: '40px 54px' }}>
      {/* Header — name + rule */}
      <div style={{ borderTop: `3px solid ${TEAL}`, paddingTop: 14 }}>
        <h1 style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 28, fontWeight: 800, color: TEAL, margin: 0, letterSpacing: '-0.02em' }}>
          YOUR NAME
        </h1>
        <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: '3px 0 0' }}>{tpl.headline}</p>
        <p style={{ fontSize: 10, color: MUTED, margin: '4px 0 0' }}>{CONTACT}</p>
      </div>

      {/* Skills chips row — immediately after contact, before summary */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, margin: '13px 0' }}>
        {tpl.skills.map((s, i) => (
          <span
            key={i}
            style={{
              fontSize: 9.5,
              fontWeight: 500,
              color: TEAL,
              background: CHIP_BG,
              border: `1px solid ${CHIP_BORDER}`,
              borderRadius: 3,
              padding: '2px 8px',
              whiteSpace: 'nowrap',
            }}
          >
            {s}
          </span>
        ))}
      </div>

      {/* Thin separator */}
      <div style={{ borderTop: '1px solid #D1FAF5', marginBottom: 13 }} />

      <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.55, margin: '0 0 14px' }}>{tpl.summary}</p>

      {/* Experience */}
      <h3 style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: TEAL, margin: '0 0 8px', paddingBottom: 3, borderBottom: `1px solid ${CHIP_BORDER}` }}>
        Experience
      </h3>
      <ExperienceBlock tpl={tpl} size={11} titleColor={INK} companyColor={MUTED} metaColor={TEAL} />

      {/* Education */}
      <h3 style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: TEAL, margin: '14px 0 7px', paddingBottom: 3, borderBottom: `1px solid ${CHIP_BORDER}` }}>
        Education
      </h3>
      <EducationBlock tpl={tpl} size={11} titleColor={INK} subColor={MUTED} dateColor={MUTED} />

      {tpl.certs.length > 0 && (
        <>
          <h3 style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: TEAL, margin: '14px 0 7px', paddingBottom: 3, borderBottom: `1px solid ${CHIP_BORDER}` }}>
            Certifications
          </h3>
          <Bullets items={tpl.certs} size={10.5} color={MUTED} />
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * 3.  SLATE
 *     Personality: authoritative and structured. Dark header band reverses
 *     the name in white; mid-weight divider rules; tabular figures.
 *     Best for: operations, project management, HR, executive candidates
 *     who want to signal seniority without relying on a personal brand.
 * ───────────────────────────────────────────────────────────────────────── */
function Slate({ tpl }) {
  const DARK = '#1e2a3a';
  const RULE = '#94a3b8';
  const ACCENT = '#3b82f6';
  const INK = '#1e293b';
  const MUTED = '#475569';

  return (
    <div>
      {/* Dark header band */}
      <div style={{ background: DARK, padding: '32px 54px 28px' }}>
        <h1 style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 29, fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
          YOUR NAME
        </h1>
        <p style={{ fontSize: 12.5, fontWeight: 500, color: '#93c5fd', margin: '5px 0 0' }}>{tpl.headline}</p>
        <p style={{ fontSize: 9.5, color: '#94a3b8', margin: '6px 0 0', letterSpacing: '0.02em' }}>{CONTACT}</p>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 54px 44px' }}>
        <p style={{ fontSize: 11.5, lineHeight: 1.65, color: INK, margin: '0 0 16px' }}>{tpl.summary}</p>

        {[
          { label: 'Professional Experience', content: <ExperienceBlock tpl={tpl} size={11.5} titleColor={INK} companyColor={MUTED} metaColor={ACCENT} /> },
          { label: 'Core Competencies',        content: <SkillsInline skills={tpl.skills} size={11.5} color={INK} separator="  ·  " /> },
          { label: 'Education',                content: <EducationBlock tpl={tpl} size={11.5} titleColor={INK} subColor={MUTED} dateColor={MUTED} /> },
          ...(tpl.certs.length > 0
            ? [{ label: 'Certifications', content: <Bullets items={tpl.certs} size={11} color={MUTED} /> }]
            : []),
        ].map(({ label, content }) => (
          <div key={label}>
            <h3
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.13em',
                textTransform: 'uppercase',
                color: DARK,
                margin: '17px 0 7px',
                paddingBottom: 4,
                borderBottom: `1px solid ${RULE}`,
              }}
            >
              {label}
            </h3>
            {content}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * 4.  GROVE
 *     Personality: warm, trustworthy, unhurried. Moss-green accent, generous
 *     line height, soft section rules, Georgia body text.
 *     Best for: healthcare, education, counselling, non-profit, consulting
 *     — anywhere that a "caring and competent" signal matters more than a
 *     "sharp and efficient" one.
 * ───────────────────────────────────────────────────────────────────────── */
function Grove({ tpl }) {
  const MOSS = '#166534';
  const MOSS_LIGHT = '#bbf7d0';
  const INK = '#1a2e1a';
  const MUTED = '#4b6a4b';
  const RULE = '#d1fae5';

  return (
    <div style={{ padding: '46px 58px' }}>
      {/* Header */}
      <h1
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 27,
          fontWeight: 700,
          color: INK,
          margin: 0,
          letterSpacing: '0.01em',
        }}
      >
        YOUR NAME
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '5px 0 0' }}>
        <div style={{ width: 32, height: 2, background: MOSS, flexShrink: 0 }} />
        <p style={{ fontSize: 13, color: MOSS, fontWeight: 600, margin: 0 }}>{tpl.headline}</p>
      </div>
      <p style={{ fontSize: 10, color: MUTED, margin: '5px 0 0', letterSpacing: '0.01em' }}>{CONTACT}</p>
      <div style={{ height: 1, background: MOSS_LIGHT, margin: '12px 0' }} />

      {/* Summary */}
      <p style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 11.5, lineHeight: 1.7, color: INK, margin: 0 }}>
        {tpl.summary}
      </p>

      {[
        { label: 'Professional Experience', content: <ExperienceBlock tpl={tpl} size={11.5} titleColor={INK} companyColor={MUTED} metaColor={MOSS} /> },
        { label: 'Skills & Expertise',       content: <SkillsInline skills={tpl.skills} size={11.5} color={INK} separator=" · " /> },
        { label: 'Education',                content: <EducationBlock tpl={tpl} size={11.5} titleColor={INK} subColor={MUTED} dateColor={MUTED} /> },
        ...(tpl.certs.length > 0
          ? [{ label: 'Certifications & CPD', content: <Bullets items={tpl.certs} size={11} color={MUTED} /> }]
          : []),
      ].map(({ label, content }) => (
        <div key={label}>
          <h3
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: MOSS,
              margin: '18px 0 7px',
              paddingBottom: 4,
              borderBottom: `1px solid ${RULE}`,
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            {label}
          </h3>
          {content}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * 5.  ARC
 *     Personality: structured and contemporary. Deep indigo left sidebar
 *     holds contact, skills and certs; main column holds the career story.
 *     DOM order is: main column first, sidebar second — so an ATS reads the
 *     role history before the skills list, not interleaved with it.
 *     Best for: marketing, creative strategy, design, sales, UX.
 * ───────────────────────────────────────────────────────────────────────── */
function Arc({ tpl }) {
  const INDIGO = '#312e81';
  const INDIGO_LIGHT = '#e0e7ff';
  const INK = '#1e1b4b';
  const MUTED = '#4338ca';
  const SIDEBAR_W = 218;

  const SideLabel = ({ children }) => (
    <p
      style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.13em',
        textTransform: 'uppercase',
        color: '#a5b4fc',
        margin: '18px 0 6px',
      }}
    >
      {children}
    </p>
  );

  return (
    <div>
      {/* Name bar — full width, above the two-column area */}
      <div style={{ background: INDIGO, padding: '30px 48px 24px' }}>
        <h1 style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 27, fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
          YOUR NAME
        </h1>
        <p style={{ fontSize: 12.5, color: '#a5b4fc', fontWeight: 500, margin: '4px 0 0' }}>{tpl.headline}</p>
      </div>

      {/* Two-column body — DOM order: main first for ATS, sidebar second */}
      <div style={{ display: 'flex' }}>

        {/* ── MAIN COLUMN (DOM-first, visually right via flex order) ── */}
        <div style={{ flex: 1, order: 2, padding: '24px 44px 44px 32px' }}>
          <p style={{ fontSize: 11, lineHeight: 1.6, color: '#1e293b', margin: '0 0 14px' }}>
            {tpl.summary}
          </p>

          {[
            {
              label: 'Professional Experience',
              content: (
                <ExperienceBlock
                  tpl={tpl}
                  size={11}
                  titleColor="#1e293b"
                  companyColor="#475569"
                  metaColor={MUTED}
                />
              ),
            },
            {
              label: 'Education',
              content: (
                <EducationBlock
                  tpl={tpl}
                  size={11}
                  titleColor="#1e293b"
                  subColor="#475569"
                  dateColor="#64748b"
                />
              ),
            },
          ].map(({ label, content }) => (
            <div key={label}>
              <h3
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: INDIGO,
                  margin: '17px 0 7px',
                  paddingBottom: 3,
                  borderBottom: `1px solid ${INDIGO_LIGHT}`,
                }}
              >
                {label}
              </h3>
              {content}
            </div>
          ))}
        </div>

        {/* ── SIDEBAR (DOM-second, visually left via flex order) ── */}
        <aside
          style={{
            width: SIDEBAR_W,
            flexShrink: 0,
            order: 1,
            background: INDIGO,
            padding: '8px 22px 44px',
          }}
        >
          <SideLabel>Contact</SideLabel>
          <p style={{ fontSize: 9.5, color: '#c7d2fe', lineHeight: 1.6, margin: 0 }}>
            {CONTACT.split('  |  ').map((bit, i) => (
              <span key={i} style={{ display: 'block' }}>{bit}</span>
            ))}
          </p>

          <SideLabel>Skills</SideLabel>
          <ul style={{ margin: 0, paddingLeft: 13 }}>
            {tpl.skills.map((s, i) => (
              <li key={i} style={{ fontSize: 9.5, color: '#e0e7ff', lineHeight: 1.65 }}>{s}</li>
            ))}
          </ul>

          {tpl.certs.length > 0 && (
            <>
              <SideLabel>Certifications</SideLabel>
              <ul style={{ margin: 0, paddingLeft: 13 }}>
                {tpl.certs.map((c, i) => (
                  <li key={i} style={{ fontSize: 9, color: '#c7d2fe', lineHeight: 1.7 }}>{c}</li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Dispatcher
 * ───────────────────────────────────────────────────────────────────────── */

const LAYOUT_COMPONENTS = {
  meridian: Meridian,
  pulse:    Pulse,
  slate:    Slate,
  grove:    Grove,
  arc:      Arc,
};

export function ResumeTemplatePreview({ template, className, crop = true }) {
  const boxRef = useRef(null);
  const scale = useFitScale(boxRef, [template?.id, crop]);
  if (!template) return null;

  const Layout = LAYOUT_COMPONENTS[template.layout] || Meridian;

  return (
    <div
      ref={boxRef}
      className={className}
      style={{ overflow: 'hidden', position: 'relative', width: '100%' }}
    >
      <div
        style={{
          width: PAGE_W,
          height: crop ? undefined : PAGE_H,
          minHeight: crop ? undefined : PAGE_H,
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          background: '#ffffff',
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          lineHeight: 1.45,
          color: '#111827',
        }}
      >
        <Layout tpl={template} />
      </div>
    </div>
  );
}

export default ResumeTemplatePreview;