import { Link } from 'react-router-dom';
import { ArrowUpRight, Check } from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Hero } from '../components/marketing/Hero.jsx';
import { CareerJourney } from '../components/marketing/CareerJourney.jsx';
import { OneProfile } from '../components/marketing/OneProfile.jsx';
import { AiAssistantPreview } from '../components/marketing/AiAssistantPreview.jsx';
import { ServiceMatrix } from '../components/marketing/ServiceMatrix.jsx';
import { JourneyRail } from '../components/marketing/JourneyRail.jsx';
import { TestimonialStrip } from '../components/marketing/TestimonialStrip.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { AtsTeaser } from '../components/marketing/AtsTeaser.jsx';
import { GlobalSpotlight } from '../components/marketing/GlobalSpotlight.jsx';
import { PricingCard } from '../components/marketing/PricingCard.jsx';
import { BlogCard } from '../components/blog/BlogCard.jsx';
import { useApi } from '../hooks/useApi.js';
import { pricingService, blogService } from '../services/contentService.js';
import { organizationSchema } from '../utils/seo.js';
import { contact } from '../data/site.js';

const audiences = [
  { label: 'Students and fresh graduates', to: '/higher-education', note: 'First CV, course choice, study abroad' },
  { label: 'Working professionals', to: '/career-services', note: 'Repositioning, interviews, next role' },
  { label: 'Career changers', to: '/contact#consultation', note: 'Direction first, then the paperwork' },
  { label: 'UAE and Gulf job seekers', to: '/dubai-job-seeker-package', note: 'Search, visa, arrival' },
  { label: 'People moving documents abroad', to: '/documentation', note: 'Apostille, attestation, translation' },
  { label: 'Employers and recruiters', to: '/employer', note: 'Post roles, manage applicants' },
];

export default function Home() {
  const { data: packages } = useApi(() => pricingService.cvPackages(), []);
  const { data: posts } = useApi(() => blogService.list({ limit: 3 }), []);

  const preview = (Array.isArray(packages) ? packages : []).slice(0, 3);
  const postList = Array.isArray(posts) ? posts : [];

  return (
    <>
      <Seo
        title="Career, education and global opportunities"
        description="DutyLaunch helps you build a stronger professional profile, choose the right education, find work in India or the Gulf, and handle the documentation that goes with it."
        schema={organizationSchema(contact)}
      />

      <Hero />
      <CareerJourney />
      <OneProfile />
      <AiAssistantPreview />
      <ServiceMatrix />
      <JourneyRail />
      <GlobalSpotlight />
      <AtsTeaser />

      {/* Who it is for — a routing device rather than another card grid. */}
      <Section tone="white">
        <Container>
          <SectionHeader
            label="Who we work with"
            title="Six starting points, one process."
            lead="The work looks different depending on where you are. Pick the description that fits you and start there."
          />
          <ul className="mt-10 divide-y divide-line border-y border-line">
            {audiences.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="group flex items-center justify-between gap-6 py-5 transition-colors hover:bg-paper/70"
                >
                  <div className="min-w-0">
                    <span className="block text-lead font-semibold text-ink">{item.label}</span>
                    <span className="mt-0.5 block text-small text-slate-600">{item.note}</span>
                  </div>
                  <ArrowUpRight
                    className="h-5 w-5 shrink-0 text-slate-300 transition-colors group-hover:text-azure"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* CV pricing preview */}
      {preview.length > 0 && (
        <Section tone="paper">
          <Container>
            <SectionHeader
              label="CV bundles"
              title="Priced by how much experience there is to write about."
              lead="Every bundle includes an ATS-friendly CV, a customised cover letter, LinkedIn optimisation, a month of unlimited revisions and 2–3 day delivery."
              aside={
                <div className="mt-6">
                  <Button to="/pricing" variant="outline">
                    Compare all four bundles
                  </Button>
                </div>
              }
            />
            <div className="mt-10 grid gap-4 md:auto-rows-fr md:grid-cols-2 lg:grid-cols-3">
              {preview.map((pkg) => (
                <PricingCard key={pkg._id} pkg={pkg} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* An honesty block — this is the section that replaces invented social proof. */}
      <Section tone="white">
        <Container>
          <div>
            <div className="max-w-3xl">
              <h2 className="text-h2 font-bold">How we work</h2>
              <p className="mt-3 max-w-2xl text-lead text-slate-600">
                Four commitments that decide what we will and will not sell you.
              </p>
            </div>
            <ul className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
              {[
                ['We tell you when a service will not help.', 'If a course or a rewrite will not change your options, we say so in the consultation. That conversation is free.'],
                ['Prices are published, not quoted on the call.', 'CV bundles are listed openly. Where a price genuinely depends on the case — attestation, for instance — we confirm it in writing before any payment.'],
                ['Your documents stay yours.', 'Resumes and certificates are stored privately, served only to you and the employer you applied to, and never listed publicly.'],
                ['One month of revisions, no argument.', 'Every CV bundle includes a month of unlimited revisions. You do not have to justify the request.'],
              ].map(([title, body]) => (
                <li key={title} className="flex gap-4 rounded-xl border border-line bg-paper/60 p-5">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-xs bg-azure-50">
                    <Check className="h-3.5 w-3.5 text-azure" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-body font-bold text-ink">{title}</h3>
                    <p className="mt-1 text-body text-slate-600">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <TestimonialStrip />

      {postList.length > 0 && (
        <Section tone="paper">
          <Container>
            <SectionHeader
              label="From the blog"
              title="Written for the decision in front of you."
              aside={
                <div className="mt-6">
                  <Button to="/blog" variant="outline">
                    Read all articles
                  </Button>
                </div>
              }
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {postList.map((post) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <CTASection
        title="Start with a conversation, not a purchase."
        body="Tell us where you are and what you are aiming at. We will tell you what would actually move the needle — including when that is nothing we sell."
        primary={{ label: 'Book a free consultation', to: '/contact#consultation' }}
        secondary={{ label: 'See what we do', to: '/career-services' }}
      />
    </>
  );
}