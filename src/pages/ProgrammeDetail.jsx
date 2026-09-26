import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Building2, ExternalLink, Handshake, MapPin } from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Reveal, RevealGroup, RevealItem } from '../components/ui/Reveal.jsx';
import { PageHero } from '../components/marketing/PageHero.jsx';
import { ConsultationForm } from '../components/marketing/ConsultationForm.jsx';
import { TRACKS, findProgramme, programmesIn, programmeHref } from '../data/programmes.js';
import { useApi } from '../hooks/useApi.js';
import { partnerService } from '../services/contentService.js';
import NotFound from './NotFound.jsx';

const MODE_STYLE = {
  Online: 'bg-azure-50 text-azure-700',
  Distance: 'bg-azure-50 text-azure-700',
  Regular: 'bg-success/10 text-success',
  Classroom: 'bg-success/10 text-success',
  Hybrid: 'bg-amber-500/10 text-amber-700',
};

/**
 * /higher-education/:slug and /professional-courses/:slug — one page per
 * programme or course, reached by clicking its chip on the listing page.
 *
 * Shows the APPROVED partner institutes for the programme (from /api/partners —
 * institutes register, complete a profile at /partner, and appear here once an
 * admin approves them)
 * and an enquiry form lower on the page. "Enquire" on an institute scrolls to
 * the form and prefills it with the programme and institute, so the
 * counsellor knows exactly what the enquiry is about.
 *
 * track: 'education' | 'courses'
 */
export default function ProgrammeDetail({ track }) {
  const { slug } = useParams();
  const programme = findProgramme(track, slug);
  const [partner, setPartner] = useState(null);
  const formRef = useRef(null);
  // Called before the not-found check so hooks always run in the same order.
  const { data: partnerData, loading: partnersLoading } = useApi(
    () => (programme ? partnerService.list({ track, programme: slug }) : Promise.resolve([])),
    [track, slug]
  );

  if (!programme) return <NotFound />;

  const t = TRACKS[track];
  const { item, group, groupDescription } = programme;
  const partners = partnerData || [];
  const related = programmesIn(track).filter((p) => p.group === group && p.slug !== slug);

  const enquire = (p) => {
    setPartner(p);
    // Wait a frame so the form re-renders with the new prefill first.
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <>
      <Seo
        title={`${item} — partner institutes`}
        description={`Partner institutes offering ${item}, with study mode and location. Enquire and a DutyLaunch counsellor will confirm eligibility and next steps.`}
      />

      <PageHero
        eyebrow={group === item ? t.label : group}
        title={item}
        lead={
          groupDescription ||
          `Compare partner institutes offering ${item} by study mode and location, then enquire — a counsellor will confirm eligibility and next steps within one working day.`
        }
        breadcrumb={[{ label: t.label, to: t.basePath }, { label: item }]}
        actions={
          <>
            <Button size="lg" onClick={() => enquire(null)}>
              Enquire about {item}
            </Button>
            <Button to={t.basePath} variant="outline" size="lg">
              All {t.noun}s
            </Button>
          </>
        }
      />

      {/* ---------- Partner institutes ---------- */}
      <Section tone="white">
        <Container>
          <Reveal>
            <h2 className="text-h2 font-bold text-ink">Partner institutes</h2>
            <p className="mt-2 max-w-prose text-body text-slate-600">
              {partnersLoading
                ? 'Loading partner institutes…'
                : partners.length
                ? `${partners.length} institute${partners.length > 1 ? 's' : ''} offering ${item}.`
                : `We're onboarding partner institutes for ${item}. Enquire below and a counsellor will walk you through your options.`}
            </p>
          </Reveal>

          <RevealGroup className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.07}>
            {partners.map((p) => (
              <RevealItem
                as="article"
                key={p._id || p.name}
                className={`tile flex flex-col p-5 transition-all duration-200 hover:-translate-y-0.5 sm:p-6 ${
                  partner?.name === p.name ? 'ring-2 ring-azure-300' : ''
                }`}
              >
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-azure-50">
                  <Building2 className="h-5 w-5 text-azure" aria-hidden />
                </span>
                <h3 className="mt-4 text-body font-bold text-ink">{p.name}</h3>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" aria-hidden />
                    {p.location}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${MODE_STYLE[p.mode] || 'bg-slate-100 text-slate-600'}`}>
                    {p.mode}
                  </span>
                </p>
                <p className="mt-3 flex-1 text-small text-slate-600">{p.about}</p>
                {p.website && (
                  <a
                    href={p.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-caption font-medium text-azure hover:underline"
                  >
                    {p.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                )}
                <Button onClick={() => enquire(p)} className="mt-5" fullWidth>
                  Enquire
                </Button>
              </RevealItem>
            ))}
          </RevealGroup>

          {/* Institutes can list themselves: register as an Institute, complete
              the partner profile, and appear here once approved. */}
          <div className="mt-8 flex flex-col gap-4 rounded-xl border border-dashed border-azure-200 bg-azure-50/40 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white">
                <Handshake className="h-5 w-5 text-azure" aria-hidden />
              </span>
              <div>
                <p className="text-body font-bold text-ink">Offer {item}? Partner with DutyLaunch.</p>
                <p className="mt-0.5 text-small text-slate-600">
                  Create an institute account, add the {t.noun}s you offer, and get listed on their pages once our team
                  has reviewed your profile.
                </p>
              </div>
            </div>
            <Button to="/register?type=institute" variant="outline" className="shrink-0">
              Become a partner
            </Button>
          </div>
        </Container>
      </Section>

      {/* ---------- Enquiry ---------- */}
      <Section tone="paper">
        <Container>
          <div ref={formRef} className="grid scroll-mt-28 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="text-h2 font-bold text-ink">Enquire about {item}</h2>
              <p className="mt-3 text-body text-slate-600">
                {partner
                  ? `You're enquiring about ${item} at ${partner.name}. A counsellor will confirm availability, eligibility and next steps within one working day.`
                  : `Tell us a little about yourself and a counsellor will walk you through the options for ${item} within one working day.`}
              </p>
              {partner && (
                <button
                  type="button"
                  onClick={() => setPartner(null)}
                  className="mt-4 text-small font-semibold text-azure hover:text-azure-700"
                >
                  Enquire without choosing an institute
                </button>
              )}
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <div className="tile p-6">
                <ConsultationForm
                  key={partner?.name || 'general'}
                  defaultService={t.service}
                  defaultMessage={
                    partner ? `I'm interested in ${item} at ${partner.name}.` : `I'm interested in ${item}.`
                  }
                  compact
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ---------- Related ---------- */}
      {related.length > 0 && (
        <Section tone="white">
          <Container>
            <h2 className="text-h3 font-bold text-ink">Other {group === item ? t.noun + 's' : group}</h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    to={programmeHref(track, r.item)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-small font-medium text-slate-700 transition-colors hover:border-azure-300 hover:bg-azure-50 hover:text-azure-700"
                  >
                    {r.item}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}
    </>
  );
}