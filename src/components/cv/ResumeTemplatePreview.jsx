import { useEffect, useRef, useState } from 'react';

/**
 * DutyLaunch Flagship Resume Template Preview Engine.
 *
 * Renders actual, ATS-compliant CV document previews for the five DutyLaunch flagship templates:
 * 1. DL Elite        — Universal Professional (Aarav N. Kapoor)
 * 2. DL Tech         — Software, Cybersecurity, AI, Engineering (Vikramaditya Singhania)
 * 3. DL Professional — Business, Finance, Operations, Strategy (Priya S. Sundaram)
 * 4. DL Executive    — Leadership, CXO, Director, Senior Management (Dr. Rajeshwar Rao, Ph.D.)
 * 5. DL Project+     — Students, Freshers, Internships, Switchers (Ananya Deshmukh)
 *
 * Sizing & Layout Geometry:
 * Standard ISO 216 A4 dimensions: 794px × 1123px (at 96 DPI standard web resolution).
 * Scaled dynamically via CSS transform origin, maintaining exact A4 proportions
 * without layout thrashing, clipping, or lower empty space.
 */

export const PAGE_W = 794;
export const PAGE_H = 1123;

function useFitScale(ref, deps = []) {
  const [scale, setScale] = useState(0.28);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const updateScale = () => {
      const w = el.clientWidth;
      if (w > 0) {
        setScale(w / PAGE_W);
      }
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);

    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scale;
}

/* ─────────────────────────────────────────────────────────────────────────
 * Shared Building Blocks
 * ───────────────────────────────────────────────────────────────────────── */

function Bullets({ items = [], size = 10, color = '#374151', gap = 3 }) {
  const clean = items.filter(Boolean);
  if (!clean.length) return null;
  return (
    <ul style={{ margin: '3px 0 0', paddingLeft: 15 }}>
      {clean.map((b, i) => (
        <li key={i} style={{ fontSize: size, lineHeight: 1.48, color, marginBottom: gap }}>
          {b}
        </li>
      ))}
    </ul>
  );
}

function ExperienceSection({ tpl, titleColor = '#111827', companyColor = '#4B5563', metaColor = '#6B7280', accentColor }) {
  const list = tpl.experience || [];
  if (!list.length) return null;
  return (
    <div style={{ marginTop: 4 }}>
      {list.map((exp, i) => (
        <div key={i} style={{ marginBottom: i === list.length - 1 ? 0 : 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: titleColor }}>
              {exp.title || 'Job Title'}
            </span>
            <span style={{ fontSize: 9.5, color: metaColor, whiteSpace: 'nowrap', fontWeight: 500 }}>
              {exp.dates || ''}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '1px 0 2px' }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: accentColor || companyColor }}>
              {exp.company || ''}
            </span>
            {exp.location && (
              <span style={{ fontSize: 9, color: '#6B7280' }}>{exp.location}</span>
            )}
          </div>
          <Bullets items={exp.bullets} size={9.5} color="#374151" gap={2} />
        </div>
      ))}
    </div>
  );
}

function ProjectsSection({ tpl, titleColor = '#111827', roleColor = '#4B5563' }) {
  const list = tpl.projects || [];
  if (!list.length) return null;
  return (
    <div style={{ marginTop: 4 }}>
      {list.map((p, i) => (
        <div key={i} style={{ marginBottom: i === list.length - 1 ? 0 : 5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: titleColor }}>{p.name}</span>
            <span style={{ fontSize: 9, color: roleColor, fontWeight: 600 }}>{p.role}</span>
          </div>
          <p style={{ fontSize: 9.5, color: '#374151', margin: '2px 0 0', lineHeight: 1.45 }}>{p.impact}</p>
        </div>
      ))}
    </div>
  );
}

