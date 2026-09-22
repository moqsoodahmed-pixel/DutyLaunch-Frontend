import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Search, ShieldCheck, Maximize2 } from 'lucide-react';
import { Container, Section } from '../ui/Container.jsx';
import { SectionHeader } from '../ui/SectionHeader.jsx';
import { Reveal } from '../ui/Reveal.jsx';
import { Button } from '../ui/Button.jsx';
import { Tabs } from '../ui/Tabs.jsx';
import { Modal } from '../ui/Modal.jsx';
import { EmptyState } from '../ui/States.jsx';
import { ResumeTemplatePreview } from './ResumeTemplatePreview.jsx';
import { TEMPLATES, FAMILIES, LAYOUTS, LEVELS, TEMPLATE_COUNT } from '../../data/resumeTemplates.js';
import { cn } from '../../utils/cn.js';

const ATS_LABEL = {
  max: 'Maximum ATS compatibility',
  high: 'High ATS compatibility',
};

function TemplateCard({ tpl, selected, onSelect, onOpen }) {
  return (
    <div
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-xl border bg-white transition-all duration-200',
        selected ? 'border-azure-400 shadow-blue' : 'border-line hover:-translate-y-1 hover:border-azure-200 hover:shadow-lift'
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(tpl.id)}
        aria-pressed={selected}
        className="relative block w-full border-b border-line bg-paper p-4 text-left focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-azure-300 focus-visible:outline-offset-[-3px]"
      >
        <div className="overflow-hidden rounded-sm border border-line shadow-lift transition-transform duration-300 group-hover:-translate-y-1">
          <ResumeTemplatePreview template={tpl} />
        </div>

        {selected && (
          <span className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-azure px-2.5 py-1 text-caption font-bold text-white shadow-lift">
            <Check className="h-3 w-3" aria-hidden />
            Selected
          </span>
        )}

        <span
          onClick={(e) => {
            e.stopPropagation();
            onOpen(tpl);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onOpen(tpl);
            }
          }}
          className="absolute bottom-6 left-1/2 inline-flex -translate-x-1/2 translate-y-2 items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-caption font-semibold text-white opacity-0 shadow-lift transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100"
        >
          <Maximize2 className="h-3 w-3" aria-hidden />
          Full preview
        </span>
      </button>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-body font-bold text-ink">{tpl.role}</h3>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-caption font-semibold capitalize text-slate-600">
            {tpl.layout}
          </span>
        </div>
        <p className="mt-2 flex-1 text-pretty text-small text-slate-600">{tpl.headline}</p>
        <p
          className={cn(
            'mt-3 inline-flex items-center gap-1.5 text-caption font-semibold',
            tpl.ats === 'max' ? 'text-success' : 'text-azure-700'
          )}
        >
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          {ATS_LABEL[tpl.ats]}
        </p>
      </div>
    </div>
  );
}

export function TemplateGallery({
  title = 'Pick the format your CV is written in.',
  label = 'CV templates',
  lead,
  cta = { label: 'Start my CV', to: '/cv-builder' },
  tone = 'white',
  limit,
}) {
  const [family, setFamily] = useState('all');
  const [layout, setLayout] = useState('all');
  const [level, setLevel] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(TEMPLATES[0].id);
  const [preview, setPreview] = useState(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = TEMPLATES.filter((t) => {
      if (family !== 'all' && t.family !== family) return false;
      if (layout !== 'all' && t.layout !== layout) return false;
      if (level !== 'all' && t.level !== level) return false;
      if (!q) return true;
      return (
        t.role.toLowerCase().includes(q) ||
        t.headline.toLowerCase().includes(q) ||
        t.skills.some((s) => s.toLowerCase().includes(q))
      );
    });
    return limit ? list.slice(0, limit) : list;
  }, [family, layout, level, query, limit]);

  return (
    <Section tone={tone}>
      <Container>
        <Reveal>
          <SectionHeader
            label={label}
            title={title}
            lead={
              lead ??
              `${TEMPLATE_COUNT} role-specific formats, each written to the sections and keywords screeners look for in that job. Every template is filled in by a career writer with your real history — the bracketed figures below are blanks, not sample results.`
            }
          />
        </Reveal>

        {/* Filters */}
        <div className="mt-8 space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs options={FAMILIES} value={family} onChange={setFamily} label="Filter templates by role family" />
            <label className="relative w-full lg:max-w-xs">
              <span className="sr-only">Search templates by role or skill</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search role or skill"
                className="h-11 w-full rounded-sm border border-line bg-white pl-9 pr-3 text-small text-ink placeholder:text-slate-400 focus:border-azure focus:outline-none focus:ring-2 focus:ring-azure-100"
              />
            </label>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Tabs options={LAYOUTS} value={layout} onChange={setLayout} label="Filter templates by layout" />
            <Tabs options={LEVELS} value={level} onChange={setLevel} label="Filter templates by experience" />
          </div>
        </div>

        <p className="mt-5 text-small text-slate-500" aria-live="polite">
          Showing {visible.length} of {TEMPLATE_COUNT} templates
        </p>

        {visible.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No templates match those filters"
              description="Try a different role family, or clear the search box."
            />
          </div>
        ) : (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((tpl, i) => (
              <motion.li
                key={tpl.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.2), ease: [0.16, 0.84, 0.44, 1] }}
              >
                <TemplateCard tpl={tpl} selected={selected === tpl.id} onSelect={setSelected} onOpen={setPreview} />
              </motion.li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-line bg-white px-6 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="max-w-prose text-small text-slate-600">
            Not sure which fits? A counsellor picks the format against your target roles, and the layout can be
            swapped during the revision window at no extra cost.
          </p>
          <Button to={cta.to} className="shrink-0">
            {cta.label}
          </Button>
        </div>
      </Container>

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview ? `${preview.role} — ${preview.layout} template` : ''}
        description={preview ? ATS_LABEL[preview.ats] : ''}
        size="lg"
      >
        {preview && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-sm border border-line shadow-lift">
              <ResumeTemplatePreview template={preview} crop={false} />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button to={cta.to} fullWidth>
                {cta.label}
              </Button>
              <Button variant="outline" fullWidth onClick={() => setPreview(null)}>
                Back to templates
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Section>
  );
}
