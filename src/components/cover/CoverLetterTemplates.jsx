import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Designed cover letter templates.
 *
 * Every style is inline on purpose: the PDF download (utils/printResume.js)
 * copies only the letter's HTML into a print frame, not the site's CSS, so
 * inline styles are what make the PDF look exactly like the preview.
 * The page is A4 at 96 dpi (794 × 1123 px) and scaled down for previews.
 */

export const PAGE_W = 794;
export const PAGE_H = 1123;

// Arial first, like the resume templates: some Windows PCs have a broken
// "Helvetica Neue" that makes PDFs mix glyphs from a fallback font.
const SANS = 'Arial, Helvetica, sans-serif';
const SERIF = 'Georgia, "Times New Roman", Times, serif';

export const COVER_TEMPLATES = [
  { id: 'classic', name: 'Classic', layout: 'classic', accent: '#1E3A5F', font: SERIF, note: 'Timeless and formal' },
  { id: 'clean-ats', name: 'Clean ATS', layout: 'minimal', accent: '#111827', font: SANS, note: 'Plain, best for online forms' },
  { id: 'lagoon', name: 'Lagoon', layout: 'sidebar', accent: '#2F6F73', font: SANS, note: 'Teal side panel' },
  { id: 'ruby', name: 'Ruby', layout: 'band', accent: '#9B1C2C', font: SANS, note: 'Bold red header' },
  { id: 'harbor', name: 'Harbor', layout: 'sidebar', accent: '#1D4E89', font: SANS, note: 'Navy side panel' },
  { id: 'sandstone', name: 'Sandstone', layout: 'sidebar', accent: '#A68B5B', font: SERIF, note: 'Warm and elegant' },
  { id: 'midnight', name: 'Midnight', layout: 'band', accent: '#1F2937', font: SANS, note: 'Dark, modern header' },
  { id: 'marigold', name: 'Marigold', layout: 'accent', accent: '#E07B1F', font: SANS, note: 'Bright accent bar' },
  { id: 'skyline', name: 'Skyline', layout: 'split', accent: '#2563EB', font: SANS, note: 'Fresh and clean' },
  { id: 'corporate', name: 'Corporate', layout: 'split', accent: '#334155', font: SERIF, note: 'Business classic' },
  { id: 'slate', name: 'Slate', layout: 'sidebar', accent: '#475569', font: SANS, note: 'Calm grey panel' },
  { id: 'evergreen', name: 'Evergreen', layout: 'accent', accent: '#15803D', font: SANS, note: 'Green accent bar' },
];

export const DEFAULT_COVER_TEMPLATE = 'classic';

/** Smaller text for longer letters so the letter stays on one A4 page. */
function bodySize(content = '') {
  const n = content.length;
  if (n <= 1700) return 15;
  if (n <= 2200) return 14;
  if (n <= 2700) return 13;
  return 12;
}

const paragraphsOf = (content = '') =>
  content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

function contactItems(d) {
  return [d.email, d.phone, d.location, d.linkedin].filter(Boolean);
}

function Recipient({ d, color = '#374151' }) {
  return (
    <div style={{ color, marginBottom: 22 }}>
      <div style={{ marginBottom: 14 }}>{d.date}</div>
      <div style={{ fontWeight: 700 }}>{d.hiringManager || 'Hiring Manager'}</div>
      {d.company && <div>{d.company}</div>}
      {d.jobTitle && <div style={{ marginTop: 14, fontWeight: 700 }}>Re: Application for {d.jobTitle}</div>}
    </div>
  );
}

function Body({ d, size, color = '#1F2937' }) {
  return (
    <div data-cl-body="" style={{ fontSize: size, lineHeight: size < 12 ? 1.45 : 1.6, color }}>
      {paragraphsOf(d.content).map((p, i) => (
        <p key={i} style={{ margin: '0 0 14px', whiteSpace: 'pre-line' }}>
          {p}
        </p>
      ))}
    </div>
  );
}

/** One A4 cover letter page in the chosen design. */
const MIN_SIZE = 9.5;

