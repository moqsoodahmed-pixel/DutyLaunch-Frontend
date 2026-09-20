import { Link } from 'react-router-dom';
import { Bookmark, BriefcaseBusiness, Building2, IndianRupee, MapPin } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { formatExperience, formatSalary, relativeTime } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

/** First letters of the company name, for the logo-tile placeholder. */
function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/**
 * Job-board style listing card — a logo tile, title/company, a tag row and a
 * salary/location strip, matching the scan-first layout of Naukri, Indeed
 * and Apna rather than a generic content card.
 */
export function JobCard({ job, saved, onToggleSave, compact }) {
  return (
    <article className="tile group relative flex gap-4 p-5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-azure-500 to-azure-700 text-small font-extrabold text-white shadow-blue">
        {initials(job.company) || <Building2 className="h-5 w-5" aria-hidden />}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-body font-bold leading-snug text-ink">
              <Link to={`/jobs/${job.slug || job._id}`} className="before:absolute before:inset-0">
                {job.title}
              </Link>
            </h3>
            <p className="mt-0.5 truncate text-small font-medium text-slate-600">{job.company}</p>
          </div>
          {onToggleSave && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onToggleSave(job);
              }}
              className="relative z-10 shrink-0 rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink"
              aria-label={saved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
              aria-pressed={Boolean(saved)}
            >
              <Bookmark className={cn('h-4.5 w-4.5', saved && 'fill-amber-500 text-amber-500')} aria-hidden />
            </button>
          )}
        </div>

        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-small text-slate-600">
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

        {!compact && (
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
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
        )}

        <div className="mt-3.5 flex items-center justify-between border-t border-line pt-3">
          <span className="text-caption text-slate-500">Posted {relativeTime(job.publishedAt || job.createdAt)}</span>
          <span className="relative z-10 text-caption font-bold text-azure-600 opacity-0 transition-opacity group-hover:opacity-100">
            View &amp; apply →
          </span>
        </div>
      </div>
    </article>
  );
}
