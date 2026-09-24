import { Link } from 'react-router-dom';
import { Bookmark, FileStack, Briefcase, Users, ArrowUpRight, ScanLine, Sparkles, CircleAlert } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { StatCard } from '../../components/admin/StatCard.jsx';
import { LoadingBlock, EmptyState } from '../../components/ui/States.jsx';
import { StatusBadge, Badge } from '../../components/ui/Badge.jsx';
import { Progress, ProgressRing } from '../../components/ui/Progress.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { jobService, employerService } from '../../services/jobService.js';
import { resumeService } from '../../services/contentService.js';
import { relativeTime, formatSalary, formatExperience } from '../../utils/format.js';
import { calculateProfileStrength, recommendJobs } from '../../services/aiService.js';

/**
 * "What is my status → what should I do next" — the profile strength ring
 * plus the concrete fields still missing, each linking straight to the
 * profile section that fixes it.
 */
function ProfileStrengthCard({ user }) {
  const strength = calculateProfileStrength(user);
  const tone = strength.score >= 80 ? 'success' : strength.score >= 50 ? 'azure' : 'amber';

  return (
    <div className="tile flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
      <ProgressRing value={strength.score} tone={tone} sublabel="/ 100" />
      <div className="min-w-0 flex-1">
        <p className="eyebrow">DutyLaunch Profile Strength</p>
        <p className="mt-2 text-small text-slate-600">{strength.summary}</p>
        {strength.missing.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {strength.missing.map((label) => (
              <li key={label}>
                <Badge tone="amber" className="inline-flex items-center gap-1">
                  <CircleAlert className="h-3 w-3" aria-hidden />
                  {label}
                </Badge>
              </li>
            ))}
          </ul>
        )}
        <Button to="/profile" size="sm" className="mt-4">
          Complete my profile
        </Button>
      </div>
    </div>
  );
}