export function CoverLetterPage({ template, data, asSheet = false, onFit }) {
  const t = COVER_TEMPLATES.find((x) => x.id === template) || COVER_TEMPLATES[0];
  const d = data || {};
  const rootRef = useRef(null);
  const size = bodySize(d.content);

  // Fit the whole letter on the A4 page: measure, and step the text size
  // down (straight on the page, in one pass) until the last line is above
  // the bottom margin. The fitted size is an inline style, so the PDF keeps it.
  useLayoutEffect(() => {
    const el = rootRef.current;
    const body = el?.querySelector('[data-cl-body]');
    if (!el || !body) return;
    const overflowing = () => {
      const paras = el.querySelectorAll('p');
      if (!paras.length) return false;
      const box = el.getBoundingClientRect();
      const margin = (box.height / PAGE_H) * 24;
      return paras[paras.length - 1].getBoundingClientRect().bottom > box.bottom - margin;
    };
    const apply = (v) => {
      body.style.fontSize = `${v}px`;
      body.style.lineHeight = v < 12 ? '1.45' : '1.6';
    };
    let v = bodySize(d.content);
    apply(v);
    while (overflowing() && v > MIN_SIZE) {
      v = Math.max(MIN_SIZE, Math.round((v - 0.5) * 10) / 10);
      apply(v);
    }
    onFit?.(!overflowing());
  }, [d.content, template, d.name, d.headline, d.email, d.phone, d.location, d.linkedin, d.company, d.jobTitle, d.hiringManager, d.date, onFit]);

  const page = {
    width: PAGE_W,
    height: PAGE_H,
    background: '#ffffff',
    fontFamily: t.font,
    color: '#1F2937',
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box',
  };
  const sheetAttr = asSheet ? { 'data-resume-sheet': 'true' } : {};
  const contacts = contactItems(d);

  if (t.layout === 'sidebar') {
    return (
      <div ref={rootRef} {...sheetAttr} style={{ ...page, display: 'flex' }}>
        <div style={{ width: 230, background: t.accent, color: '#ffffff', padding: '56px 26px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.15, letterSpacing: 0.3 }}>{d.name || 'Your Name'}</div>
          {d.headline && <div style={{ marginTop: 10, fontSize: 14, opacity: 0.9 }}>{d.headline}</div>}
          <div style={{ marginTop: 34, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.8 }}>Contact</div>
          <div style={{ marginTop: 10, fontSize: 12.5, lineHeight: 1.7, wordBreak: 'break-word' }}>
            {contacts.map((c) => (
              <div key={c}>{c}</div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, padding: '64px 52px 56px 46px', boxSizing: 'border-box' }}>
          <Recipient d={d} />
          <Body d={d} size={size} />
        </div>
      </div>
    );
  }

  if (t.layout === 'band') {
    return (
      <div ref={rootRef} {...sheetAttr} style={page}>
        <div style={{ background: t.accent, color: '#ffffff', padding: '44px 64px 34px' }}>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 0.4 }}>{d.name || 'Your Name'}</div>
          {d.headline && <div style={{ marginTop: 6, fontSize: 15, opacity: 0.92 }}>{d.headline}</div>}
          <div style={{ marginTop: 14, fontSize: 12.5, opacity: 0.92 }}>{contacts.join('   •   ')}</div>
        </div>
        <div style={{ padding: '42px 64px 56px' }}>
          <Recipient d={d} />
          <Body d={d} size={size} />
        </div>
      </div>
    );
  }

  if (t.layout === 'accent') {
    return (
      <div ref={rootRef} {...sheetAttr} style={page}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, background: t.accent }} />
        <div style={{ padding: '56px 64px 56px 78px' }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: t.accent }}>{d.name || 'Your Name'}</div>
          {d.headline && <div style={{ marginTop: 4, fontSize: 15, fontWeight: 600, color: '#374151' }}>{d.headline}</div>}
          <div style={{ marginTop: 10, fontSize: 12.5, color: '#4B5563' }}>{contacts.join('  |  ')}</div>
          <div style={{ height: 2, background: t.accent, opacity: 0.35, margin: '24px 0 30px' }} />
          <Recipient d={d} />
          <Body d={d} size={size} />
        </div>
      </div>
    );
  }

  if (t.layout === 'split') {
    return (
      <div ref={rootRef} {...sheetAttr} style={page}>
        <div style={{ padding: '56px 64px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24 }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, color: t.accent }}>{d.name || 'Your Name'}</div>
            {d.headline && <div style={{ marginTop: 4, fontSize: 15, color: '#374151' }}>{d.headline}</div>}
          </div>
          <div style={{ textAlign: 'right', fontSize: 12.5, lineHeight: 1.7, color: '#4B5563' }}>
            {contacts.map((c) => (
              <div key={c}>{c}</div>
            ))}
          </div>
        </div>
        <div style={{ height: 4, background: t.accent, margin: '20px 64px 34px' }} />
        <div style={{ padding: '0 64px 56px' }}>
          <Recipient d={d} />
          <Body d={d} size={size} />
        </div>
      </div>
    );
  }

  if (t.layout === 'minimal') {
    return (
      <div ref={rootRef} {...sheetAttr} style={page}>
        <div style={{ padding: '60px 72px 56px' }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: t.accent }}>{d.name || 'Your Name'}</div>
          <div style={{ marginTop: 6, fontSize: 12.5, color: '#4B5563' }}>{[d.headline, ...contacts].filter(Boolean).join(' · ')}</div>
          <div style={{ height: 1, background: '#D1D5DB', margin: '22px 0 30px' }} />
          <Recipient d={d} />
          <Body d={d} size={size} />
        </div>
      </div>
    );
  }

  // classic
  return (
    <div ref={rootRef} {...sheetAttr} style={page}>
      <div style={{ padding: '60px 72px 56px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: t.accent, letterSpacing: 1 }}>{d.name || 'Your Name'}</div>
          {d.headline && <div style={{ marginTop: 4, fontSize: 14, fontStyle: 'italic', color: '#374151' }}>{d.headline}</div>}
          <div style={{ marginTop: 10, fontSize: 12.5, color: '#4B5563' }}>{contacts.join('  •  ')}</div>
        </div>
        <div style={{ height: 1.5, background: t.accent, margin: '22px 0 32px' }} />
        <Recipient d={d} />
        <Body d={d} size={size} />
      </div>
    </div>
  );
}

/** Scales an A4 page down to fit its container's width. */
export function ScaledPage({ children, className }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(0.4);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setScale(el.clientWidth / PAGE_W || 0.4);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ position: 'relative', width: '100%', height: PAGE_H * scale, overflow: 'hidden' }}>
      <div style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
    </div>
  );
}
