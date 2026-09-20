import * as Icons from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { PageHero, HeroActions } from '../components/marketing/PageHero.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { CardSkeleton, EmptyState, ErrorState } from '../components/ui/States.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { useApi } from '../hooks/useApi.js';
import { documentationService } from '../services/contentService.js';

export default function Documentation() {
  const { data, loading, error, refetch } = useApi(() => documentationService.list(), []);
  const services = data || [];

  return (
    <>
      <Seo
        title="Documentation & attestation"
        description="Apostille, embassy attestation, certificate translation and other document services for study or work abroad."
      />
      <PageHero
        eyebrow="Global & documents"
        tone="sand"
        title="The paperwork that moving abroad runs on."
        lead="Apostille, attestation, translation and verification — handled in the order authorities actually expect them, not the order that seems obvious."
        breadcrumb={[{ label: 'Documentation' }]}
        actions={<HeroActions primary={{ label: 'Ask about your documents', to: '/contact#consultation' }} />}
      />

      <Section tone="white">
        <Container>
          {loading && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          )}
          {error && <ErrorState error={error} onRetry={refetch} />}
          {!loading && !error && !services.length && (
            <EmptyState
              title="Documentation services are not published yet"
              description="Add them from the admin, or run the seed script."
            />
          )}
          {!loading && services.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((svc) => {
                const Icon = Icons[svc.icon] || Icons.FileCheck2;
                return (
                  <article key={svc._id} className="tile p-6">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded bg-sand-200 text-ink-700">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h2 className="mt-4 text-h3 font-bold text-ink">{svc.name}</h2>
                    <p className="mt-2 text-small text-slate-600">{svc.description}</p>
                    <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-caption text-slate-500">
                      {svc.typicalDuration && (
                        <div>
                          <dt className="inline font-semibold">Typical time: </dt>
                          <dd className="inline">{svc.typicalDuration}</dd>
                        </div>
                      )}
                      {svc.countries?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {svc.countries.slice(0, 3).map((c) => (
                            <Badge key={c} tone="outline">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </dl>
                  </article>
                );
              })}
            </div>
          )}
          <p className="mt-8 max-w-prose text-small text-slate-500">
            Processing times vary by country, document type and issuing authority, so timelines and fees are confirmed
            per case rather than quoted here as a fixed number.
          </p>
        </Container>
      </Section>

      <CTASection
        tone="sand"
        title="Not sure which document process you need?"
        body="Tell us the country and purpose and we will map out the exact sequence of steps before you pay for anything."
      />
    </>
  );
}