/** Jobs re-ranked against the candidate's own profile, not just "latest". */
function RecommendedJobs({ user }) {
  const { data: jobs, loading } = useApi(() => jobService.list({ limit: 12, sort: 'recent' }), []);
  const ranked = recommendJobs(user, Array.isArray(jobs) ? jobs : [], { limit: 3 });

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-h3 font-bold text-ink">
          <Sparkles className="h-4.5 w-4.5 text-azure" aria-hidden />
          Recommended for you
        </h2>
        <Link to="/jobs" className="inline-flex items-center gap-1 text-small font-medium text-azure hover:underline">
          Browse all jobs <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
      <div className="mt-4">
        {loading && <LoadingBlock />}
        {!loading && !ranked.length && (
          <EmptyState
            title="No jobs to match yet"
            description="Once roles are published, we'll rank them against your profile here."
            icon={Briefcase}
          />
        )}
        {!loading && ranked.length > 0 && (
          <ul className="space-y-3">
            {ranked.map(({ job, match }) => (
              <li key={job._id}>
                <Link
                  to={`/jobs/${job.slug || job._id}`}
                  className="tile flex items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-small font-bold text-ink">{job.title}</p>
                    <p className="truncate text-caption text-slate-500">
                      {job.company} · {job.location} · {formatExperience(job.experience)}
                      {job.salary?.disclosed !== false ? ` · ${formatSalary(job.salary)}` : ''}
                    </p>
                  </div>
                  <span className="tabular shrink-0 rounded-full bg-azure-50 px-2.5 py-1 text-caption font-bold text-azure-700">
                    {match.percent}% match
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function ResumeAnalysisHistory() {
  const { data: history, loading } = useApi(() => resumeService.history({ limit: 5 }), []);
  const runs = history || [];
  const latest = runs[0];
  const previous = runs[1];
  const trend = latest && previous ? latest.score - previous.score : null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-h3 font-bold text-ink">My Resume Analysis</h2>
        <Link to="/ats-resume-checker" className="inline-flex items-center gap-1 text-small font-medium text-azure hover:underline">
          Check a resume <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
      <div className="mt-4">
        {loading && <LoadingBlock />}
        {!loading && !runs.length && (
          <EmptyState
            title="No resumes analyzed yet"
            description="Run a free ATS check to see your score, category breakdown and recommendations here."
            icon={ScanLine}
            action={
              <Link to="/ats-resume-checker" className="text-small font-semibold text-azure hover:underline">
                Check my ATS score
              </Link>
            }
          />
        )}
        {!loading && runs.length > 0 && (
          <>
            {trend !== null && (
              <p className="mb-3 text-small text-slate-600">
                Previous score <span className="tabular font-semibold text-ink">{previous.score}</span> → Current score{' '}
                <span className="tabular font-semibold text-ink">{latest.score}</span>{' '}
                <span className={`tabular font-semibold ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
                  ({trend >= 0 ? '+' : ''}{trend})
                </span>
              </p>
            )}
            <ul className="divide-y divide-line rounded-lg border border-line bg-white">
              {runs.map((run) => (
                <li key={run._id} className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-small font-semibold text-ink">{run.fileName}</p>
                    <p className="truncate text-caption text-slate-500">{relativeTime(run.createdAt)}</p>
                  </div>
                  <span className="tabular shrink-0 rounded bg-azure-50 px-2.5 py-1 text-small font-bold text-azure">
                    {run.score}/100
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}

function CandidateOverview() {
  const { user } = useAuth();
  const { data: applications, meta, loading } = useApi(() => jobService.myApplications({ limit: 5 }), []);
  const { data: saved } = useApi(() => jobService.savedJobs(), []);

  return (
    <>
      <ProfileStrengthCard user={user} />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Applications" value={meta?.total ?? applications?.length ?? '—'} icon="FileStack" to="/applications" />
        <StatCard label="Saved jobs" value={saved?.length ?? '—'} icon="Bookmark" to="/saved-jobs" />
        <Link to="/assistant" className="tile flex items-center gap-3 p-5">
          <span className="tile-icon grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-azure-50">
            <Sparkles className="h-5 w-5 text-azure" aria-hidden />
          </span>
          <div>
            <p className="text-small font-bold text-ink">AI Career Assistant</p>
            <p className="text-caption text-slate-500">Ask what to do next</p>
          </div>
        </Link>
      </div>

      <RecommendedJobs user={user} />

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-h3 font-bold text-ink">Recent applications</h2>
          <Link to="/applications" className="inline-flex items-center gap-1 text-small font-medium text-azure hover:underline">
            View all <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <div className="mt-4">
          {loading && <LoadingBlock />}
          {!loading && !applications?.length && (
            <EmptyState
              title="No applications yet"
              description="Roles you apply to will show up here, with their status as it changes."
              icon={FileStack}
              action={
                <Link to="/jobs" className="text-small font-semibold text-azure hover:underline">
                  Browse open jobs
                </Link>
              }
            />
          )}
          {!loading && applications?.length > 0 && (
            <ul className="divide-y divide-line rounded-lg border border-line bg-white">
              {applications.map((app) => (
                <li key={app._id} className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <div className="min-w-0">
                    <Link to={`/jobs/${app.job?.slug || app.job?._id}`} className="block truncate text-small font-semibold text-ink hover:underline">
                      {app.job?.title}
                    </Link>
                    <p className="truncate text-caption text-slate-500">{app.job?.company} · {relativeTime(app.appliedAt)}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ResumeAnalysisHistory />
    </>
  );
}

function EmployerOverview() {
  const { data: jobs, loading } = useApi(() => employerService.listJobs({ limit: 5 }), []);
  const { meta: applicationsMeta } = useApi(() => employerService.applications({ limit: 1 }), []);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Job posts" value={jobs?.length ?? '—'} icon="Briefcase" to="/employer/jobs" />
        <StatCard label="Total applicants" value={applicationsMeta?.total ?? '—'} icon="Users" to="/employer/applications" />
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-h3 font-bold text-ink">Your latest job posts</h2>
          <Link to="/employer/jobs" className="inline-flex items-center gap-1 text-small font-medium text-azure hover:underline">
            Manage all <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <div className="mt-4">
          {loading && <LoadingBlock />}
          {!loading && !jobs?.length && (
            <EmptyState
              title="No job posts yet"
              description="Post a role and it will appear here once submitted for review."
              icon={Briefcase}
              action={
                <Link to="/employer/jobs/new" className="text-small font-semibold text-azure hover:underline">
                  Post your first job
                </Link>
              }
            />
          )}
          {!loading && jobs?.length > 0 && (
            <ul className="divide-y divide-line rounded-lg border border-line bg-white">
              {jobs.map((job) => (
                <li key={job._id} className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <div className="min-w-0">
                    <Link to={`/employer/jobs`} className="block truncate text-small font-semibold text-ink hover:underline">
                      {job.title}
                    </Link>
                    <p className="truncate text-caption text-slate-500">{job.location} · {relativeTime(job.createdAt)}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

export default function Dashboard() {
  const { user, isEmployer } = useAuth();

  return (
    <>
      <PanelHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || ''}`}
        description={isEmployer ? 'An overview of your job posts and applicants.' : 'An overview of your applications and saved roles.'}
        actions={
          isEmployer ? (
            <Link to="/employer/jobs/new" className="inline-flex items-center gap-1.5 rounded bg-azure px-4 py-2 text-small font-semibold text-white hover:bg-azure-700">
              Post a job
            </Link>
          ) : (
            <Link to="/jobs" className="inline-flex items-center gap-1.5 rounded bg-azure px-4 py-2 text-small font-semibold text-white hover:bg-azure-700">
              Browse jobs
            </Link>
          )
        }
      />
      {isEmployer ? <EmployerOverview /> : <CandidateOverview />}
    </>
  );
}