function EducationSection({ tpl, titleColor = '#111827', subColor = '#4B5563' }) {
  const list = tpl.education || [];
  if (!list.length) return null;
  return (
    <div style={{ marginTop: 4 }}>
      {list.map((edu, i) => (
        <div key={i} style={{ marginBottom: i === list.length - 1 ? 0 : 5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: titleColor }}>{edu.degree || 'Degree / Qualification'}</span>
            <span style={{ fontSize: 9.5, color: '#6B7280' }}>{edu.year || ''}</span>
          </div>
          <p style={{ fontSize: 9.5, color: subColor, margin: '1px 0 0' }}>
            {edu.institution || ''} {edu.location ? `· ${edu.location}` : ''}
          </p>
        </div>
      ))}
    </div>
  );
}

function formatContact(contact) {
  if (!contact) return '';
  if (typeof contact === 'string') return contact;
  const parts = [];
  if (contact.email) parts.push(contact.email);
  if (contact.phone) parts.push(contact.phone);
  if (contact.location) parts.push(contact.location);
  if (contact.linkedin) parts.push(contact.linkedin);
  if (contact.github) parts.push(contact.github);
  if (contact.website) parts.push(contact.website);
  return parts.join('   |   ');
}

function getCandidateName(tpl, fallback = 'Your Full Name') {
  if (tpl.personName && tpl.personName.trim()) return tpl.personName;
  if (tpl.name && !['DL Elite', 'DL Tech', 'DL Professional', 'DL Executive', 'DL Modern'].includes(tpl.name)) {
    return tpl.name;
  }
  return fallback;
}

function getCandidateHeadline(tpl, fallback = 'Target Professional Title') {
  if (tpl.headline && tpl.headline.trim()) return tpl.headline;
  return fallback;
}

function getContactText(tpl, fallback = 'your.email@example.com   |   +1 (555) 000-0000   |   City, Country') {
  const formatted = formatContact(tpl.contact);
  if (formatted && formatted.trim()) return formatted;
  return fallback;
}

/* ─────────────────────────────────────────────────────────────────────────
 * 1. DL ELITE — Universal Professional
 * Authoritative serif candidate name, ink-navy vertical accent rail,
 * perfectly balanced single-column ATS hierarchy with 0 white gaps.
 * ───────────────────────────────────────────────────────────────────────── */
