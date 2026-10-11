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
  // `dark` used to mean the dark band; it is now the pale mist-blue band.
  const dark = tone === 'dark';

  return (
    <Section tone={dark ? 'mist' : 'paper'}>
      <Container>
        <SectionHeader label="In their words" title="What clients say" />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <figure
              key={item._id}
              className={`flex flex-col rounded-xl p-6 ${
                dark
                  ? 'border-2 border-mist-line bg-white shadow-[0_16px_36px_-20px_rgba(29,93,184,0.4)]'
                  : 'border border-line bg-white'
              }`}
            >
              <Quote className="h-5 w-5 text-amber-500" aria-hidden />
              <blockquote className={`mt-4 flex-1 text-body text-slate-700`}>
                {item.quote}
              </blockquote>
              <figcaption className={`mt-5 border-t pt-4 border-line`}>
                <span className={`block text-small font-semibold text-ink`}>
                  {item.name}
                </span>
                <span className={`block text-caption text-slate-600`}>
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
