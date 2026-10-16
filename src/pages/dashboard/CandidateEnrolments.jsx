import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../../components/ui/Seo.jsx';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { useApi } from '../../hooks/useApi.js';
import { enrolmentService } from '../../services/contentService.js';
import { LoadingBlock, ErrorState } from '../../components/ui/States.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { GraduationCap, BookOpen, ExternalLink, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

export default function CandidateEnrolments() {
  const { data, loading, error, refetch } = useApi(() => enrolmentService.myEnrolments(), []);
  const enrolments = useMemo(() => (Array.isArray(data) ? data : data?.data || []), [data]);

  return (
    <>
      <Seo title="My Enrolments" description="Your enrolled university programmes and training courses" noIndex />
      <PanelHeader
        title="My Enrolments"
        description="Access your confirmed higher education programmes and professional courses."
      />

      {loading && <LoadingBlock message="Loading your enrolments..." />}
      {error && <ErrorState error={error} onRetry={refetch} />}

      {!loading && !error && (
        <div className="space-y-6">
          {enrolments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-paper/50 p-12 text-center">
              <GraduationCap className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-body font-semibold text-ink">No enrolments yet</h3>
              <p className="mt-1 text-small text-slate-500 max-w-sm mx-auto">
                Explore our accredited university programmes and industry-focused courses to boost your career.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button to="/higher-education" variant="primary" size="sm">
                  Browse Higher Education
                </Button>
                <Button to="/courses" variant="outline" size="sm">
                  Browse Courses
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolments.map((enrol) => {
                const isEducation = enrol.itemType === 'education_program';
                return (
                  <div key={enrol._id} className="rounded-xl border border-line bg-paper p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <Badge tone={isEducation ? 'info' : 'success'}>
                          {isEducation ? 'Higher Education' : 'Course'}
                        </Badge>
                        <Badge tone="success" className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Confirmed
                        </Badge>
                      </div>

                      <h3 className="text-body font-bold text-ink line-clamp-2">
                        {enrol.itemTitle || 'Enrolled Programme'}
                      </h3>

                      {enrol.partner && (
                        <p className="mt-1 text-small text-slate-600 font-medium">
                          {enrol.partner.displayName || enrol.partner.name}
                        </p>
                      )}

                      <div className="mt-4 space-y-2 border-t border-line/60 pt-3 text-caption text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700">Delivery Format:</span>
                          <span className="capitalize">{enrol.deliveryFormat || 'Online'}</span>
                        </div>

                        {enrol.learningAccess && (
                          <div className="mt-2 rounded-lg bg-slate-50 p-3 text-caption border border-line">
                            <span className="font-semibold text-slate-800 block mb-1">Learning Access & Next Steps:</span>
                            <p className="text-slate-600 whitespace-pre-line">{enrol.learningAccess}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-slate-400 pt-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Enrolled on {new Date(enrol.enrolledAt || enrol.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
                      {enrol.payment ? (
                        <span className="text-caption font-semibold text-emerald-700">
                          Paid ₹{Number(enrol.payment.amount || 0).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-caption font-semibold text-azure-700">Free Enrolment</span>
                      )}

                      <Link
                        to={isEducation ? `/higher-education` : `/courses`}
                        className="text-small font-semibold text-azure-600 hover:text-azure-700 inline-flex items-center gap-1"
                      >
                        View Details
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
