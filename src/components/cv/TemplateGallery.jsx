import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Container, Section } from '../ui/Container.jsx';
import { SectionHeader } from '../ui/SectionHeader.jsx';
import { Reveal } from '../ui/Reveal.jsx';
import { Button } from '../ui/Button.jsx';
import { Tabs } from '../ui/Tabs.jsx';
import { ResumeTemplatePreview } from './ResumeTemplatePreview.jsx';
import { cn } from '../../utils/cn.js';

/**
 * The formats a DutyLaunch writer can deliver in. Descriptions cover what the
 * layout does for a reader — no claims about acceptance rates or employers,
 * since we have no data to support either.
 */
const TEMPLATES = [
  {
    id: 'classic',
    layout: 'classic',
    name: 'Classic',
    fit: 'Safest default',
    bands: ['early', 'mid', 'senior'],
    body: 'Single column, ruled section headings, no graphics. The format least likely to be mis-parsed by any ATS.',
  },
  {
    id: 'compact',
    layout: 'compact',
    name: 'Compact',
    fit: 'Dense history',
    bands: ['mid', 'senior'],
    body: 'Tighter leading and shorter section gaps, for when ten years of roles need to fit two pages without shrinking the type.',
  },
  {
    id: 'sidebar',
    layout: 'sidebar',
    name: 'Sidebar',
    fit: 'Skills-led roles',
    bands: ['early', 'mid'],
    body: 'Skills, tools and contact details move to a fixed rail so the main column stays a clean chronological read.',
  },
  {
    id: 'banner',
    layout: 'banner',
    name: 'Banner',
    fit: 'Career changers',
    bands: ['early', 'mid'],
    body: 'A header band carries the title and positioning line, useful when the target role differs from the last job title.',
  },
  {
    id: 'twoTone',
    layout: 'twoTone',
    name: 'Profile-first',
    fit: 'Graduates',
    bands: ['early'],
    body: 'Leads with a summary block and grouped project or coursework panels, for when experience is shorter than potential.',
  },
  {
    id: 'executive',
    layout: 'executive',
    name: 'Executive',
    fit: 'Leadership scope',
    bands: ['senior'],
    body: 'Opens with a scope-of-responsibility statement and a pulled-out achievements rail ahead of the role history.',
  },
];

const BAND_FILTERS = [
  { value: 'all', label: 'All layouts' },
  { value: 'early', label: '0–3 years' },
  { value: 'mid', label: '4–14 years' },
  { value: 'senior', label: '15+ years' },
];

export function TemplateGallery({
  title = 'Pick the format your CV is written in.',
  label = 'CV layouts',
  lead = 'Every layout is written by a career writer and run through an ATS check before delivery. If you are not sure, a counsellor picks the format for your target roles.',
  cta = { label: 'Start my CV', to: '/cv-builder' },
  tone = 'white',
}) {
  const [band, setBand] = useState('all');
  const [active, setActive] = useState(TEMPLATES[0].id);

  const visible = band === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.bands.includes(band));

  return (
    <Section tone={tone}>
      <Container>
        <Reveal>
          <SectionHeader
            label={label}
            title={title}
            lead={lead}
            aside={
              <div className="mt-6">
                <Tabs options={BAND_FILTERS} value={band} onChange={setBand} label="Filter layouts by experience" />
              </div>
            }
          />
        </Reveal>

        <motion.ul
          layout
          className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((tpl, i) => {
            const isActive = active === tpl.id;
            return (
              <motion.li
                layout
                key={tpl.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.25), ease: [0.16, 0.84, 0.44, 1] }}
              >
                <button
                  type="button"
                  onClick={() => setActive(tpl.id)}
                  aria-pressed={isActive}
                  className={cn(
                    'group flex h-full w-full flex-col overflow-hidden rounded-xl border bg-white text-left transition-all duration-200',
                    isActive
                      ? 'border-azure-400 shadow-blue'
                      : 'border-line hover:-translate-y-1 hover:border-azure-200 hover:shadow-lift'
                  )}
                >
                  <div className="relative overflow-hidden border-b border-line bg-paper px-6 pt-6">
                    <ResumeTemplatePreview
                      layout={tpl.layout}
                      className="mx-auto block h-52 w-auto rounded-t-sm shadow-lift transition-transform duration-300 group-hover:-translate-y-1"
                    />
                    {isActive && (
                      <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-azure px-2.5 py-1 text-caption font-bold text-white">
                        <Check className="h-3 w-3" aria-hidden />
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-body font-bold text-ink">{tpl.name}</h3>
                      <span className="rounded-full bg-azure-50 px-2.5 py-1 text-caption font-semibold text-azure-700">
                        {tpl.fit}
                      </span>
                    </div>
                    <p className="mt-2 text-pretty text-small text-slate-600">{tpl.body}</p>
                  </div>
                </button>
              </motion.li>
            );
          })}
        </motion.ul>

        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-line bg-white px-6 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="max-w-prose text-small text-slate-600">
            Layouts can be swapped during the revision window at no extra cost — the writing is the deliverable, the
            format is not locked in.
          </p>
          <Button to={cta.to} className="shrink-0">
            {cta.label}
          </Button>
        </div>
      </Container>
    </Section>
  );
}