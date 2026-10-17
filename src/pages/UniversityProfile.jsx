import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { LoadingBlock, ErrorState } from '../components/ui/States.jsx';
import { useApi } from '../hooks/useApi.js';
import { partnerService, enrolmentService } from '../services/contentService.js';
import { useRazorpayCheckout } from '../hooks/useRazorpayCheckout.js';
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
} from 'lucide-react';

export default function UniversityProfile() {
  const { id } = useParams();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const { pay, pendingId } = useRazorpayCheckout();

  const { data: res, loading, error, refetch } = useApi(() => partnerService.getPublic(id), [id]);

  const partner = res?.partner;
  const programmes = res?.programmes || [];
  const courses = res?.courses || [];

  const [enrollingId, setEnrollingId] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  const handleEnrol = async (prog) => {
    const fee = Number(prog.fee || 0);
    if (fee <= 0) {
      if (!isAuthenticated) {
        toast.info('Please sign in to enrol in this programme.');
        return;
      }
      setEnrollingId(prog._id);
      try {
        await enrolmentService.enrolFree({
          itemType: 'education_program',
          itemId: prog._id,
        });
        toast.success(`You are now enrolled in ${prog.title}!`);
      } catch (err) {
        toast.error(err.message || 'Could not complete free enrolment.');
      } finally {
        setEnrollingId(null);
      }
    } else {
      pay({
        itemType: 'education_program',
        itemId: prog._id,
        onSuccess: () => {
          toast.success(`Enrolment confirmed for ${prog.title}!`);
        },
      });
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

            {/* Right: Programmes List */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-h3 font-bold text-ink">
                  Offered Programmes ({programmes.length})
                </h2>
                <p className="text-small text-slate-500 mt-1">
                  All listings are approved and offered directly through {universityName}.
                </p>
              </div>

              {programmes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line bg-paper/50 p-10 text-center">
                  <GraduationCap className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-3 text-body font-semibold text-ink">No published programmes</h3>
                  <p className="mt-1 text-small text-slate-500">
                    This institution has not published any programmes yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {programmes.map((prog) => {
                    const feeAmount = Number(prog.fee || 0);
                    const isEnrolling = enrollingId === prog._id || pendingId === prog._id;

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
                              <span className="text-h3 font-bold text-ink block sm:text-right">
                                {feeAmount > 0 ? `₹${feeAmount.toLocaleString('en-IN')}` : 'Free'}
                              </span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                              {prog.syllabusUrl && (
                                <a
                                  href={prog.syllabusUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-caption font-semibold rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  Syllabus
                                </a>
                              )}

                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleEnrol(prog)}
                                loading={isEnrolling}
                              >
                                {feeAmount > 0 ? 'Enrol Now' : 'Enrol Free'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
