import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Input } from '../components/ui/Field.jsx';
import { LoadingBlock, ErrorState } from '../components/ui/States.jsx';
import { useApi } from '../hooks/useApi.js';
import { partnerService, enrolmentService } from '../services/contentService.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getMediaUrl } from '../utils/media.js';
import {
  GraduationCap,
  MapPin,
  Globe,
  Mail,
  Phone,
  FileText,
  Clock,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  ArrowLeft,
  Building2,
  Send,
  User,
} from 'lucide-react';

export default function UniversityProfile() {
  const { id } = useParams();
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();

  const { data: res, loading, error, refetch } = useApi(() => partnerService.getPublic(id), [id]);

  const partner = res?.partner;
  const programmes = res?.programmes || [];
  const courses = res?.courses || [];

  const [logoError, setLogoError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  // Enrolled programmes tracker
  const [enrolledIds, setEnrolledIds] = useState(() => new Set());

  // Enrolment Application Modal State
  const [enrolModalOpen, setEnrolModalOpen] = useState(false);
  const [selectedProg, setSelectedProg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentDegree: '',
  });

  // Check candidate's existing enrolments
  useEffect(() => {
    if (!isAuthenticated) return;
    enrolmentService
      .myEnrolments()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        const ids = new Set();
        list.forEach((item) => {
          if (item.itemId) ids.add(String(item.itemId));
        });
        setEnrolledIds((prev) => new Set([...prev, ...ids]));
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const handleOpenEnrol = (item, type = 'education_program') => {
    setSelectedProg({ ...item, itemType: type });
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
      toast.error('Please enter your current degree');
      return;
    }

    setSubmitting(true);
    try {
      await enrolmentService.apply({
        itemId: selectedProg._id,
        itemType: selectedProg.itemType || 'education_program',
        fullName: formState.fullName.trim(),
        email: formState.email.trim(),
        phone: formState.phone.trim(),
        currentDegree: formState.currentDegree.trim(),
      });

      const universityName = partner?.displayName || partner?.name || 'the institution';
      toast.success(`Application submitted! ${universityName} has received your enrolment details.`);
      if (selectedProg?._id) {
        setEnrolledIds((prev) => new Set([...prev, String(selectedProg._id)]));
      }
      setEnrolModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Could not submit enrolment application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Section tone="white" className="py-24">
        <Container>
          <LoadingBlock message="Loading university profile..." />
        </Container>
      </Section>
    );
  }

  if (error || !partner) {
    return (
      <Section tone="white" className="py-24">
        <Container>
          <ErrorState
            error={error || new Error('University profile not found or not currently active.')}
            onRetry={refetch}
          />
        </Container>
      </Section>
    );
  }

  const universityName = partner.displayName || partner.name;

  return (
    <>
      <Seo
        title={`${universityName} — Higher Education Programmes`}
        description={partner.about || `Explore approved higher education programmes offered by ${universityName} on DutyLaunch.`}
      />

      {/* Hero / Header Section */}
      <div className="relative bg-slate-900 text-white overflow-hidden">
        {partner.coverImageUrl && !coverError ? (
          <div className="absolute inset-0 opacity-30">
            <img
              src={getMediaUrl(partner.coverImageUrl)}
              alt=""
              onError={() => setCoverError(true)}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-azure-950 to-indigo-950 opacity-95" />
        )}

        <Container className="relative py-12 md:py-16">
          <Link
            to="/higher-education"
            className="inline-flex items-center gap-1.5 text-caption text-slate-300 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Higher Education
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="h-24 w-24 md:h-28 md:w-28 rounded-2xl bg-white p-2.5 shadow-xl border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
              {partner.logoUrl && !logoError ? (
                <img
                  src={getMediaUrl(partner.logoUrl)}
                  alt={universityName}
                  onError={() => setLogoError(true)}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-azure-700">
                  <Building2 className="h-10 w-10 text-azure-700" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">
                    {universityName.slice(0, 3)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="azure">
                  {partner.orgType === 'university' ? 'Higher Education Institution' : 'Training Provider'}
                </Badge>
                <Badge tone="success" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified Partner
                </Badge>
              </div>

              <h1 className="text-h2 md:text-h1 font-bold text-white tracking-tight">{universityName}</h1>

              <div className="flex flex-wrap items-center gap-4 text-small text-slate-300">
                {partner.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-azure-400" />
                    <span>{partner.location}</span>
                  </div>
                )}
                {partner.website && (
                  <a
                    href={partner.website.startsWith('http') ? partner.website : `https://${partner.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-azure-300 hover:text-white underline transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Official Website</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Section tone="white" className="py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: About & Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-xl border border-line bg-paper p-6 shadow-sm">
                <h2 className="text-body font-bold text-ink mb-3">About the Institution</h2>
                <p className="text-small text-slate-600 leading-relaxed whitespace-pre-line">
                  {partner.about || 'Verified higher education provider listed on the DutyLaunch educational marketplace.'}
                </p>

                <div className="mt-6 pt-6 border-t border-line space-y-3 text-caption text-slate-600">
                  {partner.contactEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>{partner.contactEmail}</span>
                    </div>
                  )}
                  {partner.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{partner.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Listings */}
            <div className="lg:col-span-2 space-y-8">
              {/* Courses section (if training centre or has published courses) */}
              {courses.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-h3 font-bold text-ink">
                      Offered Courses ({courses.length})
                    </h2>
                    <p className="text-small text-slate-500 mt-1">
                      Industry-recognised courses and certifications provided directly by {universityName}.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {courses.map((c) => {
                      const courseFee = Number(c.price || 0);
                      const isFree = Boolean(c.isFree) || courseFee === 0;
                      const hasSyllabus = Boolean(c.syllabusUrl);

                      return (
                        <div
                          key={c._id}
                          className="rounded-xl border border-line bg-paper p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {c.category?.name && <Badge tone="azure">{c.category.name}</Badge>}
                                <Badge tone="neutral">{c.level || 'Beginner'}</Badge>
                                <Badge tone="outline" className="capitalize">
                                  {c.mode || c.deliveryFormat || 'Live online'}
                                </Badge>
                              </div>

                              <h3 className="text-h3 font-bold text-ink hover:text-azure-600 transition-colors">
                                <Link to={`/courses/${c.slug}`}>{c.title}</Link>
                              </h3>

                              <p className="text-small text-slate-600 line-clamp-3">
                                {c.summary || c.description}
                              </p>

                              <div className="flex flex-wrap items-center gap-4 text-caption text-slate-500 pt-2">
                                {c.duration && (
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    <span>{c.duration}</span>
                                  </div>
                                )}
                                {(c.mode || c.deliveryFormat) && (
                                  <div className="flex items-center gap-1.5">
                                    <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                                    <span>{c.mode || c.deliveryFormat}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0 sm:min-w-[150px]">
                              <div>
                                <span className="text-caption text-slate-500 block sm:text-right">Course Fee</span>
                                <div className="flex items-baseline gap-1 sm:justify-end">
                                  <span className="text-h3 font-bold text-ink">
                                    {isFree ? 'Free' : `₹${courseFee.toLocaleString('en-IN')}`}
                                  </span>
                                </div>
                                {!isFree && courseFee > 0 && (
                                  <span className="text-[11px] font-medium text-slate-500 block sm:text-right">
                                    Excl. GST
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                {hasSyllabus && (
                                  <a
                                    href={getMediaUrl(c.syllabusUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-caption font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-azure-50 hover:border-azure-300 hover:text-azure-700 transition-colors shadow-2xs"
                                  >
                                    <FileText className="h-3.5 w-3.5 text-azure-600" />
                                    Syllabus
                                  </a>
                                )}

                                <Link
                                  to={`/courses/${c.slug}`}
                                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-caption font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-azure-50 hover:border-azure-300 hover:text-azure-700 transition-colors shadow-2xs"
                                >
                                  Details
                                </Link>

                                {enrolledIds.has(String(c._id)) ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled
                                    className="bg-emerald-50 text-emerald-700 border-emerald-300 font-bold cursor-default flex items-center justify-center gap-1.5"
                                  >
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    <span>Enrolled</span>
                                  </Button>
                                ) : (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleOpenEnrol(c, 'course')}
                                  >
                                    Enrol Now
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Higher Education Programmes Section */}
              {programmes.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-h3 font-bold text-ink">
                      Higher Education Programmes ({programmes.length})
                    </h2>
                    <p className="text-small text-slate-500 mt-1">
                      All degree listings are approved and offered directly through {universityName}.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {programmes.map((prog) => {
                      const feeAmount = Number(prog.fee || 0);

                      return (
                        <div
                          key={prog._id}
                          className="rounded-xl border border-line bg-paper p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {prog.level && <Badge tone="azure">{prog.level}</Badge>}
                                {prog.qualification && <Badge tone="neutral">{prog.qualification}</Badge>}
                                <Badge tone="outline" className="capitalize">
                                  {prog.deliveryFormat || 'Online'}
                                </Badge>
                              </div>

                              <h3 className="text-h3 font-bold text-ink">{prog.title}</h3>

                              <p className="text-small text-slate-600 line-clamp-3">
                                {prog.summary || prog.description}
                              </p>

                              <div className="flex flex-wrap items-center gap-4 text-caption text-slate-500 pt-2">
                                {prog.duration && (
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    <span>{prog.duration}</span>
                                  </div>
                                )}
                                {prog.destinations?.length > 0 && (
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                    <span>{prog.destinations.join(', ')}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0 sm:min-w-[150px]">
                              <div>
                                <span className="text-caption text-slate-500 block sm:text-right">Programme Fee</span>
                                <div className="flex items-baseline gap-1 sm:justify-end">
                                  <span className="text-h3 font-bold text-ink">
                                    {feeAmount > 0 ? `₹${feeAmount.toLocaleString('en-IN')}` : 'Free'}
                                  </span>
                                  {feeAmount > 0 && (
                                    <span className="text-caption font-semibold text-slate-500">/ year</span>
                                  )}
                                </div>
                                {feeAmount > 0 && (
                                  <span className="text-[11px] font-medium text-azure-700 block sm:text-right">
                                    Per Year
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                {prog.syllabusUrl && (
                                  <a
                                    href={prog.syllabusUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-caption font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-azure-50 hover:border-azure-300 hover:text-azure-700 transition-colors shadow-2xs"
                                  >
                                    <FileText className="h-3.5 w-3.5 text-azure-600" />
                                    Syllabus
                                  </a>
                                )}

                                {enrolledIds.has(String(prog._id)) ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled
                                    className="bg-emerald-50 text-emerald-700 border-emerald-300 font-bold cursor-default flex items-center justify-center gap-1.5"
                                  >
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    <span>Enrolled</span>
                                  </Button>
                                ) : (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleOpenEnrol(prog, 'education_program')}
                                  >
                                    {feeAmount > 0 ? 'Enrol Now' : 'Enrol Free'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty state if both are empty */}
              {programmes.length === 0 && courses.length === 0 && (
                <div className="rounded-xl border border-dashed border-line bg-paper/50 p-10 text-center">
                  <GraduationCap className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-3 text-body font-semibold text-ink">No published listings</h3>
                  <p className="mt-1 text-small text-slate-500">
                    This institution has not published any programmes or courses yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>

      {/* Enrolment Application Modal */}
      <Modal
        open={enrolModalOpen}
        onClose={() => setEnrolModalOpen(false)}
        title={`Enrol in ${selectedProg?.title || 'Programme'}`}
        size="md"
      >
        <div className="space-y-5">
          {/* Institution & Programme Mini Header */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200/80 p-3.5">
            <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
              {partner?.logoUrl ? (
                <img
                  src={getMediaUrl(partner.logoUrl)}
                  alt={universityName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <Building2 className="h-5 w-5 text-azure-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-body font-bold text-ink truncate leading-tight">
                  {universityName}
                </span>
                <CheckCircle2 className="h-4 w-4 text-azure-600 shrink-0" />
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-caption text-slate-500">
                <span className="font-semibold text-azure-700">{selectedProg?.title}</span>
                <span>•</span>
                <span>{selectedProg?.deliveryFormat || 'Offline'}</span>
                {Number(selectedProg?.fee || 0) > 0 && (
                  <>
                    <span>•</span>
                    <span className="font-bold text-ink">₹{Number(selectedProg.fee).toLocaleString('en-IN')} / year</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitEnrol} className="space-y-4">
            <Input
              label="Full Name"
              required
              value={formState.fullName}
              onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              icon={User}
            />

            <Input
              label="Mobile Number"
              type="tel"
              required
              value={formState.phone}
              onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
              placeholder="e.g. +91 98765 43210"
              icon={Phone}
            />

            <Input
              label="Email Address"
              type="email"
              required
              value={formState.email}
              onChange={(e) => setFormState({ ...formState, email: e.target.value })}
              placeholder="e.g. rahul@example.com"
              icon={Mail}
            />

            <Input
              label="Current Degree / Qualification"
              required
              value={formState.currentDegree}
              onChange={(e) => setFormState({ ...formState, currentDegree: e.target.value })}
              placeholder="e.g. BTech, BE, BSc, BCA, 12th Standard"
              icon={GraduationCap}
              hint="Mention your current educational qualification or pursuing degree"
            />

            <div className="rounded-xl bg-azure-50/70 border border-azure-200/70 p-3 text-caption text-azure-900 leading-relaxed">
              Your details will be forwarded directly to the <strong>{universityName}</strong> admissions desk. A programme advisor will contact you regarding eligibility, schedule, and next steps.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEnrolModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
              >
                Submit Enrolment
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
