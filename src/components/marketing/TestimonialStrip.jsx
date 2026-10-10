import { Quote } from 'lucide-react';
import { Container, Section } from '../ui/Container.jsx';
import { SectionHeader } from '../ui/SectionHeader.jsx';
import { useApi } from '../../hooks/useApi.js';
import { testimonialService } from '../../services/contentService.js';

/**
 * Renders nothing until real, consented client quotes are added in the admin.
 * No placeholder testimonials are shipped — inventing them would be dishonest
 * and is explicitly out of scope.
 */
export function TestimonialStrip({ tone = 'dark' }) {
  const { data } = useApi(() => testimonialService.list(), []);
  if (!data?.length) return null;
  const dark = tone === 'dark';

  return (
    <Section
      tone={dark ? 'ink' : 'paper'}
      seamTop={dark ? 'dark' : undefined}
      seamBottom={dark ? 'dark' : undefined}
    >
      <Container>
        <SectionHeader tone={dark ? 'dark' : 'light'} label="In their words" title="What clients say" />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <figure
              key={item._id}
              className={`flex flex-col rounded-xl p-6 ${
                dark
                  ? 'border-2 border-night-line bg-night-card text-white'
                  : 'border border-line bg-white'
              }`}
            >
              <Quote className="h-5 w-5 text-amber-500" aria-hidden />
              <blockquote className={`mt-4 flex-1 text-body ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                {item.quote}
              </blockquote>
              <figcaption className={`mt-5 border-t pt-4 ${dark ? 'border-white/10' : 'border-line'}`}>
                <span className={`block text-small font-semibold ${dark ? 'text-white' : 'text-ink'}`}>
                  {item.name}
                </span>
                <span className={`block text-caption ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {[item.role, item.location].filter(Boolean).join(' · ')}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  );
}
