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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Candidates" value={counts.totalUsers} icon="Users" to="/admin/users" />
        <StatCard label="Employers" value={counts.totalEmployers} icon="Building2" to="/admin/users?role=employer" />
        <StatCard label="Published jobs" value={counts.publishedJobs} hint={`${counts.totalJobs} total`} icon="Briefcase" to="/admin/jobs" />
        <StatCard label="Applications" value={counts.totalApplications} icon="FileStack" to="/admin/applications" />
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
