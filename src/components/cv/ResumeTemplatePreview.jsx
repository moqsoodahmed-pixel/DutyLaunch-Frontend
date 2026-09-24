import { useEffect, useRef, useState } from 'react';

/**
 * Renders a real, ATS-formatted CV document for a given role template and
 * scales it to whatever box it is dropped into.
 *
 * The document is laid out at true A4 (794 x 1123 CSS px at 96dpi) and then
 * transform-scaled, so a thumbnail and the full-size modal preview are the
 * same markup at different scales — no separate "small" artwork to keep in
 * sync, and the text stays crisp because it is text, not an image.
 *
 * ATS rules deliberately followed in every layout below:
 *   - one text flow, top to bottom (the sidebar variants place the rail AFTER
 *     the main column in DOM order, so a parser reads role history first)
 *   - no <table> for layout, no text boxes, no multi-column text
 *   - real headings in document order: Summary, Experience, Skills, Education
 *   - dates in a consistent "MM/YYYY – MM/YYYY" form on the same line as role
 *   - no images, icons or graphics carrying information
 */

const PAGE_W = 794;
const PAGE_H = 1123;

const CONTACT = 'your.email@example.com  |  +91 00000 00000  |  City, Country  |  linkedin.com/in/yourprofile';
const COMPANIES = ['Company Name', 'Previous Company', 'Earlier Employer'];
const DATES = ['MM/YYYY – Present', 'MM/YYYY – MM/YYYY', 'MM/YYYY – MM/YYYY'];

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

function SectionTitle({ children, rule = true, center = false }) {
  return (
    <h3
      style={{
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#0f1f3d',
        margin: '18px 0 6px',
        paddingBottom: rule ? 4 : 0,
        borderBottom: rule ? '1px solid #0f1f3d' : 'none',
        textAlign: center ? 'center' : 'left',
      }}
    >
      {children}
    </h3>
  );
}

function Bullets({ items, size = 11.5 }) {
  return (
    <ul style={{ margin: '4px 0 0', paddingLeft: 16 }}>
      {items.map((b, i) => (
        <li key={i} style={{ fontSize: size, lineHeight: 1.45, color: '#26334d', marginBottom: 2 }}>
          {b}
        </li>
      ))}
    </ul>
  );
}

function ExperienceBlock({ tpl, count = 3, size = 11.5 }) {
  return COMPANIES.slice(0, count).map((company, i) => (
    <div key={company} style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontSize: size + 1, fontWeight: 700, color: '#0f1f3d' }}>
          {tpl.titles[i] || tpl.titles[0]}
        </span>
        <span style={{ fontSize: size - 0.5, color: '#5b6880', whiteSpace: 'nowrap' }}>{DATES[i]}</span>
      </div>
      <div style={{ fontSize: size, color: '#26334d', fontStyle: 'italic' }}>{company} — City, Country</div>
      <Bullets items={tpl.bullets.slice(0, i === 0 ? 4 : 2)} size={size} />
    </div>
  ));
}

function SkillsInline({ tpl, size = 11.5 }) {
  return (
    <p style={{ fontSize: size, lineHeight: 1.6, color: '#26334d', margin: 0 }}>
      {tpl.skills.join('  •  ')}
    </p>
  );
}

function EducationBlock({ tpl, size = 11.5 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: size, color: '#26334d' }}>
        <strong style={{ color: '#0f1f3d' }}>{tpl.degree}</strong> — University / Institution Name
      </span>
      <span style={{ fontSize: size - 0.5, color: '#5b6880', whiteSpace: 'nowrap' }}>YYYY – YYYY</span>
    </div>
  );
}

/* ---------------- layouts ---------------- */

