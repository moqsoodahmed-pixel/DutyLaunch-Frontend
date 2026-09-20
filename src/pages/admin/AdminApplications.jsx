import { useSearchParams } from 'react-router-dom';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { useApi } from '../../hooks/useApi.js';
import { adminService } from '../../services/adminService.js';
import { formatDate } from '../../utils/format.js';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under-review', label: 'Under review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offered', label: 'Offered' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

export default function AdminApplications() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const page = Number(params.get('page') || 1);

  const { data, meta, loading, error, refetch } = useApi(
    () => adminService.applications({ status: status || undefined, page }),
    [status, page]
  );

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  return (
    <>
      <PanelHeader title="Applications" description="Every application across every job post, platform-wide." />

      <Tabs options={STATUS_FILTERS} value={status} onChange={(v) => update({ status: v })} label="Filter by status" className="mb-6" />

      <DataTable
        loading={loading}
        error={error}
        onRetry={refetch}
        rows={data || []}
        empty={{ title: 'No applications yet' }}
        columns={[
          {
            key: 'candidate',
            header: 'Candidate',
            primary: true,
            render: (row) => (
              <div>
                <p className="font-semibold text-ink">{row.candidate?.name}</p>
                <p className="text-caption text-slate-500">{row.candidate?.email}</p>
              </div>
            ),
          },
          { key: 'job', header: 'Role', render: (row) => `${row.job?.title || '—'} · ${row.job?.company || ''}` },
          { key: 'appliedAt', header: 'Applied', render: (row) => formatDate(row.appliedAt) },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        ]}
      />

      <Pagination meta={meta} onChange={(next) => update({ page: String(next) })} className="mt-8" />
    </>
  );
}
