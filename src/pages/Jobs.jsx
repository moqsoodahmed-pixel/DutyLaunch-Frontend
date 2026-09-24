import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Briefcase, MapPin, TrendingUp } from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SearchBar } from '../components/ui/SearchBar.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { CardSkeleton, EmptyState, ErrorState } from '../components/ui/States.jsx';
import { Button } from '../components/ui/Button.jsx';
import { JobCard } from '../components/jobs/JobCard.jsx';
import { JobFilters } from '../components/jobs/JobFilters.jsx';
import { useApi } from '../hooks/useApi.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { jobService } from '../services/jobService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { images } from '../data/images.js';
import { SiteImage } from '../components/ui/SiteImage.jsx';
import { useMediaQuery } from '../hooks/useMediaQuery.js';

export default function Jobs() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const debouncedQ = useDebounce(q, 400);

  const filters = {
    q: debouncedQ,
    category: params.get('category') || '',
    location: params.get('location') || '',
    jobType: params.get('jobType') || '',
    workMode: params.get('workMode') || '',
    maxExperience: params.get('maxExperience') || '',
    sort: params.get('sort') || 'relevance',
    page: Number(params.get('page') || 1),
  };

  const { data: facets } = useApi(() => jobService.filters(), []);
  const { data, meta, loading, error, refetch } = useApi(
    () => jobService.list(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))),
    [debouncedQ, params.toString()]
  );
  const { data: savedJobs, refetch: refetchSaved } = useApi(
    () => (isAuthenticated ? jobService.savedJobs() : Promise.resolve({ data: [] })),
    [isAuthenticated]
  );
  const savedIds = new Set((savedJobs || []).map((j) => j._id));

  const updateFilters = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  const reset = () => setParams({});

  const handleToggleSave = async (job) => {
    if (!isAuthenticated) {
      toast.error('Sign in to save jobs.');
      return;
    }
    try {
      await jobService.toggleSaved(job._id);
      refetchSaved();
    } catch {
      toast.error('Could not update saved jobs.');
    }
  };

  return (
    <>
      <Seo title="Jobs" description="Open roles in India and the Gulf, searchable by category, location and experience." />

      {/* Search-first hero — the job title/keyword search is the primary
          action on this page, the same way Naukri, Indeed and Apna lead
          with a search bar rather than marketing copy. */}
      <section className="surface-hero">
        <Container className="grid grid-cols-1 items-center gap-10 py-14 lg:grid-cols-12 lg:py-20">
          <div className="min-w-0 lg:col-span-8">
          <p className="eyebrow">Jobs</p>
          <h1 className="mt-4 text-h1 font-extrabold">Roles that are actually open right now.</h1>
          <p className="mt-3 max-w-2xl text-lead text-slate-600">
            Every listing here is live — nothing is posted to make the page look busier than the market is.
          </p>

          <div className="mt-8 rounded-xl border border-line bg-white p-2 shadow-lift sm:p-2.5">
            <SearchBar
              value={q}
              onChange={setQ}
              placeholder="Search job title, company or keyword"
              aria-label="Search jobs"
              className="sm:flex-row [&_input]:h-14 [&_input]:rounded-lg [&_input]:border-0 [&_input]:text-body"
            >
              <Button size="lg" className="sm:w-auto">
                Search jobs
              </Button>
            </SearchBar>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-small font-medium text-slate-600">
            <li className="inline-flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-azure-600" aria-hidden />
              {meta?.total ?? '—'} live roles
            </li>
            <li className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-azure-600" aria-hidden />
              India &amp; the Gulf
            </li>
            <li className="inline-flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-azure-600" aria-hidden />
              Free for candidates
            </li>
          </ul>
          </div>
          {/* Desktop only: on phones the search bar should be the first thing
              on screen, not pushed down by a photo — and not rendering it
              below lg means phones don't download it either. */}
          {isDesktop && (
            <div className="lg:col-span-4">
              <SiteImage image={images.jobsHeader} priority className="ml-auto" />
            </div>
          )}
        </Container>
      </section>

      <Section tone="white">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-3">
              <JobFilters
                filters={filters}
                facets={facets}
                onChange={updateFilters}
                onReset={reset}
                resultCount={meta?.total}
              />
            </div>

            <div className="min-w-0 lg:col-span-9">
              {loading && (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              )}
              {error && <ErrorState error={error} onRetry={refetch} />}
              {!loading && !error && !data?.length && (
                <EmptyState
                  title="No roles match these filters"
                  description="Try widening your search, or clear filters to see everything open."
                  action={
                    <Button variant="outline" onClick={reset}>
                      Clear filters
                    </Button>
                  }
                />
              )}
              {!loading && data?.length > 0 && (
                <div className="space-y-4">
                  {data.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      saved={savedIds.has(job._id)}
                      onToggleSave={handleToggleSave}
                    />
                  ))}
                </div>
              )}
              <div className="mt-8">
                <Pagination meta={meta} onChange={(page) => updateFilters({ page: String(page) })} />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
