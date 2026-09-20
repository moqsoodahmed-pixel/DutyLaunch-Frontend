import { Link } from 'react-router-dom';
import { Clock, SignalHigh, MonitorPlay } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { formatCurrency } from '../../utils/format.js';

export function CourseCard({ course }) {
  const price = course.priceOnRequest || course.price == null
    ? 'Price on request'
    : formatCurrency(course.price, course.currency);

  return (
    <article className="group relative flex flex-col rounded-lg border border-line bg-white p-5 transition-colors hover:border-slate-300">
      <div className="flex items-center gap-2">
        {course.category?.name && <Badge tone="outline">{course.category.name}</Badge>}
        <Badge tone="azure">{course.level}</Badge>
      </div>

      <h3 className="mt-3.5 text-h3 font-bold leading-snug text-ink">
        <Link to={`/courses/${course.slug}`} className="before:absolute before:inset-0">
          {course.title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-small text-slate-600">{course.summary}</p>

      <dl className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-caption text-slate-500">
        {course.duration && (
          <div className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            <dt className="sr-only">Duration</dt>
            <dd>{course.duration}</dd>
          </div>
        )}
        {course.mode && (
          <div className="inline-flex items-center gap-1.5">
            <MonitorPlay className="h-3.5 w-3.5" aria-hidden />
            <dt className="sr-only">Mode</dt>
            <dd>{course.mode}</dd>
          </div>
        )}
        <div className="inline-flex items-center gap-1.5">
          <SignalHigh className="h-3.5 w-3.5" aria-hidden />
          <dt className="sr-only">Level</dt>
          <dd>{course.level}</dd>
        </div>
      </dl>

      <p className="mt-4 border-t border-line pt-4 text-small font-semibold text-ink">{price}</p>
    </article>
  );
}
