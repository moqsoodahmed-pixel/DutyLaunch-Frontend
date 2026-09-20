import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { Container, Section } from '../ui/Container.jsx';
import { SectionHeader } from '../ui/SectionHeader.jsx';
import { pillars } from '../../data/site.js';

/**
 * Deliberately not six identical cards. One lead block carries the primary
 * service with its sub-links; the rest form an uneven mosaic where size and
 * surface encode importance.
 */
const layout = {
  career: 'lg:col-span-7 lg:row-span-2',
  education: 'lg:col-span-5',
  global: 'lg:col-span-5',
  documentation: 'lg:col-span-4',
  jobs: 'lg:col-span-4',
  courses: 'lg:col-span-4',
};

function Tile({ pillar, tone = 'light', className, children }) {
  const Icon = Icons[pillar.icon] || Icons.Circle;
  const dark = tone === 'dark';
  const sand = tone === 'sand';

  return (
    <Link
      to={pillar.path}
      className={`group flex flex-col justify-between p-6 sm:p-7 ${
        dark
          ? 'surface-dark rounded-lg hover:bg-ink-700'
          : sand
            ? 'rounded-lg border border-sand-400/60 bg-sand-200 transition-colors hover:bg-sand-300'
            : 'tile'
      } ${className || ''}`}
    >
      <div className={dark ? 'relative z-[1]' : ''}>
        <span
          className={
            dark
              ? 'inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-azure-200'
              : sand
                ? 'inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-ink'
                : 'tile-icon'
          }
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <h3 className={`mt-5 text-h3 font-bold ${dark ? 'text-white' : 'text-ink'}`}>{pillar.label}</h3>
        <p className={`mt-2 max-w-md text-small ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{pillar.summary}</p>
        {children}
      </div>
      <span
        className={`mt-6 inline-flex items-center gap-1.5 text-small font-bold ${
          dark ? 'relative z-[1] text-azure-200' : 'text-azure-600'
        }`}
      >
        Learn more
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
      </span>
    </Link>
  );
}

export function ServiceMatrix() {
  const byId = Object.fromEntries(pillars.map((p) => [p.id, p]));
  const courses = {
    id: 'courses',
    label: 'Courses',
    path: '/courses',
    icon: 'BookOpen',
    summary: 'Mentor-led programmes that end in something you can show, not just a certificate.',
  };

  return (
    <Section tone="white">
      <Container>
        <SectionHeader
          label="What we do"
          title="Everything you need to move forward"
          lead="Six connected services. Most people start with one and come back for the next — a CV, then a course, then the paperwork for a move abroad."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          <Tile pillar={byId.career} className={layout.career}>
            <ul className="mt-6 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
              {byId.career.items.map((item) => (
                <li key={item.path} className="flex items-baseline gap-2.5 text-small text-slate-700">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-amber-500" aria-hidden />
                  {item.label}
                </li>
              ))}
              {['Interview preparation', 'Cover letters'].map((extra) => (
                <li key={extra} className="flex items-baseline gap-2.5 text-small text-slate-700">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-amber-500" aria-hidden />
                  {extra}
                </li>
              ))}
            </ul>
          </Tile>

          <Tile pillar={byId.education} className={layout.education} />
          <Tile pillar={byId.global} tone="dark" className={layout.global} />
          <Tile pillar={byId.documentation} tone="sand" className={layout.documentation} />
          <Tile pillar={byId.jobs} className={layout.jobs} />
          <Tile pillar={courses} className={layout.courses} />
        </div>
      </Container>
    </Section>
  );
}
