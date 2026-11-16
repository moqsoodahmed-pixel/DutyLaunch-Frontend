import { PanelHeader } from '../../layouts/AppShell.jsx';
import { StatCard } from '../../components/admin/StatCard.jsx';
import { TrendChart, BreakdownBars } from '../../components/admin/MiniChart.jsx';
import { LoadingBlock, ErrorState } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { adminService } from '../../services/adminService.js';

export default function AdminDashboard() {
  const { data, loading, error, refetch } = useApi(() => adminService.dashboard(), []);

  if (loading) return <LoadingBlock label="Loading dashboard" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const { counts, consultationTrend, applicationsByStatus, topCategories } = data;

  return (
    <>
      <PanelHeader title="Dashboard" description="An overview of activity across the platform." />

      {/* Pricing & CMS Quick Action Banner */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-azure-200 bg-gradient-to-r from-azure-50 to-indigo-50/60 p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-azure-600 text-white shadow-xs">
            <span className="text-lg">🏷️</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Pricing & Packages Studio</h3>
            <p className="text-xs text-slate-600">
              Control all package rates, price hikes, strikethroughs, deliverables, and track live surface impact.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/admin/pricing-studio"
            className="inline-flex items-center gap-1.5 rounded-lg bg-azure-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-azure-700 transition-colors"
          >
            Open Pricing Studio →
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pricing & Packages Studio"
          value="Dynamic Hub"
          hint="Edit prices, deliverables & SLA"
          icon="Tag"
          to="/admin/pricing-studio"
        />
        <StatCard label="Candidates" value={counts.totalUsers} icon="Users" to="/admin/users" />
        <StatCard
          label="Resume Build Orders"
          value={counts.totalResumeOrders ?? 0}
          hint={`${counts.pendingResumeOrders ?? 0} pending review`}
          icon="FileText"
          tone={(counts.pendingResumeOrders ?? 0) > 0 ? 'alert' : 'default'}
          to="/admin/resume-orders"
        />
        <StatCard label="Employers" value={counts.totalEmployers} icon="Building2" to="/admin/users?role=employer" />
        <StatCard label="Published jobs" value={counts.publishedJobs} hint={`${counts.totalJobs} total`} icon="Briefcase" to="/admin/jobs" />
        <StatCard label="Applications" value={counts.totalApplications} icon="FileStack" to="/admin/applications" />
        <StatCard
          label="Partner institutes"
          value={counts.totalPartners ?? 0}
          icon="Building2"
          to="/admin/partners?status=approved"
        />
        <StatCard
          label="Pending partner reviews"
          value={counts.pendingPartners ?? 0}
          icon="ShieldCheck"
          tone={(counts.pendingPartners ?? 0) > 0 ? 'alert' : 'default'}
          to="/admin/partners?status=pending"
        />
        <StatCard
          label="New consultations"
          value={counts.newConsultations}
          hint={`${counts.totalConsultations} total`}
          icon="CalendarCheck"
          tone={counts.newConsultations > 0 ? 'alert' : 'default'}
          to="/admin/consultations"
        />
        <StatCard
          label="Unread messages"
          value={counts.unreadMessages}
          icon="Mail"
          tone={counts.unreadMessages > 0 ? 'alert' : 'default'}
          to="/admin/messages"
        />
        <StatCard label="Published courses" value={counts.totalCourses} icon="GraduationCap" to="/admin/courses" />
        <StatCard label="Published articles" value={counts.totalPosts} icon="Newspaper" to="/admin/blogs" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-h3 font-bold text-ink">Consultation requests, last 30 days</h2>
          <div className="mt-4">
            <TrendChart data={consultationTrend} label="Consultations" />
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-h3 font-bold text-ink">Applications by status</h2>
          <div className="mt-4">
            <BreakdownBars data={applicationsByStatus} labelKey="status" />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-line bg-white p-5">
        <h2 className="text-h3 font-bold text-ink">Top job categories</h2>
        <div className="mt-4 max-w-lg">
          <BreakdownBars data={topCategories} labelKey="category" emptyLabel="No published jobs yet." />
        </div>
      </div>
    </>
  );
}
