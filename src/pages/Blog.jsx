import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SearchBar } from '../components/ui/SearchBar.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { CardSkeleton, EmptyState, ErrorState } from '../components/ui/States.jsx';
import { PageHero } from '../components/marketing/PageHero.jsx';
import { BlogCard } from '../components/blog/BlogCard.jsx';
import { useApi } from '../hooks/useApi.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { blogService } from '../services/contentService.js';
import { images } from '../data/images.js';
import { SiteImage } from '../components/ui/SiteImage.jsx';

export default function Blog() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const debouncedQ = useDebounce(q, 400);
  const page = Number(params.get('page') || 1);

  const { data, meta, loading, error, refetch } = useApi(
    () => blogService.list({ q: debouncedQ || undefined, page }),
    [debouncedQ, page]
  );

  const posts = data || [];
  const [featured, ...rest] = posts;

  return (
    <>
      <Seo title="Blog" description="Career, education and global-mobility articles from DutyLaunch." />
      <PageHero
        eyebrow="Blog"
        title="Notes on careers, education and moving abroad."
        lead="Practical articles, not filler — written from the questions people actually bring to consultations."
        breadcrumb={[{ label: 'Blog' }]}
        aside={<SiteImage image={images.blogHero} priority className="mx-auto lg:ml-auto lg:mr-0" />}
      />

      <Section tone="white">
        <Container>
          <SearchBar value={q} onChange={setQ} placeholder="Search articles" label="Search articles" />

          <div className="mt-8">
            {loading && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            )}
            {error && <ErrorState error={error} onRetry={refetch} />}
            {!loading && !error && !posts.length && (
              <EmptyState title="No articles match your search" description="Try a different keyword." />
            )}
            {!loading && featured && page === 1 && !debouncedQ && (
              <div className="mb-6">
                <BlogCard post={featured} featured />
              </div>
            )}
            {!loading && posts.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {(page === 1 && !debouncedQ ? rest : posts).map((post) => (
                  <BlogCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>

          <div className="mt-8">
            <Pagination meta={meta} onChange={(p) => setParams({ page: String(p) })} />
          </div>
        </Container>
      </Section>
    </>
  );
}
