import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { Tabs } from '../components/ui/Tabs.jsx';
import { SearchBar } from '../components/ui/SearchBar.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { CardSkeleton, EmptyState, ErrorState } from '../components/ui/States.jsx';
import { PageHero } from '../components/marketing/PageHero.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { CourseCard } from '../components/courses/CourseCard.jsx';
import { useApi } from '../hooks/useApi.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { courseService } from '../services/contentService.js';
import { images } from '../data/images.js';
import { SiteImage } from '../components/ui/SiteImage.jsx';

const TRACKS = [
  { value: '', label: 'All tracks' },
  { value: 'professional', label: 'Professional' },
  { value: 'upskill', label: 'Upskilling' },
  { value: 'certification', label: 'Certification' },
];

export default function Courses() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const debouncedQ = useDebounce(q, 350);

  const track = params.get('track') || '';
  const category = params.get('category') || '';
  const page = Number(params.get('page') || 1);

  const { data: categories } = useApi(() => courseService.categories(), []);
  const { data, meta, loading, error, refetch } = useApi(
    () => courseService.list({ q: debouncedQ || undefined, track: track || undefined, category: category || undefined, page }),
    [debouncedQ, track, category, page]
  );

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  useEffect(() => {
    if (debouncedQ !== (params.get('q') || '')) update({ q: debouncedQ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  const categoryOptions = [
    { value: '', label: 'All subjects' },
    ...(categories || []).map((c) => ({ value: c.slug, label: c.name })),
  ];

  return (
    <>
      <Seo
        title="Courses"
        description="Browse professional courses, short upskilling programmes and certification preparation from DutyLaunch."
      />

      <PageHero
        eyebrow="Courses"
        title="The full catalogue."
        lead="Professional programmes, short upskilling courses and certification preparation. If you already know the gap you are closing, search for it."
        breadcrumb={[{ label: 'Courses' }]}
        aside={<SiteImage image={images.coursesHero} priority className="mx-auto lg:ml-auto lg:mr-0" />}
      />

      <Section tone="paper">
        <Container>
          <SearchBar
            value={q}
            onChange={setQ}
            placeholder="Search courses — SQL, project management, IELTS…"
            label="Search courses"
          />

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs options={TRACKS} value={track} onChange={(value) => update({ track: value })} label="Filter by track" />
            <Tabs
              options={categoryOptions}
              value={category}
              onChange={(value) => update({ category: value })}
              label="Filter by subject"
            />
          </div>

          <p className="mt-6 text-small text-slate-600" role="status">
            {loading ? 'Searching…' : `${meta?.total ?? data?.length ?? 0} course${(meta?.total ?? 0) === 1 ? '' : 's'}`}
          </p>

          <div className="mt-4">
            {loading && <CardSkeleton count={6} />}
            {error && <ErrorState error={error} onRetry={refetch} />}
            {!loading && !error && !data?.length && (
              <EmptyState
                title="No courses match that"
                description="Try a broader search, or tell us what you are trying to learn and we will point you at the right programme."
              />
            )}
            {!loading && data?.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            )}
          </div>

          <Pagination meta={meta} onChange={(next) => update({ page: String(next) })} className="mt-10" />
        </Container>
      </Section>

      <CTASection
        tone="sand"
        title="Not sure a course is the answer?"
        body="Sometimes the barrier is positioning, not skill. The consultation is free and we will say so if that is what we find."
        primary={{ label: 'Book a free consultation', to: '/contact#consultation' }}
        secondary={{ label: 'See career services', to: '/career-services' }}
      />
    </>
  );
}