function Classic({ tpl }) {
  return (
    <div style={{ padding: '46px 56px' }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '0.02em', color: '#0f1f3d', margin: 0 }}>
        YOUR NAME
      </h1>
      <p style={{ fontSize: 13.5, color: '#1d5db8', fontWeight: 600, margin: '4px 0 0' }}>{tpl.headline}</p>
      <p style={{ fontSize: 11, color: '#5b6880', margin: '6px 0 0' }}>{CONTACT}</p>

      <SectionTitle>Professional Summary</SectionTitle>
      <p style={{ fontSize: 11.5, lineHeight: 1.5, color: '#26334d', margin: 0 }}>{tpl.summary}</p>

      <SectionTitle>Professional Experience</SectionTitle>
      <ExperienceBlock tpl={tpl} />

      <SectionTitle>Skills</SectionTitle>
      <SkillsInline tpl={tpl} />

      <SectionTitle>Education</SectionTitle>
      <EducationBlock tpl={tpl} />

      {tpl.certs.length > 0 && (
        <>
          <SectionTitle>Certifications</SectionTitle>
          <Bullets items={tpl.certs} />
        </>
      )}
    </div>
  );
}

function Compact({ tpl }) {
  return (
    <div style={{ padding: '38px 52px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
        <h1 style={{ fontSize: 25, fontWeight: 800, color: '#0f1f3d', margin: 0 }}>YOUR NAME</h1>
        <span style={{ fontSize: 10.5, color: '#5b6880', textAlign: 'right' }}>{CONTACT}</span>
      </div>
      <p style={{ fontSize: 12.5, color: '#1d5db8', fontWeight: 600, margin: '3px 0 0' }}>{tpl.headline}</p>
      <div style={{ borderTop: '2px solid #0f1f3d', marginTop: 8 }} />

      <SectionTitle rule={false}>Summary</SectionTitle>
      <p style={{ fontSize: 10.5, lineHeight: 1.45, color: '#26334d', margin: 0 }}>{tpl.summary}</p>

      <SectionTitle rule={false}>Experience</SectionTitle>
      <ExperienceBlock tpl={tpl} size={10.5} />

      <SectionTitle rule={false}>Skills</SectionTitle>
      <SkillsInline tpl={tpl} size={10.5} />

      <SectionTitle rule={false}>Education</SectionTitle>
      <EducationBlock tpl={tpl} size={10.5} />

      {tpl.certs.length > 0 && (
        <>
          <SectionTitle rule={false}>Certifications</SectionTitle>
          <Bullets items={tpl.certs} size={10.5} />
        </>
      )}
    </div>
  );
}

function Banner({ tpl }) {
  return (
    <div>
      <div style={{ background: '#0f1f3d', padding: '30px 56px 26px' }}>
        <h1 style={{ fontSize: 29, fontWeight: 800, color: '#ffffff', margin: 0 }}>YOUR NAME</h1>
        <p style={{ fontSize: 13, color: '#9fc2f5', fontWeight: 600, margin: '4px 0 0' }}>{tpl.headline}</p>
        <p style={{ fontSize: 10.5, color: '#c7d6ec', margin: '6px 0 0' }}>{CONTACT}</p>
      </div>
      <div style={{ padding: '10px 56px 46px' }}>
        <SectionTitle>Professional Summary</SectionTitle>
        <p style={{ fontSize: 11.5, lineHeight: 1.5, color: '#26334d', margin: 0 }}>{tpl.summary}</p>

        <SectionTitle>Professional Experience</SectionTitle>
        <ExperienceBlock tpl={tpl} />

        <SectionTitle>Skills</SectionTitle>
        <SkillsInline tpl={tpl} />

        <SectionTitle>Education</SectionTitle>
        <EducationBlock tpl={tpl} />
      </div>
    </div>
  );
}

function Executive({ tpl }) {
  return (
    <div style={{ padding: '46px 56px' }}>
      <h1 style={{ fontSize: 31, fontWeight: 800, color: '#0f1f3d', margin: 0, textAlign: 'center' }}>
        YOUR NAME
      </h1>
      <p style={{ fontSize: 13, color: '#1d5db8', fontWeight: 600, margin: '4px 0 0', textAlign: 'center' }}>
        {tpl.headline}
      </p>
      <p style={{ fontSize: 10.5, color: '#5b6880', margin: '6px 0 0', textAlign: 'center' }}>{CONTACT}</p>
      <div style={{ borderTop: '2px solid #0f1f3d', margin: '14px 0 0' }} />

      <SectionTitle center rule={false}>Executive Summary</SectionTitle>
      <p style={{ fontSize: 11.5, lineHeight: 1.55, color: '#26334d', margin: 0 }}>{tpl.summary}</p>

      <SectionTitle center rule={false}>Core Competencies</SectionTitle>
      <SkillsInline tpl={tpl} />

      <SectionTitle center rule={false}>Professional Experience</SectionTitle>
      <ExperienceBlock tpl={tpl} />

      <SectionTitle center rule={false}>Education & Certifications</SectionTitle>
      <EducationBlock tpl={tpl} />
      {tpl.certs.length > 0 && <Bullets items={tpl.certs} />}
    </div>
  );
}

/* Sidebar keeps the main column FIRST in DOM order so an ATS reads the role
   history before the skills rail. The visual swap is done with flex order. */
function Sidebar({ tpl }) {
  return (
    <div>
      <div style={{ padding: '38px 44px 18px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f1f3d', margin: 0 }}>YOUR NAME</h1>
        <p style={{ fontSize: 12.5, color: '#1d5db8', fontWeight: 600, margin: '4px 0 0' }}>{tpl.headline}</p>
        <p style={{ fontSize: 10.5, color: '#5b6880', margin: '6px 0 0' }}>{CONTACT}</p>
      </div>
      <div style={{ display: 'flex', gap: 26, padding: '0 44px 44px' }}>
        <div style={{ flex: 1, order: 2 }}>
          <SectionTitle>Experience</SectionTitle>
          <ExperienceBlock tpl={tpl} size={10.5} />
          <SectionTitle>Education</SectionTitle>
          <EducationBlock tpl={tpl} size={10.5} />
        </div>
        <aside style={{ width: 210, order: 1, borderRight: '1px solid #dbe3ef', paddingRight: 22 }}>
          <SectionTitle rule={false}>Summary</SectionTitle>
          <p style={{ fontSize: 10, lineHeight: 1.45, color: '#26334d', margin: 0 }}>{tpl.summary}</p>
          <SectionTitle rule={false}>Skills</SectionTitle>
          <ul style={{ margin: 0, paddingLeft: 14 }}>
            {tpl.skills.map((s) => (
              <li key={s} style={{ fontSize: 10, lineHeight: 1.5, color: '#26334d' }}>{s}</li>
            ))}
          </ul>
          {tpl.certs.length > 0 && (
            <>
              <SectionTitle rule={false}>Certifications</SectionTitle>
              <ul style={{ margin: 0, paddingLeft: 14 }}>
                {tpl.certs.map((c) => (
                  <li key={c} style={{ fontSize: 10, lineHeight: 1.5, color: '#26334d' }}>{c}</li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

const LAYOUTS = { classic: Classic, compact: Compact, banner: Banner, executive: Executive, sidebar: Sidebar };

export function ResumeTemplatePreview({ template, className, crop = true }) {
  const boxRef = useRef(null);
  const scale = useFitScale(boxRef, [template?.id, crop]);
  if (!template) return null;
  const Layout = LAYOUTS[template.layout] || Classic;

  return (
    <div
      ref={boxRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        minWidth: 0,
        height: crop ? undefined : PAGE_H * scale,
        aspectRatio: crop ? '794 / 700' : undefined,
        overflow: 'hidden',
        background: '#ffffff',
      }}
      role="img"
      aria-label={`${template.role} ATS resume template preview`}
    >
      <div
        aria-hidden
        style={{
          /* Absolutely positioned so the full-size A4 page never contributes
             to layout width — otherwise every card is 794px wide on phones
             and the whole page scrolls sideways. */
          position: 'absolute',
          top: 0,
          left: 0,
          width: PAGE_W,
          height: PAGE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          fontFamily: "'Inter', Arial, Helvetica, sans-serif",
          background: '#ffffff',
        }}
      >
        <Layout tpl={template} />
      </div>
    </div>
  );
}
