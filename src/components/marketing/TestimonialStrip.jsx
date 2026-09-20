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
export function TestimonialStrip() {
  const { data } = useApi(() => testimonialService.list(), []);
  if (!data?.length) return null;

  return (
    <Section tone="paper">
      <Container>
        <SectionHeader label="In their words" title="What clients say" />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <figure key={item._id} className="flex flex-col rounded-lg border border-line bg-white p-6">
              <Quote className="h-5 w-5 text-amber-500" aria-hidden />
              <blockquote className="mt-4 flex-1 text-body text-slate-700">{item.quote}</blockquote>
              <figcaption className="mt-5 border-t border-line pt-4">
                <span className="block text-small font-semibold text-ink">{item.name}</span>
                <span className="block text-caption text-slate-500">
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
