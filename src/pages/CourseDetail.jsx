import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Check,
  Clock,
  MonitorPlay,
  SignalHigh,
  Building2,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  FileDown,
  User,
  Send,
} from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Input } from '../components/ui/Field.jsx';
import { Breadcrumb } from '../components/ui/Breadcrumb.jsx';
import { LoadingBlock, ErrorState } from '../components/ui/States.jsx';
import { ArticleBody } from '../components/blog/ArticleBody.jsx';
import { CourseCard } from '../components/courses/CourseCard.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { useApi } from '../hooks/useApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { courseService, enrolmentService } from '../services/contentService.js';
import { formatCurrency } from '../utils/format.js';
import { getMediaUrl } from '../utils/media.js';
import { useRazorpayCheckout } from '../hooks/useRazorpayCheckout.js';
import { PRICE_TAX_NOTE } from '../data/legal.js';

export default function CourseDetail() {
  const { slug } = useParams();
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();
  const { data, loading, error, refetch } = useApi(() => courseService.get(slug), [slug]);
  const { pay, pendingId, enabled } = useRazorpayCheckout();

  // Enrolled tracking
  const [enrolledIds, setEnrolledIds] = useState(() => new Set());
  const [enrolModalOpen, setEnrolModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentDegree: '',
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    enrolmentService
      .myEnrolments()
      .then((resData) => {
        const list = Array.isArray(resData) ? resData : resData?.data || [];
        const ids = new Set();
        list.forEach((item) => {
          if (item.itemId) ids.add(String(item.itemId));
        });
        setEnrolledIds((prev) => new Set([...prev, ...ids]));
      })
      .catch(() => {});
  }, [isAuthenticated]);

  if (loading) return <LoadingBlock label="Loading course" className="min-h-[60vh]" />;
  if (error) {
    return (
      <Container className="py-20">
        <ErrorState error={error} onRetry={refetch} />
      </Container>
    );
  }

  const { course, related } = data;
  const inst = course.institution;
  const instName = inst?.displayName || inst?.name || (course.location ? `Training Centre · ${course.location}` : 'Training Partner');
  const instId = inst?._id;
  const isEnrolled = enrolledIds.has(String(course._id));

  const fixedPrice = !course.priceOnRequest && course.price > 0;
  const isFree = course.isFree || course.price === 0;
  const price = fixedPrice
    ? formatCurrency(course.price, course.currency)
    : isFree
    ? 'Free'
    : 'Price on request';
  const canPay = fixedPrice && enabled !== false && Boolean(course._id);
  const paying = pendingId === course._id;

  const handleOpenEnrol = () => {
    setFormState({
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      currentDegree: user?.profile?.currentRole || '',
    });
    setEnrolModalOpen(true);
  };

  const handleSubmitEnrol = async (e) => {
    e.preventDefault();
    if (!formState.fullName?.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!formState.email?.trim()) {
      toast.error('Please enter your email ID');
      return;
    }
    if (!formState.phone?.trim()) {
      toast.error('Please enter your mobile number');
      return;
    }
    if (!formState.currentDegree?.trim()) {
      toast.error('Please enter your current degree / qualification');
      return;
    }

    setSubmitting(true);
    try {
      await enrolmentService.apply({
        itemId: course._id,
        itemType: 'course',
        fullName: formState.fullName.trim(),
        email: formState.email.trim(),
        phone: formState.phone.trim(),
        currentDegree: formState.currentDegree.trim(),
      });

      toast.success(`Application submitted! ${instName} has received your enrolment details.`);
      if (course?._id) {
        setEnrolledIds((prev) => new Set([...prev, String(course._id)]));
      }
      setEnrolModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Could not submit enrolment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Seo title={course.title} description={course.summary} type="article" />

      <section className="border-b border-line bg-paper">
        <Container className="py-12 lg:py-16">
          <Breadcrumb items={[{ label: 'Courses', to: '/courses' }, { label: course.title }]} />

          <div className="grid gap-10 lg:grid-cols-12 mt-6">
            <div className="lg:col-span-7">
              {/* Training Centre / Institution Header Badge */}
              {inst && (
                <div className="mb-4">
                  <Link
                    to={instId ? `/universities/${instId}` : '#'}
                    className="inline-flex items-center gap-2.5 rounded-full bg-white border border-slate-200/90 py-1.5 px-3.5 shadow-2xs hover:border-azure-400 hover:bg-azure-50/50 transition-all group"
                  >
                    <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                      {inst.logoUrl ? (
                        <img
                          src={getMediaUrl(inst.logoUrl)}
                          alt={instName}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Building2 className="h-3.5 w-3.5 text-azure-600" />
                      )}
                    </div>
                    <span className="text-caption font-bold text-ink group-hover:text-azure-600 transition-colors">
                      {instName}
                    </span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-azure-600 shrink-0" aria-label="Verified Partner" />
                    {(inst.location || inst.city) && (
                      <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 border-l border-slate-200 pl-2">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {inst.location || inst.city}
                      </span>
                    )}
                  </Link>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {course.category?.name && <Badge tone="outline">{course.category.name}</Badge>}
                <Badge tone="azure">{course.level}</Badge>
                <Badge tone="neutral">{course.track}</Badge>
                {course.deliveryFormat && (
                  <Badge tone="outline" className="capitalize">
                    {course.deliveryFormat}
                  </Badge>
                )}
              </div>

              <h1 className="mt-4 text-h1 font-extrabold text-ink">{course.title}</h1>
              <p className="mt-4 max-w-prose text-lead text-slate-600 leading-relaxed">{course.summary}</p>
            </div>

            <aside className="lg:col-span-5 lg:col-start-8 space-y-6">
              {/* Pricing & Enrolment Card */}
              <div className="tile p-6 shadow-sm">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-caption text-slate-500 block">Course Fee</span>
                    <p className="text-h2 font-extrabold text-ink">{price}</p>
                  </div>
                  {fixedPrice && (
                    <span className="text-caption font-semibold text-azure-700 bg-azure-50 px-2.5 py-1 rounded-full border border-azure-200">
                      Fixed Price
                    </span>
                  )}
                </div>

                {fixedPrice && (
                  <p className="mt-1 text-caption font-medium text-slate-500">{PRICE_TAX_NOTE}</p>
                )}

                <dl className="mt-5 space-y-3 border-t border-line pt-5 text-small">
                  {course.duration && (
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <Clock className="h-4 w-4 text-slate-400" aria-hidden />
                      <dt className="sr-only">Duration</dt>
                      <dd>{course.duration}</dd>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <MonitorPlay className="h-4 w-4 text-slate-400" aria-hidden />
                    <dt className="sr-only">Mode</dt>
                    <dd>{course.mode || course.deliveryFormat || 'Live online'}</dd>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <SignalHigh className="h-4 w-4 text-slate-400" aria-hidden />
                    <dt className="sr-only">Level</dt>
                    <dd>{course.level}</dd>
                  </div>
                </dl>

                <div className="mt-6 space-y-2.5">
                  {isEnrolled ? (
                    <Button
                      variant="outline"
                      fullWidth
                      disabled
                      className="bg-emerald-50 text-emerald-700 border-emerald-300 font-bold cursor-default flex items-center justify-center gap-2 py-3"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Enrolled</span>
                    </Button>
                  ) : (
                    <Button fullWidth onClick={handleOpenEnrol} className="py-3 font-bold">
                      Enrol Now
                    </Button>
                  )}

                  {course.syllabusUrl && (
                    <a
                      href={getMediaUrl(course.syllabusUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-caption font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-azure-50 hover:border-azure-300 hover:text-azure-700 transition-colors shadow-2xs"
                    >
                      <FileDown className="h-4 w-4 text-azure-600" />
                      Download Syllabus
                    </a>
                  )}

                  {canPay && !isEnrolled && (
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => pay({ itemType: 'course', itemId: course._id })}
                      loading={paying}
                      disabled={enabled === null || Boolean(pendingId)}
                    >
                      {paying ? 'Opening payment…' : 'Pay Online via Razorpay'}
                    </Button>
                  )}

                  <p className="pt-1 text-center text-caption text-slate-500">
                    Application details are delivered directly to {instName}.
                  </p>
                </div>
              </div>

              {/* Training Centre Details Card */}
              {inst && (
                <div className="tile p-6 shadow-sm space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-2xs">
                      {inst.logoUrl ? (
                        <img
                          src={getMediaUrl(inst.logoUrl)}
                          alt={instName}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-azure-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-ink truncate text-body">{instName}</h3>
                        <CheckCircle2 className="h-4 w-4 text-azure-600 shrink-0" />
                      </div>
                      <p className="text-caption text-azure-600 font-semibold">
                        {inst.orgType === 'university'
                          ? 'Higher Education Partner'
                          : 'Official Training Centre'}
                      </p>
                    </div>
                  </div>

                  {inst.about && (
                    <p className="text-small text-slate-600 leading-relaxed whitespace-pre-line line-clamp-3">
                      {inst.about}
                    </p>
                  )}

                  <div className="space-y-2.5 pt-3 border-t border-line text-caption text-slate-600">
                    {(inst.location || inst.address) && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          {[
                            inst.address,
                            inst.location || inst.city,
                            inst.state,
                            inst.country,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                    {inst.mode && (
                      <div className="flex items-center gap-2">
                        <MonitorPlay className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>
                          Instruction Mode: <strong className="text-slate-800">{inst.mode}</strong>
                        </span>
                      </div>
                    )}
                    {inst.contactEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                        <a
                          href={`mailto:${inst.contactEmail}`}
                          className="hover:text-azure-600 truncate"
                        >
                          {inst.contactEmail}
                        </a>
                      </div>
                    )}
                    {inst.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                        <a
                          href={`tel:${inst.contactPhone}`}
                          className="hover:text-azure-600"
                        >
                          {inst.contactPhone}
                        </a>
                      </div>
                    )}
                    {inst.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                        <a
                          href={inst.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-azure-600 truncate inline-flex items-center gap-1 font-semibold"
                        >
                          <span>Visit Website</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {instId && (
                    <Button
                      to={`/universities/${instId}`}
                      variant="outline"
                      size="sm"
                      fullWidth
                      className="mt-3"
                    >
                      View Training Centre Profile
                    </Button>
                  )}
                </div>
              )}
            </aside>
          </div>
        </Container>
      </section>

      <Section tone="white">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <ArticleBody content={course.description} />

              {course.modules?.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-h2 font-bold">What the course covers</h2>
                  <ol className="mt-6 divide-y divide-line border-y border-line">
                    {course.modules.map((module, i) => (
                      <li key={module.title} className="flex gap-4 py-4">
                        <span className="tabular mt-0.5 text-caption font-bold text-slate-400">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <h3 className="text-body font-semibold text-ink">{module.title}</h3>
                          {module.detail && <p className="mt-1 text-small text-slate-600">{module.detail}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {course.outcomes?.length > 0 && (
              <aside className="lg:col-span-5 lg:col-start-8">
                <div className="rounded-xl bg-paper p-6 lg:sticky lg:top-24 border border-line">
                  <h2 className="text-h3 font-bold text-ink">By the end you can</h2>
                  <ul className="mt-4 space-y-3">
                    {course.outcomes.map((outcome) => (
                      <li key={outcome} className="flex gap-2.5 text-small text-slate-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            )}
          </div>
        </Container>
      </Section>

      {related?.length > 0 && (
        <Section tone="paper">
          <Container>
            <h2 className="text-h2 font-bold">Related courses</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <CourseCard key={item._id} course={item} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <CTASection
        title="Want a second opinion before enrolling?"
        body="Tell us the role you are aiming at. If this course is not the fastest route there, we will say which is."
        primary={{ label: 'Book a free consultation', to: '/contact#consultation' }}
        secondary={{ label: 'Back to all courses', to: '/courses' }}
      />

      {/* Candidate Enrolment Modal */}
      <Modal
        open={enrolModalOpen}
        onClose={() => setEnrolModalOpen(false)}
        title={`Enrol in ${course.title}`}
        size="md"
      >
        <div className="space-y-5">
          {/* Institution Header */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200/80 p-3.5">
            <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
              {inst?.logoUrl ? (
                <img
                  src={getMediaUrl(inst.logoUrl)}
                  alt={instName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <Building2 className="h-5 w-5 text-azure-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-body font-bold text-ink truncate leading-tight">
                  {instName}
                </span>
                <CheckCircle2 className="h-4 w-4 text-azure-600 shrink-0" />
              </div>
              <p className="text-caption text-slate-500 truncate">
                {course.title} · {course.level} · {course.mode || course.deliveryFormat || 'Live online'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-body font-bold text-ink">{price}</span>
            </div>
          </div>

          <form onSubmit={handleSubmitEnrol} className="space-y-4">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Rahul Sharma"
              value={formState.fullName}
              onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="name@example.com"
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
              />

              <Input
                label="Mobile Number"
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formState.phone}
                onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
              />
            </div>

            <Input
              label="Current Degree / Qualification"
              required
              placeholder="e.g. B.Tech (Computer Science) or Working Professional"
              value={formState.currentDegree}
              onChange={(e) => setFormState({ ...formState, currentDegree: e.target.value })}
            />

            <p className="text-caption text-slate-500 pt-1">
              By submitting, your candidate details will be forwarded directly to {instName}&apos;s admissions team.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEnrolModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submitting}>
                Submit Enrolment
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}