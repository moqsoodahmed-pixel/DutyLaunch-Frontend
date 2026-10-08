import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../utils/cn.js';
import { enrichTemplateData } from '../../data/resumeTemplates.js';

/**
 * DutyLaunch Flagship Resume Template Preview Engine.
 *
 * Renders actual, ATS-compliant CV document previews for the DutyLaunch flagship templates:
 * 1. DL Elite        — Universal Professional (Aarav N. Kapoor / ATS Classic)
 * 2. DL Tech         — Software, Systems, AI, Cloud (Marcus Vance / ATS Minimal, Vikramaditya Singhania)
 * 3. DL Professional — Business, Finance, Operations, Strategy (Priya S. Sundaram / ATS Sales)
 * 4. DL Executive    — Leadership, CXO, Director, Senior Management (Dr. Rajeshwar Rao, Ph.D. / ATS Executive)
 * 5. DL Project+     — Students, Freshers, Modern Tech (Rohan S. Joshi / ATS Fresher, Ananya Deshmukh / ATS Modern)
 * 6. DL Finance      — Investment Banking, PE, FinTech & Quant (Siddharth M. Mehta / ATS Finance)
 * 7. DL Creative     — Product Design, UX Architecture & Creative Direction (Maya R. Chen / ATS Creative)
 *
 * Sizing & Layout Geometry:
 * Standard ISO 216 A4 dimensions: 794px × 1123px (standard 96 DPI web A4 proportion).
 * Proportional typography:
 * - Candidate Name: 30px - 32px (bold, high contrast)
 * - Headline: 13.5px
 * - Contact Line: 10.8px
 * - Section Headings: 12.2px (bold uppercase, crisp rule/underline)
 * - Roles & Project Titles: 12.8px (bold)
 * - Companies / Metas: 11.5px - 11.8px
 * - Bullets & Summaries: 11.2px - 11.4px with 1.5 - 1.55 line-height
 * - Skills & Chips: 10.5px
 *
 * Beautifully fills the full A4 sheet from top to bottom (no empty white void at the bottom,
 * zero stretched words or unnatural paragraph spacing, strict left alignment).
 */

export const PAGE_W = 794;
export const PAGE_H = 1123;

function useFitScale(ref, deps = []) {
  const [scale, setScale] = useState(0.35);

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

function Bullets({ items = [], size = 11.2, color = '#334155', gap = 4 }) {
  const clean = items.filter(Boolean);
  if (!clean.length) return null;
  return (
    <ul style={{ margin: '3px 0 0', paddingLeft: 18, textAlign: 'left' }}>
      {clean.map((b, i) => (
        <li key={i} style={{ fontSize: size, lineHeight: 1.5, color, marginBottom: gap, textAlign: 'left' }}>
          {b}
        </li>
      ))}
    </ul>
  );
}

function ExperienceSection({ tpl, titleColor = '#0F172A', companyColor = '#475569', metaColor = '#64748B', accentColor }) {
  const list = tpl.experience || [];
  if (!list.length) return null;
  return (
    <div style={{ marginTop: 2, display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
      {list.map((exp, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 12.8, fontWeight: 700, color: titleColor, textAlign: 'left' }}>
              {exp.title || 'Job Title'}
            </span>
            <span style={{ fontSize: 11, color: metaColor, whiteSpace: 'nowrap', fontWeight: 600, textAlign: 'right' }}>
              {exp.dates || ''}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '1px 0 3px' }}>
            <span style={{ fontSize: 11.8, fontWeight: 600, color: accentColor || companyColor, textAlign: 'left' }}>
              {exp.company || ''}
            </span>
            {exp.location && (
              <span style={{ fontSize: 10.5, color: '#64748B', textAlign: 'right' }}>{exp.location}</span>
            )}
          </div>
          <Bullets items={exp.bullets} size={11.2} color="#334155" gap={3.5} />
        </div>
      ))}
    </div>
  );
}

function ProjectsSection({ tpl, titleColor = '#0F172A', roleColor = '#475569' }) {
  const list = tpl.projects || [];
  if (!list.length) return null;
  return (
    <div style={{ marginTop: 2, display: 'flex', flexDirection: 'column', gap: 9, textAlign: 'left' }}>
      {list.map((p, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 12.8, fontWeight: 700, color: titleColor, textAlign: 'left' }}>{p.name}</span>
            <span style={{ fontSize: 11, color: roleColor, fontWeight: 600, textAlign: 'right' }}>{p.role}</span>
          </div>
          <p style={{ fontSize: 11.2, color: '#334155', margin: '2px 0 0', lineHeight: 1.5, textAlign: 'left' }}>{p.impact}</p>
        </div>
      ))}
    </div>
  );
}

