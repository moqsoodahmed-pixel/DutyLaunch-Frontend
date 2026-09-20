import { Seo } from '../../components/ui/Seo.jsx';
import { Container, Section } from '../../components/ui/Container.jsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.jsx';

export function LegalPage({ title, description, updated, children }) {
  return (
    <>
      <Seo title={title} description={description} noIndex={false} />
      <Section tone="paper">
        <Container size="narrow" className="py-12 lg:py-16">
          <Breadcrumb items={[{ label: title }]} />
          <h1 className="text-h1 font-extrabold text-ink">{title}</h1>
          {updated && <p className="mt-2 text-small text-slate-500">Last updated: {updated}</p>}
        </Container>
      </Section>
      <Section tone="white">
        <Container size="narrow" className="prose-article py-12">
          {children}
        </Container>
      </Section>
    </>
  );
}
