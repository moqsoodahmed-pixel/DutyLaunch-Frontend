import { useParams } from 'react-router-dom';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Breadcrumb } from '../components/ui/Breadcrumb.jsx';
import { LoadingBlock, ErrorState } from '../components/ui/States.jsx';
import { ArticleBody } from '../components/blog/ArticleBody.jsx';
import { BlogCard } from '../components/blog/BlogCard.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { useApi } from '../hooks/useApi.js';
import { blogService } from '../services/contentService.js';
import { formatDate } from '../utils/format.js';
import { articleSchema } from '../utils/seo.js';

export default function BlogPost() {
  const { slug } = useParams();
  const { data, loading, error, refetch } = useApi(() => blogService.get(slug), [slug]);
  // The API answers { post, related } — this page used to treat that whole
  // object as the article, so post.title and the article text were undefined and the
  // page crashed. (Same fix JobDetail needed for { job, related }.)
  const post = data?.post ?? null;
  const related = data?.related ?? [];

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
      <Section tone="paper" className="pb-0">
        <Container className="max-w-3xl">
          <Breadcrumb items={[{ label: 'Blog', to: '/blog' }, { label: post.title }]} />
          <Badge tone="azure">{post.category}</Badge>
          <h1 className="mt-4 text-h1 font-extrabold text-ink">{post.title}</h1>
          <p className="mt-4 text-caption text-slate-500">
            {formatDate(post.publishedAt)} · {post.readingMinutes} min read
          </p>
        </Container>
      </Section>
      <Section tone="white" className="pt-8">
        <Container className="max-w-3xl">
          <ArticleBody content={post.content ?? post.body ?? ''} />
        </Container>
      </Section>
      {related.length > 0 && (
        <Section tone="paper">
          <Container>
            <h2 className="text-h3 font-bold text-ink">Related articles</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <BlogCard key={r._id || r.slug} post={r} />
              ))}
            </div>
          </Container>
        </Section>
      )}
      <CTASection
        title="Have a question this raised?"
        body="Book a free consultation and we will talk through how it applies to your situation."
      />
    </>
  );
}