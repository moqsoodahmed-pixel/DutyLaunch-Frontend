import { Seo } from '../../components/ui/Seo.jsx';
import { Container, Section } from '../../components/ui/Container.jsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.jsx';

export function LegalPage({ title, description, updated, children }) {
  return (
    <>
      <Seo title={title} description={description} noIndex={false} />
      <Section tone="white">
        <Container size="narrow">
          <Breadcrumb items={[{ label: title }]} />
          <h1 className="text-h1 font-extrabold text-ink">{title}</h1>
          {updated && <p className="mt-2 text-small text-slate-500">Last updated: {updated}</p>}
          <div className="mt-8 prose-article">
            {children}
          </div>
        </Container>
      </Section>
    </>
  );
}