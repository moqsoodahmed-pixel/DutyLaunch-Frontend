import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bookmark, BriefcaseBusiness, Building2, Check, CircleAlert, FlaskConical, IndianRupee, MapPin, SearchX, Share2, Sparkles } from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Breadcrumb } from '../components/ui/Breadcrumb.jsx';
import { LoadingBlock, EmptyState } from '../components/ui/States.jsx';
import { ApplyModal } from '../components/jobs/ApplyModal.jsx';
import { Progress } from '../components/ui/Progress.jsx';
import { useApi } from '../hooks/useApi.js';
import { jobService } from '../services/jobService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatExperience, formatSalary, relativeTime } from '../utils/format.js';
import { jobPostingSchema } from '../utils/seo.js';
import { analyzeJobMatch } from '../services/aiService.js';
import { findDemoJob } from '../data/demoJobs.js';
import { careerService } from '../services/careerService.js';

/**
 * "Your Match" block — clearly separates what came from the job description
 * (mandatory / preferred, driven by `job.skills`) from DutyLaunch's own
 * suggestions (labelled "AI Recommendation"), per the product rule that AI
 * output must never be presented as a job requirement.
 */
function MatchSection({ user, job }) {
  const match = analyzeJobMatch(user, job);

  return (
    <div className="tile mt-8 p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="inline-flex items-center gap-2 text-h3 font-bold text-ink">
          <Sparkles className="h-4.5 w-4.5 text-azure" aria-hidden />
          Your Match
        </h2>
        <span className="tabular rounded-full bg-azure-50 px-3 py-1 text-body font-extrabold text-azure-700">
          {match.percent}%
        </span>
      </div>
      <Progress value={match.percent} className="mt-3" />

      {match.matches.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {match.matches.map((m) => (
            <li key={m} className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-caption font-semibold text-success">
              <Check className="h-3 w-3" aria-hidden />
              {m}
            </li>
          ))}
        </ul>
      )}

      {(match.mandatoryGaps.length > 0 || match.suggested.length > 0) && (
        <div className="mt-5 space-y-2">
          {match.mandatoryGaps.map((g) => (
            <p key={g.label} className="flex items-start gap-2 text-small">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
              <span>
                <span className="font-semibold text-ink">{g.label}</span>{' '}
                <span className="text-slate-500">— {g.source}</span>
              </span>
            </p>
          ))}
          {match.suggested.map((g) => (
            <p key={g.label} className="flex items-start gap-2 text-small">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-azure" aria-hidden />
              <span>
                <span className="font-semibold text-ink">{g.label}</span>{' '}
                <span className="text-slate-500">— {g.source}</span>
              </span>
            </p>
          ))}
        </div>
      )}

      <div className="mt-5 rounded-lg border border-line bg-paper p-4">
        <p className="text-caption font-bold uppercase tracking-wide text-azure-600">AI Recommendation</p>
        <p className="mt-1.5 text-small text-slate-700">{match.recommendation}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button to="/profile" variant="outline" size="sm">
          Improve My Profile
        </Button>
        <Button to="/upskills" variant="outline" size="sm">
          View Recommended Courses
        </Button>
      </div>
    </div>
  );
}