function EducationSection({ tpl, titleColor = '#0F172A', subColor = '#475569' }) {
  const list = tpl.education || [];
  if (!list.length) return null;
  return (
    <div style={{ marginTop: 2, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
      {list.map((edu, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 12.8, fontWeight: 700, color: titleColor, textAlign: 'left' }}>{edu.degree || 'Degree / Qualification'}</span>
            <span style={{ fontSize: 11, color: '#64748B', whiteSpace: 'nowrap', fontWeight: 600, textAlign: 'right' }}>{edu.year || ''}</span>
          </div>
          <p style={{ fontSize: 11.2, color: subColor, margin: '2px 0 0', textAlign: 'left' }}>
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
 * 1. DL ELITE — Universal Professional (Aarav N. Kapoor, ATS Classic)
 * Authoritative serif candidate name, ink-navy vertical accent rail,
 * perfectly balanced single-column ATS hierarchy with full A4 flow.
 * ───────────────────────────────────────────────────────────────────────── */
function DLElite({ tpl }) {
  const NAVY = '#0B1F48';
  const AZURE = '#1D5DB8';
  const TEXT = '#1E293B';
  const MUTED = '#475569';

  const candidateName = getCandidateName(tpl);
  const candidateHeadline = getCandidateHeadline(tpl);
  const contactText = getContactText(tpl);

  const SectionHead = ({ children }) => (
    <h3
      style={{
        fontSize: 12.2,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: NAVY,
        margin: '0 0 5px',
        paddingBottom: 3,
        borderBottom: `2px solid ${NAVY}`,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        textAlign: 'left',
      }}
    >
      {children}
    </h3>
  );

  return (
    <div style={{ display: 'flex', width: PAGE_W, height: PAGE_H, boxSizing: 'border-box', background: '#FFFFFF', textAlign: 'left' }}>
      {/* Decorative vertical accent bar */}
      <div style={{ width: 7, background: NAVY, flexShrink: 0 }} />

      <div style={{ flex: 1, padding: '26px 36px 24px 30px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 14, textAlign: 'left' }}>
        {/* Header & Summary */}
        <div>
          <h1
            style={{
              fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
              fontSize: 32,
              fontWeight: 800,
              color: NAVY,
              margin: 0,
              letterSpacing: '-0.01em',
              textAlign: 'left',
            }}
          >
            {candidateName}
          </h1>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: AZURE, margin: '3px 0 0', textAlign: 'left' }}>
            {candidateHeadline}
          </p>
          <p style={{ fontSize: 10.8, color: MUTED, margin: '4px 0 0', letterSpacing: '0.01em', textAlign: 'left' }}>
            {contactText}
          </p>
          <div style={{ marginTop: 8 }}>
            <SectionHead>Professional Summary</SectionHead>
            <p style={{ fontSize: 11.4, lineHeight: 1.55, color: TEXT, margin: 0, textAlign: 'left' }}>
              {tpl.summary}
            </p>
          </div>
        </div>

        {/* Experience */}
        <div>
          <SectionHead>Professional Experience</SectionHead>
          <ExperienceSection tpl={tpl} titleColor={NAVY} companyColor={MUTED} accentColor={AZURE} />
        </div>

        {/* Projects / Strategic Initiatives */}
        {tpl.projects?.length > 0 && (
          <div>
            <SectionHead>Strategic Programs & Transformations</SectionHead>
            <ProjectsSection tpl={tpl} titleColor={NAVY} roleColor={AZURE} />
          </div>
        )}

        {/* Skills */}
        {tpl.skills?.length > 0 && (
          <div>
            <SectionHead>Core Competencies & Leadership Capabilities</SectionHead>
            <p style={{ fontSize: 11.2, color: TEXT, lineHeight: 1.5, margin: 0, textAlign: 'left' }}>
              {tpl.skills.join('   ·   ')}
            </p>
          </div>
        )}

        {/* Education & Certifications Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
          <div>
            <SectionHead>Education & Academic Honors</SectionHead>
            <EducationSection tpl={tpl} titleColor={NAVY} subColor={MUTED} />
          </div>
          <div>
            <SectionHead>Certifications & Credentials</SectionHead>
            <Bullets items={tpl.certs || tpl.certifications} size={11} color={TEXT} gap={3.5} />
          </div>
        </div>

        {/* Achievements & Languages Footer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
          {tpl.achievements?.length > 0 && (
            <div>
              <SectionHead>Executive Honors & Awards</SectionHead>
              <Bullets items={tpl.achievements} size={11} color={TEXT} gap={3.5} />
            </div>
          )}
          {tpl.languages?.length > 0 && (
            <div>
              <SectionHead>Languages</SectionHead>
              <p style={{ fontSize: 11, color: TEXT, margin: '2px 0 0', lineHeight: 1.5, textAlign: 'left' }}>
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
 * 2. DL TECH — Software, Systems, AI, Cloud (Marcus Vance, Vikramaditya Singhania)
 * Frost-blue engineering top border, grouped tech badges, quantifiable metrics.
 * ───────────────────────────────────────────────────────────────────────── */
function DLTech({ tpl }) {
  const FROST = '#0284C7';
  const INK = '#0F172A';
  const MUTED = '#475569';
  const CHIP_BG = '#F0F9FF';
  const CHIP_BORDER = '#BAE6FD';

  const candidateName = getCandidateName(tpl);
  const candidateHeadline = getCandidateHeadline(tpl);
  const contactText = getContactText(tpl);

  const SectionHead = ({ children }) => (
    <h3
      style={{
        fontSize: 12.2,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: FROST,
        margin: '0 0 5px',
        paddingBottom: 3,
        borderBottom: `2px solid ${CHIP_BORDER}`,
        textAlign: 'left',
      }}
    >
      {children}
    </h3>
  );

  return (
    <div style={{ width: PAGE_W, height: PAGE_H, padding: '26px 36px 24px', boxSizing: 'border-box', background: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 14, textAlign: 'left' }}>
      {/* Top Header Border & Summary */}
      <div>
        <div style={{ borderTop: `4px solid ${FROST}`, paddingTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h1
              style={{
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 32,
                fontWeight: 800,
                color: INK,
                margin: 0,
                letterSpacing: '-0.02em',
                textAlign: 'left',
              }}
            >
              {candidateName}
            </h1>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: FROST, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ATS Engine Optimized · Cloud Native
            </span>
          </div>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: FROST, margin: '3px 0 0', textAlign: 'left' }}>{candidateHeadline}</p>
          <p style={{ fontSize: 10.8, color: MUTED, margin: '4px 0 0', textAlign: 'left' }}>{contactText}</p>
        </div>

        {/* Tech Stack Chips Bar */}
        {tpl.skills?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, margin: '8px 0 8px' }}>
            {tpl.skills.slice(0, 16).map((s, i) => (
              <span
                key={i}
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: '#0369A1',
                  background: CHIP_BG,
                  border: `1px solid ${CHIP_BORDER}`,
                  borderRadius: 4,
                  padding: '2px 8px',
                  whiteSpace: 'nowrap',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <p style={{ fontSize: 11.4, color: '#334155', lineHeight: 1.55, margin: '2px 0 0', textAlign: 'left' }}>
          {tpl.summary}
        </p>
      </div>

      {/* Experience */}
      <div>
        <SectionHead>Technical & Engineering Experience</SectionHead>
        <ExperienceSection tpl={tpl} titleColor={INK} companyColor={MUTED} accentColor={FROST} />
      </div>

      {/* Projects */}
      {tpl.projects?.length > 0 && (
        <div>
          <SectionHead>Core Systems Architecture & Open Source</SectionHead>
          <ProjectsSection tpl={tpl} titleColor={INK} roleColor={FROST} />
        </div>
      )}

      {/* Education & Certs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
        <div>
          <SectionHead>Education</SectionHead>
          <EducationSection tpl={tpl} titleColor={INK} subColor={MUTED} />
        </div>
        <div>
          <SectionHead>Verified Certifications</SectionHead>
          <Bullets items={tpl.certs || tpl.certifications} size={11} color={MUTED} gap={3.5} />
        </div>
      </div>

      {/* Achievements & Languages */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        {tpl.achievements?.length > 0 && (
          <div>
            <SectionHead>Patents & Honors</SectionHead>
            <Bullets items={tpl.achievements} size={11} color={MUTED} gap={3.5} />
          </div>
        )}
        {tpl.languages?.length > 0 && (
          <div>
            <SectionHead>Languages</SectionHead>
            <p style={{ fontSize: 11, color: MUTED, margin: '2px 0 0', lineHeight: 1.5, textAlign: 'left' }}>
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
  const VIOLET_LIGHT = '#DDD6FE';
  const INK = '#0F172A';
  const MUTED = '#475569';

  const candidateName = getCandidateName(tpl);
  const candidateHeadline = getCandidateHeadline(tpl);
  const contactText = getContactText(tpl);

  const SectionHead = ({ children }) => (
    <h3
      style={{
        fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
        fontSize: 12.5,
        fontWeight: 700,
        color: VIOLET,
        margin: '0 0 5px',
        paddingBottom: 3,
        borderBottom: `2px solid ${VIOLET_LIGHT}`,
        textAlign: 'left',
      }}
    >
      {children}
    </h3>
  );

  return (
    <div style={{ width: PAGE_W, height: PAGE_H, padding: '26px 36px 24px', boxSizing: 'border-box', background: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 14, textAlign: 'left' }}>
      {/* Header & Summary */}
      <div>
        <h1
          style={{
            fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
            fontSize: 32,
            fontWeight: 700,
            color: INK,
            margin: 0,
            textAlign: 'left',
          }}
        >
          {candidateName}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 0' }}>
          <div style={{ width: 24, height: 2.5, background: VIOLET, flexShrink: 0 }} />
          <p style={{ fontSize: 13.5, color: VIOLET, fontWeight: 600, margin: 0, textAlign: 'left' }}>{candidateHeadline}</p>
        </div>
        <p style={{ fontSize: 10.8, color: MUTED, margin: '4px 0 0', letterSpacing: '0.01em', textAlign: 'left' }}>{contactText}</p>
        <div style={{ height: 1.5, background: VIOLET_LIGHT, margin: '8px 0' }} />

        {/* Summary */}
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 11.4, lineHeight: 1.55, color: INK, margin: 0, textAlign: 'left' }}>
          {tpl.summary}
        </p>
      </div>

      {/* Experience */}
      <div>
        <SectionHead>Professional Career History</SectionHead>
        <ExperienceSection tpl={tpl} titleColor={INK} companyColor={MUTED} accentColor={VIOLET} />
      </div>

      {/* Commercial Projects */}
      {tpl.projects?.length > 0 && (
        <div>
          <SectionHead>Strategic M&A & Capital Deployment</SectionHead>
          <ProjectsSection tpl={tpl} titleColor={INK} roleColor={VIOLET} />
        </div>
      )}

      {/* Core Competencies */}
      {tpl.skills?.length > 0 && (
        <div>
          <SectionHead>Core Competencies & Functional Expertise</SectionHead>
          <p style={{ fontSize: 11.2, color: INK, lineHeight: 1.5, margin: 0, textAlign: 'left' }}>
            {tpl.skills.join('   ·   ')}
          </p>
        </div>
      )}

      {/* Education & Certs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
        <div>
          <SectionHead>Education & Academic Honors</SectionHead>
          <EducationSection tpl={tpl} titleColor={INK} subColor={MUTED} />
        </div>
        <div>
          <SectionHead>Certifications & Licensures</SectionHead>
          <Bullets items={tpl.certs} size={11} color={MUTED} gap={3.5} />
        </div>
      </div>

      {/* Honors & Languages */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        {tpl.achievements?.length > 0 && (
          <div>
            <SectionHead>Industry Recognitions</SectionHead>
            <Bullets items={tpl.achievements} size={11} color={MUTED} gap={3.5} />
          </div>
        )}
        {tpl.languages?.length > 0 && (
          <div>
            <SectionHead>Languages</SectionHead>
            <p style={{ fontSize: 11, color: MUTED, margin: '2px 0 0', lineHeight: 1.5, textAlign: 'left' }}>
              {tpl.languages.join('   ·   ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * 4. DL EXECUTIVE — Leadership, CXO, Director, Senior Management (Dr. Rajeshwar Rao)
 * Premium dark ink band header, strategic leadership, Board & P&L scale.
 * ───────────────────────────────────────────────────────────────────────── */
function DLExecutive({ tpl }) {
  const DARK = '#0F172A';
  const INK = '#1E293B';
  const MUTED = '#475569';
  const ACCENT = '#2563EB';
  const RULE = '#CBD5E1';

  const candidateName = getCandidateName(tpl);
  const candidateHeadline = getCandidateHeadline(tpl);
  const contactText = getContactText(tpl);

  const SectionHead = ({ children }) => (
    <h3
      style={{
        fontSize: 12.2,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: DARK,
        margin: '0 0 5px',
        paddingBottom: 3,
        borderBottom: `2px solid ${RULE}`,
        textAlign: 'left',
      }}
    >
      {children}
    </h3>
  );

  return (
    <div style={{ width: PAGE_W, height: PAGE_H, boxSizing: 'border-box', background: '#FFFFFF', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
      {/* Dark Header Band */}
      <div style={{ background: DARK, padding: '24px 38px 20px', textAlign: 'left' }}>
        <h1
          style={{
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 32,
            fontWeight: 800,
            color: '#FFFFFF',
            margin: 0,
            letterSpacing: '-0.01em',
            textAlign: 'left',
          }}
        >
          {candidateName}
        </h1>
        <p style={{ fontSize: 13.5, fontWeight: 500, color: tpl.headline ? '#93C5FD' : '#94A3B8', margin: '4px 0 0', textAlign: 'left' }}>{candidateHeadline}</p>
        <p style={{ fontSize: 10.8, color: tpl.contact?.email ? '#CBD5E1' : '#94A3B8', margin: '5px 0 0', letterSpacing: '0.02em', textAlign: 'left' }}>{contactText}</p>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 36px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 14, textAlign: 'left' }}>
        <div>
          <p style={{ fontSize: 11.4, lineHeight: 1.55, color: INK, margin: 0, textAlign: 'left' }}>
            {tpl.summary}
          </p>
        </div>

        {/* Experience */}
        <div>
          <SectionHead>Executive Leadership & Board History</SectionHead>
          <ExperienceSection tpl={tpl} titleColor={DARK} companyColor={MUTED} accentColor={ACCENT} />
        </div>

        {/* Board Directorships / Projects */}
        {tpl.projects?.length > 0 && (
          <div>
            <SectionHead>Board Directorships & Key Transformations</SectionHead>
            <ProjectsSection tpl={tpl} titleColor={DARK} roleColor={ACCENT} />
          </div>
        )}

        {/* Strategic Competencies */}
        {tpl.skills?.length > 0 && (
          <div>
            <SectionHead>Executive Capabilities & Governance</SectionHead>
            <p style={{ fontSize: 11.2, color: INK, lineHeight: 1.5, margin: 0, textAlign: 'left' }}>
              {tpl.skills.join('   ·   ')}
            </p>
          </div>
        )}

        {/* Education & Certs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18 }}>
          <div>
            <SectionHead>Executive Education</SectionHead>
            <EducationSection tpl={tpl} titleColor={DARK} subColor={MUTED} />
          </div>
          <div>
            <SectionHead>Board Credentials & Fellowships</SectionHead>
            <Bullets items={tpl.certs || tpl.certifications} size={11} color={MUTED} gap={3.5} />
          </div>
        </div>

        {/* Honors & Languages */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
          {tpl.achievements?.length > 0 && (
            <div>
              <SectionHead>Executive Recognition & Publications</SectionHead>
              <Bullets items={tpl.achievements} size={11} color={MUTED} gap={3.5} />
            </div>
          )}
          {tpl.languages?.length > 0 && (
            <div>
              <SectionHead>Languages</SectionHead>
              <p style={{ fontSize: 11, color: MUTED, margin: '2px 0 0', lineHeight: 1.5, textAlign: 'left' }}>
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
 * 5. DL PROJECT+ — Students, Freshers, Modern Tech (Rohan S. Joshi, Ananya Deshmukh)
 * Project-first structure with gradient header, visual sidebar (ATS DOM linear safe).
 * Proportioned to fill the full A4 sheet with crisp typography and zero empty space.
 * ───────────────────────────────────────────────────────────────────────── */
function DLProjectPlus({ tpl }) {
  const GRADIENT = 'linear-gradient(135deg, #0284C7 0%, #4F46E5 100%)';
  const INDIGO = '#4F46E5';
  const INDIGO_LIGHT = '#C7D2FE';
  const SIDEBAR_W = 215;

  const candidateName = getCandidateName(tpl);
  const candidateHeadline = getCandidateHeadline(tpl);
  const contactText = getContactText(tpl);

  const SideLabel = ({ children }) => (
    <p
      style={{
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#E0F2FE',
        margin: '0 0 5px',
        textAlign: 'left',
      }}
    >
      {children}
    </p>
  );

  return (
    <div style={{ width: PAGE_W, height: PAGE_H, boxSizing: 'border-box', background: '#FFFFFF', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
      {/* Name banner */}
      <div style={{ background: GRADIENT, padding: '22px 34px 18px', textAlign: 'left' }}>
        <h1
          style={{
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 30,
            fontWeight: 800,
            color: '#FFFFFF',
            margin: 0,
            letterSpacing: '-0.01em',
            textAlign: 'left',
          }}
        >
          {candidateName}
        </h1>
        <p style={{ fontSize: 13, color: '#E0F2FE', fontWeight: 500, margin: '3px 0 0', textAlign: 'left' }}>{candidateHeadline}</p>
      </div>

      {/* Two-column layout: DOM order has Main first (for ATS linear reading), sidebar visually ordered */}
      <div style={{ display: 'flex', flex: 1, textAlign: 'left' }}>
        {/* Main Column (DOM 1st, flex order 2) */}
        <div style={{ flex: 1, order: 2, padding: '20px 28px 24px 22px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 15, textAlign: 'left' }}>
          <div>
            <p style={{ fontSize: 11.4, lineHeight: 1.55, color: '#1E293B', margin: 0, textAlign: 'left' }}>
              {tpl.summary}
            </p>
          </div>

          {tpl.projects?.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: 12.2,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: INDIGO,
                  margin: '0 0 5px',
                  paddingBottom: 3,
                  borderBottom: `2px solid ${INDIGO_LIGHT}`,
                  textAlign: 'left',
                }}
              >
                Key Projects & Open Source
              </h3>
              <ProjectsSection tpl={tpl} titleColor="#0F172A" roleColor={INDIGO} />
            </div>
          )}

          {tpl.experience?.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: 12.2,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: INDIGO,
                  margin: '0 0 5px',
                  paddingBottom: 3,
                  borderBottom: `2px solid ${INDIGO_LIGHT}`,
                  textAlign: 'left',
                }}
              >
                Engineering Experience & Internships
              </h3>
              <ExperienceSection tpl={tpl} titleColor="#0F172A" companyColor="#475569" accentColor={INDIGO} />
            </div>
          )}

          {tpl.education?.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: 12.2,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: INDIGO,
                  margin: '0 0 5px',
                  paddingBottom: 3,
                  borderBottom: `2px solid ${INDIGO_LIGHT}`,
                  textAlign: 'left',
                }}
              >
                Education & Academic Track
              </h3>
              <EducationSection tpl={tpl} titleColor="#0F172A" subColor="#475569" />
            </div>
          )}
        </div>

        {/* Sidebar (DOM 2nd, flex order 1) */}
        <aside
          style={{
            width: SIDEBAR_W,
            flexShrink: 0,
            order: 1,
            background: GRADIENT,
            padding: '20px 18px 24px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: 16,
            textAlign: 'left',
          }}
        >
          <div>
            <SideLabel>Contact Info</SideLabel>
            <p style={{ fontSize: 10.2, color: '#E0F2FE', lineHeight: 1.5, margin: 0, textAlign: 'left' }}>
              {contactText.split('   |   ').map((item, i) => (
                <span key={i} style={{ display: 'block', marginBottom: 3 }}>{item}</span>
              ))}
            </p>
          </div>

          {tpl.skills?.length > 0 && (
            <div>
              <SideLabel>Technical Proficiencies</SideLabel>
              <ul style={{ margin: 0, paddingLeft: 14, textAlign: 'left' }}>
                {tpl.skills.map((s, i) => (
                  <li key={i} style={{ fontSize: 10.2, color: '#FFFFFF', lineHeight: 1.5, textAlign: 'left' }}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(tpl.certs || tpl.certifications)?.length > 0 && (
            <div>
              <SideLabel>Certifications</SideLabel>
              <ul style={{ margin: 0, paddingLeft: 14, textAlign: 'left' }}>
                {(tpl.certs || tpl.certifications).map((c, i) => (
                  <li key={i} style={{ fontSize: 9.8, color: '#E0F2FE', lineHeight: 1.45, textAlign: 'left' }}>
                    {typeof c === 'string' ? c : `${c.name} — ${c.issuer}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tpl.achievements?.length > 0 && (
            <div>
              <SideLabel>Honors & Hackathons</SideLabel>
              <ul style={{ margin: 0, paddingLeft: 14, textAlign: 'left' }}>
                {tpl.achievements.map((a, i) => (
                  <li key={i} style={{ fontSize: 9.8, color: '#E0F2FE', lineHeight: 1.45, textAlign: 'left' }}>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tpl.languages?.length > 0 && (
            <div>
              <SideLabel>Languages</SideLabel>
              <p style={{ fontSize: 10.2, color: '#FFFFFF', margin: 0, lineHeight: 1.45, textAlign: 'left' }}>
                {tpl.languages.join(' · ')}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * 6. DL FINANCE — Investment Banking, PE, FinTech & Quantitative (Siddharth M. Mehta)
 * Emerald & slate accents, tabular hierarchy, concise deal/metric structure.
 * ───────────────────────────────────────────────────────────────────────── */
function DLFinance({ tpl }) {
  const EMERALD = '#0D9488';
  const DARK = '#0F172A';
  const MUTED = '#475569';
  const BORDER = '#CBD5E1';

  const candidateName = getCandidateName(tpl);
  const candidateHeadline = getCandidateHeadline(tpl);
  const contactText = getContactText(tpl);

  const SectionHead = ({ children }) => (
    <h3
      style={{
        fontSize: 12.2,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: DARK,
        margin: '0 0 5px',
        paddingBottom: 3,
        borderBottom: `2px solid ${BORDER}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        textAlign: 'left',
      }}
    >
      <span>{children}</span>
      <span style={{ fontSize: 9.5, color: EMERALD, fontWeight: 700, letterSpacing: '0.05em' }}>ATS FISCAL</span>
    </h3>
  );

  return (
    <div style={{ width: PAGE_W, height: PAGE_H, padding: '26px 36px 24px', boxSizing: 'border-box', background: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 14, textAlign: 'left' }}>
      {/* Top Banner & Summary */}
      <div>
        <div style={{ textAlign: 'left', borderBottom: `2px solid ${DARK}`, paddingBottom: 8 }}>
          <h1 style={{ fontFamily: 'Georgia, Cambria, serif', fontSize: 32, fontWeight: 700, color: DARK, margin: 0, textAlign: 'left' }}>
            {candidateName}
          </h1>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: EMERALD, margin: '3px 0 0', textAlign: 'left' }}>{candidateHeadline}</p>
          <p style={{ fontSize: 10.8, color: MUTED, margin: '4px 0 0', textAlign: 'left' }}>{contactText}</p>
        </div>

        {/* Summary */}
        <div style={{ marginTop: 8 }}>
          <SectionHead>Executive Financial Profile</SectionHead>
          <p style={{ fontSize: 11.4, color: '#334155', lineHeight: 1.55, margin: 0, textAlign: 'left' }}>{tpl.summary}</p>
        </div>
      </div>

      {/* Experience */}
      <div>
        <SectionHead>Investment Banking & Transaction Experience</SectionHead>
        <ExperienceSection tpl={tpl} titleColor={DARK} companyColor={MUTED} accentColor={EMERALD} />
      </div>

      {/* Projects / Transactions */}
      {tpl.projects?.length > 0 && (
        <div>
          <SectionHead>Selected M&A & Financing Mandates</SectionHead>
          <ProjectsSection tpl={tpl} titleColor={DARK} roleColor={EMERALD} />
        </div>
      )}

      {/* Competencies */}
      {tpl.skills?.length > 0 && (
        <div>
          <SectionHead>Quantitative & Financial Core Competencies</SectionHead>
          <p style={{ fontSize: 11.2, color: '#334155', lineHeight: 1.5, margin: 0, textAlign: 'left' }}>
            {tpl.skills.join('   ·   ')}
          </p>
        </div>
      )}

      {/* Education & Certifications Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
        <div>
          <SectionHead>Academic Credentials</SectionHead>
          <EducationSection tpl={tpl} titleColor={DARK} subColor={MUTED} />
        </div>
        <div>
          <SectionHead>Licenses & Certifications</SectionHead>
          <Bullets items={tpl.certs || tpl.certifications} size={11} color={MUTED} gap={3.5} />
        </div>
      </div>

      {/* Honors & Languages */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        {tpl.achievements?.length > 0 && (
          <div>
            <SectionHead>Deal Honors & Recognitions</SectionHead>
            <Bullets items={tpl.achievements} size={11} color={MUTED} gap={3.5} />
          </div>
        )}
        {tpl.languages?.length > 0 && (
          <div>
            <SectionHead>Languages</SectionHead>
            <p style={{ fontSize: 11, color: MUTED, margin: '2px 0 0', lineHeight: 1.5, textAlign: 'left' }}>
              {tpl.languages.join('   ·   ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * 7. DL CREATIVE — Product Design, UX Architecture & Creative Direction (Maya R. Chen)
 * Refined geometric layout with indigo-violet accents and case study focus.
 * ───────────────────────────────────────────────────────────────────────── */
function DLCreative({ tpl }) {
  const INDIGO = '#4F46E5';
  const INK = '#0F172A';
  const MUTED = '#475569';

  const candidateName = getCandidateName(tpl);
  const candidateHeadline = getCandidateHeadline(tpl);
  const contactText = getContactText(tpl);

  const SectionHead = ({ children }) => (
    <h3
      style={{
        fontSize: 12.2,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: INDIGO,
        margin: '0 0 5px',
        paddingBottom: 3,
        borderBottom: '2px solid #E2E8F0',
        textAlign: 'left',
      }}
    >
      {children}
    </h3>
  );

  return (
    <div style={{ width: PAGE_W, height: PAGE_H, padding: '26px 36px 24px', boxSizing: 'border-box', background: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 14, textAlign: 'left' }}>
      {/* Top Banner & Summary */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #E2E8F0', paddingBottom: 10 }}>
          <div>
            <h1 style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 32, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.02em', textAlign: 'left' }}>
              {candidateName}
            </h1>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: INDIGO, margin: '3px 0 0', textAlign: 'left' }}>{candidateHeadline}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#FFFFFF', background: INDIGO, padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase' }}>
              Design Systems & UX
            </span>
          </div>
        </div>
        <p style={{ fontSize: 10.8, color: MUTED, margin: '5px 0 0', textAlign: 'left' }}>{contactText}</p>

        {/* Summary */}
        <div style={{ marginTop: 8 }}>
          <SectionHead>Design Philosophy & Professional Summary</SectionHead>
          <p style={{ fontSize: 11.4, color: '#1E293B', lineHeight: 1.55, margin: 0, textAlign: 'left' }}>{tpl.summary}</p>
        </div>
      </div>

      {/* Experience */}
      <div>
        <SectionHead>Product Design & Architecture Experience</SectionHead>
        <ExperienceSection tpl={tpl} titleColor={INK} companyColor={MUTED} accentColor={INDIGO} />
      </div>

      {/* Key Projects */}
      {tpl.projects?.length > 0 && (
        <div>
          <SectionHead>Featured Design Systems & Case Studies</SectionHead>
          <ProjectsSection tpl={tpl} titleColor={INK} roleColor={INDIGO} />
        </div>
      )}

      {/* Skills */}
      {tpl.skills?.length > 0 && (
        <div>
          <SectionHead>Design Tooling & Systems Methodologies</SectionHead>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, margin: '4px 0' }}>
            {tpl.skills.slice(0, 16).map((s, i) => (
              <span
                key={i}
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: INDIGO,
                  background: '#EEF2FF',
                  border: '1px solid #E0E7FF',
                  borderRadius: 4,
                  padding: '2px 8px',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Education & Certs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
        <div>
          <SectionHead>Education</SectionHead>
          <EducationSection tpl={tpl} titleColor={INK} subColor={MUTED} />
        </div>
        <div>
          <SectionHead>Credentials & Honors</SectionHead>
          <Bullets items={tpl.certs || tpl.certifications} size={11} color={MUTED} gap={3.5} />
        </div>
      </div>

      {/* Honors & Languages */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        {tpl.achievements?.length > 0 && (
          <div>
            <SectionHead>Design Awards & Speaking</SectionHead>
            <Bullets items={tpl.achievements} size={11} color={MUTED} gap={3.5} />
          </div>
        )}
        {tpl.languages?.length > 0 && (
          <div>
            <SectionHead>Languages</SectionHead>
            <p style={{ fontSize: 11, color: MUTED, margin: '2px 0 0', lineHeight: 1.5, textAlign: 'left' }}>
              {tpl.languages.join('   ·   ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Dispatcher & Scale Wrapper
 * ───────────────────────────────────────────────────────────────────────── */

const LAYOUT_COMPONENTS = {
  'dl-elite': DLElite,
  'ats-classic': DLElite,
  'dl-tech': DLTech,
  'ats-technology': DLTech,
  'ats-minimal': DLTech,
  'dl-professional': DLProfessional,
  'ats-sales': DLProfessional,
  'ats-operations': DLElite,
  'dl-executive': DLExecutive,
  'ats-executive': DLExecutive,
  'dl-modern': DLProjectPlus,
  'ats-modern': DLProjectPlus,
  'dl-project-plus': DLProjectPlus,
  'ats-fresher': DLProjectPlus,
  'dl-finance': DLFinance,
  'ats-finance': DLFinance,
  'dl-creative': DLCreative,
  'ats-international': DLCreative,
};

export function ResumeTemplatePreview({ template, className, crop = true, allowOverflow = false, onOverflow }) {
  const boxRef = useRef(null);
  const sheetRef = useRef(null);
  const scale = useFitScale(boxRef, [template?.id, crop]);

  const resolved = useMemo(() => enrichTemplateData(template), [template]);

  // allowOverflow is a separate, opt-in prop (default false) rather than
  // reusing `crop` — `crop` never actually changed the clipping behaviour
  // below (it was only ever used to retrigger the scale calculation), so
  // every existing crop={false} caller (galleries, showcases, the live
  // builder) already depends on this box always clipping to one page.
  // Changing that default would risk breaking those. allowOverflow instead
  // only affects callers that explicitly ask for it — today just the
  // "review before you download" screen — where we must NOT silently clip
  // content taller than one A4 page: the box below used to hard-crop to
  // exactly one page with overflow hidden, so anything past that vanished
  // on screen AND in the printed PDF with no sign anything was missing.
  const [overflowPx, setOverflowPx] = useState(0);
  useEffect(() => {
    if (!allowOverflow || !sheetRef.current) return undefined;
    const measure = () => {
      const h = sheetRef.current?.scrollHeight || 0;
      const extra = Math.max(0, h - PAGE_H);
      setOverflowPx(extra);
      onOverflow?.(extra);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(sheetRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowOverflow, resolved]);

  if (!resolved) return null;

  const Layout =
    LAYOUT_COMPONENTS[resolved.layout] ||
    LAYOUT_COMPONENTS[resolved.id] ||
    LAYOUT_COMPONENTS[resolved.aliasId] ||
    DLElite;

  // The outer container maintains exact A4 document ratio (794 : 1123) by
  // default. With allowOverflow it grows to fit whatever the content
  // actually needs instead of forcing a single-page height.
  const scaledHeight = scale > 0 ? PAGE_H * scale : undefined;
  const overflowScaledHeight = scale > 0 ? (PAGE_H + overflowPx) * scale : undefined;

  return (
    <div
      ref={boxRef}
      data-resume-protect="true"
      onContextMenu={(e) => e.preventDefault()}
      className={cn('dl-resume-preview-box dl-protected-preview select-none', className)}
      style={{
        overflow: allowOverflow ? 'visible' : 'hidden',
        position: 'relative',
        width: '100%',
        aspectRatio: allowOverflow ? undefined : '794 / 1123',
        height: allowOverflow ? overflowScaledHeight : scaledHeight,
        textAlign: 'left',
      }}
    >
      <div
        ref={sheetRef}
        data-resume-sheet="true"
        className="dl-resume-a4-sheet"
        style={{
          width: PAGE_W,
          height: allowOverflow ? undefined : PAGE_H,
          minHeight: PAGE_H,
          transformOrigin: 'top left',
          transform: `scale(${scale}) translateZ(0)`,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
          imageRendering: '-webkit-optimize-contrast',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          background: '#FFFFFF',
          // Arial first, not "Helvetica Neue": on some Windows machines a
          // partial/incomplete "Helvetica Neue" font file is registered
          // (bundled with some Office/Adobe installs), and the OS can
          // synthesize bold for glyphs missing from that broken file
          // instead of cleanly falling back to Arial — the exact cause of
          // individual bold-looking letters (commonly "i") in printed
          // PDFs. Leading with Arial avoids that file entirely.
          fontFamily: 'Arial, Helvetica, sans-serif',
          lineHeight: 1.5,
          color: '#0F172A',
          boxSizing: 'border-box',
          textAlign: 'left',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}
      >
        <Layout tpl={resolved} />
      </div>
    </div>
  );
}

export default ResumeTemplatePreview;