import { Link } from 'react-router-dom';
import {
  Building2,
  GraduationCap,
  BookOpen,
  Users,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  PlusCircle,
  FileText,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { PanelHeader } from '../../../layouts/AppShell.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { LoadingBlock, ErrorState } from '../../../components/ui/States.jsx';
import { useApi } from '../../../hooks/useApi.js';
import { partnerService } from '../../../services/contentService.js';
import { formatCurrency, formatDate } from '../../../utils/format.js';
import { cn } from '../../../utils/cn.js';

export default function PartnerOverview() {
  const { data, loading, error, refetch } = useApi(() => partnerService.mine(), []);
  const profile = data?._id ? data : null;
  const stats = data?.stats || {};
  const isVerified = profile?.status === 'approved';
  const isUniversity = (profile?.orgType || 'university') === 'university';

  if (loading) return <LoadingBlock label="Loading Partner Portal..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  // Status configuration banner
  const statusCfg = {
    incomplete: {
      icon: AlertTriangle,
      color: 'border-amber-400 bg-amber-50 text-amber-900',
      badgeTone: 'amber',
      title: 'Profile Incomplete',
      desc: 'Complete your organization details, upload your verification documents, and submit for admin review to begin creating listings.',
      ctaText: 'Complete Organization Profile',
      ctaTo: '/partner/profile',
    },
    pending: {
      icon: Clock,
      color: 'border-azure-400 bg-azure-50 text-azure-900',
      badgeTone: 'azure',
      title: 'Verification In Progress',
      desc: 'Your profile has been submitted for manual admin verification. Our compliance team usually verifies credentials within 1-2 business days. Programme and course creation will unlock upon approval.',
      ctaText: 'Review Submitted Details',
      ctaTo: '/partner/profile',
    },
    changes_requested: {
      icon: AlertTriangle,
      color: 'border-amber-500 bg-amber-50 text-amber-900',
      badgeTone: 'amber',
      title: 'Changes Requested By Reviewer',
      desc: profile?.reviewNote
        ? `Review feedback: "${profile.reviewNote}". Please update your organization profile and resubmit for verification.`
        : 'Please update your organization details and resubmit for verification.',
      ctaText: 'Update & Resubmit',
      ctaTo: '/partner/profile',
    },
    approved: {
      icon: CheckCircle2,
      color: 'border-emerald-400 bg-emerald-50/70 text-emerald-950',
      badgeTone: 'success',
      title: 'Verified Partner Organization',
      desc: `Your organization is verified on DutyLaunch as an official ${
        isUniversity ? 'University / Higher Education Institution' : 'EdTech / Training Provider'
      }. You have full access to create and manage programme listings.`,
      ctaText: 'View Public Profile',
      ctaTo: profile?._id ? `/partners/${profile._id}` : '#',
    },
    rejected: {
      icon: XCircle,
      color: 'border-rose-400 bg-rose-50 text-rose-900',
      badgeTone: 'danger',
      title: 'Verification Not Approved',
      desc: profile?.reviewNote
        ? `Reason: "${profile.reviewNote}". You may update your profile with supporting credentials and resubmit for review.`
        : 'Verification was not approved. Review your submitted details and resubmit.',
      ctaText: 'Edit Profile & Resubmit',
      ctaTo: '/partner/profile',
    },
    suspended: {
      icon: XCircle,
      color: 'border-rose-500 bg-rose-50 text-rose-900',
      badgeTone: 'danger',
      title: 'Partner Account Suspended',
      desc: 'This organization profile is currently suspended. Direct API and listing creation operations are restricted. Contact DutyLaunch compliance support.',
      ctaText: 'Contact Support',
      ctaTo: '/contact',
    },
  }[profile?.status || 'incomplete'];

  const StatusIcon = statusCfg.icon;

  return (
    <div className="space-y-7">
      <PanelHeader
        title={profile?.displayName || profile?.name || 'Partner Portal'}
        description={`Welcome to DutyLaunch ${
          isUniversity ? 'Higher Education' : 'Training'
        } Portal. Manage approved offerings, track student enrolments and monitor payout settlements.`}
        actions={
          <div className="flex flex-wrap gap-2">
            {isVerified && isUniversity && (
              <Button to="/partner/higher-education?action=new" size="sm">
                <PlusCircle className="h-4 w-4" aria-hidden />
                New Programme
              </Button>
            )}
            {isVerified && !isUniversity && (
              <Button to="/partner/courses?action=new" size="sm">
                <PlusCircle className="h-4 w-4" aria-hidden />
                New Course
              </Button>
            )}
            <Button to="/partner/profile" variant="outline" size="sm">
              <Building2 className="h-4 w-4" aria-hidden />
              Profile Details
            </Button>
          </div>
        }
      />

      {/* Verification Status Card */}
      <section className={cn('rounded-2xl border p-5 sm:p-6 shadow-sm transition-all', statusCfg.color)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white shadow-sm">
              <StatusIcon className="h-6 w-6 text-inherit" aria-hidden />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-body font-bold text-ink">{statusCfg.title}</h2>
                <Badge tone={statusCfg.badgeTone} className="capitalize">
                  {profile?.status || 'incomplete'}
                </Badge>
              </div>
              <p className="mt-1 text-small max-w-3xl leading-relaxed text-slate-700">{statusCfg.desc}</p>
            </div>
          </div>
          <Button
            to={statusCfg.ctaTo}
            target={statusCfg.ctaTo.startsWith('/partners') ? '_blank' : undefined}
            variant="outline"
            className="shrink-0 bg-white"
          >
            <span>{statusCfg.ctaText}</span>
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </section>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-caption font-semibold uppercase tracking-wider text-slate-500">
              Published Listings
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-ink">{stats.publishedCount ?? 0}</p>
          <p className="mt-1 text-caption text-slate-500">Live on public marketplace</p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-caption font-semibold uppercase tracking-wider text-slate-500">
              Under Review
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-azure-50 text-azure-600">
              <Clock className="h-5 w-5" aria-hidden />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-ink">{stats.pendingCount ?? 0}</p>
          <p className="mt-1 text-caption text-slate-500">
            {stats.draftCount ?? 0} draft{(stats.draftCount ?? 0) === 1 ? '' : 's'} saved
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-caption font-semibold uppercase tracking-wider text-slate-500">
              Confirmed Enrolments
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" aria-hidden />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-ink">{stats.enrolmentCount ?? 0}</p>
          <p className="mt-1 text-caption text-slate-500">From paid & approved students</p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-caption font-semibold uppercase tracking-wider text-slate-500">
              Payable Balance
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
              <CreditCard className="h-5 w-5" aria-hidden />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-ink">
            {formatCurrency(Math.round((stats.netCurrentPayablePaise ?? 0) / 100))}
          </p>
          <p className="mt-1 text-caption text-slate-500">Net provider payable earnings</p>
        </div>
      </div>

      {/* Main Grid: Action Tiles & Recent Orders */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Quick Access & Actions */}
        <div className="space-y-6 lg:col-span-7">
          <section className="tile p-5 sm:p-6">
            <h3 className="text-h3 font-bold text-ink">Organization Portal Sections</h3>
            <p className="mt-1 text-small text-slate-600">
              Access relevant tools designed for {isUniversity ? 'universities' : 'training providers'}.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                to="/partner/profile"
                className="group flex flex-col justify-between rounded-xl border border-line bg-paper p-4 transition-all hover:border-azure-400 hover:bg-white"
              >
                <div>
                  <span className="inline-grid h-10 w-10 place-items-center rounded-lg bg-white shadow-xs group-hover:bg-azure-50">
                    <Building2 className="h-5 w-5 text-azure" aria-hidden />
                  </span>
                  <h4 className="mt-3 text-body font-bold text-ink group-hover:text-azure-700">
                    Organization Profile
                  </h4>
                  <p className="mt-1 text-caption text-slate-600">
                    Update institution identity, logo, address and accreditation verification.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-azure group-hover:underline">
                  Manage profile <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </Link>

              {isUniversity ? (
                <Link
                  to="/partner/higher-education"
                  className={cn(
                    'group flex flex-col justify-between rounded-xl border border-line bg-paper p-4 transition-all',
                    isVerified ? 'hover:border-azure-400 hover:bg-white' : 'opacity-80'
                  )}
                >
                  <div>
                    <span className="inline-grid h-10 w-10 place-items-center rounded-lg bg-white shadow-xs group-hover:bg-azure-50">
                      <GraduationCap className="h-5 w-5 text-azure" aria-hidden />
                    </span>
                    <h4 className="mt-3 text-body font-bold text-ink group-hover:text-azure-700">
                      Higher Education
                    </h4>
                    <p className="mt-1 text-caption text-slate-600">
                      Manage degree and diploma programmes, fees, syllabi and admission details.
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-azure group-hover:underline">
                    {isVerified ? 'Manage programmes' : 'Requires verification'}{' '}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </Link>
              ) : (
                <Link
                  to="/partner/courses"
                  className={cn(
                    'group flex flex-col justify-between rounded-xl border border-line bg-paper p-4 transition-all',
                    isVerified ? 'hover:border-azure-400 hover:bg-white' : 'opacity-80'
                  )}
                >
                  <div>
                    <span className="inline-grid h-10 w-10 place-items-center rounded-lg bg-white shadow-xs group-hover:bg-azure-50">
                      <BookOpen className="h-5 w-5 text-azure" aria-hidden />
                    </span>
                    <h4 className="mt-3 text-body font-bold text-ink group-hover:text-azure-700">
                      Courses & Training
                    </h4>
                    <p className="mt-1 text-caption text-slate-600">
                      Manage online, offline, hybrid or self-paced courses, schedules and pricing.
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-azure group-hover:underline">
                    {isVerified ? 'Manage courses' : 'Requires verification'}{' '}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </Link>
              )}

              <Link
                to="/partner/enrolments"
                className="group flex flex-col justify-between rounded-xl border border-line bg-paper p-4 transition-all hover:border-azure-400 hover:bg-white"
              >
                <div>
                  <span className="inline-grid h-10 w-10 place-items-center rounded-lg bg-white shadow-xs group-hover:bg-azure-50">
                    <Users className="h-5 w-5 text-azure" aria-hidden />
                  </span>
                  <h4 className="mt-3 text-body font-bold text-ink group-hover:text-azure-700">
                    Enrolments & Orders
                  </h4>
                  <p className="mt-1 text-caption text-slate-600">
                    View confirmed students, enrolled offerings and payment references.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-azure group-hover:underline">
                  View enrolments <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </Link>

              <Link
                to="/partner/settlements"
                className="group flex flex-col justify-between rounded-xl border border-line bg-paper p-4 transition-all hover:border-azure-400 hover:bg-white"
              >
                <div>
                  <span className="inline-grid h-10 w-10 place-items-center rounded-lg bg-white shadow-xs group-hover:bg-azure-50">
                    <TrendingUp className="h-5 w-5 text-azure" aria-hidden />
                  </span>
                  <h4 className="mt-3 text-body font-bold text-ink group-hover:text-azure-700">
                    Payout Settlements
                  </h4>
                  <p className="mt-1 text-caption text-slate-600">
                    Review DutyLaunch platform commission, reconciliation and payout batches.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-azure group-hover:underline">
                  View settlements <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </Link>
            </div>
          </section>
        </div>

        {/* Right: Recent Orders & Settlements Summary */}
        <div className="space-y-6 lg:col-span-5">
          <section className="tile p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-h3 font-bold text-ink">Recent Student Orders</h3>
              <Link to="/partner/enrolments" className="text-caption font-semibold text-azure hover:underline">
                View all
              </Link>
            </div>

            {(!data?.recentOrders || data.recentOrders.length === 0) ? (
              <div className="mt-6 rounded-xl border border-dashed border-line bg-paper p-6 text-center">
                <FileText className="mx-auto h-8 w-8 text-slate-400" aria-hidden />
                <p className="mt-2 text-small font-semibold text-ink">No candidate orders yet</p>
                <p className="mt-1 text-caption text-slate-500">
                  When candidates purchase or enrol in your approved offerings, transactions will appear here.
                </p>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {data.recentOrders.slice(0, 5).map((order) => (
                  <li key={order.id} className="py-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 pr-2">
                        <p className="truncate text-small font-semibold text-ink">{order.itemName}</p>
                        <p className="text-caption text-slate-500">
                          {order.paidAt ? formatDate(order.paidAt) : 'Pending'} · Ref: {order.receipt}
                        </p>
                      </div>
                      <span className="font-bold text-small text-ink">
                        {formatCurrency(Math.round(order.amount / 100), order.currency)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="tile p-5 sm:p-6">
            <h3 className="text-h3 font-bold text-ink">Verification & Compliance</h3>
            <div className="mt-4 space-y-3 text-small text-slate-700">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-azure" aria-hidden />
                <span>
                  <strong>Independent Approval:</strong> Each university programme or course undergoes administrative review before public publication.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-azure" aria-hidden />
                <span>
                  <strong>Secure Collections:</strong> Student payments are collected via DutyLaunch with automated fee calculation and transparent settlement reconciliation.
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