/** Everything the job page knows about the role, as one JD for the engine. */
function jobAsDescription(job) {
  return [
    job.title,
    job.description,
    job.responsibilities?.length ? `Responsibilities:\n${job.responsibilities.map((r) => `- ${r}`).join('\n')}` : '',
    job.requirements?.length ? `Requirements:\n${job.requirements.map((r) => `- ${r}`).join('\n')}` : '',
    job.skills?.length ? `Skills: ${job.skills.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Profile Match from the Career Intelligence engine (spec 2 §20).
 *
 * Used when the candidate has a saved CV: it scores the real resume
 * against this job, not just a list of profile skills. With no saved CV
 * (or if the call fails) the page falls back to the lightweight
 * profile-skills check in `MatchSection`.
 */
function ProfileMatch({ user, job, isDemo }) {
  const toast = useToast();
  const [state, setState] = useState({ status: 'loading', analysis: null });
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const jobDescription = jobAsDescription(job);
  const jobHints = { jobTitle: job.title, company: job.company, location: job.location };

  useEffect(() => {
    let cancelled = false;
    careerService
      .analyze({ jobDescription, jobHints, record: false })
      .then((analysis) => !cancelled && setState({ status: analysis?.match ? 'ready' : 'fallback', analysis }))
      .catch(() => !cancelled && setState({ status: 'fallback', analysis: null }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job._id, job.slug]);

  if (state.status === 'loading') return <LoadingBlock label="Checking your profile match" className="tile mt-8" />;
  if (state.status === 'fallback') return <MatchSection user={user} job={job} />;

  const { match, skillGap } = state.analysis;
  const gaps = (skillGap?.gaps || []).slice(0, 6);

  async function optimize() {
    setCreating(true);
    try {
      await careerService.createVersion({
        jobDescription,
        jobHints,
        kind: 'targeted',
        label: `${job.title} — ${job.company}`,
        jobId: isDemo ? undefined : job._id,
      });
      setCreated(true);
      toast.success('Targeted resume created. Your master profile is unchanged.');
    } catch (err) {
      toast.error(err?.message || 'Could not create a targeted resume.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="tile mt-8 p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="inline-flex items-center gap-2 text-h3 font-bold text-ink">
          <Sparkles className="h-4.5 w-4.5 text-azure" aria-hidden />
          Profile Match
        </h2>
        <span className="tabular rounded-full bg-azure-50 px-3 py-1 text-body font-extrabold text-azure-700">{match.overall}%</span>
      </div>
      <Progress value={match.overall} className="mt-3" />
      <p className="mt-2 text-caption text-slate-500">Based on your saved CV. {match.confidenceNote || ''}</p>

      {match.strongMatch?.length > 0 && (
        <div className="mt-5">
          <p className="text-small font-semibold text-ink">Strong areas</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {match.strongMatch.map((m) => (
              <li key={m} className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-caption font-semibold text-success">
                <Check className="h-3 w-3" aria-hidden />
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {gaps.length > 0 && (
        <div className="mt-5">
          <p className="text-small font-semibold text-ink">Not yet shown on your CV</p>
          <ul className="mt-2 space-y-1.5">
            {gaps.map((g) => (
              <li key={g.skill} className="flex items-start gap-2 text-small">
                <CircleAlert className={`mt-0.5 h-4 w-4 shrink-0 ${g.necessity === 'required' ? 'text-danger' : 'text-amber-500'}`} aria-hidden />
                <span>
                  <span className="font-semibold text-ink">{g.skill}</span>{' '}
                  <span className="text-slate-500">— {g.necessity === 'required' ? 'required by this job' : 'preferred by this job'}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-caption text-slate-500">
            If you have this experience but it is not on your CV, add it — a targeted version will only use what your CV shows.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {created ? (
          <Button to="/my-resumes" size="sm">
            View my targeted resume
          </Button>
        ) : (
          <Button size="sm" loading={creating} onClick={optimize}>
            Optimize Resume for This Job
          </Button>
        )}
        <Button to="/upskills" variant="outline" size="sm">
          View Recommended Courses
        </Button>
      </div>

      <p className="mt-4 text-caption text-slate-500">{match.disclaimer}</p>
    </div>
  );
}

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function JobDetail() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const [applyOpen, setApplyOpen] = useState(false);
  // GET /jobs/:idOrSlug responds with { job, related, hasApplied } — read the
  // job out of that envelope (tolerating a bare job object too).
  const { data: jobData, loading } = useApi(() => jobService.get(id), [id]);
  const apiJob = jobData?.job ?? (jobData?.title ? jobData : null);
  // If the API has no record (the live DB is seeded without demo jobs), fall
  // back to the bundled demo copy for [DEMO] slugs so those links still show
  // a complete page. Real jobs always come from the API.
  const job = apiJob || (!loading ? findDemoJob(id) : null);
  const isDemo = Boolean(job?.isDemo);
  const { data: saved, refetch: refetchSaved } = useApi(
    () => (isAuthenticated ? jobService.savedJobs() : Promise.resolve({ data: [] })),
    [isAuthenticated]
  );
  const isSaved = (saved || []).some((j) => j._id === job?._id);

  const demoNotice = () => toast.error('This is a demo listing — applying and saving are disabled.');
  const openApply = () => (isDemo ? demoNotice() : setApplyOpen(true));

  const toggleSave = async () => {
    if (isDemo) return demoNotice();
    if (!isAuthenticated) return toast.error('Sign in to save jobs.');
    try {
      await jobService.toggleSaved(job._id);
      refetchSaved();
    } catch {
      toast.error('Could not update saved jobs.');
    }
  };

  if (loading) return <LoadingBlock label="Loading role…" className="py-24" />;
  // Not found: a retry can never succeed for a job that does not exist, so
  // point people back to the listings instead of offering "Try again".
  if (!job)
    return (
      <Container>
        <EmptyState
          icon={SearchX}
          className="my-16"
          title="This role is no longer listed"
          description="It may have been filled or taken down by the employer. There are other open roles on the job board."
          action={<Button to="/jobs">Browse all jobs</Button>}
        />
      </Container>
    );

  // No JobPosting structured data for demo records — search engines should
  // never index a listing that is not a real vacancy.
  const schema = isDemo ? undefined : jobPostingSchema(job);

  const ApplyCard = ({ className }) => (
    <div className={`rounded-xl border border-line bg-white p-6 shadow-lift ${className || ''}`}>
      <span className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-azure-500 to-azure-700 text-lead font-extrabold text-white shadow-blue">
        {initials(job.company) || <Building2 className="h-6 w-6" aria-hidden />}
      </span>
      <p className="tabular mt-4 text-h3 font-extrabold text-ink">{formatSalary(job.salary)}</p>
      <p className="text-caption text-slate-500">Posted {relativeTime(job.publishedAt || job.createdAt)}</p>

      <Button className="mt-5" fullWidth onClick={openApply}>
        Apply now
      </Button>
      <div className="mt-2 flex gap-2">
        <Button
          variant="outline"
          fullWidth
          onClick={toggleSave}
          aria-pressed={isSaved}
          aria-label={isSaved ? 'Remove from saved jobs' : 'Save this job'}
        >
          <Bookmark className={isSaved ? 'h-4 w-4 fill-amber-500 text-amber-500' : 'h-4 w-4'} aria-hidden />
          {isSaved ? 'Saved' : 'Save'}
        </Button>
        <Button
          variant="outline"
          fullWidth
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            toast?.success ? toast.success('Link copied') : null;
          }}
        >
          <Share2 className="h-4 w-4" aria-hidden />
          Share
        </Button>
      </div>

      <ul className="mt-5 space-y-2.5 border-t border-line pt-5">
        {[
          ['Experience', formatExperience(job.experience)],
          ['Location', job.location],
          ['Job type', job.jobType],
          job.workMode && ['Work mode', job.workMode],
        ]
          .filter(Boolean)
          .map(([label, value]) => (
            <li key={label} className="flex items-center justify-between text-small">
              <span className="text-slate-500">{label}</span>
              <span className="font-semibold text-ink">{value}</span>
            </li>
          ))}
      </ul>
    </div>
  );

  return (
    <>
      <Seo
        title={`${job.title} at ${job.company}`}
        description={job.summary || job.description?.slice(0, 155)}
        schema={schema}
        noIndex={isDemo}
      />

      {isDemo && (
        <div className="border-b border-amber-500/30 bg-amber-500/10">
          <Container className="flex items-center gap-2 py-2.5 text-small text-ink">
            <FlaskConical className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
            <span>
              <span className="font-semibold">Demo listing.</span> This role is sample data for previewing the job page —
              applications are disabled.
            </span>
          </Container>
        </div>
      )}

      <section className="surface-hero">
        <Container className="py-10 lg:py-14">
          <Breadcrumb items={[{ label: 'Jobs', to: '/jobs' }, { label: job.title }]} />
          <div className="mt-4 flex items-start gap-4">
            <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-azure-500 to-azure-700 text-lead font-extrabold text-white shadow-blue sm:grid">
              {initials(job.company) || <Building2 className="h-6 w-6" aria-hidden />}
            </span>
            <div className="min-w-0">
              <h1 className="text-h1 font-extrabold text-ink">{job.title}</h1>
              <p className="mt-2 inline-flex items-center gap-1.5 text-lead text-slate-600">
                <Building2 className="h-4.5 w-4.5 text-slate-400" aria-hidden />
                {job.company}
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-small text-slate-600">
                <li className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" aria-hidden />
                  {job.location}
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <BriefcaseBusiness className="h-4 w-4 text-slate-400" aria-hidden />
                  {formatExperience(job.experience)}
                </li>
                <li className="tabular inline-flex items-center gap-1.5 font-semibold text-ink">
                  <IndianRupee className="h-4 w-4 text-slate-400" aria-hidden />
                  {formatSalary(job.salary)}
                </li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="outline" className="!rounded-full">
                  {job.jobType}
                </Badge>
                {job.workMode && (
                  <Badge tone="outline" className="!rounded-full">
                    {job.workMode}
                  </Badge>
                )}
                {job.category && (
                  <Badge tone="azure" className="!rounded-full">
                    {job.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Mobile apply bar — the sticky card only shows at lg, so small
              screens get the primary action right under the header. */}
          <div className="mt-6 flex gap-2 lg:hidden">
            <Button onClick={openApply}>Apply now</Button>
            <Button variant="outline" onClick={toggleSave} aria-pressed={isSaved}>
              <Bookmark className={isSaved ? 'h-4 w-4 fill-amber-500 text-amber-500' : 'h-4 w-4'} aria-hidden />
            </Button>
          </div>
        </Container>
      </section>

      <Section tone="white">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h2 className="text-h3 font-bold text-ink">About the role</h2>
              <p className="mt-3 whitespace-pre-line text-body leading-relaxed text-slate-700">{job.description}</p>

              {job.responsibilities?.length > 0 && (
                <>
                  <h2 className="mt-8 text-h3 font-bold text-ink">Responsibilities</h2>
                  <ul className="mt-3 space-y-2">
                    {job.responsibilities.map((r) => (
                      <li key={r} className="flex gap-2.5 text-body text-slate-700">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-success" aria-hidden />
                        {r}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {job.requirements?.length > 0 && (
                <>
                  <h2 className="mt-8 text-h3 font-bold text-ink">Requirements</h2>
                  <ul className="mt-3 space-y-2">
                    {job.requirements.map((r) => (
                      <li key={r} className="flex gap-2.5 text-body text-slate-700">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-success" aria-hidden />
                        {r}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {isAuthenticated && user?.role === 'user' ? (
                <ProfileMatch user={user} job={job} isDemo={isDemo} />
              ) : isAuthenticated ? (
                <MatchSection user={user} job={job} />
              ) : (
                <div className="tile mt-8 flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="inline-flex items-center gap-2 text-body font-bold text-ink">
                      <Sparkles className="h-4.5 w-4.5 text-azure" aria-hidden />
                      See your match for this role
                    </p>
                    <p className="mt-1 text-small text-slate-600">
                      Sign in to compare this job against your DutyLaunch profile.
                    </p>
                  </div>
                  <Button to="/login" variant="outline" size="sm">
                    Sign in
                  </Button>
                </div>
              )}

              <div className="mt-10 rounded-xl border border-line bg-paper p-6 text-center lg:hidden">
                <p className="text-body font-semibold text-ink">Ready to apply?</p>
                <p className="mt-1 text-small text-slate-600">Upload your CV and add a short note for the recruiter.</p>
                <Button className="mt-4" onClick={openApply}>
                  Apply now
                </Button>
              </div>

              <p className="mt-10 text-small text-slate-500">
                Not the right fit?{' '}
                <Link to="/jobs" className="font-semibold text-azure-600 hover:underline">
                  Browse all open roles
                </Link>
                .
              </p>
            </div>

            <div className="hidden lg:col-span-4 lg:block">
              <ApplyCard className="sticky top-24" />
            </div>
          </div>
        </Container>
      </Section>

      {!isDemo && <ApplyModal job={job} open={applyOpen} onClose={() => setApplyOpen(false)} />}
    </>
  );
}
