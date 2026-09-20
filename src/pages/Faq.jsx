import { useMemo, useState } from 'react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { PageHero } from '../components/marketing/PageHero.jsx';
import { Tabs } from '../components/ui/Tabs.jsx';
import { Accordion } from '../components/ui/Accordion.jsx';
import { LoadingBlock, ErrorState, EmptyState } from '../components/ui/States.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { useApi } from '../hooks/useApi.js';
import { faqService } from '../services/contentService.js';
import { faqSchema } from '../utils/seo.js';

export default function Faq() {
  const { data, loading, error, refetch } = useApi(() => faqService.list(), []);
  const faqs = data || [];
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => {
    const set = new Set(faqs.map((f) => f.category).filter(Boolean));
    return [{ value: 'all', label: 'All' }, ...Array.from(set).map((c) => ({ value: c, label: c }))];
  }, [faqs]);

  const visible = category === 'all' ? faqs : faqs.filter((f) => f.category === category);

  return (
    <>
      <Seo title="Frequently asked questions" description="Answers about pricing, delivery, revisions and process." schema={faqSchema(faqs)} />
      <PageHero
        eyebrow="FAQ"
        title="Common questions, answered plainly."
        lead="If your question isn't here, ask it directly — a free consultation covers it too."
        breadcrumb={[{ label: 'FAQ' }]}
      />

      <Section tone="white">
        <Container className="max-w-3xl">
          {loading && <LoadingBlock label="Loading questions…" />}
          {error && <ErrorState error={error} onRetry={refetch} />}
          {!loading && !error && !faqs.length && <EmptyState title="No FAQs published yet" />}
          {!loading && faqs.length > 0 && (
            <>
              {categories.length > 2 && (
                <Tabs options={categories} value={category} onChange={setCategory} label="Filter FAQs by category" />
              )}
              <div className="mt-6">
                <Accordion items={visible} />
              </div>
            </>
          )}
        </Container>
      </Section>

      <CTASection title="Still have a question?" body="Send it through and a counsellor will answer within one working day." primary={{ label: 'Contact us', to: '/contact' }} />
    </>
  );
}
