import { Link } from 'react-router-dom';
import {
  Clock,
  SignalHigh,
  MonitorPlay,
  Building2,
  CheckCircle2,
  MapPin,
  ArrowRight,
  FileDown,
  BookOpen,
} from 'lucide-react';
import { formatCurrency } from '../../utils/format.js';
import { getMediaUrl } from '../../utils/media.js';

export function CourseCard({ course }) {
  const inst = course.institution;
  const instName =
    inst?.displayName ||
    inst?.name ||
    (course.location ? `Training Centre · ${course.location}` : 'Training Partner');
  const instId = inst?._id;
  const instTargetUrl = instId ? `/universities/${instId}` : `/courses/${course.slug}`;
  const displayImage = course.thumbnail || course.image || inst?.coverImageUrl;
  const hasSyllabus = Boolean(course.syllabusUrl);
  const isFree = course.isFree || course.price === 0;
  const price =
    course.priceOnRequest || course.price == null
      ? 'Price on request'
      : isFree
      ? 'Free'
      : formatCurrency(course.price, course.currency);

  const delivery = course.mode || course.deliveryFormat || 'Live online';
  const isOnline = delivery.toLowerCase().includes('online');
  const isHybrid =
    delivery.toLowerCase().includes('hybrid') || delivery.toLowerCase().includes('blended');

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_12px_-2px_rgba(15,28,46,0.06)] hover:shadow-[0_16px_36px_-8px_rgba(29,93,184,0.12)] hover:border-azure-400/80 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Top ambient brand highlight line on hover */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-azure-500 via-indigo-500 to-azure-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

      <div>
        {/* 1. Visual Window (Top of Card) */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-tr from-slate-950 via-azure-950 to-indigo-900">
          {/* Ambient fallback illustration underneath */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <BookOpen className="h-14 w-14 text-white" />
          </div>

          {displayImage && (
            <img
              src={getMediaUrl(displayImage)}
              alt={course.title}
              className="relative h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out z-[1]"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
              }}
            />
          )}

          {/* Gradient Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/20 pointer-events-none" />

          {/* Top Floating Badges */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-ink shadow-sm tracking-wide border border-white/60">
              <BookOpen className="h-3.5 w-3.5 text-azure-600" />
              {course.category?.name || course.track || 'Course'}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase backdrop-blur-md shadow-sm border ${
                isOnline
                  ? 'bg-emerald-950/75 text-emerald-200 border-emerald-500/30'
                  : isHybrid
                  ? 'bg-amber-950/75 text-amber-200 border-amber-500/30'
                  : 'bg-slate-950/75 text-white border-white/20'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isOnline ? 'bg-emerald-400' : isHybrid ? 'bg-amber-400' : 'bg-azure-400'
                }`}
              />
              {delivery}
            </span>
          </div>
        </div>

        {/* 2. Card Body with Training Centre Details */}
        <div className="p-5 pb-3">
          {/* Training Centre / Institution Row */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
            <Link to={instTargetUrl} className="flex items-center gap-2 min-w-0 group/inst flex-1">
              <div className="relative h-6 w-6 rounded-md bg-slate-100 border border-slate-200/80 flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-2xs group-hover/inst:border-azure-300 transition-colors">
                <Building2 className="h-3.5 w-3.5 text-azure-600/70" />
                {inst?.logoUrl && (
                  <img
                    src={getMediaUrl(inst.logoUrl)}
                    alt={instName}
                    className="absolute inset-0 h-full w-full object-contain p-0.5 bg-white"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
              <span className="text-caption font-bold text-ink truncate leading-tight group-hover/inst:text-azure-600 transition-colors">
                {instName}
              </span>
              <CheckCircle2 className="h-3.5 w-3.5 text-azure-600 shrink-0" aria-label="Verified Partner" />
            </Link>

            {(inst?.location || course.location) && (
              <span className="text-[11px] font-medium text-slate-500 truncate flex items-center gap-1 shrink-0 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                <MapPin className="h-3 w-3 text-slate-400" />
                <span>{inst?.location || course.location}</span>
              </span>
            )}
          </div>

          {/* Specialization / Category Eyebrow */}
          <div className="mt-2.5">
            {course.category?.name && (
              <p className="text-[11px] font-bold uppercase tracking-wider text-azure-600 truncate">
                {course.category.name}
              </p>
            )}

            {/* Course Title */}
            <h3
              className="text-h4 font-extrabold text-ink group-hover:text-azure-600 transition-colors line-clamp-1 leading-snug tracking-tight mt-0.5"
              title={course.title}
            >
              <Link to={`/courses/${course.slug}`}>
                {course.title}
              </Link>
            </h3>
          </div>

          {/* Summary Excerpt */}
          {course.summary && (
            <p className="mt-1.5 text-caption text-slate-500 line-clamp-2 leading-relaxed">
              {course.summary}
            </p>
          )}

          {/* Horizontal Specifications Strip */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-caption text-slate-600">
            {course.duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-azure-500 shrink-0" />
                <span className="font-medium text-slate-700">{course.duration}</span>
              </div>
            )}
            {course.mode && (
              <div className="flex items-center gap-1.5">
                <MonitorPlay className="h-3.5 w-3.5 text-azure-500 shrink-0" />
                <span className="font-medium text-slate-700">{course.mode}</span>
              </div>
            )}
            {course.level && (
              <div className="flex items-center gap-1.5">
                <SignalHigh className="h-3.5 w-3.5 text-azure-500 shrink-0" />
                <span className="font-medium text-slate-700">{course.level}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Action & Pricing Footer */}
      <div className="p-5 pt-0 pb-4">
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Fee</span>
              <span className="text-body font-bold text-ink">{price}</span>
            </div>
            {!isFree && course.price > 0 && (
              <span className="text-[10px] text-slate-400 font-medium">Excl. GST</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/courses/${course.slug}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-ink hover:bg-azure-600 active:scale-[0.98] text-white py-2.5 px-4 text-caption font-bold shadow-xs transition-all duration-200 text-center group/btn"
            >
              <span>View Course</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </Link>

            {hasSyllabus && (
              <a
                href={getMediaUrl(course.syllabusUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-azure-50 hover:border-azure-300 text-slate-700 hover:text-azure-700 py-2.5 px-3.5 text-caption font-bold transition-all shrink-0 active:scale-[0.98] shadow-2xs"
                title="Download course syllabus"
              >
                <FileDown className="h-3.5 w-3.5 text-azure-600" />
                <span>Syllabus</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
