import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Hero } from '../components/marketing/Hero.jsx';
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
import { TransformationHorizon } from '../components/ui/TransformationHorizon.jsx';
import { GlacierBackdrop } from '../components/premium/GlacierBackdrop.jsx';
import { useApi } from '../hooks/useApi.js';
import { pricingService, blogService } from '../services/contentService.js';
import { organizationSchema } from '../utils/seo.js';
import { seoFor } from '../data/seoPages.js';
import { contact } from '../data/site.js';

export default function Home() {
  const { data: packages } = useApi(() => pricingService.cvPackages(), []);
  const { data: posts } = useApi(() => blogService.list({ limit: 3 }), []);

  const preview = (Array.isArray(packages) ? packages : []).slice(0, 3);
  const postList = Array.isArray(posts) ? posts : [];

  return (
    <>
      <Seo
        title={seoFor('home').title}
        description={seoFor('home').description}
        schema={organizationSchema(contact)}
      />

      <Hero />
      <OneProfile />
      <AiAssistantPreview />
      <ServiceMatrix />
      <TransformationHorizon />
      <JourneyRail />
      <GlobalSpotlight />
      <AtsTeaser />

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
            <div className="mt-8 pt-6 grid gap-6 md:auto-rows-fr md:grid-cols-2 lg:grid-cols-3">
              {preview.map((pkg) => (
                <PricingCard key={pkg._id} pkg={pkg} />
              ))}
            </div>
          </Container>
        </Section>
      )}

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