function DLElite({ tpl }) {
  const NAVY = '#0B1F48';
  const AZURE = '#1D5DB8';
  const TEXT = '#1A202C';
  const MUTED = '#4A5568';

  const candidateName = getCandidateName(tpl);
  const candidateHeadline = getCandidateHeadline(tpl);
  const contactText = getContactText(tpl);

  const SectionHead = ({ children }) => (
    <h3
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: NAVY,
        margin: '11px 0 4px',
        paddingBottom: 2,
        borderBottom: `1.5px solid ${NAVY}`,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {children}
    </h3>
  );

  return (
    <div style={{ display: 'flex', width: PAGE_W, height: PAGE_H, boxSizing: 'border-box', background: '#FFFFFF' }}>
      {/* Decorative vertical accent bar */}
      <div style={{ width: 6, background: NAVY, flexShrink: 0 }} />

      <div style={{ flex: 1, padding: '28px 40px 24px 32px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <h1
          style={{
            fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
            fontSize: 25,
            fontWeight: 700,
            color: NAVY,
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {candidateName}
        </h1>
        <p style={{ fontSize: 11.5, fontWeight: 600, color: AZURE, margin: '2px 0 0' }}>
          {candidateHeadline}
        </p>
        <p style={{ fontSize: 9, color: MUTED, margin: '4px 0 0', letterSpacing: '0.01em' }}>
          {contactText}
        </p>

        {/* Summary */}
        <SectionHead>Professional Summary</SectionHead>
        <p style={{ fontSize: 9.8, lineHeight: 1.5, color: TEXT, margin: 0 }}>
          {tpl.summary}
        </p>

        {/* Experience */}
        <SectionHead>Professional Experience</SectionHead>
        <ExperienceSection tpl={tpl} titleColor={NAVY} companyColor={MUTED} accentColor={AZURE} />

        {/* Projects / Strategic Initiatives */}
        {tpl.projects?.length > 0 && (
          <>
            <SectionHead>Strategic Programs & Transformations</SectionHead>
            <ProjectsSection tpl={tpl} titleColor={NAVY} roleColor={AZURE} />
          </>
        )}

        {/* Skills */}
        <SectionHead>Core Competencies & Leadership Capabilities</SectionHead>
        <p style={{ fontSize: 9.6, color: TEXT, lineHeight: 1.5, margin: 0 }}>
          {tpl.skills?.join('   ·   ')}
        </p>

        {/* Education & Certifications Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginTop: 2 }}>
          <div>
            <SectionHead>Education & Academic Honors</SectionHead>
            <EducationSection tpl={tpl} titleColor={NAVY} subColor={MUTED} />
          </div>
          <div>
            <SectionHead>Certifications & Credentials</SectionHead>
            <Bullets items={tpl.certs || tpl.certifications} size={9} color={TEXT} gap={2} />
          </div>
        </div>

        {/* Achievements & Languages Footer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginTop: 2 }}>
          {tpl.achievements?.length > 0 && (
            <div>
              <SectionHead>Executive Honors & Awards</SectionHead>
              <Bullets items={tpl.achievements} size={9} color={TEXT} gap={2} />
            </div>
          )}
          {tpl.languages?.length > 0 && (
            <div>
              <SectionHead>Languages</SectionHead>
              <p style={{ fontSize: 9, color: TEXT, margin: '4px 0 0', lineHeight: 1.5 }}>
                {tpl.languages.join('   ·   ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * 2. DL TECH — Software, Cybersecurity, AI, Engineering, Cloud
 * Frost-blue engineering top border, grouped tech badges, quantifiable metrics.
 * ───────────────────────────────────────────────────────────────────────── */
function DLTech({ tpl }) {
  const FROST = '#2FA3CC';
  const INK = '#0F1C2E';
  const MUTED = '#475569';
  const CHIP_BG = '#F0F9FD';
  const CHIP_BORDER = '#BAE6F7';

  const candidateName = getCandidateName(tpl);
  const candidateHeadline = getCandidateHeadline(tpl);
  const contactText = getContactText(tpl);

  const SectionHead = ({ children }) => (
    <h3
      style={{
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: FROST,
        margin: '10px 0 4px',
        paddingBottom: 2,
        borderBottom: `1.5px solid ${CHIP_BORDER}`,
      }}
    >
      {children}
    </h3>
  );

  return (
    <div style={{ width: PAGE_W, height: PAGE_H, padding: '26px 40px 24px', boxSizing: 'border-box', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Border */}
      <div style={{ borderTop: `3.5px solid ${FROST}`, paddingTop: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h1
            style={{
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontSize: 25,
              fontWeight: 800,
              color: INK,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            {candidateName}
          </h1>
          <span style={{ fontSize: 9, fontWeight: 700, color: FROST, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            ATS Engine Optimized · Cloud Native
          </span>
        </div>
        <p style={{ fontSize: 11, fontWeight: 600, color: FROST, margin: '2px 0 0' }}>{candidateHeadline}</p>
        <p style={{ fontSize: 8.8, color: MUTED, margin: '3px 0 0' }}>{contactText}</p>
      </div>

      {/* Tech Stack Chips Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0 6px' }}>
        {tpl.skills?.slice(0, 16).map((s, i) => (
          <span
            key={i}
            style={{
              fontSize: 8.5,
              fontWeight: 600,
              color: '#166580',
              background: CHIP_BG,
              border: `1px solid ${CHIP_BORDER}`,
              borderRadius: 3,
              padding: '1px 6px',
              whiteSpace: 'nowrap',
            }}
          >
            {s}
          </span>
        ))}
      </div>

      <p style={{ fontSize: 9.6, color: '#334155', lineHeight: 1.48, margin: '0 0 4px' }}>
        {tpl.summary}
      </p>

      {/* Experience */}
      <SectionHead>Technical & Engineering Experience</SectionHead>
      <ExperienceSection tpl={tpl} titleColor={INK} companyColor={MUTED} accentColor={FROST} />

      {/* Projects */}
      {tpl.projects?.length > 0 && (
        <>
          <SectionHead>Core Systems Architecture & Open Source</SectionHead>
          <ProjectsSection tpl={tpl} titleColor={INK} roleColor={FROST} />
        </>
      )}

      {/* Education & Certs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginTop: 2 }}>
        <div>
          <SectionHead>Education</SectionHead>
          <EducationSection tpl={tpl} titleColor={INK} subColor={MUTED} />
        </div>
        <div>
          <SectionHead>Verified Certifications</SectionHead>
          <Bullets items={tpl.certs || tpl.certifications} size={9} color={MUTED} gap={2} />
        </div>
      </div>

      {/* Achievements & Languages */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginTop: 2 }}>
        {tpl.achievements?.length > 0 && (
          <div>
            <SectionHead>Patents & Honors</SectionHead>
            <Bullets items={tpl.achievements} size={9} color={MUTED} gap={2} />
          </div>
        )}
        {tpl.languages?.length > 0 && (
          <div>
            <SectionHead>Languages</SectionHead>
            <p style={{ fontSize: 9, color: MUTED, margin: '4px 0 0', lineHeight: 1.45 }}>
              {tpl.languages.join('   ·   ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * 3. DL PROFESSIONAL — Business, Finance, Marketing, Operations, HR, Sales
 * Refined Georgia serif styling, soft royal violet accent, ROI & margin focus.
 * ───────────────────────────────────────────────────────────────────────── */
function DLProfessional({ tpl }) {
  const VIOLET = '#5A38D6';
  const VIOLET_LIGHT = '#E7DFFB';
  const INK = '#1E1B2E';
  const MUTED = '#545063';

  const candidateName = getCandidateName(tpl);
  const candidateHeadline = getCandidateHeadline(tpl);
  const contactText = getContactText(tpl);

  const SectionHead = ({ children }) => (
    <h3
      style={{
        fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
        fontSize: 10.5,
        fontWeight: 700,
        color: VIOLET,
        margin: '10px 0 4px',
        paddingBottom: 2,
        borderBottom: `1px solid ${VIOLET_LIGHT}`,
      }}
    >
      {children}
    </h3>
  );

  return (
    <div style={{ width: PAGE_W, height: PAGE_H, padding: '28px 40px 24px', boxSizing: 'border-box', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <h1
        style={{
          fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
          fontSize: 25,
          fontWeight: 700,
          color: INK,
          margin: 0,
        }}
      >
        {candidateName}
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '3px 0 0' }}>
        <div style={{ width: 22, height: 2, background: VIOLET, flexShrink: 0 }} />
        <p style={{ fontSize: 11, color: VIOLET, fontWeight: 600, margin: 0 }}>{candidateHeadline}</p>
      </div>
      <p style={{ fontSize: 9, color: MUTED, margin: '4px 0 0', letterSpacing: '0.01em' }}>{contactText}</p>
      <div style={{ height: 1, background: VIOLET_LIGHT, margin: '8px 0' }} />

      {/* Summary */}
      <p style={{ fontFamily: 'Georgia, serif', fontSize: 9.8, lineHeight: 1.5, color: INK, margin: 0 }}>
        {tpl.summary}
      </p>

      {/* Experience */}
      <SectionHead>Professional Career History</SectionHead>
      <ExperienceSection tpl={tpl} titleColor={INK} companyColor={MUTED} accentColor={VIOLET} />

      {/* Commercial Projects */}
      {tpl.projects?.length > 0 && (
        <>
          <SectionHead>Strategic M&A & Capital Deployment</SectionHead>
          <ProjectsSection tpl={tpl} titleColor={INK} roleColor={VIOLET} />
        </>
      )}

      {/* Core Competencies */}
      <SectionHead>Core Competencies & Functional Expertise</SectionHead>
      <p style={{ fontSize: 9.6, color: INK, lineHeight: 1.5, margin: 0 }}>
        {tpl.skills?.join('   ·   ')}
      </p>

      {/* Education & Certs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginTop: 2 }}>
        <div>
          <SectionHead>Education & Academic Honors</SectionHead>
          <EducationSection tpl={tpl} titleColor={INK} subColor={MUTED} />
        </div>
        <div>
          <SectionHead>Certifications & Licensures</SectionHead>
          <Bullets items={tpl.certs} size={9} color={MUTED} gap={2} />
        </div>
      </div>

      {/* Honors & Languages */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginTop: 2 }}>
        {tpl.achievements?.length > 0 && (
          <div>
            <SectionHead>Industry Recognitions</SectionHead>
            <Bullets items={tpl.achievements} size={9} color={MUTED} gap={2} />
          </div>
        )}
        {tpl.languages?.length > 0 && (
          <div>
            <SectionHead>Languages</SectionHead>
            <p style={{ fontSize: 9, color: MUTED, margin: '4px 0 0', lineHeight: 1.45 }}>
              {tpl.languages.join('   ·   ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * 4. DL EXECUTIVE — Leadership, CXO, Director, Senior Management
 * Premium dark ink band header, strategic leadership, Board & P&L scale.
 * ───────────────────────────────────────────────────────────────────────── */
function DLExecutive({ tpl }) {
  const DARK = '#112240';
  const INK = '#1E293B';
  const MUTED = '#475569';
  const ACCENT = '#1D5DB8';
  const RULE = '#CBD5E1';

  const candidateName = getCandidateName(tpl);
  const candidateHeadline = getCandidateHeadline(tpl);
  const contactText = getContactText(tpl);

  const SectionHead = ({ children }) => (
    <h3
      style={{
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: DARK,
        margin: '10px 0 4px',
        paddingBottom: 2,
        borderBottom: `1.5px solid ${RULE}`,
      }}
    >
      {children}
    </h3>
  );

  return (
    <div style={{ width: PAGE_W, height: PAGE_H, boxSizing: 'border-box', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      {/* Dark Header Band */}
      <div style={{ background: DARK, padding: '22px 38px 18px' }}>
        <h1
          style={{
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            fontSize: 25,
            fontWeight: 800,
            color: '#FFFFFF',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {candidateName}
        </h1>
        <p style={{ fontSize: 11, fontWeight: 500, color: tpl.headline ? '#93C5FD' : '#94A3B8', margin: '3px 0 0' }}>{candidateHeadline}</p>
        <p style={{ fontSize: 8.8, color: tpl.contact?.email ? '#CBD5E1' : '#94A3B8', margin: '4px 0 0', letterSpacing: '0.02em' }}>{contactText}</p>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 38px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontSize: 9.6, lineHeight: 1.5, color: INK, margin: '0 0 6px' }}>
          {tpl.summary}
        </p>

        {/* Experience */}
        <SectionHead>Executive Leadership & Board History</SectionHead>
        <ExperienceSection tpl={tpl} titleColor={DARK} companyColor={MUTED} accentColor={ACCENT} />

        {/* Board Directorships / Projects */}
        {tpl.projects?.length > 0 && (
          <>
            <SectionHead>Board Directorships & Key Transformations</SectionHead>
            <ProjectsSection tpl={tpl} titleColor={DARK} roleColor={ACCENT} />
          </>
        )}

        {/* Strategic Competencies */}
        <SectionHead>Executive Capabilities & Governance</SectionHead>
        <p style={{ fontSize: 9.5, color: INK, lineHeight: 1.5, margin: 0 }}>
          {tpl.skills?.join('   ·   ')}
        </p>

        {/* Education & Certs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16, marginTop: 2 }}>
          <div>
            <SectionHead>Executive Education</SectionHead>
            <EducationSection tpl={tpl} titleColor={DARK} subColor={MUTED} />
          </div>
          <div>
            <SectionHead>Board Credentials & Fellowships</SectionHead>
            <Bullets items={tpl.certs || tpl.certifications} size={9} color={MUTED} gap={2} />
          </div>
        </div>

        {/* Honors & Languages */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginTop: 2 }}>
          {tpl.achievements?.length > 0 && (
            <div>
              <SectionHead>Executive Recognition & Publications</SectionHead>
              <Bullets items={tpl.achievements} size={9} color={MUTED} gap={2} />
            </div>
          )}
          {tpl.languages?.length > 0 && (
            <div>
              <SectionHead>Languages</SectionHead>
              <p style={{ fontSize: 9, color: MUTED, margin: '4px 0 0', lineHeight: 1.45 }}>
                {tpl.languages.join('   ·   ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * 5. DL PROJECT+ — Students, Freshers, Internships, Career Switchers
 * Project-first structure with gradient header, visual sidebar (ATS DOM linear safe).
 * ───────────────────────────────────────────────────────────────────────── */
function DLProjectPlus({ tpl }) {
  const GRADIENT = 'linear-gradient(135deg, #2FA3CC 0%, #5A38D6 100%)';
  const INDIGO = '#1D5DB8';
  const INDIGO_LIGHT = '#DCE6F5';
  const SIDEBAR_W = 196;

  const candidateName = getCandidateName(tpl);
  const candidateHeadline = getCandidateHeadline(tpl);
  const contactText = getContactText(tpl);

  const SideLabel = ({ children }) => (
    <p
      style={{
        fontSize: 8.5,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#EAF7FC',
        margin: '10px 0 3px',
      }}
    >
      {children}
    </p>
  );

  return (
    <div style={{ width: PAGE_W, height: PAGE_H, boxSizing: 'border-box', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      {/* Name banner */}
      <div style={{ background: GRADIENT, padding: '20px 32px 16px' }}>
        <h1
          style={{
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            fontSize: 24,
            fontWeight: 800,
            color: '#FFFFFF',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {candidateName}
        </h1>
        <p style={{ fontSize: 11, color: '#EAF7FC', fontWeight: 500, margin: '2px 0 0' }}>{candidateHeadline}</p>
      </div>

      {/* Two-column layout: DOM order has Main first (for ATS linear reading), sidebar visually ordered */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Main Column (DOM 1st, flex order 2) */}
        <div style={{ flex: 1, order: 2, padding: '14px 28px 20px 20px', boxSizing: 'border-box' }}>
          <p style={{ fontSize: 9.6, lineHeight: 1.48, color: '#1E293B', margin: '0 0 6px' }}>
            {tpl.summary}
          </p>

          <h3
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#5A38D6',
              margin: '10px 0 4px',
              paddingBottom: 2,
              borderBottom: `1px solid ${INDIGO_LIGHT}`,
            }}
          >
            Key Projects & Open Source
          </h3>
          <ProjectsSection tpl={tpl} titleColor="#1E293B" roleColor={INDIGO} />

          <h3
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#5A38D6',
              margin: '10px 0 4px',
              paddingBottom: 2,
              borderBottom: `1px solid ${INDIGO_LIGHT}`,
            }}
          >
            Engineering Experience & Internships
          </h3>
          <ExperienceSection tpl={tpl} titleColor="#1E293B" companyColor="#475569" accentColor={INDIGO} />

          <h3
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#5A38D6',
              margin: '10px 0 4px',
              paddingBottom: 2,
              borderBottom: `1px solid ${INDIGO_LIGHT}`,
            }}
          >
            Education & Academic Track
          </h3>
          <EducationSection tpl={tpl} titleColor="#1E293B" subColor="#475569" />
        </div>

        {/* Sidebar (DOM 2nd, flex order 1) */}
        <aside
          style={{
            width: SIDEBAR_W,
            flexShrink: 0,
            order: 1,
            background: GRADIENT,
            padding: '10px 16px 20px',
            boxSizing: 'border-box',
          }}
        >
          <SideLabel>Contact Info</SideLabel>
          <p style={{ fontSize: 8.8, color: '#EAF7FC', lineHeight: 1.45, margin: 0 }}>
            {contactText.split('   |   ').map((item, i) => (
              <span key={i} style={{ display: 'block', marginBottom: 2 }}>{item}</span>
            ))}
          </p>

          <SideLabel>Technical Proficiencies</SideLabel>
          <ul style={{ margin: 0, paddingLeft: 12 }}>
            {tpl.skills?.map((s, i) => (
              <li key={i} style={{ fontSize: 8.6, color: '#FFFFFF', lineHeight: 1.45 }}>
                {s}
              </li>
            ))}
          </ul>

          {(tpl.certs || tpl.certifications)?.length > 0 && (
            <>
              <SideLabel>Certifications</SideLabel>
              <ul style={{ margin: 0, paddingLeft: 12 }}>
                {(tpl.certs || tpl.certifications).map((c, i) => (
                  <li key={i} style={{ fontSize: 8.2, color: '#EAF7FC', lineHeight: 1.4 }}>
                    {typeof c === 'string' ? c : `${c.name} — ${c.issuer}`}
                  </li>
                ))}
              </ul>
            </>
          )}

          {tpl.achievements?.length > 0 && (
            <>
              <SideLabel>Honors & Hackathons</SideLabel>
              <ul style={{ margin: 0, paddingLeft: 12 }}>
                {tpl.achievements.map((a, i) => (
                  <li key={i} style={{ fontSize: 8.2, color: '#EAF7FC', lineHeight: 1.4 }}>
                    {a}
                  </li>
                ))}
              </ul>
            </>
          )}

          {tpl.languages?.length > 0 && (
            <>
              <SideLabel>Languages</SideLabel>
              <p style={{ fontSize: 8.5, color: '#FFFFFF', margin: '2px 0 0', lineHeight: 1.4 }}>
                {tpl.languages.join(' · ')}
              </p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Dispatcher & Scale Wrapper
 * ───────────────────────────────────────────────────────────────────────── */

const LAYOUT_COMPONENTS = {
  'dl-elite': DLElite,
  'dl-tech': DLTech,
  'dl-professional': DLProfessional,
  'dl-executive': DLExecutive,
  'dl-modern': DLProjectPlus,
  'dl-project-plus': DLProjectPlus,
};

export function ResumeTemplatePreview({ template, className, crop = true }) {
  const boxRef = useRef(null);
  const scale = useFitScale(boxRef, [template?.id, crop]);

  if (!template) return null;

  const Layout = LAYOUT_COMPONENTS[template.layout] || LAYOUT_COMPONENTS[template.id] || DLElite;

  // The outer container calculates height precisely matching the scaled A4 document:
  // Height = PAGE_H * scale, maintaining the exact 794 : 1123 aspect ratio.
  const scaledHeight = scale > 0 ? PAGE_H * scale : undefined;

  return (
    <div
      ref={boxRef}
      className={className}
      style={{
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        aspectRatio: '794 / 1123',
        height: scaledHeight,
      }}
    >
      <div
        style={{
          width: PAGE_W,
          height: PAGE_H,
          minHeight: PAGE_H,
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          background: '#FFFFFF',
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          lineHeight: 1.45,
          color: '#111827',
          boxSizing: 'border-box',
        }}
      >
        <Layout tpl={template} />
      </div>
    </div>
  );
}

export default ResumeTemplatePreview;