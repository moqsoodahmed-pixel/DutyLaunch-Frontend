import { useParams } from 'react-router-dom';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Breadcrumb } from '../components/ui/Breadcrumb.jsx';
import { LoadingBlock, ErrorState } from '../components/ui/States.jsx';
import { ArticleBody } from '../components/blog/ArticleBody.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { useApi } from '../hooks/useApi.js';
import { blogService } from '../services/contentService.js';
import { formatDate } from '../utils/format.js';
import { articleSchema } from '../utils/seo.js';

export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, loading, error, refetch } = useApi(() => blogService.get(slug), [slug]);

  if (loading) return <LoadingBlock label="Loading article…" className="py-24" />;
  if (error || !post)
    return (
      <Container>
        <ErrorState error={error} onRetry={refetch} className="my-16" />
      </Container>
    );

  return (
    <>
      <Seo title={post.title} description={post.excerpt} schema={articleSchema(post)} />
      <Section tone="paper">
        <Container className="max-w-3xl py-10 lg:py-14">
          <Breadcrumb items={[{ label: 'Blog', to: '/blog' }, { label: post.title }]} />
          <Badge tone="azure">{post.category}</Badge>
          <h1 className="mt-4 text-h1 font-extrabold text-ink">{post.title}</h1>
          <p className="mt-4 text-caption text-slate-500">
            {formatDate(post.publishedAt)} · {post.readingMinutes} min read
          </p>
        </Container>
      </Section>
      <Section tone="white">
        <Container className="max-w-3xl">
          <ArticleBody content={post.body} />
        </Container>
      </Section>
      <CTASection
        title="Have a question this raised?"
        body="Book a free consultation and we will talk through how it applies to your situation."
      />
    </>
  );
}
